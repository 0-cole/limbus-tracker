import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Star,
  Copy,
  Check,
  Tv,
  FileText,
  Terminal,
  ShieldCheck,
  Clock,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { EASTER_EGG_IMAGES } from '../assets/easter_eggs/index.js';
import TennaInfomercialModal from '../components/TennaInfomercialModal.jsx';

const CHARGE_GRINDER_REPO_URL = 'https://github.com/Walpth/Charge-Grinder/';
const CHARGE_GRINDER_RELEASES_URL = 'https://github.com/Walpth/Charge-Grinder/releases';
const CLONE_COMMAND = 'git clone https://github.com/Walpth/Charge-Grinder.git';

const PERSONNEL_LOGS = [
  {
    author: 'Outis',
    title: 'Pragmatic Advisor / LCB Specialist',
    avatar: './assets/sinners/11.webp',
    quote: 'Executive Manager! Walpth\'s automated engagement paradigm demonstrates exemplary tactical efficiency! Deploying this grinder secures absolute victory for the company with zero operational fatigue!',
    accent: '#10b981'
  },
  {
    author: 'Faust',
    title: 'The One Who Knows / LCB Technical Architect',
    avatar: './assets/sinners/2.webp',
    quote: 'Faust has evaluated all outcomes. Across 14,000,605 timelines inspected by Faust, the mathematically optimal decision was delegating Mirror Dungeon operations directly to Walpth\'s Charge-Grinder.',
    accent: '#c084fc'
  },
  {
    author: 'Don Quixote',
    title: 'Fixer of Peerless Justice',
    avatar: './assets/sinners/3.webp',
    quote: 'BEHOLD! A GLORIOUS AUTOMATON OF PEERLESS VALOR! IT CHARGETH FORTH INTO THE MIRROR DUNGEON WHILE I CONSUME FRESH SUGAR DOUGHNUTS! HUZZAH FOR SIR WALPTH!',
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
    quote: 'I evaluated the software per the Executive Manager\'s instructions. The arc-length cubic spline velocity interpolation is satisfactory. It has reduced my required mouse clicks by 100%.',
    accent: '#9ca3af'
  },
  {
    author: 'Dante',
    title: 'Executive Manager / Clockhead',
    avatar: EASTER_EGG_IMAGES.dante || null,
    quote: '< Tick, tock... tick tock tock! (Translation: "Finally! I can let Walpth grind the Mirror Dungeon while I rest my clock head!") >',
    accent: '#ef4444'
  }
];

