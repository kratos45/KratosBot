import React from 'react';
import { X, BookOpen, Terminal, Cpu, Database, Shield, Zap } from 'lucide-react';

export default function DocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0e111a] border border-[#3b151d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#141724] border-b border-[#2d141b]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#2b1319] border border-[#481923]">
              <BookOpen size={18} className="text-[#38bdf8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                KratosBot Documentation & Quick Reference
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Specialized Autonomous Coding Agent Architecture
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-[#2e141c] pb-1.5 mb-2.5">
              <Zap size={16} className="text-[#ef4444]" />
              <span>Specialized Coding Agent Directives</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-300">
              KratosBot is designed as an uncompromising software engineering specialist. It writes
              production-ready code, designs distributed architectures, performs deep root-cause bug
              diagnostics, and formulates test suites with Big-O complexity awareness.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-[#2e141c] pb-1.5 mb-2.5">
              <Terminal size={16} className="text-[#f59e0b]" />
              <span>Commands & Shortcuts</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#141724] border border-[#2b2f42]">
                <span className="text-[#f87171] font-bold">/help</span> — List available commands
              </div>
              <div className="p-2.5 rounded-lg bg-[#141724] border border-[#2b2f42]">
                <span className="text-[#f87171] font-bold">/usage</span> — Token metrics & cost estimate
              </div>
              <div className="p-2.5 rounded-lg bg-[#141724] border border-[#2b2f42]">
                <span className="text-[#f87171] font-bold">/summary</span> — View active memory summary
              </div>
              <div className="p-2.5 rounded-lg bg-[#141724] border border-[#2b2f42]">
                <span className="text-[#f87171] font-bold">/reset</span> — Clear session context & counters
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-[#2e141c] pb-1.5 mb-2.5">
              <Database size={16} className="text-[#38bdf8]" />
              <span>Running Frontend & Backend</span>
            </h3>
            <div className="space-y-2 text-xs font-mono bg-[#0c0e14] p-3 rounded-xl border border-[#2d151c]">
              <div className="text-gray-400"># Start Web UI & API Server (Production Single-Command):</div>
              <div className="text-emerald-400">pipenv run kratosbot --serve --port 8000</div>
              <div className="text-gray-400 pt-2"># Interactive CLI Mode:</div>
              <div className="text-emerald-400">pipenv run kratosbot --session my-project</div>
              <div className="text-gray-400 pt-2"># Run Automated Test Suite:</div>
              <div className="text-emerald-400">pipenv run pytest</div>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-[#2e141c] pb-1.5 mb-2.5">
              <Shield size={16} className="text-[#10b981]" />
              <span>Specialization Persona Modes</span>
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li><strong className="text-[#fca5a5]">⚔️ Full-Stack System Architect:</strong> Scalable patterns, schema designs, DDD.</li>
              <li><strong className="text-[#fca5a5]">🛡️ Spartan Bug Hunter:</strong> Concurrency leaks, stack-trace forensics, regressions.</li>
              <li><strong className="text-[#fca5a5]">⚡ Clean Code & Optimizer:</strong> Big-O time/space reduction, strict typing, refactoring.</li>
              <li><strong className="text-[#fca5a5]">🧪 Test Specialist:</strong> Pytest suites, parameterization, mocks, boundary tests.</li>
              <li><strong className="text-[#fca5a5]">🔒 Security Auditor:</strong> OWASP Top 10 vulnerabilities, auth flows, sanitization.</li>
            </ul>
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
