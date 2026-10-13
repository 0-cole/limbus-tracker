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
  Info,
  Maximize2
} from 'lucide-react';
import sinnersData from '../data/sinners.json';

const getChargeGrinderAsset = (filePath) => `./assets/charge_grinder/${String(filePath).replace(/^\/+/, '')}`;

const ALL_PACKS_LIST = [
  "TheForgotten", "TheOutcast", "FlatbrokeGamblers", "AutomatedFactory", "TheUnloving",
  "NagelundHammer", "FaithErosion", "HellsChicken", "TobeCrushed", "TheNoonofViolet",
  "MurderontheWARPExpress", "FullStoppedbyaBullet", "VainPride", "CrawlingAbyss",
  "TimekillingTime", "NocturnalSweeping", "toClaimTheirBones", "TheDuskofAmber",
  "CharmWanderDoubt", "SeasonoftheFlame", "SinkingDeluge", "ThunderandLightning",
  "RisingPowerSupply", "SlicersDicers", "PiercersPenetrators", "CrushersBreakers",
  "RepressedWrath", "UnboundWrath", "AddictingLust", "TanglingLust", "TreadwheelSloth",
  "InertSloth", "DevouredGluttony", "ExcessiveGluttony", "DegradedGloom", "SunkGloom",
  "TyrannicalPride", "InsignificantEnvy", "PitifulEnvy", "BurningHaze", "MountainofCorpses",
  "DizzyingWaves", "AbnormalSeismicZone", "CrushingExternalForce", "UnrelentingMight",
  "DeepSigh", "PoisedBreathing", "NCorp", "EfflorescingGreenery", "Line3Terminus",
  "BridleofInfinity", "Bloodfiends", "BeautifulVoice", "TheGreenDawn", "CertainLibrary",
  "CodePurple", "BearersofWeight", "Line1Madness", "BlessedCarnival", "FairyTale",
  "IchthyicOdor", "CompleteExtermination", "LaManchaMaster", "MnesticExperience"
];

