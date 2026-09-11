import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Shield, Sparkles, BookOpen, X, Heart, Award } from 'lucide-react';

const CHESED_QUOTES = [
  "Would you care for a cup of warm coffee? Good coffee soothes even the heaviest mind.",
  "No need to rush into battle so recklessly. A relaxed tactician sees three moves ahead.",
  "Roland and I often shared a cup on the balcony. He prefers it black; I prefer a touch of cream.",
  "Even when the Floor of Social Sciences is under attack, coffee breaks are non-negotiable.",
  "Courage isn't the absence of fear, Manager. It's knowing when to pause, breathe, and take another sip."
];

export default function ChesedModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [coffeeMugs, setCoffeeMugs] = useState(1);
  const [isBrewing, setIsBrewing] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [steamActive, setSteamActive] = useState(true);

  const handlePourCoffee = () => {
    setIsBrewing(true);
    setCoffeeMugs(prev => prev + 1);
    setCurrentQuoteIndex(prev => (prev + 1) % CHESED_QUOTES.length);
    setTimeout(() => setIsBrewing(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-[#0f141c] border-2 border-[#38bdf8]/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(56,189,248,0.25)] text-gray-100 flex flex-col relative"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-[#38bdf8]/30 bg-gradient-to-r from-[#0c1829] via-[#0f2438] to-[#0c1829]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/50 flex items-center justify-center shadow-lg">
                <Coffee size={24} className="text-[#38bdf8]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">
                  Patron Librarian • Floor of Social Sciences
                </span>
                <h2 className="text-2xl font-black text-white font-serif tracking-wide mt-0.5">
                  Chesed
                </h2>
                <p className="text-xs text-sky-200/70 font-sans">
                  Former Head of Welfare Team • Master of Warm Coffee & Battle of Attrition
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
          {/* Interactive Coffee Brewing Station */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-[#38bdf8]/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee size={18} className="text-[#38bdf8]" />
                <span className="font-bold text-sm text-sky-200 font-serif">Welfare Coffee Lounge</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30">
                ☕ {coffeeMugs} Mugs Enjoyed
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-[#1e293b] text-xs text-gray-300 italic font-serif flex items-center gap-3">
              <span className="text-xl">☕</span>
              <p>"{CHESED_QUOTES[currentQuoteIndex]}"</p>
            </div>

            <button
              onClick={handlePourCoffee}
              disabled={isBrewing}
              className="w-full py-2.5 rounded-lg font-bold text-xs bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-black shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Coffee size={15} />
              <span>{isBrewing ? "Brewing Fresh Arabica Roast..." : "Pour Chesed Another Cup of Coffee"}</span>
            </button>
          </div>

          {/* Librarian Battle Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#38bdf8] mb-3 flex items-center gap-1.5">
              <BookOpen size={14} /> Combat Pages & Social Science Arts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-black/40 border border-[#1e293b]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-sky-300">Warm Cup of Java</span>
                  <span className="text-[10px] font-mono text-[#38bdf8]">1 Cost • Blunt</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  [On Hit] Restore 10 SP to the ally with the lowest sanity. Grant 1 Protection next scene.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#1e293b]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-sky-300">Battle of Attrition</span>
                  <span className="text-[10px] font-mono text-[#38bdf8]">2 Cost • Pierce</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Inflict 3 Defense Down. If the target's speed is lower, boost all allies' stagger resist.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#1e293b]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-sky-300">Coffee Break</span>
                  <span className="text-[10px] font-mono text-[#38bdf8]">3 Cost • Defensive</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Evade all incoming attacks under 14 power. Next turn, start combat with +2 E.G.O resources.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-[#1e293b]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-sky-300">Courage of the Welfare Team</span>
                  <span className="text-[10px] font-mono text-[#38bdf8]">Special E.G.O</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Mass Attack (Summation). Deal 28 Blunt damage. Allies gain +2 Clash Power for 2 turns.
                </p>
              </div>
            </div>
          </div>

          {/* Kenneth's Memo */}
          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#1e293b] text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px] uppercase tracking-wider">
              <span>📋 Records Keeper Kenneth's Welfare Audit</span>
            </div>
            <p className="italic text-gray-300">
              "Librarian Chesed sent a requisition order for sixty kilograms of hand-roasted Colombian coffee beans through the pneumatic tube. When I reminded him that we are currently budget-constrained by Limbus Corporate, he offered me a mug with frothed milk. I... I have not tasted real coffee in two years. I approved the order immediately."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
