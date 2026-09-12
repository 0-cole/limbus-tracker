import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, X, Shield, Swords, Music, Box, Eye, Layers } from 'lucide-react';
import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';

const ARTFUL_QUOTES = [
  "Can success even be worth its story?",
  "A magician never reveals their tricks!",
  "With a flick of my wand—I bring your wildest dreams—into reality...!",
  "The only thing stopping you from achieving your dreams are the mental roadblocks you set before yourself!",
  "Like what you hear? All the music here is made by yours Truly! You can buy it at the Giftshop!",
  "Who's to say you can't teach an old magician new tricks?",
  "Est-ce ta carte? (Is this your card?)"
];

export default function ArtfulModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeWalls, setActiveWalls] = useState(2);
  const [musicBoxes, setMusicBoxes] = useState(1);
  const [repurposedBricks, setRepurposedBricks] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [wandFlourish, setWandFlourish] = useState(false);

  const handleCastTrick = () => {
    setWandFlourish(true);
    setQuoteIndex((quoteIndex + 1) % ARTFUL_QUOTES.length);
    setActiveWalls(prev => (prev >= 5 ? 1 : prev + 1));
    setMusicBoxes(prev => (prev >= 2 ? 1 : prev + 1));
    setRepurposedBricks(prev => prev + 1);
    setTimeout(() => setWandFlourish(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-[#101216] border-2 border-pink-500 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(236,72,153,0.35)] text-gray-100 flex flex-col relative font-sans"
      >
        {/* Floating magic spark particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-10 left-12 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-60" />
          <div className="absolute bottom-20 right-16 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-50" />
          <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce opacity-70" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-pink-500/30 bg-gradient-to-r from-[#220d1c] via-[#35102a] to-[#220d1c]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-xl bg-pink-950 border-2 border-pink-500 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)] shrink-0">
                <img src={EASTER_EGG_IMAGES.artful} alt="Artful" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-600/40">
                    Die of Death • Trapper Killer (500P)
                  </span>
                  <span className="text-[9px] font-mono font-black text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-700/50">
                    🎩 FRENCH MAGICIAN
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide mt-1 flex items-center gap-2">
                  Artful
                </h2>
                <p className="text-xs text-pink-200/80 italic">
                  "Can success even be worth its story?" — The Magician on the Run
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

        {/* Body */}
        <div className="p-6 space-y-6 relative z-10">
          {/* Identity Lore Dossier */}
          <div className="p-4 rounded-xl bg-black/60 border border-pink-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-pink-400">
                🎭 Classified Anomaly Biography
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                Former Alias: <strong className="text-gray-200">Infestent</strong>
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-pink-300">Artful</strong> is a French Magician who has possessed a profound connection to magic since birth. Once a celebrated star of the stage, his career came to an abrupt, horrifying end during an infamous performance that went disastrously wrong. Consumed by rage and humiliation, Artful snapped and <em className="text-pink-400 font-medium">"took out his frustrations on his entire audience."</em> Now a wanted criminal on the run, he wanders the outskirts wielding his trademark black-and-white wand, hiding behind a cracked Phantom-of-the-Opera half-mask.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="bg-pink-950/60 text-pink-300 px-2 py-0.5 rounded border border-pink-700/40">
                Cost: 500 Points (500P)
              </span>
              <span className="bg-black text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                Attire: Wide-Brimmed Top Hat & Black Vest
              </span>
              <span className="bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-700/40">
                Chase: "Est-ce ta carte" (theonlywhitesofa)
              </span>
              <span className="bg-yellow-950/60 text-yellow-300 px-2 py-0.5 rounded border border-yellow-700/40">
                LMS: "SHOWTIME" (AximSC)
              </span>
            </div>
          </div>

          {/* Interactive Wand Stage */}
          <div className="p-4 rounded-xl bg-black/70 border border-pink-500/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={18} className="text-pink-400" />
                <span className="font-bold text-sm text-pink-200">Stage Performance Control</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/60">
                  🧱 {activeWalls}/5 Walls
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/60">
                  🎵 {musicBoxes}/2 Boxes
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60">
                  📦 {repurposedBricks} Repurposed
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#1a0f18] border border-pink-500/30 text-xs text-pink-100 font-mono flex items-center gap-3">
              <span className="text-2xl">🎩</span>
              <p className="font-bold tracking-tight leading-relaxed italic">
                "{ARTFUL_QUOTES[quoteIndex]}"
              </p>
            </div>

            <button
              onClick={handleCastTrick}
              className="w-full py-2.5 rounded-lg font-black text-xs bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={15} />
              <span>FLOURISH WAND & SUMMON STAGE TRICK!</span>
            </button>
          </div>

          {/* Canonical Abilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-3 flex items-center gap-1.5">
              <Swords size={14} /> Die of Death Trapper Arsenal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-black/50 border border-pink-950">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-pink-300 flex items-center gap-1">
                    <Wand2 size={13} /> Wand Swing (Main)
                  </span>
                  <span className="text-[10px] font-mono text-pink-400">1s CD • 20 DMG</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  <em>"With a flick of my wand—I bring your wildest dreams into reality!"</em> Pull back right arm and swing forwards for consistent melee punishment.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-pink-950">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-pink-300 flex items-center gap-1">
                    <Shield size={13} /> Implement (Wall)
                  </span>
                  <span className="text-[10px] font-mono text-pink-400">13s CD • 100 HP</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  <em>"Mental roadblocks you set before yourself!"</em> Strike below to spawn a 10-stud rising concrete wall (max 5), launching & ragdolling targets in 3-stud radius.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-pink-950">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-pink-300 flex items-center gap-1">
                    <Music size={13} /> Copywrite (Music Box)
                  </span>
                  <span className="text-[10px] font-mono text-pink-400">5s CD • 150 HP</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  <em>"All the music here is made by yours truly!"</em> Deploys a spinning Music Box that tethers beams to enemies in 25 studs, inflicting Slowness x6 and revealing targets for 3s.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-pink-950">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-pink-300 flex items-center gap-1">
                    <Box size={13} /> Repurpose (Brick / Puppet)
                  </span>
                  <span className="text-[10px] font-mono text-pink-400">3s / 15s CD</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  <em>"Teach an old magician new tricks?"</em> Pockets active walls or music boxes with the wand, turning them into high-speed throwable bricks (25 studs/sec) or puppet decoys!
                </p>
              </div>
            </div>
          </div>

          {/* Passive & Themes */}
          <div className="p-3 rounded-lg bg-[#140b15] border border-pink-950 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-pink-300 font-bold text-[11px]">
              <span className="flex items-center gap-1">
                <Eye size={13} /> Passive: Magician's Intuition
              </span>
              <span className="text-[10px] font-mono text-pink-400">Global Trapper Radar</span>
            </div>
            <p className="text-gray-400 text-[11px]">
              <em>"A magician never reveals their tricks!"</em> All spawned Walls, Music Boxes, and Puppets are permanently highlighted through terrain. Artful always knows the exact count of existing structures.
            </p>
          </div>

          {/* Kenneth's Memo */}
          <div className="p-3.5 rounded-lg bg-[#120810] border border-pink-950 text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-pink-400 font-bold text-[11px] uppercase tracking-wider">
              <span>📋 Records Keeper Kenneth's Incident Memo</span>
            </div>
            <p className="italic text-gray-300 leading-relaxed">
              "A ten-stud wide concrete wall just materialized right in front of my desk out of thin air, throwing my coffee into the ceiling fan. Then a miniature wind-up music box started blasting French accordion music ('Est-ce ta carte') so loud that Faust came out of her lab to file a decibel violation. Charon was spotted dancing with a banana peel yelling 'SHOWTIME'. I am locking the door."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
