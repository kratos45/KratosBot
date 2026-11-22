"""Small SQLite store for local conversation sessions."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any


class SQLiteStore:
    """Persist session state locally; no API key is ever written to the DB."""

    def __init__(self, database_path: str) -> None:
        self.database_path = database_path
        if database_path != ":memory:":
            Path(database_path).parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.database_path)

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

    def load(self, session_id: str) -> dict[str, Any] | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT payload FROM sessions WHERE session_id = ?",
                (session_id,),
            ).fetchone()

        if row is None:
            return None
        payload = json.loads(row[0])
        if not isinstance(payload, dict):
            raise ValueError("Stored session payload is not a JSON object.")
        return payload

    def save(self, session_id: str, payload: dict[str, Any]) -> None:
        serialized = json.dumps(payload, ensure_ascii=False)
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO sessions (session_id, payload, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(session_id) DO UPDATE SET
                    payload = excluded.payload,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (session_id, serialized),
            )

    def delete(self, session_id: str) -> None:
        with self._connect() as connection:
            connection.execute(
                "DELETE FROM sessions WHERE session_id = ?", (session_id,)
            )

    def list_sessions(self) -> list[dict[str, Any]]:
        """List all saved sessions with summary statistics."""
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT session_id, updated_at, payload "
                "FROM sessions ORDER BY updated_at DESC"
            ).fetchall()

        results = []
        for session_id, updated_at, raw_payload in rows:
            message_count = 0
            has_summary = False
            last_message = ""
            total_tokens = 0
            try:
                data = json.loads(raw_payload)
                if isinstance(data, dict):
                    memory_data = data.get("memory", {})
                    history = memory_data.get("history", [])
                    message_count = len(history)
                    has_summary = bool(memory_data.get("summary"))
                    if history:
                        last_message = history[-1].get("content", "")[:100]
                    usage_data = data.get("usage", {})
                    total_tokens = usage_data.get("total_tokens", 0)
            except Exception:
                pass

            results.append({
                "session_id": session_id,
                "updated_at": updated_at,
                "message_count": message_count,
                "has_summary": has_summary,
                "last_message": last_message,
                "total_tokens": total_tokens,
            })
        return results
