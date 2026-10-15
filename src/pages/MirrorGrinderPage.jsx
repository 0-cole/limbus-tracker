import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ExternalLink,
  Star,
  Copy,
  Check,
  Flame,
  ShieldAlert,
  Terminal,
  Sparkles,
  AlertTriangle,
  Clock,
  Gift,
  Coffee,
  Heart,
  HelpCircle,
  ThumbsUp,
  Smile,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Radio,
  Siren,
  Tv
} from 'lucide-react';
import { EASTER_EGG_IMAGES } from '../assets/easter_eggs/index.js';
import TennaInfomercialModal from '../components/TennaInfomercialModal.jsx';

const CHARGE_GRINDER_REPO_URL = 'https://github.com/Walpth/Charge-Grinder/';
const CHARGE_GRINDER_RELEASES_URL = 'https://github.com/Walpth/Charge-Grinder/releases';
const CLONE_COMMAND = 'git clone https://github.com/Walpth/Charge-Grinder.git';

const TESTIMONIALS = [
  {
    author: 'Vergilius',
    title: 'The Red Gaze / Guide of the LCB',
    avatar: EASTER_EGG_IMAGES.vergilius || null,
    quote: 'Danteh... stop clicking buttons with your clock head. Just download Walpth\'s grinder so I can read my newspaper in peace, Danteh.',
    accent: '#ef4444'
  },
  {
    author: 'Faust',
    title: 'The One Who Knows',
    avatar: './assets/sinners/2.webp',
    quote: 'Faust knows all outcomes. Across 14,000,605 timelines inspected by Faust, the mathematically optimal outcome was downloading Walpth\'s Charge-Grinder directly from GitHub.',
    accent: '#c084fc'
  },
  {
    author: 'Don Quixote',
    title: 'Self-Proclaimed Fixer of Peerless Justice',
    avatar: './assets/sinners/3.webp',
    quote: 'BEHOLD! A GLORIOUS AUTOMATON OF UNPARALLELED VALOR! IT CHARGETH FORTH INTO THE MIRROR DUNGEON WHILE I CONSUME FRESH SUGAR DOUGHNUTS! HUZZAH FOR SIR WALPTH!',
    accent: '#fbbf24'
  },
  {
    author: 'Ryōshū',
    title: 'Seven Association Consultant (In Spirit)',
    avatar: './assets/sinners/4.webp',
    quote: 'W.T.F. (Walpth. The. Finest.) S.T.G. (Star. The. Git.) N.C.T. (No. Carpal. Tunnel.)',
    accent: '#f87171'
  },
  {
    author: 'Meursault',
    title: 'N Corp / Blade Lineage Specialist',
    avatar: './assets/sinners/5.webp',
    quote: 'I was instructed by Dante to evaluate Walpth\'s application. The arc-length cubic spline velocity interpolation is satisfactory. It has reduced my required mouse clicks by 100%.',
    accent: '#9ca3af'
  },
  {
    author: 'Heathcliff',
    title: 'Bodysack Aficionado',
    avatar: './assets/sinners/7.webp',
    quote: 'Oi! You telling me I don\'t have to sit here bludgeoning Peccatula mobs by hand forty times a bloody day?! Why didn\'t you tell me about this GitHub repo three months ago?!',
    accent: '#fb923c'
  },
  {
    author: 'Charon',
    title: 'Mephistopheles Bus Pilot',
    avatar: './assets/sinners/1.webp',
    quote: 'Vroom vroom. Engine goes fast. Walpth gives candies. Charon doesn\'t have to steer through 50 combat waves. Good app.',
    accent: '#38bdf8'
  }
];

