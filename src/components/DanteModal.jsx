import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Flame, ShieldAlert, Award, Sparkles, RefreshCw } from 'lucide-react';
import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';

const DANTE_REVIVAL_LOGS = [
  { sinner: 'Heathcliff', deaths: 142, reason: 'Charged into a blunt hammer attack head-first without looking.' },
  { sinner: 'Don Quixote', deaths: 189, reason: 'Attempted to parry an ALEPH-grade abomination with a cardboard lance.' },
  { sinner: 'Sinclair', deaths: 98, reason: 'Panicked during an abnormal coin clash and dropped his halberd.' },
  { sinner: 'Ryōshū', deaths: 76, reason: 'Intentionally allowed herself to get cut in half to evaluate artistic blood trajectory.' },
  { sinner: 'Gregor', deaths: 64, reason: 'Shielded the rookie sinners from a point-blank explosion.' },
  { sinner: 'Meursault', deaths: 12, reason: 'Executed Dante\'s orders with literal precision, including orders with 0% survival probability.' },
];

export default function DanteModal({ onClose }) {
  const [spinCount, setSpinCount] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSpinning, setIsSpinning] = useState(false);

  const handleWindClock = () => {
    setIsSpinning(true);
    setSpinCount((c) => c + 1);
    setTimeout(() => setIsSpinning(false), 800);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#171004] border-2 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.4)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-950 via-amber-400 to-amber-950" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-400 hover:text-white transition-colors bg-amber-950/80 p-1.5 rounded-full border border-amber-700/50 z-20 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-start p-5 border-b border-amber-900/40 bg-black/60">
          <div className="w-20 h-20 rounded-xl bg-amber-950/80 border-2 border-amber-500 overflow-hidden relative flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] shrink-0">
            <img src={EASTER_EGG_IMAGES.dante} alt="Dante" className="w-full h-full object-cover object-top" />
            <div className="absolute bottom-1 right-1 bg-black/80 rounded-full p-1 border border-amber-500/60 shadow">
              <Clock className={`text-amber-400 ${isSpinning ? '-rotate-[720deg] transition-transform duration-700' : 'animate-spin-slow'}`} size={14} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 tracking-widest uppercase mb-0.5">
              <Sparkles size={12} /> Executive Manager • Limbus Company
            </div>
            <h2 className="text-xl font-black text-amber-200 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] leading-tight mb-0.5">
              Executive Manager Dante
            </h2>
            <p className="text-xs text-amber-400/80 mb-2">Bearer of the Engraved Clock / Rewinder of Mortalities</p>
            <div className="text-xs italic text-amber-100/90 font-mono bg-amber-950/40 border border-amber-800/40 rounded p-2 leading-relaxed">
              &lt; Tick tock, tick tock...! &gt; (Faust translates: "The Manager expresses sincere gratitude for your guidance, but politely asks you to stop searching for them in the personnel archives.")
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-amber-900/30 bg-black/40 text-center text-xs">
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Clearance</span>
            <span className="font-bold text-amber-300">Executive Manager</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Head Device</span>
            <span className="font-bold text-gray-200">Engraved Clock</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Revivals Logged</span>
            <span className="font-bold text-red-400">849 Fatalities</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Manual Winds</span>
            <span className="font-black text-amber-400">{spinCount} Reversals</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-900/30 px-5 pt-2 gap-4 text-xs font-bold bg-black/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Managerial Capabilities
          </button>
          <button
            onClick={() => setActiveTab('revivals')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'revivals' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Sinner Revival Black-Box ({DANTE_REVIVAL_LOGS.length})
          </button>
          <button
            onClick={() => setActiveTab('kenneth')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'kenneth' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Records Memo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/40 text-center space-y-3">
                <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest block">
                  ⏱️ Chrono Rewind Station
                </span>
                <p className="text-xs text-gray-300">
                  Crank Dante's clock head to reverse entropy and test Mephistopheles engine synchronization.
                </p>
                <button
                  onClick={handleWindClock}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RefreshCw size={14} className={isSpinning ? 'animate-spin' : ''} />
                  Crank Clock Hands ({spinCount})
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-amber-900/30 space-y-2">
                <span className="font-bold text-amber-300 text-sm block">Core Function: Temporal Rewind</span>
                <p className="text-gray-300 leading-relaxed">
                  By rotating the dial on their head, Dante endures the searing agony of every dead Sinner's injuries simultaneously, pulling their temporal state backward through the corridor of pain to restore them to life.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'revivals' && (
            <div className="space-y-2.5">
              {DANTE_REVIVAL_LOGS.map((log, i) => (
                <div key={i} className="p-3 rounded-lg bg-black/50 border border-amber-900/40 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-amber-300 block text-xs">{log.sinner}</span>
                    <p className="text-[11px] text-gray-400 italic mt-0.5">{log.reason}</p>
                  </div>
                  <span className="text-[11px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40 shrink-0">
                    {log.deaths} deaths
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'kenneth' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  📋 Records Keeper Kenneth — Administrative Memo
                </span>
                <p className="text-gray-300 italic font-mono leading-relaxed">
                  "Manager Dante... Please stop clicking your own profile. You cannot assign yourself to combat rows. Also, Faust told me you tried to write off twelve bags of potato chips as 'Managerial Fuel Expenses.' Corporate denied the claim."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-amber-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-bold text-xs border border-amber-700/50 transition-colors cursor-pointer"
          >
            Close Executive File
          </button>
        </div>
      </motion.div>
    </div>
  );
}
