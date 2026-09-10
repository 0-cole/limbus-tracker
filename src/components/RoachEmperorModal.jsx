import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bug, Skull, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

const ROACH_SKILLS = [
  {
    name: "The Emperor's Fist",
    affinity: 'Lust',
    type: 'Blunt',
    base: 12,
    coinPower: 11,
    coins: 2,
    coinType: 'normal',
    coinColor: '#ea580c',
    effects: [
      'Deal +20% damage for every type of negative effect on target (max 100%)',
      'Deal +10% damage for every 2 Hurting Pests [Roaches] on target',
      '[On Hit] Inflict 2 Potency and +2 Count of a random status (Burn, Bleed, Tremor, Rupture, or Sinking) (each coin)',
    ],
    desc: 'The chitinous arm drives forward with grotesque sovereignty. Swarms of roaches follow every tremor.',
  },
  {
    name: "The Emperor's Whip & Fist",
    affinity: 'Lust',
    type: 'Blunt',
    base: 12,
    coinPower: 8,
    coins: 3,
    coinType: 'unbreakable',
    coinColor: '#ea580c',
    effects: [
      '[Unbreakable Coin] Coin does not break upon Clash Lose; attacks after getting hit',
      '[Clash Lose] Deal -80% damage and cannot Stagger target',
      '[On Hit] Inflict 3 Potency and +3 Count of a random status (Burn, Bleed, Tremor, Rupture, or Sinking) (coins 1 & 2)',
      '[On Hit without Cracking] Gain 5 Poise and +3 Poise Count (coin 3)',
    ],
    desc: 'Lashing antennae and brutal crushing blows. Even when repelled, the persistent vermin refuse to yield.',
  },
  {
    name: "The Emperor's Devouring",
    affinity: 'Gluttony',
    type: 'Blunt',
    base: 13,
    coinPower: 13,
    coins: 1,
    coinType: 'green_excision',
    coinColor: '#22c55e',
    effects: [
      '[Green Excision Coin] Special Gluttony Execution Coin',
      '[On Use] Base Power +10 for every Unbreakable Coin destroyed this encounter',
      'Deal +35% damage if target has 10+ Hurting Pests [Roaches]',
      '[On Hit] Inflict 15 Hurting Pests [Roaches] and trigger Tremor Burst',
      '[On Kill] Heal 20% Max HP and summon Swarm Minions',
    ],
    desc: 'The roach mandibles unhinge completely. A horrifying feast that consumes flesh, sin, and sanity alike.',
  },
];

const UNIQUE_STATUS = {
  name: 'Hurting Pests [Roaches]',
  maxStack: 50,
  details: [
    'Lose 1% Max HP per Stack.',
    'Combat Start: Take (Stack × 12) fixed Gluttony damage.',
    'Whenever this unit loses Stacks of this effect, gain E.G.O resources of random Affinities equal to Stacks lost (max 15).',
    '"This creature is unmatched among those scorned as pests."',
  ],
};

