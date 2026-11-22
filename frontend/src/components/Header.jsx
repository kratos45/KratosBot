import React from 'react';
import {
  Code,
  Cpu,
  Layers,
  BookOpen,
  DollarSign,
  PlusCircle,
  Menu,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Activity,
} from 'lucide-react';
import kratosLogo from '../assets/kratos_logo_transparent.png';

export default function Header({
  activeSession,
  sessions,
  activePreset,
  presets,
  onSelectPreset,
  usage,
  memorySummary,
  onOpenWorkbench,
  isWorkbenchOpen,
  onOpenMemoryHUD,
  onOpenDocs,
  onNewSession,
  onToggleSidebar,
  health,
}) {
  const currentPresetData = presets?.find((p) => p.id === activePreset) || {
    badge: '⚔️ System Architect',
    title: 'Full-Stack Architect',
  };

  const totalTokens = usage?.total_tokens || 0;
  const costUsd = usage?.estimated_cost_usd || 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0c12]/95 backdrop-blur-md border-b border-[#2d1217] px-3 md:px-5 py-2.5 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            title="Toggle Sessions Menu"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#20141a] transition lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer select-none">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#951418] to-[#ef4444] opacity-75 blur-sm group-hover:opacity-100 transition"></div>
              <img
                src={kratosLogo}
                alt="Kratos Logo"
                className="relative w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.7)]"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg md:text-xl tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-[#fca5a5]">
                  KRATOS<span className="text-[#ef4444]">BOT</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#33141a] text-[#f87171] border border-[#5c1c25]">
                  v0.2 CODING AGENT
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] font-mono text-gray-400 tracking-tight hidden sm:block">
                SPARTAN AUTONOMOUS CODING AGENT // GROQ ACCELERATED
              </p>
            </div>
          </div>
        </div>

        {/* Center: Specialization Preset Selector */}
        <div className="hidden md:flex items-center">
          <div className="relative group">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#141724] border border-[#3b1720] hover:border-[#ef4444]/60 transition cursor-pointer">
              <span className="text-xs font-semibold text-[#fca5a5]">
                {currentPresetData.badge || '⚔️ Architect'}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-64 p-1.5 rounded-xl bg-[#121522] border border-[#3b1720] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="text-[10px] uppercase tracking-wider font-mono px-2 py-1 text-gray-400">
                Coding Specialization Mode
              </div>
              {presets?.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col space-y-0.5 transition ${
                    activePreset === preset.id
                      ? 'bg-[#2a1319] text-[#fca5a5] border border-[#521c25]'
                      : 'text-gray-300 hover:bg-[#1a1c2a] hover:text-white'
                  }`}
                >
                  <span className="font-bold flex items-center space-x-1.5">
                    <span>{preset.badge}</span>
                  </span>
                  <span className="text-[11px] text-gray-400">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Token HUD & Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Token Usage Pill */}
          <button
            onClick={onOpenMemoryHUD}
            title="Inspect Memory & Token Accounting"
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-[#131622] hover:bg-[#1c2033] border border-[#33161e] text-xs transition"
          >
            <Activity size={13} className="text-[#10b981]" />
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-gray-300">
                {totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens} tok
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-[#f59e0b] font-semibold">${costUsd.toFixed(6)}</span>
            </div>
          </button>

          {/* Code Workbench Toggle */}
          <button
            onClick={onOpenWorkbench}
            title={isWorkbenchOpen ? 'Close Code Workbench' : 'Open Code Workbench'}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isWorkbenchOpen
                ? 'bg-[#951418] text-white border-[#dc2626] shadow-lg shadow-red-950/50'
                : 'bg-[#151825] hover:bg-[#201820] text-gray-200 border-[#381822]'
            }`}
          >
            <Code size={14} className={isWorkbenchOpen ? 'text-white' : 'text-[#f87171]'} />
            <span className="hidden sm:inline">Workbench</span>
          </button>

          {/* Docs Modal Button */}
          <button
            onClick={onOpenDocs}
            title="KratosBot Docs & Architecture"
            className="p-1.5 md:px-2.5 md:py-1.5 rounded-xl bg-[#151825] hover:bg-[#201820] border border-[#381822] text-gray-300 hover:text-white transition flex items-center space-x-1 text-xs"
          >
            <BookOpen size={14} className="text-[#38bdf8]" />
            <span className="hidden md:inline">Docs</span>
          </button>

          {/* New Session Button */}
          <button
            onClick={onNewSession}
            title="Create New Session"
            className="p-1.5 md:px-2.5 md:py-1.5 rounded-xl bg-[#2b1218] hover:bg-[#3d151e] border border-[#521b25] text-[#fca5a5] hover:text-white transition flex items-center space-x-1 text-xs font-bold"
          >
            <PlusCircle size={14} />
            <span className="hidden md:inline">New</span>
          </button>
        </div>
      </div>
    </header>
  );
}
