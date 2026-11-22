# KratosBot Architecture

KratosBot is designed as an elite, production-grade **specialized autonomous coding agent** featuring a dual-interface architecture: a cyberpunk-Spartan **React Web UI** and an **interactive terminal CLI**, both orchestrated by Python, FastAPI, and Groq.

---

## Architectural Diagram

```text
+-----------------------------------------------------------------------------------+
|                              KRATOSBOT ARCHITECTURE                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +--------------------------------+          +---------------------------------+  |
|  |     React Immersive Web UI     |          |       Interactive CLI           |  |
|  |  - Kratos Crimson/Obsidian UI  |          |  - Terminal Streaming           |  |
|  |  - Code Workbench / Studio     |          |  - Session Switcher             |  |
|  |  - Live Memory & Token HUD     |          |  - Slash Commands (/usage, etc) |  |
|  +---------------+----------------+          +----------------+----------------+  |
|                  |                                            |                   |
|                  | SSE / REST                                 |                   |
|                  v                                            v                   |
|  +--------------------------------+          +---------------------------------+  |
|  |     FastAPI Server (api.py)    |          |            cli.py               |  |
|  |  - Streaming SSE generator     |          |  - Terminal I/O & exception UX  |  |
|  |  - Session & Preset management |          +----------------+----------------+  |
|  |  - Static React SPA serving    |                           |                   |
|  +---------------+----------------+                           |                   |
|                  |                                            |                   |
|                  +--------------------+-----------------------+                   |
|                                       |                                           |
|                                       v                                           |
|                        +------------------------------+                           |
|                        |      ChatBot (chatbot.py)    |                           |
|                        |  - Orchestrates Groq calls   |                           |
|                        |  - Manages streaming tokens  |                           |
|                        |  - Triggers memory summary   |                           |
|                        |  - Accumulates usage & cost  |                           |
|                        +--------------+---------------+                           |
|                                       |                                           |
|                     +-----------------+-----------------+                         |
|                     |                                   |                         |
|                     v                                   v                         |
|      +------------------------------+    +------------------------------+         |
|      |  ConversationMemory          |    |   SQLiteStore (storage.py)   |         |
|      |  (memory.py)                 |    |   data/kratosbot.sqlite3     |         |
|      |  - System Prompt / Presets   |    |   - Session payloads         |         |
|      |  - Recent Turns (Uncompressed|    |   - Timestamps & Stats       |         |
|      |  - Rolling Technical Summary |    +------------------------------+         |
|      +------------------------------+                                             |
+-----------------------------------------------------------------------------------+
```

---

## Component Responsibilities

### 1. Presentation Layer

- **React Web Application (`frontend/`):**
  - **Kratos Theme:** Inspired by the Kratos emblem (`#951418` crimson, obsidian `#07080b`, flame orange `#ea580c`, and Spartan rune gold `#f59e0b`).
  - **Streaming SSE Engine:** Uses `ReadableStreamDefaultReader` with chunk buffering to stream tokens smoothly with a glowing Spartan red cursor.
  - **Code Blocks (`CodeBlock.jsx`):** Renders syntax-highlighted code with Prism.js, line numbers toggle, one-click copy, and a *Send to Workbench* action.
  - **Code Studio & Scratchpad (`CodeWorkbench.jsx`):** Side-by-side workspace to draft or inspect code with one-click actions: *Hunt Bugs*, *Refactor & Speed*, *Generate Tests*, and *Security Audit*.
  - **Memory HUD Modal (`MemoryHUDModal.jsx`):** Inspects the active rolling summary, retained turn counts, verified provider tokens, and estimated USD billing.
  - **Multi-Session Sidebar (`Sidebar.jsx`):** Allows creating, switching, and deleting isolated coding sessions with real-time stats.
  - **Prompt Arsenal (`PromptArsenal.jsx`):** Quick-launch cards for architecture design, concurrency leaks, test fixtures, and security scans.

- **Terminal CLI (`cli.py`):**
  - Interactive terminal mode with real-time token streaming to stdout.
  - Command handling (`/help`, `/usage`, `/summary`, `/reset`, `/quit`).
  - Server launcher flag (`--serve`, `--host`, `--port`).

---

### 2. Service & API Layer

- **FastAPI Backend (`api.py`):**
  - Exposes REST endpoints (`/api/health`, `/api/presets`, `/api/sessions`, `/api/sessions/{session_id}/reset`).
  - Exposes SSE endpoint (`POST /api/chat`) yielding real-time token chunks and final usage metadata.
  - Mounts compiled production assets (`frontend/dist`) at `/` for single-command serving.

- **LLM Orchestration (`chatbot.py`):**
  - Dispatches chat completions to Groq via the OpenAI-compatible endpoint.
  - Handles streaming tokens with `stream_options={"include_usage": True}`.
  - Best-effort technical summarization triggered when conversation reaches threshold.
  - Graceful error recovery: rolls back unfulfilled user messages if an API exception occurs.

---

### 3. State & Persistence Layer

- **Conversation Memory (`memory.py`):**
  - Manages the system prompt and active specialization preset.
  - Retains the newest complete turns verbatim (`KRATOSBOT_MAX_RECENT_TURNS`).
  - Compresses older complete turns into a rolling summary when history reaches `KRATOSBOT_SUMMARIZE_AFTER_MESSAGES`.
  - Prefix matching check prevents out-of-order race conditions when committing summaries.

- **SQLite Store (`storage.py`):**
  - Persists session state (history, summary, usage counters, and timestamp) in `data/kratosbot.sqlite3`.
  - Provides atomic `save`, `load`, `delete`, and `list_sessions`.
  - Does **not** store any API keys or credentials in the database.

- **Usage & Cost Accounting (`usage.py`):**
  - Records provider-verified input and output tokens directly from API responses.
  - Calculates estimated API costs based on configured input and output prices per million tokens.
  - Tracks requests missing provider usage rather than fabricating numbers.

---

## Specialization Presets

KratosBot supports five coding specialization modes:

1. **⚔️ Full-Stack System Architect:** System architecture, database modeling, API contracts, caching, and clean service boundaries.
2. **🛡️ Spartan Bug Hunter:** Root-cause analysis of stack traces, memory leaks, race conditions, and regressions.
3. **⚡ Clean Code & Optimizer:** Algorithmic optimization, Big-O reduction, strict type safety, and SOLID refactoring.
4. **🧪 Test Automation & QA Specialist:** Complete Pytest/Vitest suites, mock fixtures, parameterization, and edge case fuzzing.
5. **🔒 Security & DevSecOps Auditor:** OWASP Top 10 vulnerabilities, auth flows, timing attacks, and defensive programming.
