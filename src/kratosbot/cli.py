"""Command-line interface for KratosBot."""

from __future__ import annotations

import argparse
import sys

from dotenv import load_dotenv
from openai import APIConnectionError, APIStatusError, APITimeoutError, RateLimitError

from kratosbot.chatbot import ChatBot, UsageLimitReached
from kratosbot.config import Settings


def _print_help() -> None:
    print(
        "\nCommands:\n"
        "  /help     Show commands\n"
        "  /usage    Show token usage and estimated cost\n"
        "  /summary  Show the current memory summary\n"
        "  /reset    Clear this session's conversation and usage\n"
        "  /quit     Exit KratosBot\n"
    )


def _print_usage(bot: ChatBot) -> None:
    report = bot.usage_report()
    print("\n--- KratosBot usage ---")
    print(f"Input tokens:           {report['input_tokens']:,}")
    print(f"Output tokens:          {report['output_tokens']:,}")
    print(f"Total tokens:           {report['total_tokens']:,}")
    print(f"Requests with usage:    {report['requests_with_usage']}")
    print(f"Requests without usage: {report['requests_without_usage']}")
    print(f"Estimated API cost:     ${report['estimated_cost_usd']:.8f} USD")
    print("-----------------------\n")


def run() -> int:
    parser = argparse.ArgumentParser(
        description="KratosBot: Specialized Autonomous Coding Agent with Memory"
    )
    parser.add_argument(
        "--session",
        default="default",
        help=(
            "Session identifier (default: default). Different IDs keep "
            "separate chats."
        ),
    )
    parser.add_argument(
        "--serve",
        action="store_true",
        help="Start the KratosBot HTTP API and React web frontend server.",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind the web server (default: 127.0.0.1).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind the web server (default: 8000).",
    )
    args = parser.parse_args()

    load_dotenv()

    if args.serve:
        import uvicorn

        from kratosbot.api import app

        print(
            f"\n🔥 KratosBot Specialized Coding Agent Web Server running at http://{args.host}:{args.port}\n"
            f"   Interactive UI, Code Workbench & API online.\n"
        )
        uvicorn.run(app, host=args.host, port=args.port)
        return 0

    try:
        settings = Settings.from_env()
        bot = ChatBot(settings=settings, session_id=args.session)
    except (ValueError, OSError) as error:
        print(f"Configuration error: {error}", file=sys.stderr)
        return 2

    print(
        "\n⚔️ KratosBot: Specialized Autonomous Coding Agent is ready.\n"
        "   Type /help to see commands, or ask any complex coding question.\n"
    )

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        command = user_input.lower()
        if command in {"/quit", "/exit", "/q"}:
            print("Goodbye!")
            break
        if command == "/help":
            _print_help()
            continue
        if command == "/usage":
            _print_usage(bot)
            continue
        if command == "/summary":
            print("\nCurrent memory summary:")
            print(bot.memory.get_summary() or "(No summary created yet.)")
            print()
            continue
        if command == "/reset":
            bot.reset()
            print("Conversation and usage counters reset.\n")
            continue

        print("\nKratosBot: ", end="", flush=True)
        try:
            bot.ask(user_input, on_token=lambda token: print(token, end="", flush=True))
            print("\n")
        except UsageLimitReached as error:
            print(f"\n{error}\n")
        except RateLimitError:
            print("\nGroq rate limit reached. Please wait and try again.\n")
        except APITimeoutError:
            print("\nThe request timed out. Your message was not added to memory.\n")
        except APIConnectionError:
            print("\nCould not connect to Groq. Check your internet connection.\n")
        except APIStatusError as error:
            print(
                f"\nGroq returned an API error (HTTP {error.status_code}). "
                "Check the model, API key, and account limits.\n"
            )
        except Exception as error:  # noqa: BLE001 - keep the CLI usable
            print(f"\nUnexpected error: {error}\n")

    _print_usage(bot)
    return 0
