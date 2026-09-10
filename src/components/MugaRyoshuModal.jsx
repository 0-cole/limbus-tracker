import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Flame, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

const MUGA_SKILLS = [
  {
    name: 'Sever',
    affinity: 'Gluttony',
    type: 'Slash',
    base: 12,
    coinPower: -1,
    coins: 2,
    coinType: 'unbreakable',
    coinColor: '#16a34a',
    effects: [
      'Cannot change target',
      'Final Power +1 for every 10 Muga [無我] on self (max 3)',
      'Final Power +1 for every 6 Bleed on target (max 3)',
      '[Unbreakable Coin] Does not break on Clash Lose; attacks after getting hit',
      '[On Hit without Cracking] Inflict 1 Bleed and +2 Bleed Count (coin 1)',
      '[On Hit without Cracking] Inflict 3 Bleed and +1 Bleed Count (coin 2)',
    ],
    quote: '"I cannot let Araya live a life like my own. She must lead a new life away from this place, away from me."',
  },
  {
    name: 'Paint',
    affinity: 'Gluttony',
    type: 'Slash',
    base: 12,
    coinPower: -1,
    coins: 2,
    coinType: 'unbreakable',
    coinColor: '#16a34a',
    effects: [
      'Cannot change target',
      'Final Power +1 for every 10 Muga [無我] on self (max 3)',
      'Final Power +1 for every 6 Bleed on target (max 3)',
      '[Unbreakable Coin] Does not break on Clash Lose; attacks after getting hit',
      '[On Hit without Cracking] Inflict 2 Bleed and +1 Bleed Count (coin 1)',
      '[On Hit without Cracking] Inflict 2 Bleed and +2 Bleed Count (coin 2)',
    ],
    quote: '"We will escape the House of Spiders... Before Araya meets the same fate as Saru."',
  },
  {
    name: 'Splatter',
    affinity: 'Lust',
    type: 'Slash',
    base: 15,
    coinPower: -4,
    coins: 3,
    coinType: 'purple',
    coinColor: '#ea580c',
    effects: [
      'Cannot change target',
      'Random chance to delete the earliest Coin on the Skill this unit Clashed with',
      'Final Power +1 for every 10 Muga [無我] on self (max 5)',
      'Final Power +1 for every 6 Bleed on target (max 4)',
      '[On Hit without Cracking] Inflict 1 Bleed and +1 Bleed Count (coin 1)',
      '[On Hit without Cracking] Inflict 2 Bleed and +1 Bleed Count (coin 2)',
      '[On Hit without Cracking] Inflict 3 Bleed and +2 Bleed Count (coin 3)',
    ],
    quote: '"A splash of red upon the canvas. Nothing more, nothing less."',
  },
];

