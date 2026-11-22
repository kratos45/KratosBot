import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, Hash } from 'lucide-react';
import { highlightCode } from '../utils/syntaxHighlighter';

export default function CodeBlock({ code, language = '', onSendToWorkbench }) {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.trimEnd().split('\n');
  const highlightedHtml = highlightCode(code, language);

  return (
    <div className="code-block-container my-4 rounded-xl overflow-hidden border border-[#3b1216] bg-[#0c0e14] shadow-xl group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#141722] border-b border-[#2d1217] text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/70 border border-[#dc2626]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/70 border border-[#d97706]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/70 border border-[#059669]"></span>
          </div>
          <Terminal size={14} className="text-[#f87171]" />
          <span className="font-mono uppercase font-bold tracking-wider text-[#e2e8f0]">
            {language || 'code'}
          </span>
          <span className="text-gray-500 font-mono text-[10px]">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            title="Toggle line numbers"
            className={`p-1.5 rounded transition ${
              showLineNumbers ? 'text-[#f87171] bg-[#2a1418]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hash size={13} />
          </button>

          {onSendToWorkbench && (
            <button
              onClick={() => onSendToWorkbench(code, language)}
              title="Open in Code Workbench"
              className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-[#22171c] hover:bg-[#381c22] text-[#fca5a5] border border-[#4c1d24] transition"
            >
              <ExternalLink size={12} />
              <span className="hidden sm:inline">Workbench</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code to clipboard"
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-[#2c1318] hover:bg-[#431820] text-white border border-[#5c1c25] transition active:scale-95"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="relative overflow-x-auto text-[13px] font-mono leading-relaxed bg-[#0b0c10]">
        <div className="flex py-3 px-2">
          {showLineNumbers && (
            <div className="select-none text-right pr-3 pl-1 text-[#4b5563] font-mono border-r border-[#1f2430]">
              {lines.map((_, i) => (
                <div key={i} className="leading-6 text-[11px] h-6">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <pre className="flex-1 pl-4 pr-4 overflow-x-auto m-0 text-[#e6edf3]">
            <code
              className={`language-${language || 'text'}`}
              dangerouslySetString={undefined}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
}