// 24 Keywordless EGO Gifts from Charge-Grinder paths.py / WORDLESS dictionary
const KEYWORDLESS_GIFTS = [
  { id: 0, name: "False Halo", file: "falsehalo.png", tier: "IV", maxState: 3 },
  { id: 1, name: "Piece of Relationship", file: "pieceofrelationship.png", tier: "IV", maxState: 3 },
  { id: 2, name: "Carmilla", file: "carmilla.png", tier: "II", maxState: 3 },
  { id: 3, name: "Investigator Badge", file: "investigatorbadge.png", tier: "II", maxState: 3 },
  { id: 4, name: "Ancient Effigy", file: "ancienteffigy.png", tier: "IV", maxState: 2 },
  { id: 5, name: "Faith", file: "faith.png", tier: "IV", maxState: 2 },
  { id: 6, name: "Kim Ji-hoon", file: "kimjihoon.png", tier: "IV", maxState: 2 },
  { id: 7, name: "Grand Welcome", file: "grandwelcome.png", tier: "III", maxState: 2 },
  { id: 8, name: "Illusory Hunt", file: "illusoryhunt.png", tier: "III", maxState: 2 },
  { id: 9, name: "Prestige Card", file: "prestigecard.png", tier: "III", maxState: 2 },
  { id: 10, name: "Rusty Coin", file: "rustycoin.png", tier: "III", maxState: 2 },
  { id: 11, name: "Special Contract", file: "specialcontract.png", tier: "III", maxState: 2 },
  { id: 12, name: "Blessing", file: "blessing.png", tier: "III", maxState: 2 },
  { id: 13, name: "Tango", file: "tango.png", tier: "III", maxState: 2 },
  { id: 14, name: "Child Within Flask", file: "childwithinflask.png", tier: "II", maxState: 2 },
  { id: 15, name: "Coffee Cranes", file: "coffeecranes.png", tier: "II", maxState: 2 },
  { id: 16, name: "Moth Eclipse", file: "motheclipse.png", tier: "II", maxState: 2 },
  { id: 17, name: "Golden Urn", file: "goldenurn.png", tier: "II", maxState: 2 },
  { id: 18, name: "Homeward", file: "homeward.png", tier: "II", maxState: 2 },
  { id: 19, name: "Oracle", file: "oracle.png", tier: "II", maxState: 2 },
  { id: 20, name: "Painkiller", file: "painkiller.png", tier: "II", maxState: 2 },
  { id: 21, name: "Hammer", file: "hammer.png", tier: "II", maxState: 2 },
  { id: 22, name: "Lithograph", file: "lithograph.png", tier: "I", maxState: 2 },
  { id: 23, name: "Phlebotomy Pack", file: "phlebotomypack.png", tier: "I", maxState: 2 },
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
  // Navigation & Modals
  const [viewMode, setViewMode] = useState('MD'); // 'MD' or 'LUX'
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [logActive, setLogActive] = useState(true);

  // MD Run Parameters
  const [mdRunCount, setMdRunCount] = useState(3);
  const [hardMode, setHardMode] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState('BURN');
  const [selectedAffinity, setSelectedAffinity] = useState('SLASH');

  // Lux Parameters
  const [expLuxCount, setExpLuxCount] = useState(1);
  const [thdLuxCount, setThdLuxCount] = useState(3);
  const [restartDefeat, setRestartDefeat] = useState(true);
  const [altF4IfDone, setAltF4IfDone] = useState(false);
  const [buildModuleToBox, setBuildModuleToBox] = useState(true);
  const [collectDaily, setCollectDaily] = useState(true);
  const [doMdAfter, setDoMdAfter] = useState(false);

  // Bot Config Parameters
  const [configTab, setConfigTab] = useState('NORMAL'); // 'NORMAL' or 'HARD'
  const [configSubTab, setConfigSubTab] = useState('ARAYASHU'); // 'ARAYASHU' or 'WEBHOOK'
  
  // Pack Selection (Two Columns: Prioritize vs Avoid)
  const [prioDropdown, setPrioDropdown] = useState("TheForgotten");
  const [avoidDropdown, setAvoidDropdown] = useState("TheForgotten");
  const [priorityPacks, setPriorityPacks] = useState(["FlatbrokeGamblers", "HellsChicken", "TheOutcast"]);
  const [avoidPacks, setAvoidPacks] = useState([
    "AutomatedFactory", "TheUnloving", "FaithErosion", "TobeCrushed", "TheNoonofViolet", "MurderontheWARPExpress"
  ]);

  // Grace & Other Settings
  const [graceState, setGraceState] = useState([true, false, false, false, false, false, false, false, false, false]);
  const [speedLevel, setSpeedLevel] = useState(1); // 1 to 4
  const [reRunIfStuck, setReRunIfStuck] = useState(true);
  const [skipLast, setSkipLast] = useState(false);
  const [wishmaking, setWishmaking] = useState(false);
  const [winRate, setWinRate] = useState(true);

  // Keywordless EGO Gifts custom state map: { [id]: state }
  // state: 0 = off, 1 = keep (blue), 2 = buy (yellow stripes), 3 = uptie (orange stripes)
  const [customGifts, setCustomGifts] = useState({
    0: 2, 1: 2, 2: 2, 3: 2, 4: 0, 5: 0,
    6: 0, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2,
    12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2,
    18: 2, 19: 2, 20: 2, 21: 2, 22: 0, 23: 2
  });

  // Discord Webhook
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookThreadId, setWebhookThreadId] = useState('');
  const [webhookPingRoleId, setWebhookPingRoleId] = useState('');
  const [webhookCompactMode, setWebhookCompactMode] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState(null);

  // Per-Team Sinners deployment & order mapping (saved in localStorage)
  const [teamSinners, setTeamSinners] = useState(() => {
    try {
      const saved = localStorage.getItem('chargegrinder_team_sinners');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Active Sinner selection order (default is empty/none, or loaded from team)
  const [selectedSinners, setSelectedSinners] = useState(() => {
    try {
      const saved = localStorage.getItem('chargegrinder_team_sinners');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed['BURN'] || [];
    } catch (e) {
      return [];
    }
  });
  const [saveTeamNotice, setSaveTeamNotice] = useState(false);

  // Telemetry state
  const [telemetry, setTelemetry] = useState({
    state: 'IDLE',
    currentRun: 0,
    currentFloor: 1,
    totalStarlightEarned: 0,
    isLimbusFocused: false,
    sessionElapsedMs: 0,
    runElapsedMs: 0,
    recentLogs: []
  });

  const logTerminalRef = useRef(null);

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

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [telemetry.recentLogs, logActive]);

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
        speedIntensity: speedLevel === 1 ? 'LOW' : speedLevel === 2 ? 'NORMAL' : speedLevel === 3 ? 'FAST' : 'TURBO',
        priorityPacks,
        avoidPacks,
        reRunIfStuck,
        altF4IfDone,
        buildModuleToBox,
        skipLast,
        wishmaking,
        winRate,
        customGifts,
        selectedSinners,
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

  const handleSelectKeyword = (kwId) => {
    // Save current selection to active keyword
    const updatedTeams = {
      ...teamSinners,
      [selectedKeyword]: selectedSinners
    };
    setTeamSinners(updatedTeams);
    try {
      localStorage.setItem('chargegrinder_team_sinners', JSON.stringify(updatedTeams));
    } catch (e) {}

    setSelectedKeyword(kwId);
    // Load new team's saved sinner selection (default to empty/none [] if not previously saved)
    setSelectedSinners(updatedTeams[kwId] || []);
  };

  const toggleSinner = (id) => {
    let updated;
    if (selectedSinners.includes(id)) {
      // Allow deselecting all the way down to none (0 sinners)
      updated = selectedSinners.filter(s => s !== id);
    } else {
      // Append sinner to the deployment order
      updated = [...selectedSinners, id];
    }
    setSelectedSinners(updated);

    const updatedTeams = {
      ...teamSinners,
      [selectedKeyword]: updated
    };
    setTeamSinners(updatedTeams);
    try {
      localStorage.setItem('chargegrinder_team_sinners', JSON.stringify(updatedTeams));
    } catch (e) {}
  };

  const handleClearSinners = () => {
    setSelectedSinners([]);
    const updatedTeams = {
      ...teamSinners,
      [selectedKeyword]: []
    };
    setTeamSinners(updatedTeams);
    try {
      localStorage.setItem('chargegrinder_team_sinners', JSON.stringify(updatedTeams));
    } catch (e) {}
  };

  const handleSaveTeamOrder = () => {
    const updatedTeams = {
      ...teamSinners,
      [selectedKeyword]: selectedSinners
    };
    setTeamSinners(updatedTeams);
    try {
      localStorage.setItem('chargegrinder_team_sinners', JSON.stringify(updatedTeams));
    } catch (e) {}
    setSaveTeamNotice(true);
    setTimeout(() => setSaveTeamNotice(false), 2000);
  };

  const handleApplyPreset = (presetList) => {
    setSelectedSinners(presetList);
    const updatedTeams = {
      ...teamSinners,
      [selectedKeyword]: presetList
    };
    setTeamSinners(updatedTeams);
    try {
      localStorage.setItem('chargegrinder_team_sinners', JSON.stringify(updatedTeams));
    } catch (e) {}
  };

  const cycleGiftState = (giftId, maxState) => {
    const curr = customGifts[giftId] || 0;
    const next = (curr + 1) % (maxState + 1);
    setCustomGifts({ ...customGifts, [giftId]: next });
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
    <div className="min-h-screen bg-[#0e0e12] text-[#edd1ac] p-4 max-w-5xl mx-auto space-y-4 font-['ExcelsiorSans',sans-serif] select-none pb-20">
      
      {/* Authentic ChargeGrinder Header Frame (Matching ChargeGrinder v3.5.3 UI) */}
      <div className="relative rounded-xl border-2 border-[#7b6240] bg-gradient-to-r from-[#17130f] via-[#211a14] to-[#17130f] p-3 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Chibi Yi Sang Guide Trigger Button */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#10242e] hover:bg-[#183543] border border-[#00d0ff] text-[#00d0ff] font-bold text-sm transition shadow-[0_0_12px_rgba(0,208,255,0.3)]"
          >
            <img src={getChargeGrinderAsset('guide_icon.png')} alt="Guide" className="w-6 h-6 object-contain" />
            <span>GUIDE</span>
          </button>

          {/* Electric Cyan Stencil Title */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-black tracking-widest text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">
              ChargeGrinder
            </h1>
            <span className="text-xs text-[#a0855b] font-mono">v3.5.3</span>
          </div>
        </div>

        {/* LOG Switch & GitHub */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-[#7b6240]">
            <span className="text-xs font-bold text-[#edd1ac]">LOG</span>
            <button
              onClick={() => setLogActive(!logActive)}
              className={`px-2 py-0.5 rounded text-xs font-black transition ${
                logActive ? 'bg-[#00e5ff] text-black shadow-[0_0_8px_#00e5ff]' : 'bg-[#33291d] text-gray-400'
              }`}
            >
              {logActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <a
            href="https://github.com/walpth/Charge-Grinder"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded bg-[#2a2219] hover:bg-[#3a3024] border border-[#7b6240] text-[#edd1ac] hover:text-white transition"
            title="Charge-Grinder Repository by Walpth"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Credit Attribution Bar */}
      <div className="flex items-center justify-between text-[11px] text-[#b09670] bg-[#1a140e] px-4 py-1.5 rounded-lg border border-[#483824]">
        <span>⚡ Originally Designed & Created by <strong>Walpth</strong> (Charge-Grinder v3.5.3)</span>
        <span>Resolution: <strong>1920x1080</strong> &amp; <strong>1280x720</strong> (16:9 ratio supported)</span>
      </div>

      {/* Main Command Deck (Normal/Hard MD or Luxcavation) */}
      <div className="rounded-xl border-2 border-[#7b6240] bg-[#1a1510] p-4 shadow-2xl space-y-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {viewMode === 'MD' ? (
              <>
                {/* Grind Count Input (Image 1 & 4) */}
                <div className="flex items-center gap-2 bg-black/70 border border-[#7b6240] px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-bold text-[#c9a84c]">Grind</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={mdRunCount}
                    onChange={(e) => setMdRunCount(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isRunning}
                    className="w-12 bg-transparent text-center font-black text-lg text-white outline-none border-b border-[#7b6240]"
                  />
                  <span className="text-xs font-bold text-gray-400">MDs</span>
                </div>

                {/* Switch to Lux */}
                <button
                  onClick={() => setViewMode('LUX')}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-lg bg-[#2b2217] hover:bg-[#3d3121] text-xs font-black text-[#edd1ac] border border-[#7b6240] transition"
                >
                  Switch to Lux
                </button>

                {/* Hardmode Switch */}
                <div className="flex items-center gap-2 bg-black/60 border border-[#7b6240] px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-black uppercase text-red-400">HARDMODE</span>
                  <button
                    onClick={() => setHardMode(!hardMode)}
                    disabled={isRunning}
                    className={`px-2 py-0.5 rounded text-xs font-black transition ${
                      hardMode ? 'bg-red-600 text-white shadow-[0_0_8px_red]' : 'bg-[#33291d] text-gray-400'
                    }`}
                  >
                    {hardMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Lux Mode Counters (Image 3) */}
                <div className="flex items-center gap-2 bg-black/70 border border-[#7b6240] px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-bold text-[#c9a84c]">Grind</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={expLuxCount}
                    onChange={(e) => setExpLuxCount(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={isRunning}
                    className="w-10 bg-transparent text-center font-black text-base text-amber-300 outline-none border-b border-[#7b6240]"
                  />
                  <span className="text-xs font-bold text-gray-400">EXP Lux</span>
                </div>

                <div className="flex items-center gap-2 bg-black/70 border border-[#7b6240] px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-bold text-[#c9a84c]">Grind</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={thdLuxCount}
                    onChange={(e) => setThdLuxCount(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={isRunning}
                    className="w-10 bg-transparent text-center font-black text-base text-cyan-300 outline-none border-b border-[#7b6240]"
                  />
                  <span className="text-xs font-bold text-gray-400">THD Lux</span>
                </div>

                <button
                  onClick={() => setViewMode('MD')}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-lg bg-[#2b2217] hover:bg-[#3d3121] text-xs font-black text-[#edd1ac] border border-[#7b6240] transition"
                >
                  Switch to MD
                </button>
              </>
            )}

            {/* Bot Config Trigger */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2b2217] hover:bg-[#3d3121] text-xs font-black text-[#edd1ac] border border-[#7b6240] transition"
            >
              <Settings size={15} className="text-amber-400" />
              Bot Config
            </button>
          </div>

          {/* Action Trigger (START / STOP) */}
          <div>
            {isRunning || isPaused ? (
              <button
                onClick={handleStop}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white font-black text-sm uppercase tracking-wider border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition"
              >
                STOP
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-10 py-2.5 rounded-lg bg-gradient-to-r from-[#1c7848] to-[#2cb56c] hover:from-[#249459] hover:to-[#35d881] text-white font-black text-sm uppercase tracking-wider border border-emerald-400 shadow-[0_0_15px_rgba(46,181,108,0.4)] transition"
              >
                START
              </button>
            )}
          </div>
        </div>

        {/* Luxcavation Quick Toggles Bar */}
        {viewMode === 'LUX' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#483824]">
            {[
              { label: 'Restart DEFEAT', val: restartDefeat, set: setRestartDefeat },
              { label: 'Alt+F4 if done', val: altF4IfDone, set: setAltF4IfDone },
              { label: 'Build Module -> Box', val: buildModuleToBox, set: setBuildModuleToBox },
              { label: 'Collect daily', val: collectDaily, set: setCollectDaily },
              { label: 'Do MD after', val: doMdAfter, set: setDoMdAfter }
            ].map(item => (
              <label key={item.label} className="flex items-center gap-2 bg-black/40 p-2 rounded border border-[#483824] cursor-pointer hover:bg-black/60 transition text-xs">
                <input
                  type="checkbox"
                  checked={item.val}
                  onChange={(e) => item.set(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span className="text-gray-300 font-bold">{item.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Team Keyword Tabs */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#b09670]">
            <span>TEAM KEYWORD SELECTION</span>
            <span className="text-[10px] text-gray-500">Adapts encounter pack valuation & rest shop fusions</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MD_KEYWORDS.map(kw => {
              const active = selectedKeyword === kw.id;
              return (
                <button
                  key={kw.id}
                  onClick={() => handleSelectKeyword(kw.id)}
                  disabled={isRunning}
                  style={{
                    backgroundColor: active ? kw.color : 'rgba(0,0,0,0.5)',
                    borderColor: active ? kw.color : '#5c482f',
                    color: active ? '#ffffff' : '#c9a84c'
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-black tracking-wide border transition ${
                    active ? 'shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-105' : 'hover:bg-black/80'
                  }`}
                >
                  {kw.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Affinity Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#b09670]">
            <span>TEAM AFFINITY &amp; SIN RESONANCE</span>
            <span className="text-[10px] text-gray-500">Damage type &amp; sin gift weighting</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AFFINITIES.map(aff => {
              const active = selectedAffinity === aff.id;
              return (
                <button
                  key={aff.id}
                  onClick={() => setSelectedAffinity(aff.id)}
                  disabled={isRunning}
                  style={{
                    backgroundColor: active ? aff.color : 'rgba(0,0,0,0.4)',
                    borderColor: active ? aff.color : '#443420',
                    color: active ? '#ffffff' : '#a89070'
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                    active ? 'shadow-[0_0_8px_rgba(255,255,255,0.2)] scale-105' : 'hover:bg-black/70'
                  }`}
                >
                  {aff.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12 Sinners Grid with Authentic Image Portraits & Order Badges */}
        <div className="space-y-2 pt-2 border-t border-[#483824]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-[#b09670]">SINNERS DEPLOYMENT ROSTER</span>
              <span className="px-2 py-0.5 rounded bg-[#2b2217] border border-[#7b6240] text-amber-300 font-mono text-[11px]">
                TEAM: {selectedKeyword}
              </span>
              <span className="text-[#c9a84c]">
                ({selectedSinners.length} / 12 selected{selectedSinners.length === 0 ? ' — None by default' : ''})
              </span>
            </div>

            {/* Team Order Actions */}
            <div className="flex items-center gap-2">
              {saveTeamNotice && (
                <span className="text-emerald-400 text-xs font-bold animate-pulse">
                  ✓ Team Order Saved!
                </span>
              )}
              <button
                onClick={handleClearSinners}
                disabled={isRunning || selectedSinners.length === 0}
                className="px-2 py-1 rounded bg-[#2a1a1a] hover:bg-[#3d2424] text-red-300 border border-red-900/60 text-[11px] font-bold transition disabled:opacity-40"
              >
                Clear (0)
              </button>
              <button
                onClick={() => handleApplyPreset([1, 2, 3, 4, 5, 6])}
                disabled={isRunning}
                className="px-2 py-1 rounded bg-[#1e282d] hover:bg-[#283840] text-cyan-300 border border-cyan-800/60 text-[11px] font-bold transition disabled:opacity-40"
              >
                Preset (1-6)
              </button>
              <button
                onClick={handleSaveTeamOrder}
                disabled={isRunning}
                className="px-2.5 py-1 rounded bg-[#2b2217] hover:bg-[#3d3121] text-amber-300 border border-[#7b6240] text-[11px] font-black transition disabled:opacity-40"
              >
                Save Team Order
              </button>
            </div>
          </div>

          {/* Active Deployment Order Sequence Preview */}
          {selectedSinners.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded bg-black/50 border border-[#3d2f1f] text-[11px]">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mr-1">Turn Order:</span>
              {selectedSinners.map((sinnerId, idx) => {
                const SINNER_NAMES = {
                  1: "Yi Sang", 2: "Faust", 3: "Don Quixote", 4: "Ryoshu",
                  5: "Meursault", 6: "Hong Lu", 7: "Heathcliff", 8: "Ishmael",
                  9: "Rodion", 10: "Sinclair", 11: "Outis", 12: "Gregor"
                };
                return (
                  <span
                    key={sinnerId}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#13222a] border border-[#00d0ff]/50 text-[#00e5ff] font-bold"
                  >
                    <span className="text-[10px] text-amber-300 font-mono">#{idx + 1}</span>
                    <span>{SINNER_NAMES[sinnerId]}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="p-2 rounded bg-black/40 border border-[#3d2f1f] text-gray-500 text-xs italic text-center">
              No sinners currently selected for {selectedKeyword}. Click any sinner card below to add them to this team's turn order (1st click = Slot #1, 2nd click = Slot #2, etc.).
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
            {[
              { id: 1, name: "Yi Sang", slug: "lcb-sinner-yi-sang", color: "#4a90d9" },
              { id: 2, name: "Faust", slug: "lcb-sinner-faust", color: "#c084fc" },
              { id: 3, name: "Don Quixote", slug: "lcb-sinner-don-quixote", color: "#fbbf24" },
              { id: 4, name: "Ryōshū", slug: "lcb-sinner-ryoshu", color: "#f87171" },
              { id: 5, name: "Meursault", slug: "lcb-sinner-meursault", color: "#a3a3a3" },
              { id: 6, name: "Hong Lu", slug: "lcb-sinner-hong-lu", color: "#34d399" },
              { id: 7, name: "Heathcliff", slug: "lcb-sinner-heathcliff", color: "#fb923c" },
              { id: 8, name: "Ishmael", slug: "lcb-sinner-ishmael", color: "#38bdf8" },
              { id: 9, name: "Rodion", slug: "lcb-sinner-rodion", color: "#f472b6" },
              { id: 10, name: "Sinclair", slug: "lcb-sinner-sinclair", color: "#a78bfa" },
              { id: 11, name: "Outis", slug: "lcb-sinner-outis", color: "#6ee7b7" },
              { id: 12, name: "Gregor", slug: "lcb-sinner-gregor", color: "#fca5a5" },
            ].map(sinner => {
              const orderIndex = selectedSinners.indexOf(sinner.id);
              const isSelected = orderIndex !== -1;
              const orderNumber = orderIndex + 1;
              return (
                <div
                  key={sinner.id}
                  onClick={() => !isRunning && toggleSinner(sinner.id)}
                  className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all transform hover:scale-[1.03] ${
                    isSelected
                      ? 'border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.5)] brightness-110'
                      : 'border-[#483824] opacity-50 hover:opacity-90 grayscale hover:grayscale-0'
                  }`}
                >
                  <img
                    src={`./assets/sinners/${sinner.id}.webp`}
                    alt={sinner.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://assets.limbusdeck.com/identities/full/${sinner.slug}.webp`;
                    }}
                    className="w-full h-36 object-cover object-top bg-[#120e0a]"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/85 py-1 px-1.5 flex items-center justify-between border-t border-[#7b6240]/60">
                    <span className="text-[11px] font-black text-[#edd1ac] tracking-wide truncate">
                      {sinner.name}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: sinner.color }}
                      title={sinner.name}
                    />
                  </div>
                  {isSelected && (
                    <>
                      <div className="absolute top-1 right-1 bg-[#00e5ff] text-black font-black text-[10px] px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(0,229,255,0.9)]">
                        #{orderNumber}
                      </div>
                      <div className="absolute top-1 left-1 bg-black/85 border border-[#00e5ff]/60 text-[#edd1ac] font-mono text-[9px] px-1 py-0.5 rounded shadow">
                        {orderIndex < 7 ? `SLOT ${orderNumber}` : `BENCH`}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live LOG Console (Drawer toggled by top switch) */}
      {logActive && (
        <div className="rounded-xl border-2 border-[#7b6240] bg-[#120e0a] p-3 shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#332616] text-[11px] text-[#b09670]">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#00e5ff]" />
              <span className="font-bold text-white uppercase">Engine Activity Stream</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Session: <strong className="text-white">{formatTime(telemetry.sessionElapsedMs)}</strong></span>
              <span>Floor: <strong className="text-white">{telemetry.currentFloor} / 5</strong></span>
              <span>Starlight: <strong className="text-[#c9a84c]">+{telemetry.totalStarlightEarned}</strong></span>
              <span>Focus: <strong className={telemetry.isLimbusFocused ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.isLimbusFocused ? 'Limbus Focused' : 'Auto-Pause Standby'}
              </strong></span>
            </div>
          </div>
          <div
            ref={logTerminalRef}
            className="mt-2 h-36 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-[#7b6240]"
          >
            {telemetry.recentLogs.length === 0 ? (
              <div className="text-gray-600 italic py-3 text-center">
                Engine ready. Set grind parameters and press START.
              </div>
            ) : (
              telemetry.recentLogs.slice().reverse().map((entry, idx) => {
                let color = 'text-[#edd1ac]';
                if (entry.level === 'warning') color = 'text-amber-400';
                if (entry.level === 'error') color = 'text-red-400';
                if (entry.level === 'debug') color = 'text-gray-500';
                return (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#7b6240] select-none">[{entry.timestamp}]</span>
                    <span className={color}>{entry.msg}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Guide Modal (Matching Image 3: media_1791846183970_641285e3.jpg) */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundImage: `url(${getChargeGrinderAsset('guide.png')})`,
                backgroundSize: '100% 100%'
              }}
              className="w-full max-w-lg h-[620px] rounded-lg shadow-2xl relative p-8 flex flex-col justify-between text-[#2c1d11]"
            >
              {/* Invisible Click Area for 'Proceed ->' button (Geometry 214, 662 from App.py) */}
              <div className="space-y-4 pt-10">
                <div className="text-center">
                  <h2 className="text-4xl font-black tracking-widest text-[#2c1d11] font-['ExcelsiorSans',sans-serif]">
                    GUIDE
                  </h2>
                  <div className="mt-2 text-red-700 font-black text-sm tracking-wide">
                    WARNING! If the bot fails, make sure that game is in English and aspect ratio is 16:9
                    <div className="text-xs text-red-800 font-bold mt-0.5">(Supports 1920x1080 and 1280x720)</div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs font-bold leading-relaxed text-[#3d2715]">
                  <div>
                    <span className="text-sm font-black block text-[#2c1d11]">MANDATORY TO START:</span>
                    <p className="mt-1">1. Enter a number: <strong>Grind [ MDs / Lux ]</strong></p>
                    <p>2. Select at least one sinner from the roster</p>
                  </div>

                  <div className="border-t border-[#8c704c]/40 pt-2">
                    <span className="text-sm font-black block text-[#2c1d11]">GENERAL GUIDELINES:</span>
                    <p className="mt-1">• <strong>LOG Switch:</strong> When on, emits live telemetry stream.</p>
                    <p>• <strong>Team Keyword / Affinity:</strong> Affects selected EGO gifts and rest shop fusions.</p>
                    <p>• The bot can be started from any point of Mirror Dungeon exploration.</p>
                    <p>• Execution is paused immediately upon switching from Limbus Company window.</p>
                    <p>• The bot will abort the run if 6 or more sinners are dead.</p>
                  </div>
                </div>
              </div>

              {/* Hand-drawn style 'Proceed ->' button */}
              <div className="pb-4 flex justify-center">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="px-10 py-3 rounded-full border-2 border-[#2c1d11] hover:bg-[#2c1d11]/10 text-[#2c1d11] font-black text-lg tracking-wider transition transform active:scale-95"
                >
                  Proceed →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bot Config Modal (Matching Image 4: media_1791846200028_5a06f8ee.jpg) */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a140e] border-2 border-[#7b6240] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-[#edd1ac]"
            >
              {/* Header: ChargeGrinder top frame */}
              <div className="flex items-center justify-between p-3 border-b-2 border-[#7b6240] bg-[#120e0a]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfigTab(configTab === 'NORMAL' ? 'HARD' : 'NORMAL')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#2a2015] hover:bg-[#382b1d] border border-[#7b6240] text-xs font-black text-white"
                  >
                    <Settings size={14} className="text-amber-400" />
                    {configTab === 'NORMAL' ? 'Normal MD' : 'Hard MD'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded bg-[#2a2015] hover:bg-[#382b1d] border border-[#7b6240] text-xs font-black text-[#edd1ac]"
                  >
                    ✏ Save &amp; Close
                  </button>
                  <button
                    onClick={() => {
                      setPriorityPacks(["FlatbrokeGamblers", "HellsChicken", "TheOutcast"]);
                      setAvoidPacks(["AutomatedFactory", "TheUnloving", "FaithErosion", "TobeCrushed", "TheNoonofViolet", "MurderontheWARPExpress"]);
                      setSpeedLevel(1);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#2a2015] hover:bg-[#382b1d] border border-[#7b6240] text-xs font-black text-[#edd1ac]"
                  >
                    ↺ Reset
                  </button>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="p-1 rounded text-gray-400 hover:text-white ml-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Discord Webhook vs Arayashu */}
              <div className="flex border-b border-[#483824] bg-black/40">
                <button
                  onClick={() => setConfigSubTab('WEBHOOK')}
                  className={`flex-1 py-2 text-xs font-bold uppercase transition border-b-2 ${
                    configSubTab === 'WEBHOOK'
                      ? 'border-[#00e5ff] text-[#00e5ff] bg-black/60'
                      : 'border-transparent text-gray-400 hover:text-[#edd1ac]'
                  }`}
                >
                  Discord Webhook
                </button>
                <button
                  onClick={() => setConfigSubTab('ARAYASHU')}
                  className={`flex-1 py-2 text-xs font-bold uppercase transition border-b-2 ${
                    configSubTab === 'ARAYASHU'
                      ? 'border-[#00e5ff] text-[#00e5ff] bg-black/60'
                      : 'border-transparent text-gray-400 hover:text-[#edd1ac]'
                  }`}
                >
                  Arayashu
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                {configSubTab === 'ARAYASHU' ? (
                  <>
                    {/* Pack Selection Priority (Two Columns from Image 4) */}
                    <div className="border border-[#7b6240] rounded-lg p-3 bg-black/50 space-y-2">
                      <div className="text-center font-black text-xs tracking-wider text-[#edd1ac] border-b border-[#7b6240] pb-1">
                        Pack selection priority
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Prioritize Column */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-red-400 tracking-wider text-center">Prioritize</h4>
                          <div className="flex gap-1">
                            <select
                              value={prioDropdown}
                              onChange={(e) => setPrioDropdown(e.target.value)}
                              className="flex-1 bg-[#120e0a] border border-[#7b6240] rounded px-2 py-1 text-xs text-[#edd1ac] outline-none"
                            >
                              {ALL_PACKS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button
                              onClick={() => {
                                if (!priorityPacks.includes(prioDropdown)) {
                                  setPriorityPacks([...priorityPacks, prioDropdown]);
                                }
                              }}
                              className="px-2 py-1 rounded bg-[#10242e] border border-[#00d0ff] text-[#00d0ff] font-bold text-xs"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                            {priorityPacks.map(p => (
                              <span key={p} className="flex items-center gap-1 bg-[#2b1812] border border-red-500/60 text-red-200 text-[10px] px-2 py-0.5 rounded">
                                {p}
                                <button onClick={() => setPriorityPacks(priorityPacks.filter(x => x !== p))} className="hover:text-white">
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Avoid Column */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-gray-300 tracking-wider text-center">Avoid</h4>
                          <div className="flex gap-1">
                            <select
                              value={avoidDropdown}
                              onChange={(e) => setAvoidDropdown(e.target.value)}
                              className="flex-1 bg-[#120e0a] border border-[#7b6240] rounded px-2 py-1 text-xs text-[#edd1ac] outline-none"
                            >
                              {ALL_PACKS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button
                              onClick={() => {
                                if (!avoidPacks.includes(avoidDropdown)) {
                                  setAvoidPacks([...avoidPacks, avoidDropdown]);
                                }
                              }}
                              className="px-2 py-1 rounded bg-[#10242e] border border-[#00d0ff] text-[#00d0ff] font-bold text-xs"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                            {avoidPacks.map(p => (
                              <span key={p} className="flex items-center gap-1 bg-[#201d18] border border-[#7b6240] text-gray-300 text-[10px] px-2 py-0.5 rounded">
                                {p}
                                <button onClick={() => setAvoidPacks(avoidPacks.filter(x => x !== p))} className="hover:text-white">
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Starlight Grace Ribbon (Row of 10 icons from Image 4) */}
                    <div className="border border-[#7b6240] rounded-lg p-2.5 bg-black/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#b09670]">Starlight Grace</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setGraceState(graceState.map(() => true))}
                            className="px-2 py-0.5 rounded bg-[#2a2015] border border-[#7b6240] text-[10px] font-bold text-[#edd1ac]"
                          >
                            Grace
                          </button>
                          <button
                            onClick={() => setGraceState(graceState.map(() => false))}
                            className="px-2 py-0.5 rounded bg-[#2a2015] border border-[#7b6240] text-[10px] font-bold text-gray-400"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-10 gap-1">
                        {graceState.map((active, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const updated = [...graceState];
                              updated[idx] = !updated[idx];
                              setGraceState(updated);
                            }}
                            className={`h-9 rounded border flex items-center justify-center transition ${
                              active
                                ? 'bg-[#0d2a33] border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                                : 'bg-[#18120c] border-[#483824] text-gray-600 hover:text-gray-400'
                            }`}
                          >
                            <Sparkles size={14} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Other Settings (Matching Image 4) */}
                    <div className="border border-[#7b6240] rounded-lg p-3 bg-black/50 space-y-3">
                      <div className="text-center font-black text-xs tracking-wider text-[#edd1ac] border-b border-[#7b6240] pb-1">
                        Other Settings
                      </div>

                      {/* Speed Segmented Bar & Action Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {/* 4-Segment Speed Bar */}
                        <div className="bg-[#120e0a] border border-[#7b6240] rounded p-1.5 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-gray-400">Speed / Intensity</span>
                          <div className="grid grid-cols-4 gap-1 mt-1 cursor-pointer" onClick={() => setSpeedLevel((speedLevel % 4) + 1)}>
                            {[1, 2, 3, 4].map(lvl => (
                              <div
                                key={lvl}
                                className={`h-5 rounded-sm transition ${
                                  lvl <= speedLevel
                                    ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                                    : 'bg-[#2a2015] border border-[#483824]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setReRunIfStuck(!reRunIfStuck)}
                          className={`p-2 rounded border text-xs font-bold transition flex items-center justify-center text-center ${
                            reRunIfStuck ? 'bg-[#2a2015] border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'bg-[#120e0a] border-[#483824] text-gray-500'
                          }`}
                        >
                          Re-run if stuck
                        </button>

                        <button
                          onClick={() => setAltF4IfDone(!altF4IfDone)}
                          className={`p-2 rounded border text-xs font-bold transition flex items-center justify-center text-center ${
                            altF4IfDone ? 'bg-[#2a2015] border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-[#120e0a] border-[#483824] text-gray-500'
                          }`}
                        >
                          If done, Alt+F4
                        </button>

                        <button
                          onClick={() => setBuildModuleToBox(!buildModuleToBox)}
                          className={`p-2 rounded border text-xs font-bold transition flex items-center justify-center text-center ${
                            buildModuleToBox ? 'bg-[#2a2015] border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'bg-[#120e0a] border-[#483824] text-gray-500'
                          }`}
                        >
                          Build 📦 → 🎴
                        </button>

                        <button
                          onClick={() => setSkipLast(!skipLast)}
                          className={`p-2 rounded border text-xs font-bold transition flex items-center justify-center text-center ${
                            skipLast ? 'bg-[#2a2015] border-amber-400 text-amber-300' : 'bg-[#120e0a] border-[#483824] text-gray-500'
                          }`}
                        >
                          Skip last ⏏
                        </button>

                        <button
                          onClick={() => setWishmaking(!wishmaking)}
                          className={`p-2 rounded border text-xs font-bold transition flex items-center justify-center text-center ${
                            wishmaking ? 'bg-[#2a2015] border-amber-400 text-amber-300' : 'bg-[#120e0a] border-[#483824] text-gray-500'
                          }`}
                        >
                          Wishmaking ✨
                        </button>

                        <button
                          onClick={() => setWinRate(!winRate)}
                          className={`p-2 rounded border text-xs font-bold transition flex items-center justify-center text-center ${
                            winRate ? 'bg-[#2a2015] border-amber-400 text-amber-300' : 'bg-[#120e0a] border-[#483824] text-gray-500'
                          }`}
                        >
                          Win Rate ⏶
                        </button>

                        {/* Customize Button -> Opens Keywordless EGO Gifts Panel (User Request 1 & Image 2) */}
                        <button
                          onClick={() => setShowCustomizePanel(true)}
                          className="p-2 rounded border-2 border-[#00e5ff] bg-[#10242e] hover:bg-[#183543] text-[#00e5ff] font-black text-xs transition flex items-center justify-center text-center shadow-[0_0_12px_rgba(0,229,255,0.3)] animate-pulse"
                        >
                          Customize ⯀
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Discord Webhook Sub-tab */
                  <div className="space-y-3 bg-black/40 p-4 rounded-lg border border-[#7b6240]">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Discord Webhook URL</label>
                      <input
                        type="text"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="w-full bg-[#120e0a] border border-[#7b6240] rounded px-3 py-1.5 text-xs text-[#edd1ac] outline-none focus:border-[#00e5ff]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Thread ID (Optional)</label>
                        <input
                          type="text"
                          value={webhookThreadId}
                          onChange={(e) => setWebhookThreadId(e.target.value)}
                          placeholder="e.g. 123456789"
                          className="w-full bg-[#120e0a] border border-[#7b6240] rounded px-3 py-1.5 text-xs text-[#edd1ac] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Ping Role ID (Optional)</label>
                        <input
                          type="text"
                          value={webhookPingRoleId}
                          onChange={(e) => setWebhookPingRoleId(e.target.value)}
                          placeholder="e.g. 987654321"
                          className="w-full bg-[#120e0a] border border-[#7b6240] rounded px-3 py-1.5 text-xs text-[#edd1ac] outline-none"
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
                      <span className="text-xs text-gray-300">Compact Embed Notification Mode</span>
                    </label>

                    <div className="flex items-center gap-3 pt-2 border-t border-[#7b6240]/40">
                      <button
                        onClick={handleTestWebhook}
                        disabled={webhookTesting || !webhookUrl}
                        className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#2a2015] hover:bg-[#382b1d] border border-[#7b6240] text-xs font-bold text-[#edd1ac] disabled:opacity-50"
                      >
                        <Bell size={13} />
                        {webhookTesting ? 'Sending test...' : 'Test Webhook'}
                      </button>
                      {webhookTestStatus === 'success' && (
                        <span className="text-emerald-400 text-xs font-bold">✓ Webhook dispatched!</span>
                      )}
                      {webhookTestStatus === 'error' && (
                        <span className="text-red-400 text-xs font-bold">✗ Failed. Check URL.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keywordless EGO Gifts Customization Modal (Matching Image 2: media_1791846162811_1331e7d6.jpg) */}
      <AnimatePresence>
        {showCustomizePanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#18130e] border-2 border-[#7b6240] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl p-5 space-y-4 text-[#edd1ac]"
            >
              {/* Header plate */}
              <div className="border border-[#7b6240] bg-[#120e0a] rounded-lg py-2 px-4 text-center">
                <h3 className="text-sm font-black tracking-wide">
                  Keywordless EGO gifts to <span className="text-[#00d0ff]">keep</span> / <span className="text-yellow-400">buy</span> / <span className="text-amber-500">uptie</span>
                </h3>
              </div>

              {/* 6x4 Grid of 24 Keywordless EGO Gifts */}
              <div className="grid grid-cols-6 gap-2.5 p-2 bg-black/40 rounded-lg border border-[#483824]">
                {KEYWORDLESS_GIFTS.map(gift => {
                  const state = customGifts[gift.id] || 0;
                  
                  // Visual border style based on state
                  let borderStyle = 'border-[#483824] opacity-50 grayscale';
                  if (state === 1) {
                    // Keep: Blue cyan glow
                    borderStyle = 'border-[#00d0ff] shadow-[0_0_10px_rgba(0,208,255,0.6)] brightness-110';
                  } else if (state === 2) {
                    // Buy: Yellow diagonal caution stripes
                    borderStyle = 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] brightness-110';
                  } else if (state === 3) {
                    // Uptie: Orange diagonal caution stripes
                    borderStyle = 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)] brightness-110';
                  }

                  return (
                    <div
                      key={gift.id}
                      onClick={() => cycleGiftState(gift.id, gift.maxState)}
                      className={`relative group rounded-lg p-1.5 border-2 cursor-pointer transition-all flex flex-col items-center justify-center bg-[#1c1610] hover:scale-105 ${borderStyle}`}
                      title={`${gift.name} (Tier ${gift.tier}) - Click to toggle keep/buy/uptie`}
                    >
                      {/* Corner Tier Roman Numeral */}
                      <span className="absolute top-1 left-1.5 text-xs font-black text-amber-400 drop-shadow">
                        {gift.tier}
                      </span>

                      {/* Gift PNG Icon from extracted assets */}
                      <img
                        src={getChargeGrinderAsset(`keywordless/${gift.file}`)}
                        alt={gift.name}
                        className="w-14 h-14 object-contain my-1"
                        onError={(e) => {
                          // Fallback placeholder if image not loaded
                          e.target.style.display = 'none';
                        }}
                      />

                      {/* State badge */}
                      <span className="text-[9px] font-black uppercase tracking-tighter">
                        {state === 1 ? 'KEEP' : state === 2 ? 'BUY' : state === 3 ? 'UPTIE' : 'OFF'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Close Panel Button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setShowCustomizePanel(false)}
                  className="px-6 py-2 rounded-lg bg-[#2a2015] hover:bg-[#382b1d] border-2 border-[#7b6240] text-xs font-black text-[#edd1ac] transition"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
