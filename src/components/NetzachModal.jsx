import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Wine, Sparkles, BookOpen, X, Volume2, Shield } from 'lucide-react';
import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';

const NETZACH_QUOTES = [
  "Do we... really have to do this right now? I was just about to fall asleep.",
  "Why does everyone in the City work so hard? Just rest a bit. The world won't end today.",
  "If you have any cold beer left in the Mephistopheles cooler, I'll trade you my combat notes for it.",
  "Fighting, filing reports, dying, reviving... isn't everyone exhausted? Just lay down on the floor.",
  "Art is about letting things happen at their own pace. Right now, my pace is zero kilometers per hour."
];

export default function NetzachModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [isNapping, setIsNapping] = useState(true);
  const [drinksShared, setDrinksShared] = useState(3);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const toggleNap = () => {
    setIsNapping(!isNapping);
    setQuoteIndex((quoteIndex + 1) % NETZACH_QUOTES.length);
  };

  const handleDrinkBeer = () => {
    setDrinksShared(prev => prev + 1);
    setQuoteIndex((quoteIndex + 2) % NETZACH_QUOTES.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-[#0e1611] border-2 border-[#10b981]/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(16,185,129,0.25)] text-gray-100 flex flex-col relative"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-[#10b981]/30 bg-gradient-to-r from-[#091a12] via-[#0d2a1d] to-[#091a12]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-emerald-950 border-2 border-emerald-400 overflow-hidden flex items-center justify-center shadow-lg shrink-0">
                <img src={EASTER_EGG_IMAGES.netzach} alt="Netzach" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30">
                  Patron Librarian • Floor of Art
                </span>
                <h2 className="text-2xl font-black text-white font-serif tracking-wide mt-0.5">
                  Netzach
                </h2>
                <p className="text-xs text-emerald-200/70 font-sans">
                  Former Head of Security Team • Sloth, Liquors & Stagger Nullification
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
          {/* Nap & Beer Lounge */}
          <div className="p-4 rounded-xl bg-[#08130c] border border-[#10b981]/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={18} className="text-[#10b981]" />
                <span className="font-bold text-sm text-emerald-200 font-serif">
                  Status: {isNapping ? "😴 Deep Slumber (Do Not Disturb)" : "🥱 Half-Awake (Complaining)"}
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                🍺 {drinksShared} Cans Emptied
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-[#132c1e] text-xs text-gray-300 italic font-serif flex items-center gap-3">
              <span className="text-xl">{isNapping ? "💤" : "🍺"}</span>
              <p>"{NETZACH_QUOTES[quoteIndex]}"</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={toggleNap}
                className="py-2.5 px-3 rounded-lg font-bold text-xs bg-[#132c1e] hover:bg-[#1a3d2a] text-emerald-300 border border-[#10b981]/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Moon size={14} />
                <span>{isNapping ? "Poke Him to Wake Up" : "Let Him Sleep Again"}</span>
              </button>
              <button
                onClick={handleDrinkBeer}
                className="py-2.5 px-3 rounded-lg font-bold text-xs bg-gradient-to-r from-[#059669] to-[#10b981] hover:from-[#047857] hover:to-[#059669] text-black font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wine size={14} />
                <span>Offer Cold Beverage</span>
              </button>
            </div>
          </div>

          {/* Combat Pages & Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-3 flex items-center gap-1.5">
              <BookOpen size={14} /> Combat Pages & Sloth Resonance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-black/40 border border-[#132c1e]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-emerald-300">Floor of Art Sloth</span>
                  <span className="text-[10px] font-mono text-[#10b981]">Passive</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Whenever Netzach or an ally takes lethal stagger damage, ignore it once per encounter and restore 20% max HP.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#132c1e]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-emerald-300">Pain Reliever (Green Tea)</span>
                  <span className="text-[10px] font-mono text-[#10b981]">1 Cost • Support</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Target ally loses all status ailments. Next turn, reduce all damage taken by 40%.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#132c1e]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-emerald-300">Drunken Brawler</span>
                  <span className="text-[10px] font-mono text-[#10b981]">2 Cost • Blunt</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Unfocused, swaying strikes. 50% chance to roll maximum coin value; 100% chance to stagger enemy on crit.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#132c1e]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-emerald-300">Everlasting Sloth Zone</span>
                  <span className="text-[10px] font-mono text-[#10b981]">Mass E.G.O</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Inflict 5 Bind and 3 Attack Power Down to all enemies. All allies heal 15 HP and 15 SP.
                </p>
              </div>
            </div>
          </div>

          {/* Kenneth's Memo */}
          <div className="p-3.5 rounded-lg bg-[#07130c] border border-[#132c1e] text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
              <span>📋 Records Keeper Kenneth's Incident Report</span>
            </div>
            <p className="italic text-gray-300">
              "At 03:00, I heard faint snoring coming from inside the high-security archive closet. When I unlocked the door with my master key, Librarian Netzach was wrapped in three Mephistopheles spare blankets fast asleep between the tax ledgers. When I asked him how he bypassed the electronic deadbolt, he mumbled 'the door was cold, so it felt nice on my forehead' and fell back asleep."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
