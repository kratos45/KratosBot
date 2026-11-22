# KratosBot: Specialized Autonomous Coding Agent

<p align="center">
  <img src="kratos_logo.png" alt="KratosBot Logo" width="180" />
</p>

<p align="center">
  <strong>The God of Code. Uncompromising Spartan Precision. Blazing Groq Inference.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#immersive-frontend">Immersive Frontend</a> •
  <a href="#quickstart">Quickstart</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#specialization-presets">Coding Presets</a> •
  <a href="#commands">Commands</a> •
  <a href="#api-reference">API Reference</a>
</p>

---

**KratosBot** is an elite, memory-aware **autonomous coding agent** built with Python, FastAPI, React, and Groq. Powered by sub-second LLM inference, KratosBot streams production-grade code, surgically diagnoses bugs, optimizes algorithmic complexity, compresses long-running technical conversations into rolling SQLite memory, and tracks provider-verified token accounting with live cost estimation.

It features both an **interactive terminal CLI** and an **immersive, cyberpunk-Spartan React web frontend** styled with the fiery crimson and obsidian armor theme of the legendary God of War.

---

## Features

- ⚔️ **Specialized Autonomous Coding Agent:** Engineered to write production-ready, typed, and battle-tested code without lazy placeholders.
- 🎨 **Immersive React Web Frontend:** Modern dark UI featuring the Kratos logo, fiery crimson glows, fluid responsive layouts, and interactive developer tools.
- ⚡ **Ultra-Fast Groq Inference:** Streams token responses in real-time via Server-Sent Events (SSE) for near-instant answers.
- 🧠 **Two-Layer Memory Architecture:**
  - **Recent Turns:** Maintains verbatim user/assistant message turns in context.
  - **Rolling Memory Summary:** Automatically compresses older turns into a concise technical memory preserving file paths, schemas, API contracts, and architectural decisions.
- 💾 **SQLite Session Persistence:** Automatically saves multi-session conversation history, memory summaries, and token accounting across restarts.
- 🛠️ **Integrated Code Studio & Scratchpad (Workbench):** Side-by-side workspace to draft, inspect, or paste code and run one-click actions: *Hunt Bugs*, *Refactor Clean*, *Generate Tests*, and *Security Audit*.
- 📊 **Real-Time Token & Cost HUD:** Tracks exact input/output tokens from API chunk responses and calculates estimated USD cost in real-time.
- 🎭 **Spartan Specialization Presets:** Instantly switch personas: Full-Stack Architect, Spartan Bug Hunter, Clean Code Optimizer, Test Automation Specialist, or Security Auditor.
- 💻 **Dual Interfaces:** Run as a standalone web application or through the interactive terminal CLI.
- 🧪 **Comprehensive Automated Test Suite:** Unit and integration tests covering storage, memory compaction, streaming, API endpoints, and token tracking.

---

## Immersive Frontend

The frontend is built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**, styled with a custom Spartan God of Code theme:

- **War Room Dashboard:** Obsidian carbon background (`#07080b`), fiery crimson gradients (`#951418`, `#dc2626`, `#ef4444`), and amber rune accents.
- **Interactive Syntax Highlighting:** Syntax highlighting for Python, TypeScript, JavaScript, SQL, Bash, Rust, Go, HTML, CSS, JSON, and YAML with line numbers and one-click copy.
- **Code Workbench:** Side-drawer editor allowing developers to review generated code or send their own code directly into KratosBot.
- **Live Memory HUD Modal:** Inspect the active SQLite memory summary and provider token accounting breakdown.
- **Multi-Session Drawer:** Switch between concurrent projects (e.g., `api-gateway`, `auth-service`, `db-migration`).
- **Prompt Arsenal:** Instant starter prompts for architecture, concurrency bugs, test generation, and security audits.

---

