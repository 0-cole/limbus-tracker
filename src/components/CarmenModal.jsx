import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Volume2, ShieldAlert, Heart, Sun, HelpCircle } from 'lucide-react';

import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';

const CARMEN_WHISPERS = [
  "\"Why do you keep pressing forward through this torment, Dante? Is the Golden Bough worth the blood of those twelve children?\"",
  "\"You do not have to carry the weight of their deaths upon your shoulders. Let the tears flow freely. Let the sorrow become your armor.\"",
  "\"Look inside your heart. The anger you bury, the jealousy you hide... They are not sins. They are who you truly are.\"",
  "\"Do not fight the blooming flower within your soul. Close your eyes, Dante. Just let it unfold...\"",
];

export default function CarmenModal({ onClose }) {
  const [whisperIdx, setWhisperIdx] = useState(0);
  const [resisting, setResisting] = useState(false);

  const cycleWhisper = () => {
    setWhisperIdx((prev) => (prev + 1) % CARMEN_WHISPERS.length);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#1c1606] border-2 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.4)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-950 via-amber-400 to-amber-950" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-400 hover:text-white transition-colors bg-amber-950/80 p-1.5 rounded-full border border-amber-800/50 z-20 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-start p-5 border-b border-amber-900/40 bg-black/60">
          <div className="w-20 h-20 rounded-xl bg-amber-950/80 border-2 border-amber-400 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)] shrink-0">
            <img src={EASTER_EGG_IMAGES.carmen} alt="Carmen" className="w-full h-full object-cover object-top" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 tracking-widest uppercase mb-0.5">
              <Sparkles size={12} /> The Voice • Source of Distortion
            </div>
            <h2 className="text-xl font-black text-amber-100 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] leading-tight mb-0.5">
              Carmen — The Light
            </h2>
            <p className="text-xs text-amber-400/80 mb-2">Architect of the Seed of Light / The Voice Resonating in the Mind</p>
            <div className="text-xs italic text-amber-100/90 font-serif bg-amber-950/40 border border-amber-800/40 rounded p-2 leading-relaxed">
              "Why must you suppress what you truly feel? Listen closely to the beating in your chest... Let it bloom."
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/40 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest block">
              🎧 Telepathic Resonance Transmission
            </span>
            <p className="text-sm font-serif italic text-amber-100 leading-relaxed px-4 py-3 bg-black/60 rounded-xl border border-amber-800/50 min-h-[4rem] flex items-center justify-center">
              {CARMEN_WHISPERS[whisperIdx]}
            </p>
            <div className="flex justify-center gap-3 pt-1">
              <button
                onClick={cycleWhisper}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 size={14} /> Listen to Next Whisper
              </button>
              <button
                onClick={() => setResisting(!resisting)}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase transition-colors border cursor-pointer ${
                  resisting 
                    ? 'bg-sky-600 text-white border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                    : 'bg-black/60 text-gray-300 border-white/20 hover:border-white/40'
                }`}
              >
                {resisting ? '🛡️ Mind Shield Active' : 'Resist Distortion'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-amber-900/30 space-y-2">
            <span className="font-bold text-amber-300 text-sm block">Psychic Distortion Profile</span>
            <p className="text-gray-300 leading-relaxed">
              When an inhabitant of the City falls into profound despair and self-hatred, the Voice appears in their mind. Carmen urges the suffering individual to cease suppressing their ego, to unleash their true innermost desires upon the world, resulting in monstrous physical metamorphosis into a Distortion.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-800/40">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block mb-1">
              ⚠️ Records Keeper Kenneth — Immediate Safety Warning
            </span>
            <p className="text-gray-200 italic font-mono leading-relaxed">
              "DANTE! WHO AUTHORIZED CONNECTING THE AUDIO RECEIVER TO THE LIGHT?! If you listen to her whispers for more than twenty seconds, your clock will sprout butterfly wings and turn the entire bus into a giant cocoon! SHUT THIS FILE DOWN RIGHT NOW!"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-amber-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 font-bold text-xs border border-amber-700/50 transition-colors cursor-pointer"
          >
            Close Transmission
          </button>
        </div>
      </motion.div>
    </div>
  );
}
