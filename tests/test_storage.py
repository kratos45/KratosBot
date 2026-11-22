from kratosbot.storage import SQLiteStore


def test_sqlite_store_saves_loads_and_deletes_session(tmp_path) -> None:
    store = SQLiteStore(str(tmp_path / "sessions.sqlite3"))
    payload = {"memory": {"summary": "remember this"}, "usage": {"total": 5}}

    store.save("test-session", payload)
    assert store.load("test-session") == payload

    store.delete("test-session")
    assert store.load("test-session") is None


def test_sqlite_store_list_sessions(tmp_path) -> None:
    store = SQLiteStore(str(tmp_path / "sessions.sqlite3"))
    payload1 = {
        "memory": {
            "summary": "sum1",
            "history": [{"role": "user", "content": "hello world"}],
        },
        "usage": {"total_tokens": 42},
    }
    payload2 = {
        "memory": {
            "summary": None,
            "history": [{"role": "user", "content": "session two"}],
        },
        "usage": {"total_tokens": 10},
    }

    store.save("session-1", payload1)
    store.save("session-2", payload2)

    sessions = store.list_sessions()
    assert len(sessions) == 2
    session_ids = {s["session_id"] for s in sessions}
    assert session_ids == {"session-1", "session-2"}
    s1 = next(s for s in sessions if s["session_id"] == "session-1")
    assert s1["has_summary"] is True
    assert s1["message_count"] == 1
    assert s1["total_tokens"] == 42