export default function RoachEmperorModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'status'
  const [crawlClicks, setCrawlClicks] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#061206] border-2 border-green-600/80 shadow-[0_0_60px_rgba(34,197,94,0.35)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-950 via-green-500 to-green-950" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-green-400 hover:text-white transition-colors bg-green-950/70 p-1.5 rounded-full border border-green-800/50 z-20"
        >
          <X size={16} />
        </button>

        {/* ── HEADER ── */}
        <div className="flex gap-4 items-start p-5 border-b border-green-900/40 bg-black/40">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] flex-shrink-0 bg-black flex items-center justify-center text-5xl">
            🪲
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-1 left-0 right-0 text-center">
              <span className="text-[8px] bg-green-900/90 text-green-200 font-black px-1 py-0.5 rounded border border-green-500/50 uppercase tracking-wider">
                CANTO IX BOSS
              </span>
            </div>
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-green-400 tracking-widest uppercase mb-0.5">
              <ShieldAlert size={12} /> Lord of all Roaches • Emperor of Pests
            </div>
            <h2 className="text-xl font-black text-green-300 drop-shadow-[0_0_10px_rgba(34,197,94,0.7)] leading-tight mb-0.5">
              The Roach Emperor
            </h2>
            <p className="text-xs text-green-200/80 mb-2">Subject: Gregor — Former Molar Office Head</p>
            <div className="text-xs italic text-gray-300 font-serif bg-green-950/30 border border-green-800/30 rounded p-2 leading-relaxed relative">
              <span className="text-green-500 text-base absolute -top-2 left-2">"</span>
              Why are they bowing to me..? Stop clicking your legs together... Stop offering me that moldy fruit...{' '}
              <strong className="text-green-400 underline decoration-green-500/60">I am not your Emperor!</strong>
              <span className="text-green-500 text-base absolute -bottom-3 right-2">"</span>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-green-900/30 bg-black/30 text-center text-xs">
          {[
            { label: 'HP', value: '3,041', color: 'text-green-400' },
            { label: 'Speed', value: '1–2', color: 'text-white' },
            { label: 'Defense', value: '100', color: 'text-white' },
            { label: 'Panic', value: '"K-kill me..."', color: 'text-yellow-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-black/50 border border-green-900/30 rounded py-1.5">
              <span className="text-[9px] text-gray-500 block font-bold uppercase">{stat.label}</span>
              <span className={`font-mono font-black text-sm ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ── TAB NAV ── */}
        <div className="flex border-b border-green-900/40 bg-black/30 px-5">
          {[
            { id: 'skills', label: 'Emperor Skills', icon: <Bug size={12} /> },
            { id: 'status', label: 'Unique Status Effect', icon: <Skull size={12} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all mr-1 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-400'
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
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-green-400">Combat Skills & Green Coins</h3>
                  <span className="text-[9px] text-green-300 bg-green-950/60 border border-green-700/40 px-2 py-0.5 rounded font-mono ml-auto">
                    CANTO IX DATA
                  </span>
                </div>

                {ROACH_SKILLS.map((skill, idx) => (
                  <div key={skill.name} className="mb-4 rounded-lg overflow-hidden border border-green-900/60 bg-[#040c04]">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b border-green-950 bg-black/50">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.coinColor }} />
                        <span className="text-sm font-bold" style={{ color: skill.coinColor }}>{skill.affinity}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-xs font-bold text-gray-300">{skill.type}</span>
                        {skill.coinType === 'green_excision' && (
                          <span className="text-[9px] bg-green-950 text-green-300 px-1.5 py-0.5 rounded border border-green-500/60 font-black uppercase tracking-wider animate-pulse">
                            🟢 Green Coin (Excision)
                          </span>
                        )}
                        {skill.coinType === 'unbreakable' && (
                          <span className="text-[9px] bg-orange-950 text-orange-300 px-1.5 py-0.5 rounded border border-orange-700/50 font-black uppercase tracking-wider">
                            Unbreakable
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-white font-bold text-sm">{skill.base}</span>
                        <span className="text-gray-500 text-xs"> base </span>
                        <span className="font-mono text-green-400 font-bold text-sm">+{skill.coinPower}</span>
                        <span className="text-gray-500 text-xs"> × {skill.coins}🪙</span>
                      </div>
                    </div>

                    {/* Skill Info */}
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-16 text-center bg-[#0a180a] rounded border border-green-900/50 py-0.5">
                          Skill {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-green-200">{skill.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 italic leading-relaxed mb-2">{skill.desc}</p>
                    </div>

                    {/* Effects */}
                    <div className="px-4 pb-3 space-y-1">
                      {skill.effects.map((eff, i) => (
                        <div key={i} className="flex gap-2 text-xs text-gray-300 leading-relaxed">
                          <span className="text-green-500 flex-shrink-0">•</span>
                          <span>{eff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="status" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="bg-[#051105] border border-green-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-green-400" size={18} />
                    <h4 className="font-bold text-green-300 text-sm">{UNIQUE_STATUS.name}</h4>
                    <span className="text-[10px] bg-green-950 text-green-400 px-2 py-0.5 rounded border border-green-800/40 ml-auto font-mono">
                      Max Stack: {UNIQUE_STATUS.maxStack}
                    </span>
                  </div>
                  <div className="space-y-2 mt-3">
                    {UNIQUE_STATUS.details.map((line, i) => (
                      <p key={i} className="text-xs text-gray-300 leading-relaxed pl-3 border-l border-green-800/50">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Gregor monologue */}
                <div className="bg-black/60 border border-green-950 rounded-xl p-4 text-xs font-mono text-green-400/80 leading-relaxed">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Field Recording — Mephistopheles Passenger Log</div>
                  "My arm... it's pulsing again. Every time we step into the backstreets, I hear thousands of tiny carapaces scraping together. They call me 'Emperor'. But an emperor doesn't beg to be stepped on."
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-green-900/40 bg-black/30">
          <button
            onClick={() => setCrawlClicks(c => c + 1)}
            className="px-3 py-1.5 rounded text-xs font-mono text-green-400 bg-green-950/40 border border-green-800/50 hover:bg-green-900/40 transition-colors"
          >
            🪲 Brush off roaches ({crawlClicks})
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-black bg-green-600 text-black hover:bg-green-500 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
