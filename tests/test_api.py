from starlette.testclient import TestClient

from kratosbot.api import app


def test_api_health_check() -> None:
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "KratosBot" in data["agent"]


def test_api_presets_list() -> None:
    client = TestClient(app)
    response = client.get("/api/presets")
    assert response.status_code == 200
    data = response.json()
    assert "presets" in data
    preset_ids = [p["id"] for p in data["presets"]]
    assert "architect" in preset_ids
    assert "debugger" in preset_ids
    assert "refactor" in preset_ids
    assert "tester" in preset_ids
    assert "security" in preset_ids


def test_api_sessions_list_and_reset(tmp_path, monkeypatch) -> None:
    db_file = str(tmp_path / "api_test.sqlite3")
    monkeypatch.setenv("KRATOSBOT_DATABASE_PATH", db_file)
    monkeypatch.setenv("GROQ_API_KEY", "test-key")

    client = TestClient(app)
    # Check sessions initially
    res = client.get("/api/sessions")
    assert res.status_code == 200
    assert "sessions" in res.json()

    # Reset a session
    reset_res = client.post("/api/sessions/demo-session/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["status"] == "success"


def test_frontend_serving() -> None:
    client = TestClient(app)
    res = client.get("/")
    assert res.status_code == 200
    assert "KratosBot" in res.text
