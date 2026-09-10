import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export default function VergiliusModal({ onClose }) {
  const [apologized, setApologized] = useState(false);
  const [apologyCount, setApologyCount] = useState(0);

  const handleApologize = () => {
    setApologyCount(prev => prev + 1);
    setApologized(true);
  };

  const getApologyResponse = () => {
    if (apologyCount === 1) {
      return "<Tick-tock...> Dante frantically waves their hands and winds their clock head in apology. Vergilius stares coldly in complete silence, exhales cigarette smoke, and looks away.";
    }
    if (apologyCount === 2) {
      return "Vergilius narrows his crimson eyes: 'Did you think repeating yourself would change my answer, Manager? Get back to the bus.'";
    }
    return "Vergilius places his hand on the hilt of his Gladius. Dante's clock hands are trembling at maximum speed. Charon giggles in the distance: 'Dante is scared. Charon wants candy.'";
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-card max-w-2xl w-full p-6 relative bg-[#0a0505] border-2 border-red-600/80 shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Red ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-red-400 hover:text-white transition-colors bg-red-950/60 p-1.5 rounded-full border border-red-800/40 z-20"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto pr-2 space-y-5">
          {/* Header Banner with Art */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start pb-5 border-b border-red-900/40">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border-2 border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.6)] flex-shrink-0 bg-black">
              <img 
                src="/images/vergilius.png" 
                alt="The Red Gaze Vergilius" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-1 left-1 right-1 text-center">
                <span className="text-[9px] bg-red-900/90 text-red-200 font-black px-1.5 py-0.5 rounded border border-red-500/50 uppercase tracking-wider">
                  Color Fixer
                </span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-red-500 tracking-widest uppercase mb-1">
                <ShieldAlert size={14} /> Threat Level: Grade 1 / Color
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-limbus text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                The Red Gaze — Vergilius
              </h2>
              <p className="text-xs text-red-300 font-medium mt-0.5">
                Senior Guide & Overseer of Limbus Company
              </p>

              {/* Iconic Quote */}
              <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-xs italic text-gray-200 font-serif leading-relaxed relative">
                <span className="text-red-500 text-lg absolute -top-2 left-2">“</span>
                Why are you looking here, Dante..? I am not one of your lackeys. Do you need... a <strong className="text-red-400 font-bold underline decoration-red-500/60">consultation?</strong>
                <span className="text-red-500 text-lg absolute -bottom-4 right-2">”</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-black/60 border border-red-900/40 p-2 rounded">
              <span className="text-[10px] text-gray-400 block font-bold">HP</span>
              <span className="font-mono font-black text-red-400 text-sm">99,999</span>
            </div>
            <div className="bg-black/60 border border-red-900/40 p-2 rounded">
              <span className="text-[10px] text-gray-400 block font-bold">Speed</span>
              <span className="font-mono font-black text-white text-sm">10 - 12</span>
            </div>
            <div className="bg-black/60 border border-red-900/40 p-2 rounded">
              <span className="text-[10px] text-gray-400 block font-bold">Defense</span>
              <span className="font-mono font-black text-white text-sm">999</span>
            </div>
            <div className="bg-black/60 border border-red-900/40 p-2 rounded">
              <span className="text-[10px] text-gray-400 block font-bold">Patience</span>
              <span className="font-mono font-black text-red-500 text-sm">0 / 100</span>
            </div>
          </div>

          {/* Skill List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Flame size={14} /> Guide Capabilities & Skills
            </h3>

            {/* Skill 1 */}
            <div className="bg-black/60 border border-red-950 p-2.5 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Skill 1: Cold Glare
                </span>
                <span className="text-[10px] font-mono font-bold text-red-400">Pierce • 99 Base (+50) • 4 Coins</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                Vergilius locks eyes with the target through the shadows. Target immediately suffers -45 Sanity. Inflicts 50 Tremor and 99 Sinking on Dante.
              </p>
            </div>

            {/* Skill 2 */}
            <div className="bg-black/60 border border-red-950 p-2.5 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Skill 2: Exasperated Sigh
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-400">Blunt • 150 Base • 1 Coin</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                Vergilius rubs the bridge of his nose and lights a cigarette. All Sinners within earshot lose 30 SP. Combat resolution speed increases by 200%.
              </p>
            </div>

            {/* Skill 3 */}
            <div className="bg-black/60 border border-red-900/60 p-2.5 rounded-lg bg-red-950/20">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-xs text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Skill 3: Gladius of the Red Gaze
                </span>
                <span className="text-[10px] font-mono font-black text-red-400">Slash • 999 Base • 5 Coins</span>
              </div>
              <p className="text-[11px] text-red-200/80 leading-snug">
                Draws the crimson gladius. Instantly obliterates all enemies on screen. The screen fades to black. Charon asks for star candy.
              </p>
            </div>

            {/* Passive */}
            <div className="bg-black/40 border border-[#333] p-2.5 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-yellow-500">
                  Passive: Contractual Non-Intervention
                </span>
                <span className="text-[10px] text-gray-500 font-mono">Cost: 0 (Always Active)</span>
              </div>
              <p className="text-[11px] text-gray-400 italic">
                "I will step in only when all twelve of you are dead. Do not test my patience, Manager."
              </p>
            </div>
          </div>

          {/* Apology Interactive Box */}
          {apologized && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-950/60 border border-red-700/60 rounded-lg text-xs text-red-200 leading-relaxed font-mono"
            >
              {getApologyResponse()}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-red-900/40">
            <button 
              onClick={handleApologize}
              className="px-4 py-2 rounded text-xs font-bold bg-black/60 text-red-400 border border-red-800/60 hover:bg-red-950/60 hover:text-white transition-colors"
            >
              &lt;Tick-tock...&gt; Apologize to Vergilius ({apologyCount})
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded text-xs font-black bg-red-600 text-white hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            >
              Back to Managing
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