const DANTE_PANIC_QUOTES = [
  '⟨ TICK-TOCK! TICK-TOCK! MY CLOCK IS VIBRATING FROM HOW FAST WALPTH\'S BOT MOVES! ⟩',
  '⟨ KENNETH! WHY DID WE EVER TRY TO REBUILD THIS OURSELVES WHEN WALPTH HAS A FULL PYTHON ENGINE?! ⟩',
  '⟨ VERGILIUS LOOK! NO HANDS! THE STARLIGHT IS HARVESTING ITSELF! ⟩',
  '⟨ CHARON, PUT THE BUS ON CRUISE CONTROL, WALPTH IS DRIVING NOW! ⟩',
  '⟨ 0-SECOND EVENTS DETECTED! SPRINTING PAST PECCATULA AT MACH 4! ⟩',
  '⟨ PANIC FLUID SAC DEPLOYED! SANITY AT +45! DANTE HAS SURVIVED ANOTHER FLOOR! ⟩'
];

export default function MirrorGrinderPage() {
  const [copied, setCopied] = useState(false);
  const [panicCount, setPanicCount] = useState(0);
  const [currentPanicQuote, setCurrentPanicQuote] = useState('');
  const [activeTab, setActiveTab] = useState('WHY_AD'); // WHY_AD, FEATURES, TESTIMONIALS
  const [kennethSleepMinutes, setKennethSleepMinutes] = useState(14);
  const [showTennaModal, setShowTennaModal] = useState(false);

  useEffect(() => {
    // Check if the Spamton / Tenna infomercial broadcast has been experienced yet
    const hasSeenCommercial = localStorage.getItem('limbus_chargegrinder_commercial_seen') === 'true';
    if (!hasSeenCommercial) {
      setShowTennaModal(true);
    }

    const timer = setInterval(() => {
      setKennethSleepMinutes((m) => m + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyClone = () => {
    navigator.clipboard.writeText(CLONE_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSmashPanic = () => {
    setPanicCount((c) => c + 1);
    const randomQuote = DANTE_PANIC_QUOTES[Math.floor(Math.random() * DANTE_PANIC_QUOTES.length)];
    setCurrentPanicQuote(randomQuote);
  };

  const openExternal = (url) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#edd1ac] p-3 sm:p-6 max-w-5xl mx-auto space-y-6 font-['ExcelsiorSans',sans-serif] select-none pb-24">
      
      {/* 🚨 Flashing Hazard Infomercial Ticker */}
      <div className="relative overflow-hidden rounded-lg border-2 border-amber-500/80 bg-gradient-to-r from-red-950 via-amber-950 to-red-950 p-2 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
        <div className="flex items-center gap-3 animate-pulse text-xs sm:text-sm font-black tracking-widest text-amber-300 uppercase">
          <Siren size={18} className="text-red-400 shrink-0 animate-bounce" />
          <span className="truncate">
            🚨 OFFICIAL LCB COMMUNIQUE: ALL AUTOMATION OUTSOURCED TO WALPTH'S MASTERPIECE 🚨 CARPAL TUNNEL IN THE CITY DOWN 99.8% 🚨 KENNETH HAS RETIRED TO RUN A TEA SHOP 🚨
          </span>
          <Siren size={18} className="text-red-400 shrink-0 animate-bounce" />
        </div>
      </div>

      {/* 📺 Retro CRT TV Infomercial Broadcast Trigger Banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-400/80 bg-gradient-to-r from-[#200938] via-[#100720] to-[#280d45] p-4 shadow-[0_0_35px_rgba(250,204,21,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 text-black flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(250,204,21,0.8)] animate-bounce">
            <Tv size={26} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] rounded uppercase animate-pulse">
                CH-77 LIVE
              </span>
              <span className="text-yellow-300 font-black text-sm uppercase tracking-wide">
                WAAACKY TV INFOMERCIAL (SPAMTON / TENNA BROADCAST)
              </span>
            </div>
            <p className="text-neutral-300 text-xs">
              Missed the unhinged television variety show?! Watch Tenna dance, blast intro music, and pitch Walpth's bot!
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTennaModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(250,204,21,0.6)] flex items-center gap-2 shrink-0 transition-all border border-yellow-200"
        >
          <Tv size={16} className="stroke-[2.5]" />
          PLAY THE COMMERCIAL!
        </motion.button>
      </div>

      {/* 💥 Over-The-Top Late Night Infomercial Hero Billboard */}
      <div className="relative rounded-2xl border-4 border-[#c9a84c] bg-gradient-to-b from-[#1c150e] via-[#120d09] to-[#0a0705] p-6 sm:p-8 shadow-[0_0_50px_rgba(201,168,76,0.35)] text-center overflow-hidden">
        
        {/* Background Radial Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Vintage Infomercial Stamp */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border-2 border-red-500 text-red-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
          <Sparkles size={16} className="text-yellow-400 animate-spin" />
          AS SEEN ON THE BACKSTREETS BROADCAST NETWORK
          <Sparkles size={16} className="text-yellow-400 animate-spin" />
        </div>

        {/* Screaming Headline */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 drop-shadow-[0_4px_12px_rgba(234,179,8,0.5)] leading-tight mb-3">
          TIRED OF TAPPING WIN RATE UNTIL YOUR HAND DISTORTS?!
        </h1>

        <p className="text-sm sm:text-lg text-amber-100/90 max-w-3xl mx-auto font-medium leading-relaxed mb-6">
          Dante, put down your smoking clock head! Why settle for a built-in toy tractor when <span className="font-black text-[#00e5ff] underline decoration-wavy">Walpth</span> spent hundreds of hours engineering an orbital fighter jet on GitHub for <span className="font-black text-emerald-400">ABSOLUTELY $0.00 FREE</span>?!
        </p>

        {/* 🚀 Giant Mega Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openExternal(CHARGE_GRINDER_REPO_URL)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center gap-3 transition-all border-2 border-white/40"
          >
            <Zap size={24} className="fill-black animate-bounce" />
            <span>GET WALPTH'S REAL APP ON GITHUB ↗</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openExternal(CHARGE_GRINDER_REPO_URL)}
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 transition-all border-2 border-white/30"
          >
            <Star size={22} className="fill-black" />
            <span>STAR THE REPOSITORY ⭐</span>
          </motion.button>
        </div>

        {/* One-Click Git Clone Bar */}
        <div className="mt-6 max-w-xl mx-auto p-2.5 rounded-xl bg-black/80 border border-[#7b6240] flex items-center justify-between gap-3 text-xs sm:text-sm font-mono">
          <div className="flex items-center gap-2 overflow-hidden truncate text-gray-300 pl-2">
            <Terminal size={16} className="text-[#00e5ff] shrink-0" />
            <span className="truncate select-all">{CLONE_COMMAND}</span>
          </div>
          <button
            onClick={handleCopyClone}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 flex items-center gap-1.5 transition ${
              copied
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                : 'bg-[#2b2217] hover:bg-[#3d3121] text-amber-300 border border-[#7b6240]'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'COPIED!' : 'COPY'}</span>
          </button>
        </div>

        {/* Live Sleep Ticker for Kenneth */}
        <div className="mt-4 text-[11px] text-gray-400 flex items-center justify-center gap-2">
          <Clock size={13} className="text-amber-400" />
          <span>Records Keeper Kenneth has been asleep for: <strong className="text-amber-300 font-mono">{kennethSleepMinutes} minutes</strong> (Do NOT wake him up).</span>
        </div>
      </div>

      {/* 🎭 Before vs After Comparison (Classic Infomercial Split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE: The Agony of Manual Grinding */}
        <div className="rounded-xl border-2 border-red-900/60 bg-gradient-to-b from-[#1a0c0c] to-[#0d0505] p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase tracking-wider">
            WITHOUT WALPTH
          </div>
          <h3 className="text-lg font-black text-red-400 flex items-center gap-2 mb-3">
            <span>😭</span>
            <span>MANUAL MIRROR DUNGEON HELL</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-300 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <span>Clicking Win Rate [P] 480 times an hour until your mouse switch literally melts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <span>Staggered on Floor 4 because you accidentally clashed a Blunt attack with 10% odds.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <span>Wasting 45 minutes per run watching Sinner attack animations in slow motion.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0">✗</span>
              <span>Dante in tears, Vergilius reading the paper, Charon steering Mephistopheles into a ditch.</span>
            </li>
          </ul>
        </div>

        {/* AFTER: The Glory of ChargeGrinder */}
        <div className="rounded-xl border-2 border-emerald-600/70 bg-gradient-to-b from-[#0c1a12] to-[#050d08] p-5 shadow-[0_0_25px_rgba(16,185,129,0.2)] relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider shadow">
            WITH CHARGE-GRINDER
          </div>
          <h3 className="text-lg font-black text-emerald-300 flex items-center gap-2 mb-3">
            <span>👑</span>
            <span>THE WALPTH ASCENSION</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-200 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>0-Second Event Sniping:</strong> Teleports through story events with zero combat delay.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Humanized Cubic Splines:</strong> Smooth Fitts's Law curvature so real even The Head thinks you're human.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Auto Panic Fluid Sacs:</strong> Detects clash struggle and auto-deploys heals like an emergency trauma unit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>Dante drinking cold lemonade while 999,999 Starlight rolls in automatically.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 📜 Kenneth's Official Resignation Letter (The Lore) */}
      <div className="rounded-xl border-2 border-[#7b6240] bg-[#140f0a] p-5 sm:p-6 shadow-xl relative">
        <div className="flex items-center gap-3 border-b border-[#3d2f1f] pb-3 mb-4">
          <Coffee size={20} className="text-amber-400 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-300">
              INTERNAL MEMORANDUM: KENNETH'S RETIREMENT &amp; THE WALPTH REVELATION
            </h2>
            <p className="text-[11px] text-[#a0855b]">
              Filed by Records Keeper Kenneth (Currently enjoying chamomile tea in the Outskirts)
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-gray-300 leading-relaxed italic font-serif">
          <p>
            "Executive Manager Dante,
          </p>
          <p>
            I have thrown my typewriter into the Mephistopheles furnace.
          </p>
          <p>
            We spent days rebuilding the mouse curves, reverse-engineering the pack priorities, debugging the 1-sinner minimum lock, and bundling high-resolution webps. But late last night, as Dante shouted at me for the 47th time about Sinner order badges, I finally opened Walpth's GitHub repository and stared at the truth.
          </p>
          <p className="font-bold text-amber-200 not-italic font-sans">
            Walpth's standalone Charge-Grinder isn't just an automation bot—it is a handcrafted Project Moon masterpiece. It already runs circles around anything we could squeeze into a React tab! Why are we trying to assemble a toy tractor inside our companion tracker when Walpth is handing you the keys to an Italian sports car on GitHub for FREE?!
          </p>
          <p>
            I have packed my bags. I am opening a quiet tea parlor past the Great Lake. If you want Mirror Dungeon automation that will change your life, click the button above and download Walpth's Charge-Grinder.
          </p>
          <p className="not-italic font-sans text-right text-amber-300 font-bold">
            — Kenneth (Permanently Offline)
          </p>
        </div>
      </div>

      {/* 🌟 "BUT WAIT, THERE'S MORE!" — Walpth Feature Showcase Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#00e5ff] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
            <Sparkles size={20} className="text-yellow-400" />
            <span>WHAT MAKES WALPTH'S APP SO SICK?!</span>
          </h2>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
            v3.5.3 FEATURES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              title: "Biomechanical Mouse Curves",
              desc: "Arc-length cubic splines with Box-Muller Gaussian velocity easing. Your mouse moves with the exhausted grace of a real human being.",
              tag: "NO TELEPORTS"
            },
            {
              title: "0-Second Event Sniping",
              desc: "Pathfinding camera routing (W/D/S) that prioritizes non-combat story events to finish floors in under 3 minutes.",
              tag: "TURBO SPEED"
            },
            {
              title: "Panic Clash Mitigation",
              desc: "Monitors clash danger levels. If a sinner faces a Struggle or Hopeless outcome, it long-presses the gear and panic-casts Fluid Sac.",
              tag: "BRAIN SURGERY"
            },
            {
              title: "24 Keywordless EGO Gifts",
              desc: "Complete 6x4 interactive customization grid to Keep, Buy, or Uptie composite gifts like False Halo and Ancient Effigy.",
              tag: "TIER IV READY"
            },
            {
              title: "Smart Enkephalin Box Crafting",
              desc: "Automatically checks your stamina bar. When modules run low, it crafts them seamlessly so you never lose stamina.",
              tag: "ZERO WASTE"
            },
            {
              title: "Discord Webhook Ping Integration",
              desc: "Sends real-time run summaries, Starlight counters, floor clears, and role pings straight to your Discord server.",
              tag: "STAY INFORMED"
            }
          ].map((feat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-gradient-to-b from-[#18130e] to-[#0f0b07] border border-[#523e27] hover:border-[#00e5ff] transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 px-1.5 py-0.5 rounded bg-black/60 border border-[#7b6240]">
                    {feat.tag}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">#0{i + 1}</span>
                </div>
                <h4 className="text-sm font-black text-amber-200 mb-1.5">
                  {feat.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🗣️ Project Moon Verified Testimonials Carousel */}
      <div className="space-y-3">
        <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
          <span>💬</span>
          <span>100% REAL &amp; UNFILTERED LCB REVIEWS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#120e0a] border border-[#483824] flex gap-3 items-start shadow-md hover:border-[#7b6240] transition"
            >
              <div
                className="w-12 h-12 rounded-lg shrink-0 overflow-hidden border-2 bg-black/80 flex items-center justify-center"
                style={{ borderColor: t.accent }}
              >
                {t.avatar ? (
                  <img src={t.avatar} alt={t.author} className="w-full h-full object-cover object-top" />
                ) : (
                  <span className="text-base font-black text-white">{t.author[0]}</span>
                )}
              </div>
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-black text-white truncate" style={{ color: t.accent }}>
                    {t.author}
                  </h4>
                  <span className="text-[10px] text-gray-500 truncate">{t.title}</span>
                </div>
                <p className="text-xs text-gray-300 italic font-serif leading-snug">
                  "{t.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚨 Interactive Dante Panic Alarm Soundboard Gag */}
      <div className="rounded-xl border-2 border-red-700/80 bg-gradient-to-r from-red-950 via-[#1c0808] to-red-950 p-5 text-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
        <h3 className="text-base sm:text-lg font-black text-red-300 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
          <AlertTriangle size={18} className="text-yellow-400" />
          <span>INTERACTIVE DANTE CRISIS BUTTON</span>
          <AlertTriangle size={18} className="text-yellow-400" />
        </h3>
        <p className="text-xs text-red-200/80 mb-4 max-w-lg mx-auto">
          Feeling overwhelmed by Mirror Dungeon anxiety? Click the button below to simulate Dante having a total administrative meltdown.
        </p>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleSmashPanic}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.7)] border-2 border-white/40 transition inline-flex items-center gap-2"
        >
          <Siren size={20} className="animate-spin" />
          <span>SMASH DANTE'S CLOCK HEAD ({panicCount} PANICS)</span>
        </motion.button>

        {currentPanicQuote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-black/80 border border-red-500/60 max-w-2xl mx-auto text-xs sm:text-sm font-black text-amber-300 drop-shadow animate-pulse"
          >
            {currentPanicQuote}
          </motion.div>
        )}
      </div>

      {/* 🏁 Final Footer Banner */}
      <div className="rounded-xl border border-[#7b6240] bg-[#140f0a] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a0855b]">
        <div>
          <span>Limbus Tracker proudly salutes <strong className="text-[#00e5ff]">Walpth</strong> for creating Charge-Grinder.</span>
          <span className="block text-[11px] text-gray-500">Go download it, star it, and give your index finger a well-deserved vacation.</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openExternal(CHARGE_GRINDER_REPO_URL)}
            className="px-3 py-1.5 rounded bg-[#2a2016] hover:bg-[#3d2f21] text-amber-300 border border-[#7b6240] font-bold text-xs transition"
          >
            GitHub Repo
          </button>
          <button
            onClick={() => openExternal(CHARGE_GRINDER_RELEASES_URL)}
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-black text-xs transition shadow"
          >
            Releases (.exe)
          </button>
        </div>
      </div>

      {/* 📺 Retro CRT TV Spamton / Tenna Style Infomercial Broadcast Modal */}
      <TennaInfomercialModal
        isOpen={showTennaModal}
        onClose={() => setShowTennaModal(false)}
      />

    </div>
  );
}