export default function MirrorGrinderPage() {
  const [copied, setCopied] = useState(false);
  // Commercial plays automatically on page visit!
  const [showTennaModal, setShowTennaModal] = useState(true);
  const [activeTab, setActiveTab] = useState('MEMO'); // MEMO, LOGS, DISPATCH

  const handleCopyClone = () => {
    navigator.clipboard.writeText(CLONE_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openExternal = (url) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0b09] text-[#edd1ac] p-4 sm:p-8 max-w-5xl mx-auto space-y-6 font-['ExcelsiorSans',sans-serif] select-none pb-24">
      
      {/* ======================================================== */}
      {/* AUTHENTIC LCCB DEPARTMENT OF RECORDS HEADER             */}
      {/* ======================================================== */}
      <div className="border border-[#3d3222] bg-[#14100c] rounded-lg p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2d251a] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#c9a84c] text-[10px] font-mono tracking-widest uppercase rounded">
                LCCB ADVISORY: EXT-0353
              </span>
              <span className="text-neutral-500 text-xs font-mono">
                REF: WALPTH / CHARGE-GRINDER
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-[#f5ebd9] uppercase">
              Autonomous Mirror Dungeon Expeditions
            </h1>
            <p className="text-xs text-[#a08f75] mt-0.5">
              Department of Records &amp; Automation — Operational Referral Directive
            </p>
          </div>

          {/* Quick TV Commercial Replay Button */}
          <button
            onClick={() => setShowTennaModal(true)}
            className="px-3.5 py-2 bg-[#201912] hover:bg-[#2b2218] border border-[#52442e] text-[#c9a84c] rounded-md text-xs font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <Tv size={15} className="text-[#c9a84c]" />
            <span>Watch BTV Commercial (CH-77)</span>
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className="flex items-center gap-3 bg-[#1a140e] border-l-4 border-[#c9a84c] p-3 rounded text-xs text-[#d1be9d]">
          <ShieldCheck size={18} className="text-[#c9a84c] shrink-0" />
          <span>
            <strong>Official Directive:</strong> Internal macro automation scripting in Limbus Tracker has been officially retired. All automated Mirror Dungeon runs are referred to Walpth's verified external suite on GitHub.
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TACTICAL ACTION DECK                                     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Repo Card */}
        <div className="border border-[#3d3222] bg-[#14100c] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#c9a84c] uppercase tracking-wider mb-1">
              Source Repository
            </div>
            <h3 className="text-base font-bold text-[#f5ebd9] mb-1">
              Walpth / Charge-Grinder
            </h3>
            <p className="text-xs text-[#9c8a70] leading-relaxed mb-4">
              Full Python-based autonomous expedition engine with humanized mouse splines, 0-second event routing, and keyword team management.
            </p>
          </div>

          <button
            onClick={() => openExternal(CHARGE_GRINDER_REPO_URL)}
            className="w-full py-2.5 px-4 bg-[#c9a84c] hover:bg-[#d8b85c] text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow"
          >
            <ExternalLink size={14} />
            <span>Open Repository on GitHub</span>
          </button>
        </div>

        {/* Releases Card */}
        <div className="border border-[#3d3222] bg-[#14100c] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#a08f75] uppercase tracking-wider mb-1">
              Pre-Compiled Executables
            </div>
            <h3 className="text-base font-bold text-[#f5ebd9] mb-1">
              Official Releases
            </h3>
            <p className="text-xs text-[#9c8a70] leading-relaxed mb-4">
              Download the standalone Windows executable (.exe) directly from Walpth's GitHub releases page.
            </p>
          </div>

          <button
            onClick={() => openExternal(CHARGE_GRINDER_RELEASES_URL)}
            className="w-full py-2.5 px-4 bg-[#261f16] hover:bg-[#332a1e] border border-[#52442e] text-[#f5ebd9] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Download size={14} className="text-[#c9a84c]" />
            <span>Download Latest Release</span>
          </button>
        </div>

        {/* GitHub Star Card */}
        <div className="border border-[#3d3222] bg-[#14100c] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#a08f75] uppercase tracking-wider mb-1">
              Community Recognition
            </div>
            <h3 className="text-base font-bold text-[#f5ebd9] mb-1">
              Star the Project
            </h3>
            <p className="text-xs text-[#9c8a70] leading-relaxed mb-4">
              Support developer Walpth for maintaining the premier open-source automation utility for Limbus Company.
            </p>
          </div>

          <button
            onClick={() => openExternal(CHARGE_GRINDER_REPO_URL)}
            className="w-full py-2.5 px-4 bg-[#261f16] hover:bg-[#332a1e] border border-[#52442e] text-[#f5ebd9] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Star size={14} className="text-[#fbbf24] fill-current" />
            <span>Star on GitHub</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK TERMINAL CLONE STRIP                               */}
      {/* ======================================================== */}
      <div className="border border-[#3d3222] bg-[#100c09] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3 overflow-hidden text-neutral-300">
          <Terminal size={16} className="text-[#c9a84c] shrink-0" />
          <span className="text-neutral-500 shrink-0">$</span>
          <span className="truncate text-[#e5c583]">{CLONE_COMMAND}</span>
        </div>

        <button
          onClick={handleCopyClone}
          className="px-3 py-1.5 bg-[#201912] hover:bg-[#2e2319] border border-[#4a3d28] text-neutral-200 rounded text-[11px] font-sans font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-[#c9a84c]" />
              <span>Copy Command</span>
            </>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* AUTHENTIC DOSSIER TABS: MEMO & PERSONNEL LOGS            */}
      {/* ======================================================== */}
      <div className="border border-[#3d3222] bg-[#14100c] rounded-lg p-5">
        <div className="flex items-center gap-2 border-b border-[#2d251a] pb-3 mb-5">
          <button
            onClick={() => setActiveTab('MEMO')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'MEMO'
                ? 'bg-[#2b2216] text-[#c9a84c] border border-[#52442e]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Records Keeper Memorandum
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'LOGS'
                ? 'bg-[#2b2216] text-[#c9a84c] border border-[#52442e]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Personnel Field Evaluations ({PERSONNEL_LOGS.length})
          </button>
        </div>

        {/* TAB 1: KENNETH'S MEMO */}
        {activeTab === 'MEMO' && (
          <div className="space-y-4 text-xs leading-relaxed text-[#c2b093]">
            <div className="border-l-2 border-[#52442e] pl-4 space-y-1 font-mono text-[11px] text-[#8c7d66]">
              <div>CLASSIFICATION: LCCB Internal Operational Transition</div>
              <div>DATE: Post-Canto VIII Expedition Cycle</div>
              <div>AUTHOR: Kenneth, Records Keeper (Retired to District 23 Tea Sector)</div>
              <div>RECIPIENT: Dante, Executive Manager</div>
            </div>

            <p>
              Manager Dante,
            </p>
            <p>
              Following your direct instructions, internal macro automation development within the companion application has been permanently decommissioned. Our department conducted an exhaustive technical audit across external automation utilities operating within the City and concluded that developer Walpth's <strong>Charge-Grinder (v3.5.3)</strong> is the superior, verified implementation.
            </p>
            <p>
              Walpth's architecture features authentic biomechanical Bezier curves, realistic Gaussian dwell timings, automated 0-second route traversal, and custom keyword roster deployments—all maintained with active community testing. Re-implementing these features internally would introduce unnecessary maintenance overhead when a battle-tested open-source solution is readily available.
            </p>
            <p>
              All future automation inquiries should be directed to Walpth's official repository. I have formally stepped down from macro maintenance to oversee archival tea logistics in District 23.
            </p>

            <div className="pt-2 font-mono text-[11px] text-[#8c7d66]">
              — Kenneth, Head of Records (Retired)
            </div>
          </div>
        )}

        {/* TAB 2: PERSONNEL LOGS */}
        {activeTab === 'LOGS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERSONNEL_LOGS.map((item, idx) => (
              <div
                key={idx}
                className="border border-[#2d251a] bg-[#100c09] p-3.5 rounded flex items-start gap-3"
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-10 h-10 rounded border border-[#3d3222] object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded border border-[#3d3222] bg-[#1a140e] flex items-center justify-center font-bold text-xs text-[#c9a84c] shrink-0">
                    {item.author[0]}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold text-xs text-[#f5ebd9]">{item.author}</span>
                    <span className="text-[10px] text-neutral-500 truncate">({item.title})</span>
                  </div>
                  <p className="text-xs text-[#a08f75] italic leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* TV INFOMERCIAL MODAL (PLAYS AUTOMATICALLY ON VISIT)      */}
      {/* ======================================================== */}
      <TennaInfomercialModal
        isOpen={showTennaModal}
        onClose={() => setShowTennaModal(false)}
      />

    </div>
  );
}
