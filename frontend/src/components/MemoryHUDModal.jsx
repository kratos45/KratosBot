import React from 'react';
import { X, Layers, Activity, Database, DollarSign, Cpu, CheckCircle } from 'lucide-react';

export default function MemoryHUDModal({
  isOpen,
  onClose,
  session,
  usage,
  memorySummary,
  health,
}) {
  if (!isOpen) return null;

  const totalTokens = usage?.total_tokens || 0;
  const inputTokens = usage?.input_tokens || 0;
  const outputTokens = usage?.output_tokens || 0;
  const requestsWithUsage = usage?.requests_with_usage || 0;
  const requestsWithoutUsage = usage?.requests_without_usage || 0;
  const cost = usage?.estimated_cost_usd || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0e111a] border border-[#3b151d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#141724] border-b border-[#2d141b]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#2b1319] border border-[#481923]">
              <Layers size={18} className="text-[#f87171]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Memory HUD & Token Accounting
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Session: <span className="text-[#fca5a5]">{session}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#251319] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Token Usage Stats Grid */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
              <Activity size={14} className="text-[#10b981]" />
              <span>Token Accounting & Pricing</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#131622] border border-[#232738]">
                <div className="text-[11px] text-gray-400 font-mono">Input Tokens</div>
                <div className="text-base font-bold text-gray-100 font-mono mt-1">
                  {inputTokens.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#131622] border border-[#232738]">
                <div className="text-[11px] text-gray-400 font-mono">Output Tokens</div>
                <div className="text-base font-bold text-gray-100 font-mono mt-1">
                  {outputTokens.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#131622] border border-[#232738]">
                <div className="text-[11px] text-gray-400 font-mono">Total Tokens</div>
                <div className="text-base font-bold text-[#f87171] font-mono mt-1">
                  {totalTokens.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#131622] border border-[#232738]">
                <div className="text-[11px] text-gray-400 font-mono">Estimated Cost</div>
                <div className="text-base font-bold text-[#f59e0b] font-mono mt-1">
                  ${cost.toFixed(6)}
                </div>
              </div>
            </div>

            <div className="mt-2 text-[11px] font-mono text-gray-400 flex items-center justify-between px-1">
              <span>Verified Requests: {requestsWithUsage}</span>
              {requestsWithoutUsage > 0 && (
                <span className="text-amber-400">Missing Usage: {requestsWithoutUsage}</span>
              )}
            </div>
          </div>

          {/* Rolling Summary State */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center space-x-1.5">
              <Database size={14} className="text-[#38bdf8]" />
              <span>Rolling SQLite Memory Summary</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-[#111420] border border-[#271b22] font-mono text-xs leading-relaxed text-gray-300">
              {memorySummary ? (
                <div>
                  <div className="flex items-center space-x-1 text-emerald-400 text-[11px] mb-2 font-semibold">
                    <CheckCircle size={13} />
                    <span>Memory Snapshot Active & Retained in Model Context:</span>
                  </div>
                  <p className="whitespace-pre-wrap">{memorySummary}</p>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  No rolling summary triggered yet. Summarization activates automatically
                  when conversation turns reach the configured threshold (default: 12 messages),
                  preserving key architectural decisions and schemas while purging verbose transcripts.
                </div>
              )}
            </div>
          </div>

          {/* Architecture Card */}
          <div className="p-3.5 rounded-xl bg-[#181216] border border-[#3d1822] text-xs text-gray-300 leading-relaxed">
            <span className="font-bold text-[#fca5a5]">Two-Layer Memory Architecture:</span>
            <p className="mt-1 text-gray-400">
              1. <strong>Recent Turns:</strong> Exact user and assistant messages retained verbatim.
              <br />
              2. <strong>Rolling Summary:</strong> Older turns compressed by Kratos into a compact technical
              synopsis preserved in SQLite for future turns.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#131622] border-t border-[#26151c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#241318] hover:bg-[#38161f] text-white text-xs font-semibold border border-[#481923] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
