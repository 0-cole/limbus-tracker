import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShieldAlert, Heart, Sparkles, Moon, Sun } from 'lucide-react';

const SANCHO_SKILLS = [
  {
    name: "Mambrino's Golden Helmet",
    affinity: 'Lust',
    type: 'Pierce',
    base: 24,
    coinPower: 14,
    coins: 3,
    effects: [
      '[On Use] Gain +5 Bloodfeast Count and 3 Protection',
      '[Coin 1 On Hit] Inflict 4 Bleed',
      '[Coin 2 On Hit] Inflict 4 Bleed and 2 Bleed Count',
      '[Coin 3 On Hit] If target has 15+ Bleed, heal 20% of max HP',
    ],
    desc: 'The battered barber\'s basin transformed into an infallible golden crown through sheer, unbroken longing.'
  },
  {
    name: 'Gallop Forth, Rocinante!',
    affinity: 'Wrath',
    type: 'Pierce',
    base: 26,
    coinPower: 16,
    coins: 2,
    effects: [
      '[Clash Win] Gain +3 Haste next turn',
      '[Coin 1 On Hit] Inflict 3 Fragile',
      '[Coin 2 On Hit] Deal +100% damage if moving faster than target',
    ],
    desc: 'Rocinante\'s true equine visage emerges from the red mist, piercing the heart of the wicked windmills.'
  },
  {
    name: 'Carnival of the Second Kindred',
    affinity: 'Lust',
    type: 'Slash (Awakening)',
    base: 44,
    coinPower: 20,
    coins: 1,
    effects: [
      '[Absolute Bloodfeast] Consumes all active Bloodfeast tokens',
      '[On Hit] Drain target\'s vital fluids, converting 50% of damage dealt into party-wide healing',
      '[Special] Sinner Don Quixote will remember the Father\'s promises...',
    ],
    desc: 'The carnival curtains part. Cast aside the shoes, unleash the crimson fangs, and remember the hundreds of years spent asleep beneath the stars.'
  }
];

export default function SanchoModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('skills');
  const [awakened, setAwakened] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#1c0406] border-2 border-red-700 shadow-[0_0_60px_rgba(220,38,38,0.4)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-950 via-red-500 to-red-950" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-400 hover:text-white transition-colors bg-red-950/80 p-1.5 rounded-full border border-red-800/50 z-20 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-start p-5 border-b border-red-900/40 bg-black/60">
          <div className="w-20 h-20 rounded-xl bg-red-950 border-2 border-red-500 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(239,68,68,0.6)] shrink-0 animate-pulse">
            🦇
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 tracking-widest uppercase mb-0.5">
              <Sparkles size={12} className="text-red-400" /> Second Kindred • Bloodfiend of the Barrio
            </div>
            <h2 className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] leading-tight mb-0.5">
              Sancho — Bloodfiend
            </h2>
            <p className="text-xs text-red-400/80 mb-2">The Dreamer of La Mancha Land / True Form of Don Quixote</p>
            <div className="text-xs italic text-red-200/90 font-serif bg-red-950/40 border border-red-800/40 rounded p-2 leading-relaxed">
              "Awaken, my dream-clad child... Cast aside the lance, and let the carnival of blood begin anew."
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-red-900/30 bg-black/40 text-center text-xs">
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Bloodline</span>
            <span className="font-bold text-red-300">Second Kindred</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Steed</span>
            <span className="font-bold text-gray-200">Rocinante (Unshackled)</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Thirst Status</span>
            <span className="font-bold text-amber-300">{awakened ? 'Awakened Bloodlust' : 'Deep Slumber'}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Threat Level</span>
            <span className="font-black text-red-500 animate-pulse">Calamity</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-red-900/30 px-5 pt-2 gap-4 text-xs font-bold bg-black/20">
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'skills' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Bloodline Disciplines ({SANCHO_SKILLS.length})
          </button>
          <button
            onClick={() => setActiveTab('lore')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'lore' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            La Mancha Chronicles
          </button>
          <button
            onClick={() => setActiveTab('kenneth')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'kenneth' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Records Memo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-950/40 border border-red-800/50">
                <div>
                  <span className="font-bold text-white block text-sm">State of Consciousness</span>
                  <span className="text-gray-400 text-[11px]">Toggle between the Innocent Knight Persona and Awakened Bloodfiend</span>
                </div>
                <button
                  onClick={() => setAwakened(!awakened)}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {awakened ? <Sun size={14} /> : <Moon size={14} />}
                  {awakened ? 'Revert to Don Quixote' : 'Awaken Sancho'}
                </button>
              </div>

              {SANCHO_SKILLS.map((skill, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-red-900/30 hover:border-red-600/50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-red-300">{skill.name}</span>
                    <span className="font-mono text-gray-400 text-[11px]">
                      {skill.type} | Base: <strong className="text-red-400">{skill.base}</strong> (+{skill.coinPower} x{skill.coins})
                    </span>
                  </div>
                  <p className="text-gray-300 italic mb-2 leading-relaxed text-[11px]">{skill.desc}</p>
                  <div className="space-y-1">
                    {skill.effects.map((eff, j) => (
                      <p key={j} className="text-[10px] font-mono text-red-400/80">
                        {eff}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lore' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-black/60 border border-red-900/40 space-y-2">
                <span className="text-[11px] font-black uppercase text-red-400 block">The Second Kindred</span>
                <p className="text-gray-300 leading-relaxed">
                  Before she put on the yellow shoes of forgetfulness, Don Quixote was Sancho, the loyal Second Kindred of the Bloodfiends. Guided by the Father's impossible dream of coexisting with humanity without slaughter, she entered a century-long slumber inside the amusement park of blood.
                </p>
                <p className="text-gray-400 italic">
                  "No matter how tragic the ending, a true knight must see the dream through to the dawn."
                </p>
              </div>
            </div>
          )}

          {activeTab === 'kenneth' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  📋 Records Keeper Kenneth — Strictly Confidential
                </span>
                <p className="text-gray-300 italic font-mono leading-relaxed">
                  "Dante, if Don Quixote realizes she is a centuries-old Bloodfiend royalty during our lunch break, Mephistopheles is doomed. Keep her supplied with hero comic books and whatever snacks she wants. Do NOT let her take off those boots!"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-red-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-white font-bold text-xs border border-red-700/50 transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
