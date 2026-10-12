import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  ShieldAlert,
  Play,
  Square,
  Pause,
  AlertTriangle,
  Compass,
  Zap,
  Clock,
  Terminal,
  Settings,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

const MD_KEYWORDS = [
  { id: 'BURN', name: 'Burn', color: '#ef4444', desc: 'Fastest average clears (~22 mins)' },
  { id: 'BLEED', name: 'Bleed', color: '#dc2626', desc: 'High single-target DPS' },
  { id: 'TREMOR', name: 'Tremor', color: '#eab308', desc: 'Heavy stagger burst' },
  { id: 'RUPTURE', name: 'Rupture', color: '#22c55e', desc: 'Hard MD optimal (~38 mins)' },
  { id: 'SINKING', name: 'Sinking', color: '#3b82f6', desc: 'Sanity destruction & gloom burst' },
  { id: 'POISE', name: 'Poise', color: '#06b6d4', desc: 'Critical strike scaling' },
  { id: 'CHARGE', name: 'Charge', color: '#8b5cf6', desc: 'W Corp & high coin power' },
];

export default function MirrorGrinderPage() {
  const [telemetry, setTelemetry] = useState({
    state: 'IDLE',
    config: {
      mode: 'NORMAL',
      selectedKeyword: 'BURN',
      priorityPacks: ['HellsChicken', 'TheOutcast'],
      bannedPacks: ['NoonOfViolet', 'WarpExpress', 'TimekillingTime'],
      humanCadence: true,
      maxRuns: 3
    },
    currentRun: 0,
    currentFloor: 1,
    isLimbusFocused: false,
    sessionElapsedMs: 0,
    runElapsedMs: 0,
    recentLogs: []
  });

  const [hasOptedIn, setHasOptedIn] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [activeKeyword, setActiveKeyword] = useState('BURN');
  const [activeMode, setActiveMode] = useState('NORMAL');
  const [maxRuns, setMaxRuns] = useState(3);
  const logTerminalRef = useRef(null);

  // Poll initial status & listen to telemetry events
  useEffect(() => {
    if (window.electronAPI?.getMirrorGrinderStatus) {
      window.electronAPI.getMirrorGrinderStatus().then(status => {
        if (status) setTelemetry(status);
      });
    }

    if (window.electronAPI?.onMirrorGrinderTelemetry) {
      window.electronAPI.onMirrorGrinderTelemetry(status => {
        setTelemetry(status);
      });
    }

    return () => {
      if (window.electronAPI?.removeMirrorGrinderTelemetry) {
        window.electronAPI.removeMirrorGrinderTelemetry();
      }
    };
  }, []);

  // Format milliseconds into MM:SS
  const formatTime = (ms) => {
    if (!ms || ms < 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!hasOptedIn) {
      setShowConsentModal(true);
      return;
    }

    if (window.electronAPI?.startMirrorGrinder) {
      window.electronAPI.startMirrorGrinder({
        mode: activeMode,
        selectedKeyword: activeKeyword,
        maxRuns: Number(maxRuns),
        humanCadence: true
      });
    }
  };

  const handleStop = () => {
    if (window.electronAPI?.stopMirrorGrinder) {
      window.electronAPI.stopMirrorGrinder();
    }
  };

  const isRunning = telemetry.state === 'RUNNING';
  const isPaused = telemetry.state === 'PAUSED';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#333] bg-gradient-to-r from-[#140b0b] via-[#0d0d12] to-black p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Zap size={32} className={isRunning ? 'animate-pulse text-yellow-400' : 'text-red-400'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded border border-[#c9a84c]/30">
                  ⚡ Autonomous Mirror Engine
                </span>
                <span className="text-[10px] font-mono text-gray-500">v1.0.87 • Clean-Room</span>
              </div>
              <h1 className="text-3xl font-black font-limbus text-white tracking-wide mt-1">
                CHARGE GRINDER HUB
              </h1>
              <p className="text-xs text-gray-400 max-w-xl mt-1">
                Inspired by Walpth's Charge-Grinder. Automated Mirror Dungeon routing, intelligent Win Rate clash mitigation, and Gaussian humanized input pacing.
              </p>
            </div>
          </div>

          {/* Engine Status Capsule */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 backdrop-blur-md ${
              isRunning
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : isPaused
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse'
                : 'bg-zinc-900/60 border-zinc-700/60 text-gray-400'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-ping' : isPaused ? 'bg-amber-400' : 'bg-gray-500'
              }`} />
              <span className="text-xs font-black tracking-wider uppercase">
                {telemetry.state}
              </span>
            </div>

            {/* Window Active Status */}
            <div className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              telemetry.isLimbusFocused
                ? 'bg-blue-950/30 border-blue-600/40 text-blue-300'
                : 'bg-red-950/30 border-red-800/40 text-red-300'
            }`} title={telemetry.isLimbusFocused ? 'Limbus Company has active focus' : 'Limbus Company is in background (Engine Auto-Paused)'}>
              <div className={`w-2 h-2 rounded-full ${telemetry.isLimbusFocused ? 'bg-blue-400' : 'bg-red-400'}`} />
              <span>{telemetry.isLimbusFocused ? 'Game Focused' : 'Background (Paused)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mission Controls & Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Controls Card */}
          <div className="rounded-xl border border-[#333] bg-[#0e0e12] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#c9a84c]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Run Settings</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Dungeon Preset</span>
            </div>

            {/* Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Mirror Dungeon Tier:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setActiveMode('NORMAL')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    activeMode === 'NORMAL'
                      ? 'border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.2)]'
                      : 'border-[#333] bg-black/40 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  NORMAL (MD6)
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setActiveMode('HARD')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    activeMode === 'HARD'
                      ? 'border-red-500 bg-red-950/40 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : 'border-[#333] bg-black/40 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  HARD (Ritual)
                </button>
              </div>
            </div>

            {/* Keyword Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Primary Team Affinity:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {MD_KEYWORDS.map(kw => (
                  <button
                    key={kw.id}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setActiveKeyword(kw.id)}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                      activeKeyword === kw.id
                        ? 'border-white/60 bg-white/10 text-white font-bold'
                        : 'border-[#222] bg-black/30 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: kw.color }} />
                      <span className="text-xs">{kw.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Runs */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">Target Runs:</span>
                <span className="text-[#c9a84c] font-mono font-bold">{maxRuns} Clear{maxRuns > 1 ? 's' : ''}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={maxRuns}
                disabled={isRunning}
                onChange={e => setMaxRuns(Number(e.target.value))}
                className="w-full accent-[#c9a84c] bg-black/40 rounded-lg cursor-pointer"
              />
            </div>

            {/* Start / Stop Button Bar */}
            <div className="pt-2">
              {!isRunning && !isPaused ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
                >
                  <Play size={18} fill="currentColor" />
                  Engage Charge Grinder
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStop}
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-red-400 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Square size={18} fill="currentColor" />
                  Emergency Stop Engine
                </button>
              )}
            </div>
          </div>

          {/* Account Safety Guard Notice */}
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert size={16} />
              <span>Project Moon Input Safety Guard</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed font-mono">
              The engine incorporates Gaussian micro-jitter (90ms ± 25ms hold duration) and instantaneous Alt+Tab auto-pausing to prevent repetitive robotic cadences.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Live Telemetry, Run Progress, & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Telemetry Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-[#333] bg-[#0e0e12] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Current Run</span>
              <div className="text-2xl font-black text-white font-mono mt-2">
                {telemetry.currentRun} <span className="text-xs text-gray-500">/ {telemetry.config.maxRuns}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#333] bg-[#0e0e12] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Current Floor</span>
              <div className="text-2xl font-black text-[#c9a84c] font-mono mt-2">
                Floor {telemetry.currentFloor}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#333] bg-[#0e0e12] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Run Elapsed</span>
              <div className="text-2xl font-black text-blue-400 font-mono mt-2">
                {formatTime(telemetry.runElapsedMs)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#333] bg-[#0e0e12] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Session Time</span>
              <div className="text-2xl font-black text-purple-400 font-mono mt-2">
                {formatTime(telemetry.sessionElapsedMs)}
              </div>
            </div>
          </div>

          {/* Tactical Terminal & Live Logs */}
          <div className="rounded-xl border border-[#333] bg-black p-4 space-y-3 shadow-inner">
            <div className="flex justify-between items-center border-b border-[#222] pb-2">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400">TACTICAL BLACKBOX TELEMETRY</span>
              </div>
              <span className="text-[10px] font-mono text-gray-600">P-Key Win Rate • Enter Confirm</span>
            </div>

            <div
              ref={logTerminalRef}
              className="h-72 overflow-y-auto space-y-1 font-mono text-xs p-2 custom-scrollbar select-text bg-[#050508] rounded-lg border border-[#1a1a24]"
            >
              {telemetry.recentLogs && telemetry.recentLogs.length > 0 ? (
                telemetry.recentLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 leading-relaxed ${
                      log.level === 'warning'
                        ? 'text-amber-400'
                        : log.level === 'error'
                        ? 'text-red-400'
                        : log.level === 'debug'
                        ? 'text-zinc-500'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-600 text-[10px] shrink-0 pt-0.5">[{log.timestamp}]</span>
                    <span>{log.msg}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-600 italic py-10 text-center">
                  Engine standing by. Configure settings and click Engage to commence operations.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Consent Modal */}
      <AnimatePresence>
        {showConsentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-lg bg-[#0e0707] border-2 border-red-600 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.5)] p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-500">
                <ShieldAlert size={28} />
                <h3 className="text-xl font-black font-limbus tracking-wider">PROJECT MOON SAFETY NOTICE</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-mono">
                Automation tools and macros interact with the game window. While Charge Grinder utilizes randomized Gaussian timing and auto-pauses when the window loses focus, using automated assistance carries inherent account risk under Project Moon's Terms of Service.
              </p>
              <div className="p-3 bg-red-950/40 rounded-xl border border-red-900 text-xs font-mono text-red-200">
                ⚠️ Never run automation unattended for unnatural durations. Use emergency stop anytime by focusing away or clicking stop.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-gray-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasOptedIn(true);
                    setShowConsentModal(false);
                    if (window.electronAPI?.startMirrorGrinder) {
                      window.electronAPI.startMirrorGrinder({
                        mode: activeMode,
                        selectedKeyword: activeKeyword,
                        maxRuns: Number(maxRuns),
                        humanCadence: true
                      });
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-md cursor-pointer"
                >
                  I Understand & Consent
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
