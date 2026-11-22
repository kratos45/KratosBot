import React, { useState } from 'react';
import {
  X,
  Play,
  Copy,
  Check,
  Code2,
  Trash2,
  Wrench,
  ShieldCheck,
  Zap,
  TestTube2,
  FileCode,
} from 'lucide-react';

const COMMON_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'bash',
  'sql',
  'json',
  'rust',
  'go',
  'cpp',
  'html',
  'css',
];

export default function CodeWorkbench({
  code,
  language,
  isOpen,
  onClose,
  onChangeCode,
  onChangeLanguage,
  onSendPrompt,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = (actionPrompt) => {
    if (!code.trim()) return;
    const formatted = `${actionPrompt}\n\n\`\`\`${language || 'text'}\n${code}\n\`\`\``;
    onSendPrompt(formatted);
  };

  return (
    <div className="workbench-panel flex flex-col h-full bg-[#0d0f16] border-l border-[#3a151b] w-full md:w-[480px] lg:w-[560px] shadow-2xl transition-all z-20">
      {/* Workbench Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#131622] border-b border-[#2b1218]">
        <div className="flex items-center space-x-2">
          <Code2 size={18} className="text-[#f87171]" />
          <span className="font-bold text-sm tracking-wide text-white">
            Code Studio & Scratchpad
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="bg-[#1f161a] text-xs font-mono text-[#fca5a5] border border-[#4d1922] rounded px-2 py-1 outline-none focus:border-[#ef4444]"
          >
            {COMMON_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#281319] transition"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>

          <button
            onClick={() => onChangeCode('')}
            title="Clear editor"
            className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-[#281319] transition"
          >
            <Trash2 size={15} />
          </button>

          <button
            onClick={onClose}
            title="Close workbench"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#281319] transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Code Textarea Editor */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col bg-[#090b10]">
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder={`// Paste or draft code here...\n// Use the Spartan Arsenal actions below to inspect, test, or refactor.`}
          className="w-full flex-1 p-3 bg-[#0d0f17] border border-[#23151b] focus:border-[#ef4444] rounded-lg font-mono text-xs md:text-sm text-gray-200 outline-none resize-none leading-relaxed selection:bg-[#7f1d1d]"
          spellCheck={false}
        />
      </div>

      {/* Action Buttons Toolbar */}
      <div className="p-3 bg-[#11131c] border-t border-[#261218] flex flex-col space-y-2">
        <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
          ⚡ Spartan Code Arsenal
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleAction('Diagnose and eliminate all bugs in this code:')}
            disabled={!code.trim()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#241318] hover:bg-[#3d1822] text-[#fca5a5] border border-[#4c1b24] transition disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left"
          >
            <Wrench size={14} className="text-[#f87171]" />
            <span>Hunt Bugs</span>
          </button>

          <button
            onClick={() =>
              handleAction(
                'Refactor this code for clean architecture, idiomatic standards, and optimal runtime complexity:'
              )
            }
            disabled={!code.trim()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#241318] hover:bg-[#3d1822] text-[#fca5a5] border border-[#4c1b24] transition disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left"
          >
            <Zap size={14} className="text-[#f59e0b]" />
            <span>Refactor & Speed</span>
          </button>

          <button
            onClick={() =>
              handleAction(
                'Generate a rigorous, comprehensive test suite (unit + edge cases + mocks) for this code:'
              )
            }
            disabled={!code.trim()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#241318] hover:bg-[#3d1822] text-[#fca5a5] border border-[#4c1b24] transition disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left"
          >
            <TestTube2 size={14} className="text-[#38bdf8]" />
            <span>Generate Tests</span>
          </button>

          <button
            onClick={() =>
              handleAction(
                'Perform a comprehensive security and vulnerability audit on this snippet:'
              )
            }
            disabled={!code.trim()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#241318] hover:bg-[#3d1822] text-[#fca5a5] border border-[#4c1b24] transition disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left"
          >
            <ShieldCheck size={14} className="text-[#10b981]" />
            <span>Security Audit</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (!code.trim()) return;
            onSendPrompt(`Review and analyze this code:\n\n\`\`\`${language || 'text'}\n${code}\n\`\`\``);
          }}
          disabled={!code.trim()}
          className="w-full mt-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-gradient-to-r from-[#951418] to-[#dc2626] hover:from-[#b91c1c] hover:to-[#ef4444] text-white font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-red-950/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play size={14} />
          <span>Send Code to KratosBot</span>
        </button>
      </div>
    </div>
  );
}
