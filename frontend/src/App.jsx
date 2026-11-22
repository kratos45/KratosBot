import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Paperclip,
  Code2,
  Terminal,
  Shield,
  Layers,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import CodeWorkbench from './components/CodeWorkbench';
import PromptArsenal from './components/PromptArsenal';
import MemoryHUDModal from './components/MemoryHUDModal';
import DocsModal from './components/DocsModal';
import {
  fetchHealth,
  fetchPresets,
  fetchSessions,
  fetchSession,
  resetSession,
  deleteSession,
  streamChatMessage,
} from './utils/api';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState('default');
  const [messages, setMessages] = useState([]);
  const [memorySummary, setMemorySummary] = useState(null);
  const [usage, setUsage] = useState({
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    estimated_cost_usd: 0,
  });
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState('architect');
  const [health, setHealth] = useState(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef(null);

  // Workbench state
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [workbenchCode, setWorkbenchCode] = useState(
    '# KratosBot Code Scratchpad\n# Send generated snippets here to inspect, test, or refactor.\n\ndef example_task():\n    return "Ready for Spartan Code Optimization"\n'
  );
  const [workbenchLang, setWorkbenchLang] = useState('python');

  // Modals & Panels
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMemoryHUDOpen, setIsMemoryHUDOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial data load
  useEffect(() => {
    async function init() {
      try {
        const [healthData, presetsData, sessionsData] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchPresets().catch(() => ({ presets: [] })),
          fetchSessions().catch(() => ({ sessions: [] })),
        ]);

        if (healthData) setHealth(healthData);
        if (presetsData?.presets) setPresets(presetsData.presets);

        const loadedSessions = sessionsData?.sessions || [];
        setSessions(loadedSessions);

        // Ensure default session exists
        if (!loadedSessions.some((s) => s.session_id === 'default')) {
          setSessions((prev) => [
            { session_id: 'default', message_count: 0, last_message: '' },
            ...prev,
          ]);
        }

        // Load active session
        await loadSessionData('default');
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  // Load session messages, summary, and usage
  const loadSessionData = async (sessionId) => {
    try {
      setErrorMessage(null);
      const data = await fetchSession(sessionId);
      setActiveSession(sessionId);
      setMessages(data.messages || []);
      setMemorySummary(data.summary || null);
      if (data.usage) setUsage(data.usage);
    } catch (err) {
      console.warn('Could not load session data, starting fresh session state:', err);
      setActiveSession(sessionId);
      setMessages([]);
      setMemorySummary(null);
    }
  };

  // Scroll to bottom when messages or streaming content changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Handle Send Message
  const handleSendMessage = async (textToSend = null) => {
    const rawText = textToSend || inputMessage;
    const trimmed = rawText.trim();
    if (!trimmed || isStreaming) return;

    // Check special slash commands
    if (trimmed.startsWith('/')) {
      const cmd = trimmed.toLowerCase();
      if (cmd === '/reset') {
        await handleResetSession(activeSession);
        setInputMessage('');
        return;
      }
      if (cmd === '/summary') {
        setIsMemoryHUDOpen(true);
        setInputMessage('');
        return;
      }
      if (cmd === '/usage') {
        setIsMemoryHUDOpen(true);
        setInputMessage('');
        return;
      }
      if (cmd === '/help') {
        setIsDocsOpen(true);
        setInputMessage('');
        return;
      }
    }

    setErrorMessage(null);
    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsStreaming(true);
    setStreamingContent('');

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let accumulated = '';

    await streamChatMessage({
      message: trimmed,
      sessionId: activeSession,
      preset: activePreset,
      signal: controller.signal,
      onToken: (token) => {
        accumulated += token;
        setStreamingContent(accumulated);
      },
      onDone: (data) => {
        setIsStreaming(false);
        setStreamingContent('');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response || accumulated },
        ]);
        if (data.summary) setMemorySummary(data.summary);
        if (data.usage) setUsage(data.usage);
        // Refresh session list metadata
        fetchSessions().then((res) => {
          if (res?.sessions) setSessions(res.sessions);
        });
      },
      onError: (err) => {
        setIsStreaming(false);
        setStreamingContent('');
        setErrorMessage(err.message || 'An error occurred during response streaming.');
      },
    });
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      if (streamingContent) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: streamingContent + ' [Interrupted by user]' },
        ]);
        setStreamingContent('');
      }
    }
  };

  // Session Handlers
  const handleSelectSession = (sessionId) => {
    if (sessionId === activeSession) return;
    loadSessionData(sessionId);
    setIsSidebarOpen(false);
  };

  const handleNewSession = (newId = null) => {
    const id =
      newId ||
      `session-${Date.now().toString().slice(-4)}`;
    setSessions((prev) => [
      { session_id: id, message_count: 0, last_message: '' },
      ...prev,
    ]);
    setActiveSession(id);
    setMessages([]);
    setMemorySummary(null);
    setUsage({
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      estimated_cost_usd: 0,
    });
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      const updated = sessions.filter((s) => s.session_id !== sessionId);
      setSessions(updated);
      if (activeSession === sessionId) {
        const nextId = updated[0]?.session_id || 'default';
        loadSessionData(nextId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSession = async (sessionId) => {
    try {
      await resetSession(sessionId);
      setMessages([]);
      setMemorySummary(null);
      setUsage({
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        estimated_cost_usd: 0,
      });
      // Refresh session list
      const res = await fetchSessions();
      if (res?.sessions) setSessions(res.sessions);
    } catch (e) {
      console.error(e);
    }
  };

  // Send Code to Workbench
  const handleSendToWorkbench = (code, language) => {
    setWorkbenchCode(code);
    setWorkbenchLang(language || 'python');
    setIsWorkbenchOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080b] text-gray-100 overflow-hidden font-sans selection:bg-[#951418] selection:text-white">
      {/* Top Header */}
      <Header
        activeSession={activeSession}
        sessions={sessions}
        activePreset={activePreset}
        presets={presets}
        onSelectPreset={setActivePreset}
        usage={usage}
        memorySummary={memorySummary}
        onOpenWorkbench={() => setIsWorkbenchOpen(!isWorkbenchOpen)}
        isWorkbenchOpen={isWorkbenchOpen}
        onOpenMemoryHUD={() => setIsMemoryHUDOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onNewSession={() => handleNewSession()}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        health={health}
      />

      {/* Main Workspace: Sidebar + Chat + Workbench */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onResetSession={handleResetSession}
          memorySummary={memorySummary}
          activePreset={activePreset}
          presets={presets}
          onSelectPreset={setActivePreset}
        />

        {/* Center: Chat Interface */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-radial-gradient relative">
          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-[#2a1114] border-b border-[#5e1923] text-[#fca5a5] px-4 py-2 text-xs flex items-center justify-between z-10 animate-shake">
              <div className="flex items-center space-x-2">
                <AlertCircle size={15} className="text-[#ef4444]" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-gray-400 hover:text-white text-xs underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 space-y-2">
            {messages.length === 0 && !isStreaming ? (
              <PromptArsenal onSelectPrompt={(p) => handleSendMessage(p)} />
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageItem
                    key={index}
                    message={msg}
                    onSendToWorkbench={handleSendToWorkbench}
                  />
                ))}

                {/* Streaming Assistant Turn */}
                {isStreaming && (
                  <MessageItem
                    message={{
                      role: 'assistant',
                      content: streamingContent || 'Analyzing code and formulating solution...',
                    }}
                    isStreaming={true}
                    onSendToWorkbench={handleSendToWorkbench}
                  />
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Floating Action Strip for Specialization Preset */}
          <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-gray-400 bg-[#0a0c12]/90 border-t border-[#1d1318]">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 hidden sm:inline">Active Mode:</span>
              <span className="text-[#f87171] font-semibold">
                {presets.find((p) => p.id === activePreset)?.badge || '⚔️ System Architect'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 hidden md:inline">
                Shortcuts: <kbd className="px-1 py-0.5 bg-[#181a24] rounded text-[10px]">Enter</kbd> Send, <kbd className="px-1 py-0.5 bg-[#181a24] rounded text-[10px]">Shift+Enter</kbd> Newline
              </span>
            </div>
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 md:p-4 bg-[#0d0f16] border-t border-[#261318]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="max-w-4xl mx-auto relative rounded-2xl bg-[#141724] border border-[#3b1721] focus-within:border-[#ef4444] transition-all shadow-xl flex flex-col p-2"
            >
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask KratosBot to write, debug, refactor, or test code... (Type /help for commands)"
                rows={Math.min(6, Math.max(1, inputMessage.split('\n').length))}
                className="w-full bg-transparent px-3 py-2 text-sm md:text-base text-gray-100 placeholder-gray-500 outline-none resize-none leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between pt-1 border-t border-[#232738]/40 px-2">
                <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMessage((prev) => prev + '\n```python\n\n```');
                      inputRef.current?.focus();
                    }}
                    title="Insert code block template"
                    className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-[#22171e] text-gray-300 hover:text-[#fca5a5] transition"
                  >
                    <Code2 size={13} />
                    <span className="text-[11px] hidden sm:inline">Add Code</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopStream}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#38151b] hover:bg-[#521c25] text-red-300 text-xs font-semibold border border-[#6b1e2a] transition"
                    >
                      <Square size={12} className="fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#951418] to-[#dc2626] hover:from-[#b91c1c] hover:to-[#ef4444] text-white text-xs font-bold tracking-wide uppercase transition shadow-lg shadow-red-950/50 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      <span>Send</span>
                      <Send size={13} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>

        {/* Right: Code Studio & Scratchpad Workbench */}
        <CodeWorkbench
          isOpen={isWorkbenchOpen}
          onClose={() => setIsWorkbenchOpen(false)}
          code={workbenchCode}
          language={workbenchLang}
          onChangeCode={setWorkbenchCode}
          onChangeLanguage={setWorkbenchLang}
          onSendPrompt={(p) => handleSendMessage(p)}
        />
      </div>

      {/* Memory HUD Modal */}
      <MemoryHUDModal
        isOpen={isMemoryHUDOpen}
        onClose={() => setIsMemoryHUDOpen(false)}
        session={activeSession}
        usage={usage}
        memorySummary={memorySummary}
        health={health}
      />

      {/* Quick Docs Modal */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
