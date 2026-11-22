import React from 'react';
import {
  Sparkles,
  Zap,
  Wrench,
  ShieldCheck,
  TestTube2,
  Workflow,
  Terminal,
} from 'lucide-react';
import kratosLogo from '../assets/kratos_logo_transparent.png';

export default function PromptArsenal({ onSelectPrompt }) {
  const PROMPTS = [
    {
      icon: <Workflow size={16} className="text-[#f87171]" />,
      title: 'Full-Stack Architecture',
      desc: 'Design scalable distributed systems, schema contracts, and clean modular boundaries.',
      prompt:
        'Design a high-throughput, fault-tolerant job queue system in Python with clean architecture, SQLite/PostgreSQL persistence, and worker pools.',
    },
    {
      icon: <Wrench size={16} className="text-[#f59e0b]" />,
      title: 'Surgical Debugging',
      desc: 'Dissect stack traces, expose concurrency pitfalls, and eradicate insidious bugs.',
      prompt:
        'I have an intermittent race condition / deadlock in my async code. What diagnostic steps and concurrency locks should I implement to eradicate it?',
    },
    {
      icon: <Zap size={16} className="text-[#38bdf8]" />,
      title: 'Clean Code & Big-O Speedup',
      desc: 'Refactor messy legacy code into idiomatic, strictly typed functions with optimal runtime.',
      prompt:
        'Refactor this algorithmic function to achieve optimal O(n) runtime complexity and strict PEP 484 type annotations.',
    },
    {
      icon: <TestTube2 size={16} className="text-[#a855f7]" />,
      title: 'Test Suite Automation',
      desc: 'Formulate comprehensive Pytest/Vitest suites with parameterized edge cases and mocks.',
      prompt:
        'Write a complete pytest test suite covering happy paths, edge cases, exceptions, and mocked external API clients for this service.',
    },
    {
      icon: <ShieldCheck size={16} className="text-[#10b981]" />,
      title: 'DevSecOps & OWASP Audit',
      desc: 'Identify injection flaws, broken auth, CSRF, and security vulnerabilities.',
      prompt:
        'Perform a security audit on this API authentication middleware. Check for OWASP Top 10 vulnerabilities, timing attacks, and token replay.',
    },
    {
      icon: <Terminal size={16} className="text-[#ec4899]" />,
      title: 'Bash & DevOps Pipeline',
      desc: 'Construct automated Dockerfiles, CI/CD GitHub Actions, and deployment scripts.',
      prompt:
        'Create a lightweight multi-stage Dockerfile and GitHub Actions CI workflow with caching, linting, and automated test execution.',
    },
  ];

  return (
    <div className="empty-feed-hero flex flex-col items-center justify-center py-10 px-4 max-w-4xl mx-auto select-none">
      {/* Central Emblem */}
      <div className="relative group mb-6">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#951418] via-[#dc2626] to-[#ea580c] opacity-30 blur-xl group-hover:opacity-50 transition duration-700"></div>
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-b from-[#181a24] to-[#0c0e14] border border-[#4a1820] p-3 flex items-center justify-center shadow-2xl">
          <img
            src={kratosLogo}
            alt="Kratos Logo"
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
          />
        </div>
      </div>

      {/* Hero Headings */}
      <h1 className="text-2xl md:text-3xl font-black text-center text-white tracking-wider mb-2">
        CONQUER COMPLEX CODE
      </h1>
      <p className="text-xs md:text-sm text-gray-400 text-center max-w-xl font-mono mb-8 leading-relaxed">
        Spartan Autonomous Coding Specialist. Powered by Groq ultra-low latency inference,
        rolling SQLite memory compression, and uncompromising engineering discipline.
      </p>

      {/* Prompt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        {PROMPTS.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrompt(card.prompt)}
            className="p-3.5 rounded-xl bg-[#121520]/80 hover:bg-[#1a1e2c] border border-[#2b141a] hover:border-[#ef4444]/60 transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-red-950/20 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <div className="p-1 rounded bg-[#201419] border border-[#3b1720]">
                  {card.icon}
                </div>
                <span className="font-bold text-xs text-gray-200 group-hover:text-[#fca5a5] transition">
                  {card.title}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                {card.desc}
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-[#ef4444] font-semibold flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
              <span>Execute Objective →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
