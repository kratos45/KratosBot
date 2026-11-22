import React, { useState } from 'react';
import { User, Copy, Check, Sparkles, ShieldAlert } from 'lucide-react';
import CodeBlock from './CodeBlock';
import kratosLogo from '../assets/kratos_logo_transparent.png';

/**
 * Parses markdown-like text into segments of markdown prose and code blocks.
 */
function parseMessageContent(text) {
  if (!text) return [];

  const segments = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    segments.push({
      type: 'code',
      language: match[1] || '',
      content: match[2] || '',
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Format inline markdown text: bold, italic, inline code, headers, bullets.
 */
function renderFormattedText(text) {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Headers
    if (line.startsWith('### ')) {
      return (
        <h3 key={lineIdx} className="text-lg font-bold text-[#f87171] mt-4 mb-2">
          {formatInline(line.slice(4))}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={lineIdx} className="text-xl font-extrabold text-[#fca5a5] border-b border-[#3b1216] pb-1 mt-5 mb-2">
          {formatInline(line.slice(3))}
        </h2>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <h1 key={lineIdx} className="text-2xl font-black text-white mt-6 mb-3 tracking-wide">
          {formatInline(line.slice(2))}
        </h1>
      );
    }

    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote
          key={lineIdx}
          className="border-l-4 border-[#dc2626] bg-[#1a0f12] text-gray-300 pl-4 py-1.5 my-2 italic rounded-r text-sm"
        >
          {formatInline(line.slice(2))}
        </blockquote>
      );
    }

    // Bullet points
    if (line.match(/^[\*\-]\s+/)) {
      return (
        <div key={lineIdx} className="flex items-start space-x-2 my-1 text-gray-200">
          <span className="text-[#ef4444] mt-1.5 text-xs select-none">◆</span>
          <span className="flex-1">{formatInline(line.replace(/^[\*\-]\s+/, ''))}</span>
        </div>
      );
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start space-x-2.5 my-1 text-gray-200">
          <span className="font-mono text-xs font-bold text-[#f59e0b] select-none min-w-[20px]">
            {numMatch[1]}.
          </span>
          <span className="flex-1">{formatInline(numMatch[2])}</span>
        </div>
      );
    }

    // Normal empty line
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Standard paragraph
    return (
      <p key={lineIdx} className="my-1.5 text-gray-200 leading-relaxed">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(str) {
  // Split by inline code: `code`
  const parts = str.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#20151a] text-[#fca5a5] border border-[#451821] font-mono text-[13px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting
    const boldParts = part.split(/(\*\*[^\*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={`${index}-${bIdx}`} className="font-semibold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

export default function MessageItem({
  message,
  isStreaming = false,
  onSendToWorkbench,
}) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const segments = parseMessageContent(message.content);

  return (
    <div
      className={`message-wrapper flex w-full my-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[94%] md:max-w-[85%] lg:max-w-[80%] rounded-2xl p-4 md:p-5 transition-all shadow-lg ${
          isUser
            ? 'bg-[#181a24] border border-[#2b3042] text-gray-100 rounded-tr-none'
            : 'bg-[#11131a] border border-[#3b1216] text-gray-200 rounded-tl-none shadow-[0_4px_25px_rgba(149,20,24,0.08)]'
        }`}
      >
        {/* Message Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1f2432]/60">
          <div className="flex items-center space-x-2.5">
            {isUser ? (
              <div className="w-7 h-7 rounded-lg bg-[#272d40] border border-[#3a4460] flex items-center justify-center text-blue-400">
                <User size={15} />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={kratosLogo}
                  alt="KratosBot"
                  className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#11131a]"></span>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  {isUser ? 'You' : 'KratosBot'}
                </span>
                {!isUser && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-[#2e1217] text-[#f87171] border border-[#5a1b24] uppercase tracking-wider">
                    Coding Specialist
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isUser && (
              <button
                onClick={handleCopyMessage}
                title="Copy entire response"
                className="flex items-center space-x-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-[#201419] transition"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="text-[11px] hidden sm:inline">Copy All</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Message Body */}
        <div className="message-content text-sm md:text-base leading-relaxed break-words">
          {segments.map((seg, idx) => {
            if (seg.type === 'code') {
              return (
                <CodeBlock
                  key={idx}
                  code={seg.content}
                  language={seg.language}
                  onSendToWorkbench={onSendToWorkbench}
                />
              );
            }
            return (
              <div key={idx} className="prose-content">
                {renderFormattedText(seg.content)}
              </div>
            );
          })}

          {/* Real-time Streaming Cursor */}
          {isStreaming && (
            <span className="inline-block w-2.5 h-4 ml-1 align-middle bg-[#ef4444] animate-pulse shadow-[0_0_8px_#ef4444]" />
          )}
        </div>
      </div>
    </div>
  );
}
