import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, BookOpen, Smile, X, Award, Shield } from 'lucide-react';

const HOD_COUNSELING_NOTES = [
  "You're doing your absolute best today, Manager. Even taking one small step forward counts as courage.",
  "It's okay to feel overwhelmed by your responsibilities. Please remember that you don't have to carry the entire world alone.",
  "Mistakes don't define who you are. What matters is wanting to become a little kinder, a little better than yesterday.",
  "Have you eaten a proper meal today? Even during difficult Mirror Dungeons, your well-being is precious.",
  "I used to think being 'good' meant being flawless. But real goodness is forgiving yourself and trying again."
];

export default function HodModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [adviceIndex, setAdviceIndex] = useState(0);
  const [sessionsAttended, setSessionsAttended] = useState(1);
  const [hopeParticles, setHopeParticles] = useState(false);

  const handleCounseling = () => {
    setHopeParticles(true);
    setSessionsAttended(prev => prev + 1);
    setAdviceIndex((adviceIndex + 1) % HOD_COUNSELING_NOTES.length);
    setTimeout(() => setHopeParticles(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-[#18120d] border-2 border-[#f59e0b]/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(245,158,11,0.25)] text-gray-100 flex flex-col relative"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-[#f59e0b]/30 bg-gradient-to-r from-[#211508] via-[#332009] to-[#211508]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/50 flex items-center justify-center shadow-lg">
                <Heart size={24} className="text-[#f59e0b]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded border border-[#f59e0b]/30">
                  Patron Librarian • Floor of Literature
                </span>
                <h2 className="text-2xl font-black text-white font-serif tracking-wide mt-0.5">
                  Hod
                </h2>
                <p className="text-xs text-amber-200/70 font-sans">
                  Former Head of Training Team • Counseling, Debilitation & Sincere Aspiration
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Counseling & Encouragement Dispenser */}
          <div className="p-4 rounded-xl bg-[#110d08] border border-[#f59e0b]/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile size={18} className="text-[#f59e0b]" />
                <span className="font-bold text-sm text-amber-200 font-serif">Training & Counseling Desk</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
                ✨ Session #{sessionsAttended}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-black/50 border border-[#3b2a14] text-xs text-amber-100/90 italic font-serif flex items-center gap-3 relative">
              <span className="text-2xl">📖</span>
              <p className="leading-relaxed">"{HOD_COUNSELING_NOTES[adviceIndex]}"</p>
              {hopeParticles && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: 1.2 }} 
                  exit={{ opacity: 0 }}
                  className="absolute right-3 top-2 text-[#fbbf24] text-xs font-bold"
                >
                  ✨ Warmth Restored!
                </motion.div>
              )}
            </div>

            <button
              onClick={handleCounseling}
              className="w-full py-2.5 rounded-lg font-bold text-xs bg-gradient-to-r from-[#d97706] to-[#f59e0b] hover:from-[#b45309] hover:to-[#d97706] text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Heart size={15} />
              <span>Request Personal Encouragement from Hod</span>
            </button>
          </div>

          {/* Combat Pages & Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3 flex items-center gap-1.5">
              <BookOpen size={14} /> Combat Pages & Literature Arts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-black/40 border border-[#3b2a14]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-amber-300">Counseling Session</span>
                  <span className="text-[10px] font-mono text-[#f59e0b]">1 Cost • Pierce</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Inflict 2 Fragile and 2 Paralysis. The target's aggressive coins roll at minimum values.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#3b2a14]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-amber-300">A Better Person</span>
                  <span className="text-[10px] font-mono text-[#f59e0b]">Passive</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Whenever an ally is staggered, gain +3 Haste and +2 Power next turn to protect them.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#3b2a14]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-amber-300">Literature of Hope</span>
                  <span className="text-[10px] font-mono text-[#f59e0b]">2 Cost • Slash</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Heal 12 HP and 15 SP to the lowest health ally. Inflict 3 Bleed on clash win.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#3b2a14]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-amber-300">Suppression Protocol: Red Shoes</span>
                  <span className="text-[10px] font-mono text-[#f59e0b]">Special E.G.O</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Mass Attack (Individual). Inflict 8 Bleed and 3 Sinking Count to all enemies.
                </p>
              </div>
            </div>
          </div>

          {/* Kenneth's Memo */}
          <div className="p-3.5 rounded-lg bg-[#140d07] border border-[#3b2a14] text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <span>📋 Records Keeper Kenneth's Counseling Log</span>
            </div>
            <p className="italic text-gray-300">
              "Librarian Hod noticed my dark eye circles while delivering inventory logs and handed me fourteen brochures on 'Mindful Work-Life Balance in the Outskirts.' I initially scoffed... but Chapter 3 on dealing with uncooperative managers who wind their clock heads in meetings was surprisingly therapeutic. I have placed her brochure next to my coffee mug."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
