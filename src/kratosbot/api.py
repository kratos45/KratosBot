"""FastAPI backend application for KratosBot Specialized Coding Agent."""

from __future__ import annotations

import asyncio
import json
import os
import queue
import threading
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from kratosbot.chatbot import ChatBot, UsageLimitReached
from kratosbot.config import Settings
from kratosbot.prompts import PRESETS, get_system_prompt
from kratosbot.storage import SQLiteStore

# Load environment configuration
load_dotenv()

app = FastAPI(
    title="KratosBot API",
    description="Backend API and SSE Streaming for KratosBot Specialized Coding Agent",
    version="0.2.0",
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_settings() -> Settings:
    try:
        return Settings.from_env()
    except Exception:
        # Fallback with dummy key if GROQ_API_KEY is not yet populated
        api_key = os.getenv("GROQ_API_KEY", "").strip() or "mock-or-missing-key"
        return Settings(api_key=api_key)


class ChatRequest(BaseModel):
    message: str = Field(
        ..., min_length=1, description="User instruction or code prompt"
    )
    session_id: str = Field(
        "default", description="Session identifier for multi-session memory"
    )
    stream: bool = Field(
        True, description="Whether to stream response tokens via SSE"
    )
    preset: str | None = Field(
        None, description="Coding agent specialization preset"
    )


class ResetResponse(BaseModel):
    status: str
    session_id: str
    message: str


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    settings = get_settings()
    has_real_key = bool(settings.api_key and settings.api_key != "mock-or-missing-key")
    return {
        "status": "online",
        "agent": "KratosBot Specialized Autonomous Coding Agent",
        "model": settings.model,
        "database": settings.database_path,
        "has_api_key": has_real_key,
        "max_recent_turns": settings.max_recent_turns,
        "summarize_after_messages": settings.summarize_after_messages,
    }


@app.get("/api/presets")
def list_presets() -> dict[str, Any]:
    return {
        "presets": [
            {
                "id": key,
                "title": data["title"],
                "badge": data["badge"],
                "description": data["description"],
                "starter": data["starter"],
            }
            for key, data in PRESETS.items()
        ]
    }


@app.get("/api/sessions")
def list_sessions() -> dict[str, Any]:
    settings = get_settings()
    store = SQLiteStore(settings.database_path)
    sessions = store.list_sessions()
    return {"sessions": sessions}


@app.get("/api/sessions/{session_id}")
def get_session(session_id: str) -> dict[str, Any]:
    settings = get_settings()
    store = SQLiteStore(settings.database_path)
    bot = ChatBot(settings=settings, session_id=session_id, store=store)
    return {
        "session_id": session_id,
        "messages": bot.get_history(),
        "summary": bot.memory.get_summary(),
        "usage": bot.usage_report(),
        "system_prompt": bot.memory.system_message.get("content", ""),
    }


@app.post("/api/sessions/{session_id}/reset", response_model=ResetResponse)
def reset_session(session_id: str) -> ResetResponse:
    settings = get_settings()
    store = SQLiteStore(settings.database_path)
    bot = ChatBot(settings=settings, session_id=session_id, store=store)
    bot.reset()
    return ResetResponse(
        status="success",
        session_id=session_id,
        message=f"Session '{session_id}' memory and counters have been reset.",
    )


@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str) -> dict[str, str]:
    settings = get_settings()
    store = SQLiteStore(settings.database_path)
    store.delete(session_id)
    return {"status": "deleted", "session_id": session_id}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    settings = get_settings()
    system_prompt = get_system_prompt(request.preset)
    store = SQLiteStore(settings.database_path)
    bot = ChatBot(
        settings=settings,
        session_id=request.session_id,
        store=store,
        system_prompt=system_prompt,
    )

    if not request.stream:
        try:
            response_text = bot.ask(request.message)
            return {
                "response": response_text,
                "summary": bot.memory.get_summary(),
                "usage": bot.usage_report(),
            }
        except UsageLimitReached as e:
            raise HTTPException(status_code=429, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # SSE Streaming response
    q: queue.Queue[dict[str, Any] | None] = queue.Queue()

    def run_worker():
        try:
            def on_token(token: str):
                q.put({"type": "token", "delta": token})

            full_reply = bot.ask(request.message, on_token=on_token)
            q.put({
                "type": "done",
                "response": full_reply,
                "summary": bot.memory.get_summary(),
                "usage": bot.usage_report(),
            })
        except Exception as exc:
            q.put({"type": "error", "error": str(exc)})
        finally:
            q.put(None)  # Sentinel to terminate generator

    thread = threading.Thread(target=run_worker, daemon=True)
    thread.start()

    async def event_generator():
        while True:
            # Check queue without blocking event loop
            try:
                item = q.get_nowait()
            except queue.Empty:
                await asyncio.sleep(0.015)
                continue

            if item is None:
                break

            data_str = json.dumps(item)
            yield f"data: {data_str}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# Serve built frontend static files if present
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        requested_file = FRONTEND_DIST / full_path
        if full_path and requested_file.exists() and requested_file.is_file():
            return FileResponse(str(requested_file))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
