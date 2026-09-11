import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles, Navigation, Fuel, Volume2 } from 'lucide-react';

const CHARON_QUOTES = [
  "\"Vroom vroom. Engine is purring happily. Mephistopheles likes smooth roads.\"",
  "\"Dante is bad driver. Dante hits trees. Charon is best driver. Charon gets star candies.\"",
  "\"Look out the window. Outskirts are foggy. If monsters jump, Mephistopheles squishes them.\"",
  "\"Charon wants lemon star candy. Red star candy is good too. Vergilius said no more than ten a day.\"",
];

export default function CharonModal({ onClose }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [candyCount, setCandyCount] = useState(12);

  const cycleQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % CHARON_QUOTES.length);
  };

  const feedCandy = () => {
    setCandyCount((c) => c + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#041217] border-2 border-cyan-500 shadow-[0_0_60px_rgba(6,182,212,0.4)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-950 via-cyan-400 to-cyan-950" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-cyan-400 hover:text-white transition-colors bg-cyan-950/80 p-1.5 rounded-full border border-cyan-800/50 z-20 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-start p-5 border-b border-cyan-900/40 bg-black/60">
          <div className="w-20 h-20 rounded-xl bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 text-4xl shadow-[0_0_20px_rgba(6,182,212,0.6)] shrink-0">
            ⭐
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-0.5">
              <Navigation size={12} /> Master Chauffeur • Mephistopheles
            </div>
            <h2 className="text-xl font-black text-cyan-100 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] leading-tight mb-0.5">
              Bus Driver Charon
            </h2>
            <p className="text-xs text-cyan-400/80 mb-2">Navigator of the City's Veins / Consumer of Star Candies</p>
            <div className="text-xs italic text-cyan-100/90 font-serif bg-cyan-950/40 border border-cyan-800/40 rounded p-2 leading-relaxed">
              "Vroom vroom. Mephistopheles is hungry. Charon wants star candies. Dante drive? No. Dante is bad driver. Charon drives."
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-cyan-900/30 bg-black/40 text-center text-xs">
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Position</span>
            <span className="font-bold text-cyan-300">Chauffeur</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Speed</span>
            <span className="font-bold text-gray-200">140 MPH</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Star Candies</span>
            <span className="font-bold text-yellow-300">{candyCount} Stashed</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Driving Skill</span>
            <span className="font-black text-cyan-400">Supreme</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-widest block">
              📻 Intercom from the Driver's Seat
            </span>
            <p className="text-sm font-serif italic text-cyan-100 leading-relaxed px-4 py-3 bg-black/60 rounded-xl border border-cyan-900/50 min-h-[4rem] flex items-center justify-center">
              {CHARON_QUOTES[quoteIdx]}
            </p>
            <div className="flex justify-center gap-3 pt-1">
              <button
                onClick={cycleQuote}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 size={14} /> Talk to Charon
              </button>
              <button
                onClick={feedCandy}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                🍬 Give Star Candy ({candyCount})
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
              📋 Records Keeper Kenneth — Maintenance Log
            </span>
            <p className="text-gray-300 italic font-mono leading-relaxed">
              "Please do not give Charon high-fructose candies before highway transit. Last time Dante gave her extra sweets, Mephistopheles took a ramp jump over an elevated rail bridge in District 4."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-cyan-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 font-bold text-xs border border-cyan-700/50 transition-colors cursor-pointer"
          >
            Close Chauffeur File
          </button>
        </div>
      </motion.div>
    </div>
  );
}
