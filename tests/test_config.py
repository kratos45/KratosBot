import pytest

from kratosbot.config import Settings


def test_settings_reject_threshold_that_cannot_summarize() -> None:
    settings = Settings(
        api_key="test-key",
        max_recent_turns=4,
        summarize_after_messages=8,
    )
    with pytest.raises(ValueError, match="must exceed"):
        settings.validate()


def test_settings_accept_default_memory_configuration() -> None:
    settings = Settings(api_key="test-key")
    settings.validate()
