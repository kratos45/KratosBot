# Contributing

1. Create a feature branch.
2. Keep responsibilities separated: API orchestration belongs in `chatbot.py`; memory state operations belong in `memory.py`.
3. Add or update tests for behavior changes.
4. Run `pytest` and `ruff check .` before opening a pull request.
5. Never commit `.env`, API keys, local SQLite databases, or other secrets.

For changes to memory behavior, include tests for threshold boundaries, complete user/assistant turns, failed summarization, and state restoration.
