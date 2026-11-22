# KratosBot Code Tour

This guide is for developers who want to understand the architecture, data flow, and codebase of KratosBot.

---

## Recommended Reading Order

1. **`src/kratosbot/memory.py`**
   - Understand the two-layer memory model: `system_message`, `summary`, and `history`.
   - Study why `get_messages_to_summarize()` returns a copy without deleting anything immediately.
   - Observe how `apply_summary()` checks that the message prefix still matches before removing old turns.

2. **`src/kratosbot/prompts.py`**
   - Examine `SYSTEM_PROMPT` tailored for an elite specialized autonomous coding agent.
   - Explore the `PRESETS` dictionary defining specialized modes (Architect, Bug Hunter, Code Optimizer, Test Specialist, Security Auditor).
   - Review `SUMMARY_PROMPT` designed to preserve technical schemas, file paths, function signatures, and bug resolutions.

3. **`src/kratosbot/storage.py`**
   - Review how Python's built-in `sqlite3` module persists JSON payloads per session.
   - Check `list_sessions()` extracting message counts and summary statuses.

4. **`src/kratosbot/usage.py`**
   - Study the token tracking dataclass and provider-verified usage accumulation.
   - See how estimated cost is calculated using input/output USD prices per million tokens.

5. **`src/kratosbot/chatbot.py`**
   - Trace the complete request lifecycle: checking the token budget, streaming tokens, recording final usage, applying rolling summaries, and saving state.

6. **`src/kratosbot/api.py`**
   - Study the FastAPI REST and SSE (Server-Sent Events) implementation.
   - See how background threads and queues deliver real-time token streaming to web clients.
   - Observe how `frontend/dist` is mounted to serve the compiled SPA directly.

7. **`src/kratosbot/cli.py`**
   - Learn how the CLI manages interactive loops, handles slash commands (`/usage`, `/summary`, `/reset`), and launches the web server via `--serve`.

8. **`frontend/` (React + Vite + Tailwind)**
   - **`frontend/src/App.jsx`**: Main UI state orchestrator managing sessions, streaming, and modals.
   - **`frontend/src/components/Header.jsx`**: Navigation, Kratos logo with glowing embers, preset selector, and live token HUD.
   - **`frontend/src/components/CodeBlock.jsx`**: Syntax highlighting with Prism, line numbers, and one-click *Send to Workbench*.
   - **`frontend/src/components/CodeWorkbench.jsx`**: Side-by-side scratchpad editor with one-click Spartan Arsenal actions.
   - **`frontend/src/components/MemoryHUDModal.jsx`**: Visual inspector for rolling SQLite memory and token accounting.

---

## Key Design Questions

### Why does memory use a rolling summary rather than a full transcript?
As conversations grow, sending every previous message exceeds context limits and increases cost and latency. KratosBot compresses older complete turns while keeping the most recent turns verbatim.

### Why does summarization happen after the assistant answer is returned?
Summarization should never delay user response delivery. If summarization fails, the generated answer is still preserved and delivered to the user.

### Why does the SSE endpoint use a background thread with an async queue?
`bot.ask()` is a synchronous generator receiving streaming chunks from the Groq SDK. A dedicated worker thread with an asyncio-compatible queue bridges the sync SDK callback to FastAPI's async HTTP response generator without blocking the main event loop.

---

## Suggested Exercises

1. **Add a new coding preset:** Add a `mobile` or `devops` preset in `src/kratosbot/prompts.py` and observe it appear automatically in the React UI and API.
2. **Export conversation:** Add an export button to `frontend/src/components/Sidebar.jsx` allowing users to download the chat history as a Markdown or JSON file.
3. **Custom Model Selector:** Add a dropdown in the UI settings allowing users to switch between supported Groq models (e.g., `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`).
