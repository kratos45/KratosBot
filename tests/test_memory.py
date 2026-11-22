from kratosbot.memory import ConversationMemory


def make_memory() -> ConversationMemory:
    return ConversationMemory(
        system_prompt="You are KratosBot.",
        max_recent_turns=2,
        summarize_after_messages=6,
    )


def add_turn(memory: ConversationMemory, question: str, answer: str) -> None:
    memory.add_user_message(question)
    memory.add_assistant_message(answer)


def test_system_prompt_is_always_first() -> None:
    memory = make_memory()
    add_turn(memory, "Hello", "Hi")

    assert memory.get_messages()[0] == {
        "role": "system",
        "content": "You are KratosBot.",
    }


def test_summarization_starts_at_configured_threshold() -> None:
    memory = make_memory()
    add_turn(memory, "q1", "a1")
    add_turn(memory, "q2", "a2")
    assert memory.should_summarize() is False

    add_turn(memory, "q3", "a3")
    assert memory.should_summarize() is True


def test_only_old_complete_turns_are_selected() -> None:
    memory = make_memory()
    for number in range(1, 4):
        add_turn(memory, f"question {number}", f"answer {number}")

    selected = memory.get_messages_to_summarize()

    assert len(selected) == 2
    assert selected[0]["content"] == "question 1"
    assert selected[1]["content"] == "answer 1"
    assert len(memory.history) == 6  # Selection does not delete anything.


def test_apply_summary_removes_only_summarized_prefix() -> None:
    memory = make_memory()
    for number in range(1, 4):
        add_turn(memory, f"question {number}", f"answer {number}")

    selected = memory.get_messages_to_summarize()
    memory.apply_summary("The user asked question 1.", selected)

    assert memory.summary == "The user asked question 1."
    assert [item["content"] for item in memory.history] == [
        "question 2", "answer 2", "question 3", "answer 3"
    ]


def test_apply_summary_does_not_mutate_state_for_invalid_prefix() -> None:
    memory = make_memory()
    add_turn(memory, "question", "answer")

    try:
        memory.apply_summary(
            "A summary", [{"role": "user", "content": "not in history"},
                          {"role": "assistant", "content": "wrong"}]
        )
    except ValueError:
        pass
    else:
        raise AssertionError("Expected ValueError for a mismatched prefix")

    assert memory.summary is None
    assert len(memory.history) == 2


def test_summary_is_included_in_reconstructed_context() -> None:
    memory = make_memory()
    add_turn(memory, "question 1", "answer 1")
    memory.apply_summary("Important earlier fact.", memory.history.copy())

    messages = memory.get_messages()
    assert messages[0]["role"] == "system"
    assert "Important earlier fact." in messages[1]["content"]


def test_rollback_removes_only_a_pending_user_message() -> None:
    memory = make_memory()
    memory.add_user_message("request that failed")
    memory.rollback_pending_user_message()
    assert memory.history == []

    add_turn(memory, "question", "answer")
    memory.rollback_pending_user_message()
    assert len(memory.history) == 2


def test_state_round_trip() -> None:
    memory = make_memory()
    add_turn(memory, "hello", "hi")
    memory.summary = "Earlier context."

    restored = make_memory()
    restored.load_dict(memory.to_dict())

    assert restored.history == memory.history
    assert restored.summary == memory.summary
