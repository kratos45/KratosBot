import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  activeSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onResetSession,
  memorySummary,
  activePreset,
  presets,
  onSelectPreset,
}) {
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      onNewSession(newSessionName.trim());
      setNewSessionName('');
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-72 bg-[#0c0e15] border-r border-[#261217] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#241318] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare size={16} className="text-[#f87171]" />
            <span className="font-bold text-sm tracking-wide text-white">
              Coding Sessions
            </span>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            title="Create New Session"
            className="p-1 rounded-md bg-[#251217] hover:bg-[#38161f] text-[#fca5a5] border border-[#481923] transition"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* New Session Inline Form */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="p-3 bg-[#131622] border-b border-[#2d1217]">
            <input
              type="text"
              autoFocus
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="e.g. auth-refactor, api-v2"
              className="w-full px-2.5 py-1.5 bg-[#0b0c11] border border-[#3b151d] rounded text-xs text-white placeholder-gray-500 outline-none focus:border-[#ef4444]"
            />
            <div className="flex justify-end space-x-1.5 mt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-[11px] text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newSessionName.trim()}
                className="px-2.5 py-1 text-[11px] font-bold rounded bg-[#951418] hover:bg-[#dc2626] text-white disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 font-mono">
              No saved sessions yet.
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.session_id === activeSession;
              return (
                <div
                  key={sess.session_id}
                  onClick={() => onSelectSession(sess.session_id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-xs ${
                    isActive
                      ? 'bg-[#221318] text-[#fca5a5] border border-[#4d1822] shadow-md shadow-red-950/20'
                      : 'text-gray-300 hover:bg-[#131622] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold truncate">
                        {sess.session_id}
                      </span>
                      {sess.has_summary && (
                        <span
                          title="Contains Rolling Memory Summary"
                          className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"
                        />
                      )}
                    </div>
                    {sess.last_message ? (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5 font-mono">
                        {sess.last_message}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {sess.message_count} messages
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Delete session "${sess.session_id}" permanently?`
                            )
                          ) {
                            onDeleteSession(sess.session_id);
                          }
                        }}
                        title="Delete Session"
                        className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-[#33151b] transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rolling Memory Status Box */}
        <div className="p-3 bg-[#10131d] border-t border-[#241318] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400 font-bold flex items-center space-x-1">
              <Layers size={12} className="text-[#f59e0b]" />
              <span>Rolling Memory</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                memorySummary
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {memorySummary ? 'Active' : 'Awaiting Threshold'}
            </span>
          </div>

          <p className="text-[11px] text-gray-300 font-mono leading-relaxed line-clamp-2">
            {memorySummary ||
              'Old turns will automatically compress into concise technical memory.'}
          </p>

          <button
            onClick={() => {
              if (
                confirm(
                  `Reset history and token counters for session "${activeSession}"?`
                )
              ) {
                onResetSession(activeSession);
              }
            }}
            className="w-full mt-2.5 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-[#211419] hover:bg-[#33161e] text-gray-300 hover:text-[#fca5a5] border border-[#3b1720] transition text-[11px] font-medium"
          >
            <RotateCcw size={12} />
            <span>Reset Current Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
