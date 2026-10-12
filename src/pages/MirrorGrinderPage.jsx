import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Play,
  Square,
  Pause,
  AlertTriangle,
  Terminal,
  Settings,
  HelpCircle,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  X,
  Volume2,
  Bell,
  Layers,
  RotateCcw,
  Sparkles,
  Shield,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import sinnersData from '../data/sinners.json';

const ALL_PACKS_LIST = [
  "Hell's Chicken", "The Outcast", "Season of the Flame", "Sinking Deluge",
  "Thunder and Lightning", "Nocturnal Sweeping", "Rising Power Supply",
  "Slicers & Dicers", "Piercers & Penetrators", "Crushers & Breakers",
  "Repressed Wrath", "Unbound Wrath", "Addicting Lust", "Tangling Lust",
  "Treadwheel Sloth", "Inert Sloth", "Devoured Gluttony", "Excessive Gluttony",
  "Degraded Gloom", "Sunk Gloom", "Vain Pride", "Tyrannical Pride",
  "Insignificant Envy", "Pitiful Envy", "Burning Haze", "Trickled Sanguine Blood",
  "Mountain of Corpses", "Dizzying Waves", "Abnormal Seismic Zone",
  "Crushing External Force", "Unrelenting Might", "Deep Sigh", "Poised Breathing",
  "N Corp Inquisition", "Efflorescing Greenery", "Line 3 Terminus",
  "Bridle of Infinity", "Sea of Blood", "Impenetrable Path", "Bloodfiends",
  "Beautiful Voice", "The Green Dawn", "Certain Library", "Code Purple",
  "Bearers of Weight", "Line 1 Madness", "Blessed Carnival", "Fairy Tale",
  "Ichthyic Odor", "Complete Extermination", "La Mancha Land", "Mnestic Experience"
];

const MD_KEYWORDS = [
  { id: 'BURN', name: 'Burn', color: '#ef4444' },
  { id: 'BLEED', name: 'Bleed', color: '#dc2626' },
  { id: 'TREMOR', name: 'Tremor', color: '#eab308' },
  { id: 'RUPTURE', name: 'Rupture', color: '#22c55e' },
  { id: 'SINKING', name: 'Sinking', color: '#3b82f6' },
  { id: 'POISE', name: 'Poise', color: '#06b6d4' },
  { id: 'CHARGE', name: 'Charge', color: '#8b5cf6' }
];

const AFFINITIES = [
  { id: 'SLASH', name: 'Slash', color: '#f87171' },
  { id: 'PIERCE', name: 'Pierce', color: '#fb923c' },
  { id: 'BLUNT', name: 'Blunt', color: '#facc15' },
  { id: 'WRATH', name: 'Wrath', color: '#ef4444' },
  { id: 'LUST', name: 'Lust', color: '#f97316' },
  { id: 'SLOTH', name: 'Sloth', color: '#eab308' },
  { id: 'GLUTTONY', name: 'Gluttony', color: '#84cc16' },
  { id: 'GLOOM', name: 'Gloom', color: '#06b6d4' },
  { id: 'PRIDE', name: 'Pride', color: '#3b82f6' },
  { id: 'ENVY', name: 'Envy', color: '#a855f7' }
];

