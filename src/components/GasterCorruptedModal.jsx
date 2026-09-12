import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export default function GasterCorruptedModal({ onClose, onTriggerSequence }) {
  const [navSection, setNavSection] = useState('skills');
  const [activeTab, setActiveTab] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  // Auto-trigger the anomaly after 5.5 seconds of inspection if user doesn't close or click first
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerAnomaly();
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  const triggerAnomaly = () => {
    setIsGlitching(true);
    setTimeout(() => {
      onClose();
      onTriggerSequence();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 md:p-6 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: isGlitching ? 'invert(100%) contrast(300%)' : 'none',
          x: isGlitching ? [0, -6, 6, -3, 3, 0] : 0
        }}
        transition={{ duration: 0.15 }}
        className="glass-card max-w-7xl w-full h-[90vh] flex flex-col md:flex-row bg-[#080808] border border-[#2a2a2a] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Horizontal Scanlines / Grey Lines Texture */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_4px)] pointer-events-none z-30 opacity-70" />

        {/* Top-Right Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 text-gray-500 hover:text-white bg-black/70 hover:bg-neutral-800 rounded-lg border border-[#333] transition-colors"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* ── Left Column: Corrupted Art Frame & Base Stats ── */}
        <div className="w-full md:w-[350px] shrink-0 border-r border-[#262626] flex flex-col bg-black relative z-10 overflow-y-auto custom-scrollbar">
          {/* Black Frame with Slight Grey Lines (NO image, NO status effects, NaN stars) */}
          <div className="relative w-full aspect-[2/3] border-b border-[#262626] bg-[#050505] flex flex-col justify-end p-5 overflow-hidden">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_5px)] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#1f1f1f] text-gray-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-[#383838] uppercase tracking-widest">
                  Identity
                </span>
                <span className="text-gray-500 font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-black/60 border border-[#2a2a2a]">
                  NaN
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-300 font-mono leading-tight">NaN</h2>
              <p className="text-gray-500 text-xs font-mono mt-1">Season: NaN</p>
            </div>
          </div>

          {/* Base Stats: NaN HP, NaN Speed, Zero Status Effects */}
          <div className="p-4 flex flex-col gap-4">
            <div className="bg-[#0e0e0e] border border-[#262626] rounded-lg p-4 font-mono">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">Base Stats</h3>
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#1c1c1c]">
                <span className="text-xs text-gray-500">HP</span>
                <span className="text-gray-400 font-bold text-sm">NaN</span>
              </div>
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#1c1c1c]">
                <span className="text-xs text-gray-500">Speed</span>
                <span className="text-gray-400 font-bold text-sm">NaN</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Defense Level</span>
                <span className="text-gray-400 font-bold text-sm">NaN</span>
              </div>
            </div>

            <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded-lg text-[11px] font-mono text-gray-500 space-y-1">
              <div className="text-gray-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-500/80" />
                <span>ERR_PARSE_FAILURE</span>
              </div>
              <div>Failed to deserialize identity descriptor.</div>
              <div className="text-gray-600 text-[10px] pt-1">Code: 0x00000042 // Sector 17</div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Corrupted Skills & Tabs ── */}
        <div className="flex-1 flex flex-col relative z-10 bg-[#0a0a0a] overflow-hidden">
          {/* Header & Section Tabs */}
          <div className="flex justify-between items-center p-6 border-b border-[#262626] bg-black/60">
            <h3 className="text-xl font-black text-gray-200 font-mono uppercase tracking-wider">
              {navSection === 'skills' ? 'Combat Skills' : navSection === 'defense' ? 'Defense Skill' : 'Passives'}
            </h3>

            <div className="flex bg-[#121212] p-1 rounded-lg border border-[#2a2a2a] mr-10 font-mono">
              {['skills', 'defense', 'passives'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setNavSection(sec)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md uppercase tracking-widest transition-all ${
                    navSection === sec
                      ? 'bg-neutral-800 text-white shadow-sm border border-[#444]'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Section Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 font-mono">
            <AnimatePresence mode="wait">
              {navSection === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Skill Tabs */}
                  <div className="flex border-b border-[#262626] mb-6">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                          activeTab === idx
                            ? 'text-gray-300 border-gray-400 bg-white/5'
                            : 'text-gray-600 border-transparent hover:text-gray-400'
                        }`}
                      >
                        Skill {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Corrupted Skill Block */}
                  <div
                    onClick={triggerAnomaly}
                    className="mb-6 rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#0c0c0c] hover:border-gray-500 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="flex justify-between items-center p-3 border-b border-[#222] bg-black/40">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-neutral-700 border border-neutral-600" />
                          <span className="text-sm font-bold text-gray-400">Unknown</span>
                        </div>
                        <span className="text-neutral-700">|</span>
                        <span className="text-sm font-bold text-gray-500">NaN</span>
                      </div>
                      <span className="text-[10px] text-gray-600 group-hover:text-amber-400 transition-colors">
                        [Click to Re-parse]
                      </span>
                    </div>

                    <div className="p-4 border-b border-[#222] bg-gradient-to-r from-[#101010] to-black">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl font-bold text-gray-300 tracking-wide">
                          [CORRUPTED_ENTRY_PTR]
                        </h4>

                        <div className="flex items-center gap-4 bg-black/80 px-4 py-2 rounded-lg border border-[#262626]">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Base</span>
                            <span className="text-lg font-bold text-gray-400">NaN</span>
                          </div>
                          <span className="text-lg font-black text-gray-600">+</span>
                          <div className="flex flex-col min-w-[70px] items-center">
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Coin</span>
                            <span className="text-base font-bold text-gray-500">+NaN</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stack trace error message */}
                    <div className="p-4 space-y-2 text-xs text-gray-400 bg-black/60 leading-relaxed">
                      <div className="text-red-400/90 font-bold">
                        [SYSTEM_EXCEPTION: NullReferenceException]
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        at Limbus.Serialization.MonParser.ResolveRecord(Byte[] stream, Int32 offset)
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Failed to map memory range [0x00000066 .. 0x0000007F]. Entry belongs to an unindexed void container.
                      </div>
                      <div className="pt-2 text-gray-600 text-[10px] italic">
                        Click here to attempt stack trace recovery...
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {navSection === 'defense' && (
                <div
                  onClick={triggerAnomaly}
                  className="p-8 text-center text-gray-500 cursor-pointer hover:text-gray-400"
                >
                  <p className="text-sm">[DEFENSE_SKILL_DATA_UNREADABLE]</p>
                  <p className="text-xs text-gray-600 mt-2">Error code: 0x66 // Tap to retry</p>
                </div>
              )}

              {navSection === 'passives' && (
                <div
                  onClick={triggerAnomaly}
                  className="p-8 text-center text-gray-500 cursor-pointer hover:text-gray-400"
                >
                  <p className="text-sm">[PASSIVE_BUFF_TABLE_UNINITIALIZED]</p>
                  <p className="text-xs text-gray-600 mt-2">Error code: 0x66 // Tap to retry</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
