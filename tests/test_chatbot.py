from types import SimpleNamespace

from kratosbot.chatbot import ChatBot
from kratosbot.config import Settings
from kratosbot.storage import SQLiteStore


class FakeCompletions:
    def create(self, **kwargs):
        if kwargs.get("stream"):
            return iter(
                [
                    SimpleNamespace(
                        choices=[
                            SimpleNamespace(delta=SimpleNamespace(content="Hello"))
                        ],
                        usage=None,
                    ),
                    SimpleNamespace(
                        choices=[
                            SimpleNamespace(delta=SimpleNamespace(content=" there."))
                        ],
                        usage=None,
                    ),
                    SimpleNamespace(
                        choices=[],
                        usage=SimpleNamespace(prompt_tokens=10, completion_tokens=3),
                    ),
                ]
            )

        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content="The user greeted KratosBot.")
                )
            ],
            usage=SimpleNamespace(prompt_tokens=20, completion_tokens=8),
        )

class FakeClient:
    def __init__(self):
        self.chat = SimpleNamespace(completions=FakeCompletions())


def test_chatbot_streams_reply_summarizes_and_persists(tmp_path) -> None:
    settings = Settings(
        api_key="test-key",
        max_recent_turns=1,
        summarize_after_messages=4,
        database_path=str(tmp_path / "kratosbot.sqlite3"),
    )
    store = SQLiteStore(settings.database_path)
    bot = ChatBot(settings, client=FakeClient(), store=store)
    streamed: list[str] = []

    first = bot.ask("Hello", on_token=streamed.append)
    assert first == "Hello there."
    assert streamed == ["Hello", " there."]

    bot.ask("Do you remember me?")

    assert bot.memory.summary == "The user greeted KratosBot."
    assert len(bot.memory.history) == 2
    assert bot.usage.input_tokens == 40
    assert bot.usage.output_tokens == 14
    assert store.load("default") is not None

    restored_bot = ChatBot(settings, client=FakeClient(), store=store)
    assert restored_bot.memory.summary == "The user greeted KratosBot."
    assert len(restored_bot.memory.history) == 2
    assert restored_bot.usage.total_tokens == bot.usage.total_tokens


def test_chatbot_reset_clears_memory_and_usage(tmp_path) -> None:
    settings = Settings(
        api_key="test-key",
        database_path=str(tmp_path / "kratosbot.sqlite3"),
    )
    bot = ChatBot(settings, client=FakeClient())
    bot.memory.add_user_message("temporary")
    bot.usage.input_tokens = 99

    bot.reset()

    assert bot.memory.history == []
    assert bot.usage.total_tokens == 0


def test_failed_chat_request_rolls_back_pending_user_message(tmp_path) -> None:
    class BrokenCompletions:
        def create(self, **kwargs):
            raise RuntimeError("simulated API failure")

    broken_client = SimpleNamespace(
        chat=SimpleNamespace(completions=BrokenCompletions())
    )
    settings = Settings(
        api_key="test-key",
        database_path=str(tmp_path / "broken.sqlite3"),
    )
    bot = ChatBot(settings, client=broken_client)

    try:
        bot.ask("This request will fail")
    except RuntimeError as error:
        assert str(error) == "simulated API failure"
    else:
        raise AssertionError("Expected the API error to propagate")

    assert bot.memory.history == []