## Quickstart

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** & **npm**
- **Pipenv**
- **Groq API Key:** Get one free at [console.groq.com/keys](https://console.groq.com/keys)

---

### Installation on Windows (PowerShell)

1. **Clone or extract repository and enter directory:**

   ```powershell
   cd d:\Hamza_Professional\PROJECTS\KratosBot
   ```

2. **Install Python virtual environment and dependencies:**

   ```powershell
   pipenv install --dev
   pipenv run pip install -e .
   ```

3. **Configure your API key:**

   ```powershell
   Copy-Item .env.example .env
   ```

   Open `.env` and set your `GROQ_API_KEY`:

   ```env
   GROQ_API_KEY=gsk_your_actual_groq_key_here
   ```

4. **Build the React Frontend assets:**

   ```powershell
   cd frontend
   npm install
   npm run build
   cd ..
   ```

---

### Running KratosBot

#### 1. Web Application (Recommended)

Launch the complete web frontend and FastAPI server with a single command:

```powershell
pipenv run kratosbot --serve --port 8000
```

Open your browser to: **`http://localhost:8000`**

To specify a custom port or host:

```powershell
pipenv run kratosbot --serve --host 127.0.0.1 --port 5000
```

#### 2. Frontend Development Mode (Vite Hot-Reload)

For rapid frontend styling and component development:

- **Terminal 1 (Backend API):**
  ```powershell
  pipenv run kratosbot --serve --port 8000
  ```
- **Terminal 2 (Vite Dev Server):**
  ```powershell
  cd frontend
  npm run dev
  ```
  Open **`http://localhost:5173`** (API requests are automatically proxied to port 8000).

#### 3. Interactive Terminal CLI Mode

Run KratosBot directly in your terminal:

```powershell
pipenv run kratosbot
```

Start or resume a named session:

```powershell
pipenv run kratosbot --session microservices-refactor
```

---

## Architecture

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

## Specialization Presets

Switch specialization modes anytime in the web header or through the API:

| Mode | Badge | Focus Area |
|---|---|---|
| **Full-Stack Architect** | ⚔️ System Architect | Scalable system designs, clean schemas, module boundaries, and distributed systems. |
| **Spartan Bug Hunter** | 🛡️ Bug Hunter | Stack-trace forensics, race conditions, memory leaks, and regression fixes. |
| **Clean Code & Optimizer** | ⚡ Code Optimizer | Algorithmic speedups, Big-O complexity reduction, SOLID refactoring, and strict typing. |
| **Test Automation & QA** | 🧪 Test Specialist | Rigorous Pytest/Vitest suites, parameterized edge cases, fixtures, and mocks. |
| **Security & DevSecOps** | 🔒 Security Auditor | OWASP Top 10 auditing, authentication flows, input sanitization, and security reviews. |

---

## Commands

In both the CLI and Web input, the following commands are available:

| Command | Action |
|---|---|
| `/help` | Open command reference and documentation |
| `/usage` | Display verified token usage and estimated USD cost |
| `/summary` | View active rolling memory summary |
| `/reset` | Clear current session history, memory summary, and token usage |
| `/quit` | Exit the CLI (*CLI mode only*) |

---

## Configuration

All configuration is loaded from `.env`:

| Variable | Default | Purpose |
|---|---|---|
| `GROQ_API_KEY` | *Required* | Groq API Key |
| `GROQ_MODEL` | `openai/gpt-oss-20b` | Target Groq LLM model ID |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | Groq OpenAI-compatible endpoint |
| `KRATOSBOT_TEMPERATURE` | `0.7` | Sampling temperature for responses |
| `KRATOSBOT_SUMMARY_TEMPERATURE` | `0.2` | Sampling temperature for memory compression |
| `KRATOSBOT_MAX_RECENT_TURNS` | `4` | Number of recent complete turns retained verbatim |
| `KRATOSBOT_SUMMARIZE_AFTER_MESSAGES` | `12` | Message threshold triggering memory summarization |
| `KRATOSBOT_MAX_TOTAL_TOKENS` | `10000` | Token limit budget per session (`0` disables) |
| `GROQ_INPUT_USD_PER_MILLION` | `0.075` | Input price per 1M tokens for cost calculation |
| `GROQ_OUTPUT_USD_PER_MILLION` | `0.30` | Output price per 1M tokens for cost calculation |
| `KRATOSBOT_DATABASE_PATH` | `data/kratosbot.sqlite3` | SQLite database file location |
| `KRATOSBOT_REQUEST_TIMEOUT` | `60` | Request timeout in seconds |

---

## API Reference

The backend exposes a clean REST & SSE API:

- **`GET /`**: Serves the built React SPA.
- **`GET /api/health`**: System status, active model, and database path.
- **`GET /api/presets`**: Available coding specialization personas.
- **`GET /api/sessions`**: List all saved sessions with message counts and summary state.
- **`GET /api/sessions/{session_id}`**: Retrieve full session history, memory summary, and token stats.
- **`POST /api/chat`**: Send prompt with real-time SSE streaming (`stream: true`) or JSON payload (`stream: false`).
- **`POST /api/sessions/{session_id}/reset`**: Clear session memory and usage counters.
- **`DELETE /api/sessions/{session_id}`**: Delete session permanently from SQLite.

---

## Run Tests and Lint

Run automated tests (all mocked, no API key or network required):

```powershell
pipenv run pytest
```

Run code formatting and linter:

```powershell
pipenv run ruff check .
```

---

## Docker Support

Build the Docker image:

```powershell
docker build -t kratosbot .
```

Run container with web interface on port 8000 and persistent SQLite storage:

```powershell
docker run --rm -it -p 8000:8000 --env-file .env -v "${PWD}/data:/app/data" kratosbot
```

Access the UI at: **`http://localhost:8000`**

---

## License

MIT License. See [LICENSE](LICENSE).
