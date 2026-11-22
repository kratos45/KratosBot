"""LLM orchestration for KratosBot."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from kratosbot.config import Settings
from kratosbot.memory import ConversationMemory
from kratosbot.prompts import SUMMARY_PROMPT, SYSTEM_PROMPT
from kratosbot.storage import SQLiteStore
from kratosbot.usage import UsageTracker

TokenCallback = Callable[[str], None]


class UsageLimitReached(RuntimeError):
    """Raised when the configured cumulative token limit has been reached."""


class ChatBot:
    def __init__(
        self,
        settings: Settings,
        session_id: str = "default",
        client: Any | None = None,
        store: SQLiteStore | None = None,
        system_prompt: str | None = None,
    ) -> None:
        settings.validate()
        self.settings = settings
        self.session_id = session_id
        if client is None:
            from openai import OpenAI

            client = OpenAI(
                api_key=settings.api_key,
                base_url=settings.base_url,
                timeout=settings.request_timeout_seconds,
            )
        self.client = client
        self.store = store or SQLiteStore(settings.database_path)
        self.memory = ConversationMemory(
            system_prompt=system_prompt or SYSTEM_PROMPT,
            max_recent_turns=settings.max_recent_turns,
            summarize_after_messages=settings.summarize_after_messages,
        )
        self.usage = UsageTracker()
        self._restore_session()

    def set_system_prompt(self, system_prompt: str) -> None:
        """Update active system prompt and persist changes."""
        self.memory.system_message["content"] = system_prompt
        self._save_session()

    def get_history(self) -> list[dict[str, str]]:
        """Return a copy of recent turns in history."""
        return list(self.memory.history)

    def _restore_session(self) -> None:
        state = self.store.load(self.session_id)
        if not state:
            return
        self.memory.load_dict(state.get("memory", {}))
        self.usage = UsageTracker.from_dict(state.get("usage"))

    def _save_session(self) -> None:
        self.store.save(
            self.session_id,
            {
                "memory": self.memory.to_dict(),
                "usage": self.usage.to_dict(),
            },
        )

    def _check_token_limit(self) -> None:
        limit = self.settings.max_total_tokens
        if limit and self.usage.total_tokens >= limit:
            raise UsageLimitReached(
                f"Session token limit reached ({self.usage.total_tokens:,}/{limit:,}). "
                "Use /reset to start a fresh conversation, or change the limit."
            )

    def ask(self, user_message: str, on_token: TokenCallback | None = None) -> str:
        """Send a user message, stream the answer, and update session memory."""
        if not user_message.strip():
            raise ValueError("The message cannot be empty.")
        self._check_token_limit()

        self.memory.add_user_message(user_message)
        response_parts: list[str] = []
        request_usage = None

        try:
            stream = self.client.chat.completions.create(
                model=self.settings.model,
                messages=self.memory.get_messages(),
                temperature=self.settings.temperature,
                stream=True,
                stream_options={"include_usage": True},
            )

            for chunk in stream:
                if chunk.choices:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        response_parts.append(delta)
                        if on_token is not None:
                            on_token(delta)
                if chunk.usage is not None:
                    request_usage = chunk.usage

        except Exception:
            self.memory.rollback_pending_user_message()
            raise

        response_text = "".join(response_parts).strip()
        if not response_text:
            self.memory.rollback_pending_user_message()
            raise RuntimeError("The model returned an empty response.")

        self.usage.add(request_usage)
        self.memory.add_assistant_message(response_text)

        # Summarization is best-effort: a summary failure must not discard history.
        try:
            self.summarize_memory()
        except Exception as error:  # noqa: BLE001 - report and continue the chat
            print(f"\n[Memory warning] Summarization failed: {error}")

        self._save_session()
        return response_text

    def summarize_memory(self) -> bool:
        """Summarize old complete turns and retain the newest configured turns."""
        if not self.memory.should_summarize():
            return False

        messages_to_summarize = self.memory.get_messages_to_summarize()
        if not messages_to_summarize:
            return False

        transcript_lines = [
            f"{message['role'].upper()}: {message['content']}"
            for message in messages_to_summarize
        ]
        transcript = "\n\n".join(transcript_lines)
        previous_summary = self.memory.get_summary()

        if previous_summary:
            summary_input = (
                "EXISTING MEMORY SUMMARY (preserve relevant facts):\n"
                f"{previous_summary}\n\n"
                "NEW OLDER CONVERSATION TO INCORPORATE:\n"
                f"{transcript}"
            )
        else:
            summary_input = transcript

        completion = self.client.chat.completions.create(
            model=self.settings.model,
            messages=[
                {"role": "system", "content": SUMMARY_PROMPT},
                {"role": "user", "content": summary_input},
            ],
            temperature=self.settings.summary_temperature,
            stream=False,
            max_completion_tokens=700,
        )

        # Count this API call even if the returned summary is later rejected.
        self.usage.add(completion.usage)
        summary_text = completion.choices[0].message.content
        if not summary_text or not summary_text.strip():
            raise RuntimeError("The model returned an empty memory summary.")

        # The old messages are removed only after a non-empty summary exists.
        self.memory.apply_summary(summary_text, messages_to_summarize)
        self._save_session()
        return True

    def reset(self) -> None:
        """Clear this session's conversation and counters."""
        self.memory.reset()
        self.usage = UsageTracker()
        self._save_session()

    def usage_report(self) -> dict[str, int | float]:
        cost = self.usage.estimate_cost_usd(
            self.settings.input_usd_per_million,
            self.settings.output_usd_per_million,
        )
        return {
            "input_tokens": self.usage.input_tokens,
            "output_tokens": self.usage.output_tokens,
            "total_tokens": self.usage.total_tokens,
            "requests_with_usage": self.usage.requests_with_usage,
            "requests_without_usage": self.usage.requests_without_usage,
            "estimated_cost_usd": cost,
        }