export default function MugaRyoshuModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'muga'
  const [slashCount, setSlashCount] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#0a0a0d] border-2 border-gray-600/80 shadow-[0_0_60px_rgba(200,200,220,0.2)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors bg-gray-900/80 p-1.5 rounded-full border border-gray-700/50 z-20"
        >
          <X size={16} />
        </button>

        {/* ── HEADER ── */}
        <div className="flex gap-4 items-start p-5 border-b border-gray-800 bg-black/50">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-400 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex-shrink-0 bg-black flex items-center justify-center text-5xl">
            ⚔️
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-1 left-0 right-0 text-center">
              <span className="text-[8px] bg-red-950/90 text-red-200 font-black px-1 py-0.5 rounded border border-red-700/50 uppercase tracking-wider">
                ASSIST UNIT
              </span>
            </div>
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 tracking-widest uppercase mb-0.5">
              <ShieldAlert size={12} className="text-red-500" /> No-Self State • House of Spiders
            </div>
            <h2 className="text-xl font-black text-gray-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] leading-tight mb-0.5">
              Muga [無我] — Ryōshū
            </h2>
            <p className="text-xs text-gray-400 mb-2">Blade of the House of Spiders • Canto VIII Assist Unit</p>
            <div className="text-xs italic text-gray-300 font-serif bg-black/50 border border-gray-800 rounded p-2 leading-relaxed relative">
              <span className="text-red-500 text-base absolute -top-2 left-2">"</span>
              So I must hold back on using the blade. And once I am ready, I will return to that House...{' '}
              <strong className="text-gray-200 underline decoration-red-600/60">without a trace of self remaining.</strong>
              <span className="text-red-500 text-base absolute -bottom-3 right-2">"</span>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-gray-800 bg-black/40 text-center text-xs">
          {[
            { label: 'HP', value: '4,200', color: 'text-gray-200' },
            { label: 'Speed', value: '3–7', color: 'text-white' },
            { label: 'Defense', value: '75', color: 'text-white' },
            { label: 'Panic', value: 'Alaya', color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-black/60 border border-gray-800 rounded py-1.5">
              <span className="text-[9px] text-gray-500 block font-bold uppercase">{stat.label}</span>
              <span className={`font-mono font-black text-sm ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ── TAB NAV ── */}
        <div className="flex border-b border-gray-800 bg-black/40 px-5">
          {[
            { id: 'skills', label: 'Sword Techniques', icon: <Swords size={12} /> },
            { id: 'muga', label: 'Muga [無我] Mechanics & Lore', icon: <EyeOff size={12} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all mr-1 ${
                activeTab === tab.id
                  ? 'border-gray-200 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === 'skills' ? (
              <motion.div key="skills" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Assist Unit Combat Skills</h3>
                  <span className="text-[9px] text-gray-400 bg-gray-900 border border-gray-700 px-2 py-0.5 rounded font-mono ml-auto">
                    CANTO VIII DATA
                  </span>
                </div>

                {MUGA_SKILLS.map((skill, idx) => (
                  <div key={skill.name} className="mb-4 rounded-lg overflow-hidden border border-gray-800 bg-[#070709]">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-900 bg-black/60">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.coinColor }} />
                        <span className="text-sm font-bold" style={{ color: skill.coinColor }}>{skill.affinity}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-xs font-bold text-gray-300">{skill.type}</span>
                        {skill.coinType === 'unbreakable' && (
                          <span className="text-[9px] bg-green-950 text-green-300 px-1.5 py-0.5 rounded border border-green-700/50 font-black uppercase tracking-wider">
                            Unbreakable
                          </span>
                        )}
                        {skill.coinType === 'purple' && (
                          <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700/50 font-black uppercase tracking-wider">
                            🟣 Purple Coin
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-white font-bold text-sm">{skill.base}</span>
                        <span className="text-gray-500 text-xs"> base </span>
                        <span className="font-mono text-red-400 font-bold text-sm">{skill.coinPower}</span>
                        <span className="text-gray-500 text-xs"> × {skill.coins}🪙</span>
                      </div>
                    </div>

                    {/* Skill Info */}
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-16 text-center bg-[#111116] rounded border border-gray-800 py-0.5">
                          Skill {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-200">{skill.name}</span>
                      </div>
                      <p className="text-xs text-red-400/80 italic leading-relaxed mb-2 font-serif">{skill.quote}</p>
                    </div>

                    {/* Effects */}
                    <div className="px-4 pb-3 space-y-1">
                      {skill.effects.map((eff, i) => (
                        <div key={i} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                          <span className="text-gray-600 flex-shrink-0">•</span>
                          <span>{eff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Equipped EGO */}
                <div className="bg-black/60 border border-red-950 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Equipped E.G.O</span>
                    <h4 className="font-bold text-white text-sm">Forest for the Flames (ZAYIN / Lust)</h4>
                  </div>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/60 font-mono">
                    Tier IV
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="muga" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="bg-[#0c0c10] border border-gray-700/60 rounded-xl p-4">
                  <h4 className="font-bold text-gray-200 text-sm mb-2 flex items-center gap-2">
                    <EyeOff size={16} className="text-red-500" />
                    Special Status: Muga [無我]
                  </h4>
                  <div className="space-y-2 text-xs text-gray-300 leading-relaxed pl-3 border-l border-red-800">
                    <p>• Max Stack: <strong>100</strong>.</p>
                    <p>• Turn Start: Gain <strong>1 Offense Level Up</strong> and <strong>1 Defense Level Up</strong> for every 10 Stacks.</p>
                    <p>• The higher the stack, the deeper Ryōshū descends into complete detachment from sense, identity, and mercy.</p>
                    <p className="italic text-gray-400 mt-2 font-serif">
                      "I cannot let Araya live a life like my own. She must lead a new life away from this place, away from me."
                    </p>
                  </div>
                </div>

                <div className="bg-black/60 border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-400 leading-relaxed">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Field Analysis — Assist Unit Protocol</div>
                  "During Canto VIII combat encounters, Ryōshū enters the 'Muga' state. Her sword swings without hesitation, carving through enemies with zero sanity decay. Do not attempt to stand in her strike line."
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-gray-800 bg-black/40">
          <button
            onClick={() => setSlashCount(c => c + 1)}
            className="px-3 py-1.5 rounded text-xs font-mono text-gray-300 bg-gray-900 border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            ⚔️ Draw sheath ({slashCount})
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-black bg-gray-200 text-black hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
