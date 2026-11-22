/**
 * API client for KratosBot backend with Server-Sent Events (SSE) streaming support.
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPresets() {
  const res = await fetch(`${API_BASE}/api/presets`);
  if (!res.ok) throw new Error(`Failed to fetch presets: ${res.statusText}`);
  return res.json();
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/api/sessions`);
  if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.statusText}`);
  return res.json();
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error(`Failed to fetch session: ${res.statusText}`);
  return res.json();
}

export async function resetSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reset session: ${res.statusText}`);
  return res.json();
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete session: ${res.statusText}`);
  return res.json();
}

/**
 * Send a chat message with Server-Sent Events streaming.
 */
export async function streamChatMessage({
  message,
  sessionId = 'default',
  preset = null,
  signal = null,
  onToken = () => {},
  onDone = () => {},
  onError = () => {},
}) {
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        preset,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const message = errData.detail || `Server error (${res.status})`;
      onError(new Error(message));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep partial line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'token') {
              onToken(data.delta);
            } else if (data.type === 'done') {
              onDone(data);
            } else if (data.type === 'error') {
              onError(new Error(data.error));
            }
          } catch (e) {
            console.error('Failed to parse SSE payload:', e, jsonStr);
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream aborted by user');
      return;
    }
    onError(err);
  }
}
