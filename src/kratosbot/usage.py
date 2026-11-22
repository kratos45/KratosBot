"""Track provider-reported token usage and estimate API cost."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(slots=True)
class UsageTracker:
    input_tokens: int = 0
    output_tokens: int = 0
    requests_with_usage: int = 0
    requests_without_usage: int = 0

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens

    def add(self, usage: Any | None) -> None:
        """Add a provider usage object; ignore requests with no usage payload."""
        if usage is None:
            self.requests_without_usage += 1
            return

        prompt_tokens = getattr(usage, "prompt_tokens", None)
        completion_tokens = getattr(usage, "completion_tokens", None)
        if prompt_tokens is None or completion_tokens is None:
            self.requests_without_usage += 1
            return

        self.input_tokens += int(prompt_tokens)
        self.output_tokens += int(completion_tokens)
        self.requests_with_usage += 1

    def estimate_cost_usd(
        self,
        input_usd_per_million: float,
        output_usd_per_million: float,
    ) -> float:
        return (
            self.input_tokens * input_usd_per_million
            + self.output_tokens * output_usd_per_million
        ) / 1_000_000

    def to_dict(self) -> dict[str, int]:
        return asdict(self)

    @classmethod
    def from_dict(cls, state: dict[str, Any] | None) -> UsageTracker:
        if not state:
            return cls()
        return cls(
            input_tokens=int(state.get("input_tokens", 0)),
            output_tokens=int(state.get("output_tokens", 0)),
            requests_with_usage=int(state.get("requests_with_usage", 0)),
            requests_without_usage=int(state.get("requests_without_usage", 0)),
        )