export default function MirrorGrinderPage() {
  // Navigation / Engine Modes
  const [viewMode, setViewMode] = useState('MD'); // 'MD' or 'LUX'
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showLogDrawer, setShowLogDrawer] = useState(false);

  // MD Run Parameters (Screen 1)
  const [mdRunCount, setMdRunCount] = useState(3);
  const [hardMode, setHardMode] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState('BURN');
  const [selectedAffinity, setSelectedAffinity] = useState('SLASH');

  // Lux Parameters (Screen 3)
  const [expLuxCount, setExpLuxCount] = useState(1);
  const [thdLuxCount, setThdLuxCount] = useState(1);
  const [restartDefeat, setRestartDefeat] = useState(true);
  const [altF4IfDone, setAltF4IfDone] = useState(false);
  const [buildModuleToBox, setBuildModuleToBox] = useState(true);
  const [collectDaily, setCollectDaily] = useState(true);
  const [doMdAfter, setDoMdAfter] = useState(false);

  // Bot Config Parameters (Screen 2)
  const [configTab, setConfigTab] = useState('NORMAL'); // 'NORMAL' or 'HARD'
  const [configSubTab, setConfigSubTab] = useState('ARAYASHU'); // 'ARAYASHU' or 'WEBHOOK'
  const [packMode, setPackMode] = useState('PRIORITIZE'); // 'PRIORITIZE' or 'AVOID'
  const [selectedPackToAdd, setSelectedPackToAdd] = useState(ALL_PACKS_LIST[0]);
  const [priorityPacks, setPriorityPacks] = useState(["Hell's Chicken", "The Outcast"]);
  const [avoidPacks, setAvoidPacks] = useState(["Complete Extermination", "Line 1 Madness"]);
  const [graceOfStarlight, setGraceOfStarlight] = useState(true);
  const [collectExtraPlus, setCollectExtraPlus] = useState(true);
  const [cardPriority, setCardPriority] = useState([2, 1, 3, 4, 5]);
  const [speedIntensity, setSpeedIntensity] = useState('NORMAL'); // LOW, NORMAL, FAST, TURBO
  const [reRunIfStuck, setReRunIfStuck] = useState(true);
  const [skipLast, setSkipLast] = useState(false);
  const [wishmaking, setWishmaking] = useState(false);
  const [winRate, setWinRate] = useState(true);
  const [customize, setCustomize] = useState(false);

  // Discord Webhook
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookThreadId, setWebhookThreadId] = useState('');
  const [webhookPingRoleId, setWebhookPingRoleId] = useState('');
  const [webhookCompactMode, setWebhookCompactMode] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState(null);

  // Sinners Roster Setup (12 sinners)
  const [rosterSinners, setRosterSinners] = useState(
    sinnersData.map((s, idx) => ({
      ...s,
      selected: idx < 6, // first 6 deployed by default
      identityName: `LCB Sinner ${s.name}`,
      equippedEgos: ['ZAYIN', 'TETH']
    }))
  );

  // Live Engine Telemetry
  const [telemetry, setTelemetry] = useState({
    state: 'IDLE',
    config: {},
    currentRun: 0,
    currentFloor: 1,
    totalStarlightEarned: 0,
    isLimbusFocused: false,
    sessionElapsedMs: 0,
    runElapsedMs: 0,
    recentLogs: []
  });

  const logTerminalRef = useRef(null);

  // Connect to Electron IPC
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

  // Auto-scroll terminal log
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [telemetry.recentLogs, showLogDrawer]);

  const formatTime = (ms) => {
    if (!ms || ms < 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (window.electronAPI?.startMirrorGrinder) {
      window.electronAPI.startMirrorGrinder({
        mode: viewMode === 'LUX' ? 'LUXCAVATION' : (hardMode ? 'HARD' : 'NORMAL'),
        hardMode,
        selectedKeyword,
        selectedAffinity,
        maxRuns: viewMode === 'LUX' ? 1 : Number(mdRunCount),
        speedIntensity,
        priorityPacks,
        avoidPacks,
        graceOfStarlight,
        collectExtraPlus,
        cardPriority,
        reRunIfStuck,
        altF4IfDone,
        buildModuleToBox,
        skipLast,
        wishmaking,
        winRate,
        customize,
        expLuxCount: Number(expLuxCount),
        thdLuxCount: Number(thdLuxCount),
        restartDefeat,
        collectDaily,
        doMdAfter,
        webhook: {
          enabled: Boolean(webhookUrl),
          url: webhookUrl,
          threadId: webhookThreadId,
          compactMode: webhookCompactMode,
          pingRoleId: webhookPingRoleId
        }
      });
    }
  };

  const handleStop = () => {
    if (window.electronAPI?.stopMirrorGrinder) {
      window.electronAPI.stopMirrorGrinder();
    }
  };

  const handleAddPack = () => {
    if (packMode === 'PRIORITIZE') {
      if (!priorityPacks.includes(selectedPackToAdd)) {
        setPriorityPacks([...priorityPacks, selectedPackToAdd]);
      }
    } else {
      if (!avoidPacks.includes(selectedPackToAdd)) {
        setAvoidPacks([...avoidPacks, selectedPackToAdd]);
      }
    }
  };

  const handleRemovePack = (pack, mode) => {
    if (mode === 'PRIORITIZE') {
      setPriorityPacks(priorityPacks.filter(p => p !== pack));
    } else {
      setAvoidPacks(avoidPacks.filter(p => p !== pack));
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl || !window.electronAPI?.testDiscordWebhook) return;
    setWebhookTesting(true);
    setWebhookTestStatus(null);
    try {
      const res = await window.electronAPI.testDiscordWebhook({
        url: webhookUrl,
        roleId: webhookPingRoleId
      });
      setWebhookTestStatus(res ? 'success' : 'error');
    } catch (e) {
      setWebhookTestStatus('error');
    } finally {
      setWebhookTesting(false);
    }
  };

  const isRunning = telemetry.state === 'RUNNING';
  const isPaused = telemetry.state === 'PAUSED';

  return (
    <div className="min-h-screen bg-[#111115] text-gray-200 p-6 max-w-7xl mx-auto space-y-6 font-sans select-none pb-24">
      {/* Top Header Bar (Matching ChargeGrinder Layout) */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-[#18181f] border border-[#2a2a36] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#242430] hover:bg-[#2e2e3e] text-xs font-bold text-gray-300 border border-[#3a3a4c] transition shadow-sm"
          >
            <HelpCircle size={15} className="text-[#c9a84c]" />
            Guide
          </button>
          <div className="h-4 w-px bg-[#333344]" />
          <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
            CHARGE GRINDER
            <span className="text-[11px] font-mono font-normal text-gray-400 bg-[#242430] px-2 py-0.5 rounded-md border border-[#353545]">
              v3.5.3
            </span>
          </h1>
        </div>

        {/* Center / Right controls: LOG toggle, Focus state, GitHub */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-[#121217] px-3 py-1.5 rounded-xl border border-[#2a2a38]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">LOG</span>
            <button
              onClick={() => setShowLogDrawer(!showLogDrawer)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center ${
                showLogDrawer ? 'bg-amber-600' : 'bg-[#2a2a38]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md ${
                  showLogDrawer ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Active Window Focus Badge */}
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            telemetry.isLimbusFocused
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-zinc-900 border-zinc-700 text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              telemetry.isLimbusFocused ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
            }`} />
            {telemetry.isLimbusFocused ? 'Limbus Focused' : 'Window Unfocused (Failsafe Ready)'}
          </div>

          <a
            href="https://github.com/walpth/Charge-Grinder"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-[#242430] hover:bg-[#2e2e3e] text-gray-400 hover:text-white border border-[#3a3a4c] transition"
            title="Charge-Grinder Repository"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </header>

      {/* Main Mode Action Ribbon (Matches Screen 1 & Screen 3) */}
      <section className="bg-[#18181f] border border-[#2a2a36] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Mode Switch & Counter */}
          <div className="flex flex-wrap items-center gap-4">
            {viewMode === 'MD' ? (
              <>
                <div className="flex items-center gap-2 bg-[#121217] border border-[#2e2e3e] rounded-xl p-1.5">
                  <button
                    onClick={() => setMdRunCount(Math.max(1, mdRunCount - 1))}
                    disabled={isRunning}
                    className="w-8 h-8 rounded-lg bg-[#242430] hover:bg-[#2e2e3e] text-lg font-bold flex items-center justify-center transition disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-14 text-center font-mono font-black text-lg text-white">
                    {mdRunCount}
                  </span>
                  <button
                    onClick={() => setMdRunCount(mdRunCount + 1)}
                    disabled={isRunning}
                    className="w-8 h-8 rounded-lg bg-[#242430] hover:bg-[#2e2e3e] text-lg font-bold flex items-center justify-center transition disabled:opacity-50"
                  >
                    +
                  </button>
                  <span className="px-2 text-xs font-black tracking-wider uppercase text-gray-400">MDs</span>
                </div>

                <button
                  onClick={() => setViewMode('LUX')}
                  disabled={isRunning}
                  className="px-4 py-2.5 rounded-xl bg-[#242430] hover:bg-[#2e2e3e] text-xs font-bold text-gray-200 border border-[#3a3a4c] transition shadow-sm disabled:opacity-50"
                >
                  Switch to Lux
                </button>

                {/* Hardmode Switch */}
                <div className="flex items-center gap-2 bg-[#121217] border border-[#2e2e3e] px-3.5 py-2 rounded-xl">
                  <span className="text-xs font-black tracking-wider uppercase text-red-400">HARDMODE</span>
                  <button
                    onClick={() => setHardMode(!hardMode)}
                    disabled={isRunning}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center ${
                      hardMode ? 'bg-red-600' : 'bg-[#2a2a38]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md ${
                        hardMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Lux Mode Controls (Screen 3) */}
                <div className="flex items-center gap-2 bg-[#121217] border border-[#2e2e3e] rounded-xl p-1.5">
                  <button
                    onClick={() => setExpLuxCount(Math.max(0, expLuxCount - 1))}
                    disabled={isRunning}
                    className="w-8 h-8 rounded-lg bg-[#242430] hover:bg-[#2e2e3e] text-sm font-bold flex items-center justify-center transition disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-black text-sm text-amber-300">
                    {expLuxCount}
                  </span>
                  <button
                    onClick={() => setExpLuxCount(expLuxCount + 1)}
                    disabled={isRunning}
                    className="w-8 h-8 rounded-lg bg-[#242430] hover:bg-[#2e2e3e] text-sm font-bold flex items-center justify-center transition disabled:opacity-50"
                  >
                    +
                  </button>
                  <span className="px-2 text-xs font-black uppercase text-gray-400">EXP Lux</span>
                </div>

                <div className="flex items-center gap-2 bg-[#121217] border border-[#2e2e3e] rounded-xl p-1.5">
                  <button
                    onClick={() => setThdLuxCount(Math.max(0, thdLuxCount - 1))}
                    disabled={isRunning}
                    className="w-8 h-8 rounded-lg bg-[#242430] hover:bg-[#2e2e3e] text-sm font-bold flex items-center justify-center transition disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-black text-sm text-cyan-300">
                    {thdLuxCount}
                  </span>
                  <button
                    onClick={() => setThdLuxCount(thdLuxCount + 1)}
                    disabled={isRunning}
                    className="w-8 h-8 rounded-lg bg-[#242430] hover:bg-[#2e2e3e] text-sm font-bold flex items-center justify-center transition disabled:opacity-50"
                  >
                    +
                  </button>
                  <span className="px-2 text-xs font-black uppercase text-gray-400">THD Lux</span>
                </div>

                <button
                  onClick={() => setViewMode('MD')}
                  disabled={isRunning}
                  className="px-4 py-2.5 rounded-xl bg-[#242430] hover:bg-[#2e2e3e] text-xs font-bold text-gray-200 border border-[#3a3a4c] transition shadow-sm disabled:opacity-50"
                >
                  Switch to MD
                </button>
              </>
            )}

            {/* Bot Config Trigger */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#242430] hover:bg-[#2e2e3e] text-xs font-bold text-gray-200 border border-[#3a3a4c] transition shadow-sm"
            >
              <Settings size={15} className="text-amber-400" />
              Bot Config
            </button>
          </div>

          {/* Large START / STOP Button */}
          <div className="flex items-center gap-3">
            {isRunning || isPaused ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-950/50 transition transform active:scale-95"
              >
                <Square size={18} fill="currentColor" />
                STOP ENGINE
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex items-center gap-2.5 px-10 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition transform active:scale-95"
              >
                <Play size={18} fill="currentColor" />
                START
              </button>
            )}
          </div>
        </div>

        {/* Luxcavation Quick Toggles Bar (Screen 3) */}
        {viewMode === 'LUX' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2 border-t border-[#2a2a38]">
            <label className="flex items-center gap-2 bg-[#121217] p-2.5 rounded-xl border border-[#2a2a38] cursor-pointer hover:bg-[#1a1a22] transition">
              <input
                type="checkbox"
                checked={restartDefeat}
                onChange={(e) => setRestartDefeat(e.target.checked)}
                className="rounded accent-red-600"
              />
              <span className="text-xs font-semibold text-gray-300">Restart DEFEAT</span>
            </label>
            <label className="flex items-center gap-2 bg-[#121217] p-2.5 rounded-xl border border-[#2a2a38] cursor-pointer hover:bg-[#1a1a22] transition">
              <input
                type="checkbox"
                checked={altF4IfDone}
                onChange={(e) => setAltF4IfDone(e.target.checked)}
                className="rounded accent-red-600"
              />
              <span className="text-xs font-semibold text-gray-300">Alt+F4 if done</span>
            </label>
            <label className="flex items-center gap-2 bg-[#121217] p-2.5 rounded-xl border border-[#2a2a38] cursor-pointer hover:bg-[#1a1a22] transition">
              <input
                type="checkbox"
                checked={buildModuleToBox}
                onChange={(e) => setBuildModuleToBox(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span className="text-xs font-semibold text-gray-300">Build Module -&gt; Box</span>
            </label>
            <label className="flex items-center gap-2 bg-[#121217] p-2.5 rounded-xl border border-[#2a2a38] cursor-pointer hover:bg-[#1a1a22] transition">
              <input
                type="checkbox"
                checked={collectDaily}
                onChange={(e) => setCollectDaily(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span className="text-xs font-semibold text-gray-300">Collect daily</span>
            </label>
            <label className="flex items-center gap-2 bg-[#121217] p-2.5 rounded-xl border border-[#2a2a38] cursor-pointer hover:bg-[#1a1a22] transition">
              <input
                type="checkbox"
                checked={doMdAfter}
                onChange={(e) => setDoMdAfter(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span className="text-xs font-semibold text-gray-300">Do MD after</span>
            </label>
          </div>
        )}

        {/* Team Keyword Tabs (Screen 1) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Team Keyword Selection
            </span>
            <span className="text-xs font-mono text-gray-500">
              Optimal packs & fusions adapt to keyword
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MD_KEYWORDS.map(kw => {
              const active = selectedKeyword === kw.id;
              return (
                <button
                  key={kw.id}
                  onClick={() => setSelectedKeyword(kw.id)}
                  disabled={isRunning}
                  style={{
                    backgroundColor: active ? kw.color : '#1a1a24',
                    borderColor: active ? kw.color : '#2d2d3e',
                    color: active ? '#ffffff' : '#9ca3af'
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide border transition shadow-sm disabled:opacity-50 ${
                    active ? 'shadow-lg shadow-black/40 scale-105' : 'hover:bg-[#252535]'
                  }`}
                >
                  {kw.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Affinity Pills (Screen 1) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Team Affinity & Sin Resonance
            </span>
            <span className="text-xs font-mono text-gray-500">
              Damage type & sin gift weighting
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AFFINITIES.map(aff => {
              const active = selectedAffinity === aff.id;
              return (
                <button
                  key={aff.id}
                  onClick={() => setSelectedAffinity(aff.id)}
                  disabled={isRunning}
                  style={{
                    backgroundColor: active ? aff.color : '#161620',
                    borderColor: active ? aff.color : '#2a2a3a',
                    color: active ? '#ffffff' : '#9ca3af'
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide border transition disabled:opacity-50 ${
                    active ? 'shadow-md shadow-black/40 scale-105' : 'hover:bg-[#20202e]'
                  }`}
                >
                  {aff.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12 Sinners Grid Roster (Matching Screen 1 Cards) */}
      <section className="bg-[#18181f] border border-[#2a2a36] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Sinner Roster Allocation
            </h2>
            <span className="text-xs text-gray-400">
              (Top 6 Deploy into battle, Bottom 6 provide Support Passives)
            </span>
          </div>
          <span className="text-xs font-mono text-[#c9a84c] bg-[#c9a84c]/10 px-2.5 py-1 rounded-lg border border-[#c9a84c]/30">
            Active: {rosterSinners.filter(s => s.selected).length} / 12
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {rosterSinners.map((sinner, idx) => {
            return (
              <div
                key={sinner.id}
                onClick={() => {
                  if (isRunning) return;
                  const updated = [...rosterSinners];
                  updated[idx].selected = !updated[idx].selected;
                  setRosterSinners(updated);
                }}
                className={`relative group rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-44 overflow-hidden ${
                  sinner.selected
                    ? 'bg-gradient-to-b from-[#252533] to-[#1a1a24] border-[#444458] shadow-md shadow-black/40'
                    : 'bg-[#121217] border-[#22222e] opacity-60 hover:opacity-90'
                }`}
              >
                {/* Sinner Number & Corner EGO Badges */}
                <div className="flex items-start justify-between z-10">
                  <span
                    style={{ color: sinner.color }}
                    className="text-xs font-black font-mono bg-black/50 px-2 py-0.5 rounded border border-white/10"
                  >
                    #{String(sinner.number).padStart(2, '0')}
                  </span>
                  <div className="flex gap-1">
                    {sinner.equippedEgos.map(ego => (
                      <span
                        key={ego}
                        className="text-[9px] font-black uppercase px-1 py-0.5 rounded bg-black/60 text-[#c9a84c] border border-[#c9a84c]/30"
                      >
                        {ego}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sinner Portrait Graphic Background */}
                <div className="my-auto flex items-center justify-center">
                  <div
                    style={{ borderColor: sinner.color }}
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center bg-black/40 shadow-inner group-hover:scale-105 transition-transform"
                  >
                    <span className="text-xl font-black" style={{ color: sinner.color }}>
                      {sinner.name[0]}
                    </span>
                  </div>
                </div>

                {/* Sinner Name & Deployment Status */}
                <div className="z-10 text-center">
                  <h3 className="text-xs font-black text-white truncate">{sinner.name}</h3>
                  <span className={`text-[10px] font-bold tracking-wider uppercase block mt-0.5 ${
                    sinner.selected ? 'text-emerald-400' : 'text-gray-500'
                  }`}>
                    {sinner.selected ? 'DEPLOYED' : 'BENCH'}
                  </span>
                </div>

                {/* Left Accent Pill */}
                <div
                  style={{ backgroundColor: sinner.color }}
                  className="absolute left-0 top-0 bottom-0 w-1"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Terminal LOG Drawer (Toggled by LOG Switch) */}
      <AnimatePresence>
        {showLogDrawer && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0e0e13] border border-[#2a2a38] rounded-2xl p-4 shadow-2xl font-mono text-xs overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222230]">
              <div className="flex items-center gap-2 text-gray-400">
                <Terminal size={14} className="text-amber-400" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Engine Telemetry & Command Stream
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-400">
                <span>Session: <strong className="text-white">{formatTime(telemetry.sessionElapsedMs)}</strong></span>
                <span>Run: <strong className="text-white">{formatTime(telemetry.runElapsedMs)}</strong></span>
                <span>Floor: <strong className="text-white">{telemetry.currentFloor} / 5</strong></span>
                <span>Starlight: <strong className="text-[#c9a84c]">+{telemetry.totalStarlightEarned}</strong></span>
              </div>
            </div>

            <div
              ref={logTerminalRef}
              className="mt-3 h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-700"
            >
              {telemetry.recentLogs.length === 0 ? (
                <div className="text-gray-600 italic py-4 text-center">
                  Engine standing by. Click START to begin autonomous runs.
                </div>
              ) : (
                telemetry.recentLogs.slice().reverse().map((entry, idx) => {
                  let color = 'text-gray-300';
                  if (entry.level === 'warning') color = 'text-amber-400';
                  if (entry.level === 'error') color = 'text-red-400';
                  if (entry.level === 'debug') color = 'text-gray-500';

                  return (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-gray-600 select-none">[{entry.timestamp}]</span>
                      <span className={color}>{entry.msg}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Bot Config Modal (Matching Screen 2) */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#181820] border border-[#333344] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#282836] bg-[#14141b]">
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-amber-400" />
                  <h2 className="text-base font-black uppercase tracking-wider text-white">Bot Config</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfigTab('NORMAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      configTab === 'NORMAL' ? 'bg-[#2e2e40] text-white border border-[#444458]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Normal MD
                  </button>
                  <button
                    onClick={() => setConfigTab('HARD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      configTab === 'HARD' ? 'bg-[#2e2e40] text-white border border-[#444458]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Hard MD
                  </button>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white ml-2 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Arayashu vs Discord Webhook */}
              <div className="flex border-b border-[#282836] bg-[#121217] px-5">
                <button
                  onClick={() => setConfigSubTab('ARAYASHU')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                    configSubTab === 'ARAYASHU'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Arayashu / General
                </button>
                <button
                  onClick={() => setConfigSubTab('WEBHOOK')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                    configSubTab === 'WEBHOOK'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Discord Webhook
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {configSubTab === 'ARAYASHU' ? (
                  <>
                    {/* Pack Selection Section */}
                    <div className="space-y-3 bg-[#131319] p-4 rounded-xl border border-[#282836]">
                      <div className="flex items-center justify-between">
                        <span className="font-black uppercase tracking-wider text-white">Pack Selection</span>
                        <div className="flex items-center gap-2 bg-[#1c1c26] p-1 rounded-lg border border-[#2e2e3e]">
                          <button
                            onClick={() => setPackMode('PRIORITIZE')}
                            className={`px-3 py-1 rounded text-[11px] font-bold transition ${
                              packMode === 'PRIORITIZE' ? 'bg-emerald-600 text-white' : 'text-gray-400'
                            }`}
                          >
                            Prioritize
                          </button>
                          <button
                            onClick={() => setPackMode('AVOID')}
                            className={`px-3 py-1 rounded text-[11px] font-bold transition ${
                              packMode === 'AVOID' ? 'bg-red-600 text-white' : 'text-gray-400'
                            }`}
                          >
                            Avoid
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={selectedPackToAdd}
                          onChange={(e) => setSelectedPackToAdd(e.target.value)}
                          className="flex-1 bg-[#1a1a24] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white outline-none"
                        >
                          {ALL_PACKS_LIST.map(pack => (
                            <option key={pack} value={pack}>{pack}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAddPack}
                          className="px-4 py-2 rounded-lg bg-[#2e2e40] hover:bg-[#38384e] text-white font-bold transition border border-[#444458]"
                        >
                          + Add
                        </button>
                      </div>

                      {/* Display active tags */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(packMode === 'PRIORITIZE' ? priorityPacks : avoidPacks).map(pack => (
                          <span
                            key={pack}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                              packMode === 'PRIORITIZE'
                                ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                                : 'bg-red-950/40 border-red-600/40 text-red-300'
                            }`}
                          >
                            {pack}
                            <button
                              onClick={() => handleRemovePack(pack, packMode)}
                              className="hover:text-white"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Grace of Starlight & Extra+ Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-center justify-between bg-[#131319] p-4 rounded-xl border border-[#282836] cursor-pointer">
                        <div>
                          <span className="font-bold text-white block">Grace of Starlight</span>
                          <span className="text-[11px] text-gray-400">Claim starlight starting blessings</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={graceOfStarlight}
                          onChange={(e) => setGraceOfStarlight(e.target.checked)}
                          className="w-4 h-4 rounded accent-amber-500"
                        />
                      </label>
                      <label className="flex items-center justify-between bg-[#131319] p-4 rounded-xl border border-[#282836] cursor-pointer">
                        <div>
                          <span className="font-bold text-white block">Collect Extra+</span>
                          <span className="text-[11px] text-gray-400">Claim extra rewards on completion</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={collectExtraPlus}
                          onChange={(e) => setCollectExtraPlus(e.target.checked)}
                          className="w-4 h-4 rounded accent-amber-500"
                        />
                      </label>
                    </div>

                    {/* Card Priority Selection (Slots 1-5) */}
                    <div className="bg-[#131319] p-4 rounded-xl border border-[#282836] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black uppercase tracking-wider text-white">Card Priority Order</span>
                        <span className="text-gray-400 text-[11px]">Floor reward slot picking priority</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cardPriority.map((slotNum, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-[#1a1a24] border border-[#2e2e3e] rounded-xl p-2.5 text-center"
                          >
                            <span className="text-[10px] text-gray-500 block">Slot {idx + 1}</span>
                            <span className="text-base font-black text-amber-400 mt-1 block">
                              {slotNum}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Speed Intensity & Detailed Switches */}
                    <div className="space-y-3 bg-[#131319] p-4 rounded-xl border border-[#282836]">
                      <div className="flex items-center justify-between">
                        <span className="font-black uppercase tracking-wider text-white">Execution Intensity</span>
                        <span className="text-amber-400 font-mono font-bold">{speedIntensity}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {['LOW', 'NORMAL', 'FAST', 'TURBO'].map(spd => (
                          <button
                            key={spd}
                            onClick={() => setSpeedIntensity(spd)}
                            className={`py-2 rounded-lg text-xs font-bold border transition ${
                              speedIntensity === spd
                                ? 'bg-amber-600 border-amber-500 text-white'
                                : 'bg-[#1a1a24] border-[#2e2e3e] text-gray-400 hover:text-white'
                            }`}
                          >
                            {spd}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Multi-toggle switches */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Re-run if stuck', val: reRunIfStuck, set: setReRunIfStuck },
                        { label: 'If done, Alt+F4', val: altF4IfDone, set: setAltF4IfDone },
                        { label: 'Build Module -> Box', val: buildModuleToBox, set: setBuildModuleToBox },
                        { label: 'Skip last', val: skipLast, set: setSkipLast },
                        { label: 'Wishmaking', val: wishmaking, set: setWishmaking },
                        { label: 'Win Rate', val: winRate, set: setWinRate },
                        { label: 'Customize', val: customize, set: setCustomize }
                      ].map(item => (
                        <label
                          key={item.label}
                          className="flex items-center gap-2 bg-[#131319] p-3 rounded-xl border border-[#282836] cursor-pointer hover:bg-[#1a1a24] transition"
                        >
                          <input
                            type="checkbox"
                            checked={item.val}
                            onChange={(e) => item.set(e.target.checked)}
                            className="rounded accent-amber-500"
                          />
                          <span className="text-[11px] font-semibold text-gray-300">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Discord Webhook Sub-tab (Matching Screen 2) */
                  <div className="space-y-4 bg-[#131319] p-5 rounded-xl border border-[#282836]">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Discord Webhook URL</label>
                      <input
                        type="text"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="w-full bg-[#1a1a24] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Thread ID (Optional)</label>
                        <input
                          type="text"
                          value={webhookThreadId}
                          onChange={(e) => setWebhookThreadId(e.target.value)}
                          placeholder="e.g. 1234567890"
                          className="w-full bg-[#1a1a24] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Ping Role ID (Optional)</label>
                        <input
                          type="text"
                          value={webhookPingRoleId}
                          onChange={(e) => setWebhookPingRoleId(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-[#1a1a24] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={webhookCompactMode}
                        onChange={(e) => setWebhookCompactMode(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span className="text-xs font-semibold text-gray-300">Compact Embed Mode</span>
                    </label>

                    <div className="flex items-center gap-3 pt-3 border-t border-[#282836]">
                      <button
                        onClick={handleTestWebhook}
                        disabled={webhookTesting || !webhookUrl}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2e2e40] hover:bg-[#38384e] text-white font-bold transition border border-[#444458] disabled:opacity-50"
                      >
                        <Bell size={14} />
                        {webhookTesting ? 'Sending test ping...' : 'Test Webhook'}
                      </button>

                      {webhookTestStatus === 'success' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={14} /> Ping dispatched successfully!
                        </span>
                      )}
                      {webhookTestStatus === 'error' && (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <X size={14} /> Webhook dispatch failed. Check URL.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#282836] bg-[#14141b] flex items-center justify-between">
                <button
                  onClick={() => {
                    setPriorityPacks(["Hell's Chicken", "The Outcast"]);
                    setAvoidPacks(["Complete Extermination", "Line 1 Madness"]);
                    setCardPriority([2, 1, 3, 4, 5]);
                    setSpeedIntensity('NORMAL');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#242430] hover:bg-[#2c2c3a] text-gray-400 hover:text-white font-bold transition border border-[#353545]"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-lg shadow-amber-950/40"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#181820] border border-[#333344] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#2a2a38] pb-3">
                <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#c9a84c]" />
                  Charge Grinder Setup Guide
                </h3>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                <p>
                  <strong>1. Resolution:</strong> Set Limbus Company to <strong>1920x1080</strong> (Windowed or Borderless Fullscreen) for coordinate mapping.
                </p>
                <p>
                  <strong>2. Safety Fail-Safe:</strong> The engine continuously reads active foreground window title. If you Alt-Tab away from Limbus Company, the engine <em>automatically pauses</em> input synthesis to avoid leakage.
                </p>
                <p>
                  <strong>3. Input Cadence:</strong> Movement is interpolated along arc-length cubic splines with micro-jitter and Gaussian key/click hold sampling (90ms-100ms) to mirror natural human hand kinetics.
                </p>
                <p>
                  <strong>4. Combat & Routing:</strong> Win Rate hotkey <code>[P]</code> is pulsed before committing turns with <code>[Enter]</code>. Events (0 battle time) are prioritized along map branches using <code>[W]</code>, <code>[D]</code>, <code>[S]</code>.
                </p>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#2e2e40] hover:bg-[#3a3a50] text-white font-bold transition border border-[#444458]"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
