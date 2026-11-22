# KratosBot Memory Design

## Why Two Memory Layers?

In software engineering tasks, conversations quickly grow verbose with stack traces, code snippets, logs, and architectural discussions. Sending the entire historical transcript on every API request causes:

1. **Context Window Exhaustion:** Rapidly saturating token limits.
2. **Degraded Attention:** LLMs can lose track of critical constraints when buried in hundred-line logs.
3. **Escalating Costs & Latency:** Re-sending tens of thousands of tokens per turn slows down streaming responses.

KratosBot solves this with a **two-layer memory architecture**:

```text
+-------------------------------------------------------------+
|                      MODEL CONTEXT                          |
+-------------------------------------------------------------+
| 1. System Prompt & Specialization Directives                |
|    - Always first, never modified or summarized             |
+-------------------------------------------------------------+
| 2. Rolling Memory Summary (Context Layer)                   |
|    - Compressed historical context                          |
|    - Preserves project goals, schemas, paths & resolutions  |
+-------------------------------------------------------------+
| 3. Recent History (Immediate Context)                       |
|    - Newest KRATOSBOT_MAX_RECENT_TURNS complete turns       |
|    - Preserved verbatim with full code snippets             |
+-------------------------------------------------------------+
```

---

## Technical Summarization Strategy for Coding Sessions

General summarization often strips away critical engineering details. KratosBot's `SUMMARY_PROMPT` enforces strict technical fidelity:

- **Architecture Decisions:** Design patterns, database engines, and caching strategies.
- **Data Schemas & API Contracts:** Database tables, columns, route definitions, and request/response payloads.
- **Signatures & Paths:** Exact class names, function signatures, file paths, and module hierarchies.
- **Bug Diagnoses & Fixes:** Root causes discovered and solutions implemented so regressions are avoided.
- **Unresolved Tasks:** Open TODOs, pending refactors, and test coverage requirements.

---

## Summarization Threshold & Trigger Cycle

1. **Threshold Trigger:** When the in-memory history reaches `KRATOSBOT_SUMMARIZE_AFTER_MESSAGES` (default: 12 messages = 6 turns).
2. **Selection:** The oldest complete turns exceeding `KRATOSBOT_MAX_RECENT_TURNS` (default: 4 turns retained = 8 messages) are selected for summarization (e.g. 4 messages = 2 complete turns).
3. **Compound Compression:** The existing summary (if present) is combined with the selected messages so context compounds over time without exponential growth.
4. **Verification & Commit:**
   - The LLM returns a non-empty summary.
   - The memory manager verifies that the selected messages still match the current history prefix (preventing race conditions).
   - Only the summarized prefix is removed; the recent turns remain untouched.
   - The new summary and retained history are saved atomically to SQLite.

---

## SQLite Session Persistence

Each session is identified by a unique `session_id` (e.g. `default`, `auth-service`, `frontend-v2`).
All session data is persisted in `data/kratosbot.sqlite3` under the `sessions` table:

- `session_id` (TEXT PRIMARY KEY)
- `payload` (JSON containing `memory` and `usage`)
- `updated_at` (TIMESTAMP)

This allows developers to resume distinct coding sessions across restarts, inspect memory states via the frontend Memory HUD, or reset specific sessions using `/reset`.
