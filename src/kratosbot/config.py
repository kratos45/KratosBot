"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Settings:
    """Immutable settings for a KratosBot instance."""

    api_key: str
    base_url: str = "https://api.groq.com/openai/v1"
    model: str = "openai/gpt-oss-20b"
    temperature: float = 0.7
    summary_temperature: float = 0.2
    max_recent_turns: int = 4
    summarize_after_messages: int = 12
    max_total_tokens: int = 10_000
    input_usd_per_million: float = 0.075
    output_usd_per_million: float = 0.30
    database_path: str = "data/kratosbot.sqlite3"
    request_timeout_seconds: float = 60.0

    @classmethod
    def from_env(cls) -> Settings:
        """Create settings from environment variables (after load_dotenv())."""
        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is missing. Add it to your .env file."
            )

        settings = cls(
            api_key=api_key,
            base_url=os.getenv(
                "GROQ_BASE_URL", "https://api.groq.com/openai/v1"
            ).strip(),
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip(),
            temperature=float(os.getenv("KRATOSBOT_TEMPERATURE", "0.7")),
            summary_temperature=float(
                os.getenv("KRATOSBOT_SUMMARY_TEMPERATURE", "0.2")
            ),
            max_recent_turns=int(
                os.getenv("KRATOSBOT_MAX_RECENT_TURNS", "4")
            ),
            summarize_after_messages=int(
                os.getenv("KRATOSBOT_SUMMARIZE_AFTER_MESSAGES", "12")
            ),
            max_total_tokens=int(
                os.getenv("KRATOSBOT_MAX_TOTAL_TOKENS", "10000")
            ),
            input_usd_per_million=float(
                os.getenv("GROQ_INPUT_USD_PER_MILLION", "0.075")
            ),
            output_usd_per_million=float(
                os.getenv("GROQ_OUTPUT_USD_PER_MILLION", "0.30")
            ),
            database_path=os.getenv(
                "KRATOSBOT_DATABASE_PATH", "data/kratosbot.sqlite3"
            ).strip(),
            request_timeout_seconds=float(
                os.getenv("KRATOSBOT_REQUEST_TIMEOUT", "60")
            ),
        )
        settings.validate()
        return settings

    def validate(self) -> None:
        """Fail early when configuration values are inconsistent."""
        if not self.model:
            raise ValueError("GROQ_MODEL cannot be empty.")
        if not 0 < self.temperature <= 2:
            raise ValueError("KRATOSBOT_TEMPERATURE must be > 0 and <= 2.")
        if not 0 < self.summary_temperature <= 2:
            raise ValueError(
                "KRATOSBOT_SUMMARY_TEMPERATURE must be > 0 and <= 2."
            )
        if self.max_recent_turns < 1:
            raise ValueError("KRATOSBOT_MAX_RECENT_TURNS must be at least 1.")
        if self.summarize_after_messages <= self.max_recent_turns * 2:
            raise ValueError(
                "KRATOSBOT_SUMMARIZE_AFTER_MESSAGES must exceed twice "
                "KRATOSBOT_MAX_RECENT_TURNS."
            )
        if self.max_total_tokens < 0:
            raise ValueError("KRATOSBOT_MAX_TOTAL_TOKENS cannot be negative.")
        if self.input_usd_per_million < 0 or self.output_usd_per_million < 0:
            raise ValueError("Token prices cannot be negative.")
        if self.request_timeout_seconds <= 0:
            raise ValueError("KRATOSBOT_REQUEST_TIMEOUT must be positive.")
