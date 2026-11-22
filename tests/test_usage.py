from types import SimpleNamespace

from kratosbot.usage import UsageTracker


def test_add_provider_usage_and_estimate_cost() -> None:
    tracker = UsageTracker()
    tracker.add(SimpleNamespace(prompt_tokens=1_000_000, completion_tokens=500_000))

    assert tracker.input_tokens == 1_000_000
    assert tracker.output_tokens == 500_000
    assert tracker.total_tokens == 1_500_000
    assert tracker.estimate_cost_usd(0.075, 0.30) == 0.225


def test_missing_usage_is_reported_not_fabricated() -> None:
    tracker = UsageTracker()
    tracker.add(None)

    assert tracker.total_tokens == 0
    assert tracker.requests_without_usage == 1


def test_usage_state_round_trip() -> None:
    tracker = UsageTracker(input_tokens=12, output_tokens=34, requests_with_usage=2)
    restored = UsageTracker.from_dict(tracker.to_dict())

    assert restored == tracker
