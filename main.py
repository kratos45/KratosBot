"""Convenience entry point. Prefer `pipenv run python -m kratosbot`."""

from kratosbot.cli import run

if __name__ == "__main__":
    raise SystemExit(run())
