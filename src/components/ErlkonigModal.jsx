import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ghost, Flame, ShieldAlert, Skull, Sparkles, Sword } from 'lucide-react';
import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';

const ERLKONIG_SKILLS = [
  {
    name: 'Lament, Mourn, and Despair',
    affinity: 'Envy',
    type: 'Slash',
    base: 22,
    coinPower: 16,
    coins: 3,
    effects: [
      '[On Use] Gain +5 Sinking Count and +3 Envy Resonance',
      '[Coin 1 On Hit] Inflict 6 Sinking and 2 Sinking Count',
      '[Coin 2 On Hit] Inflict 6 Sinking',
      '[Coin 3 On Hit] Trigger Sinking Deluge (Deals Sinking potency x count as Gloom damage)',
    ],
    desc: 'Swings the coffin-tethered greatsword with unrelenting bitterness, crushing the foe beneath the weight of unending grief.'
  },
  {
    name: 'Charge of Dullahan',
    affinity: 'Gloom',
    type: 'Blunt',
    base: 24,
    coinPower: 18,
    coins: 2,
    effects: [
      '[Clash Win] Stagger all adjacent enemies',
      '[Coin 1 On Hit] Inflict 3 Bind and 2 Fragile next turn',
      '[Coin 2 On Hit] If target is below 0 SP, deal +75% bonus damage',
    ],
    desc: 'Rides forth upon the phantom steed Dullahan, trampling souls that dare linger in the foggy heights of Wuthering Waves.'
  },
  {
    name: 'Every Heathcliff Must Perish',
    affinity: 'Envy',
    type: 'Slash (Ultimate)',
    base: 40,
    coinPower: 22,
    coins: 1,
    effects: [
      '[Absolute Resonance] Targets the identity with the highest SP',
      '[On Hit] Permanently shatters the target\'s mirror world reflection',
      '[Passive] If LCB Sinner Heathcliff is in party, force Sinner Heathcliff into immediate Corrosion',
    ],
    desc: 'The eternal vow echoed across infinite parallel worlds. "As long as Heathcliff exists, Catherine will never find peace."'
  }
];

const MIRROR_REFLECTIONS = [
  "Reflection #142: 'A Heathcliff who smiled beneath the sunny canopy of the manor... eliminated.'",
  "Reflection #318: 'A Heathcliff who became an Oufi fixer with quiet dignity... drowned in the moor.'",
  "Reflection #709: 'A Heathcliff who wore an apron and baked warm bread in District 23... severed from memory.'",
  "Reflection #999: 'This Heathcliff sitting inside Mephistopheles... You too will realize your curse.'",
];

export default function ErlkonigModal({ onClose }) {
  const [reflectionIndex, setReflectionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('skills');

  const cycleReflection = () => {
    setReflectionIndex((prev) => (prev + 1) % MIRROR_REFLECTIONS.length);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#13061c] border-2 border-purple-700 shadow-[0_0_60px_rgba(147,51,234,0.4)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-950 via-purple-500 to-purple-950" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-purple-400 hover:text-white transition-colors bg-purple-950/80 p-1.5 rounded-full border border-purple-800/50 z-20 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-start p-5 border-b border-purple-900/40 bg-black/60">
          <div className="w-20 h-20 rounded-xl bg-purple-950 border-2 border-purple-500 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] shrink-0">
            <img src={EASTER_EGG_IMAGES.erlkonig} alt="Erlkönig Heathcliff" className="w-full h-full object-cover object-top" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-400 tracking-widest uppercase mb-0.5">
              <Ghost size={12} /> Catastrophic Distortion • Leader of the Wild Hunt
            </div>
            <h2 className="text-xl font-black text-purple-100 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] leading-tight mb-0.5">
              Erlkönig Heathcliff
            </h2>
            <p className="text-xs text-purple-400/80 mb-2">Lord of Wuthering Waves / Phantom of Cathy's Moor</p>
            <div className="text-xs italic text-purple-200/90 font-serif bg-purple-950/40 border border-purple-800/40 rounded p-2 leading-relaxed">
              "Every Heathcliff in every reflection of this rotting City... must be wiped from existence."
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-purple-900/30 bg-black/40 text-center text-xs">
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Classification</span>
            <span className="font-bold text-purple-300">Catastrophic Distortion</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Mount</span>
            <span className="font-bold text-gray-200">Dullahan</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Main Affinities</span>
            <span className="font-bold text-violet-400">Envy / Gloom</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Acquirable</span>
            <span className="font-black text-red-400 uppercase">Prohibited</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-900/30 px-5 pt-2 gap-4 text-xs font-bold bg-black/20">
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'skills' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Hunt Techniques ({ERLKONIG_SKILLS.length})
          </button>
          <button
            onClick={() => setActiveTab('mirror')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mirror' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Wuthering Mirror ({reflectionIndex + 1}/{MIRROR_REFLECTIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('kenneth')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'kenneth' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Records Memo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'skills' && (
            <div className="space-y-3">
              {ERLKONIG_SKILLS.map((skill, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-purple-900/30 hover:border-purple-600/50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-purple-300">{skill.name}</span>
                    <span className="font-mono text-gray-400 text-[11px]">
                      {skill.type} | Base: <strong className="text-purple-400">{skill.base}</strong> (+{skill.coinPower} x{skill.coins})
                    </span>
                  </div>
                  <p className="text-gray-300 italic mb-2 leading-relaxed text-[11px]">{skill.desc}</p>
                  <div className="space-y-1">
                    {skill.effects.map((eff, j) => (
                      <p key={j} className="text-[10px] font-mono text-purple-400/80">
                        {eff}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mirror' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/50 text-center space-y-3">
                <span className="text-[10px] font-mono uppercase text-purple-400 block tracking-widest">
                  🪞 Fractured Mirror World Frequency
                </span>
                <p className="text-sm font-serif italic text-purple-200 leading-relaxed px-4 py-2 bg-black/50 rounded-lg border border-purple-900/50">
                  {MIRROR_REFLECTIONS[reflectionIndex]}
                </p>
                <button
                  onClick={cycleReflection}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-colors cursor-pointer"
                >
                  Peer Into Next World Reflection &rarr;
                </button>
              </div>
            </div>
          )}

          {activeTab === 'kenneth' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  📋 Records Keeper Kenneth — Incident Report
                </span>
                <p className="text-gray-300 italic font-mono leading-relaxed">
                  "Dante, our Heathcliff saw this file on the terminal and started having a screaming panic attack while swinging his baseball bat into the bus ceiling. Charon had to spray him with the engine coolant hose. Please keep this file classified under maximum lockdown."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-purple-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-white font-bold text-xs border border-purple-700/50 transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
