import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShieldAlert, Lock, AlertTriangle, BookOpen, Sparkles, Swords, Eye, Skull } from 'lucide-react';
import vergiliusImg from '../assets/vergilius.png';

const CANTO6_SKILLS = [
  {
    name: 'Heated Puncture',
    affinity: 'Wrath',
    type: 'Pierce',
    base: 22,
    coinPower: 18,
    coins: 3,
    coinType: 'normal',
    effects: [
      '[On Use] Inflict 3 Burn to all enemies',
      '[Coin 1 On Hit] Inflict 2 Bleed',
      '[Coin 2 On Hit] Inflict 2 Bleed',
      '[Coin 3 On Hit] Inflict 4 Bleed. Inflict 3 Burn',
    ],
    desc: 'Drives the heated blade forward with devastating precision. Targets with high Burn or Bleed suffer compounding damage on every coin toss.',
  },
  {
    name: 'Scorching Incision',
    affinity: 'Wrath',
    type: 'Slash',
    base: 24,
    coinPower: 16,
    coins: 3,
    coinType: 'normal',
    effects: [
      '[On Use] Gain 2 Offense Level Up next turn',
      '[Coin 1 On Hit] Inflict 3 Burn',
      '[Coin 2 On Hit] Inflict 3 Burn',
      '[Coin 3 On Hit] Inflict 5 Burn. Inflict 3 Bleed',
    ],
    desc: 'A sweeping slash wreathed in crimson heat. Aggressively stacks Burn on the target with each successive coin.',
  },
  {
    name: 'Following the Flow',
    affinity: 'Gloom',
    type: 'Slash',
    base: 20,
    coinPower: 15,
    coins: 3,
    coinType: 'normal',
    effects: [
      '[On Hit] Inflict 2 Fragile',
      '[Coin 2 On Hit] Inflict 3 Bleed',
      '[Coin 3 On Hit] Inflict 5 Bleed and +3 Bleed Count',
    ],
    desc: 'Vergilius matches the enemy rhythm effortlessly before carving through their momentum with cold, calculated cruelty.',
  },
  {
    name: 'I Shall Open the Path',
    affinity: 'Wrath',
    type: 'Pierce',
    base: 35,
    coinPower: 4,
    coins: 4,
    coinType: 'normal',
    effects: [
      '[On Use] Convert all Bleed and Burn on target into Fragile next turn (max 5)',
      '[Coin 1–3 On Hit] Deal +30% damage to targets with 10+ Burn or Bleed',
      '[Coin 4 On Hit] Inflict 10 Burn and 10 Bleed. Cannot be mitigated.',
    ],
    desc: 'The gladius clears the entire field. A decisive thrust that converts accumulated suffering into instant destruction.',
  },
  {
    name: 'Silence',
    affinity: 'Wrath',
    type: 'Counter',
    base: 26,
    coinPower: 4,
    coins: 1,
    coinType: 'unbreakable',
    effects: [
      '[On Use] Gain 5 Protection for this turn',
      '[Unbreakable Coin] Retaliates against attacker regardless of clash outcome',
      '[On Hit] Inflict 5 Bleed and 5 Burn',
    ],
    desc: 'Vergilius does not flinch. A single glance parries the strike and turns the aggressor into ash.',
  },
];

const CANTO9_SKILLS = [
  {
    name: 'Internal Bleeding',
    affinity: 'Wrath',
    type: 'Slash',
    base: 27,
    coinPower: 2,
    coins: 3,
    coinType: 'unbreakable',
    effects: [
      'Deal +1% damage per (Bleed on self + Bleed on target) (max 20%)',
      '[On Use] Gain 3 Bleed + 5 Bleed Count',
      '[Coin 1 On Hit] Inflict 1 Burn + 3 Bleed',
      '[Coin 2 On Hit] Inflict +1 Burn Count + 3 Bleed',
      '[Coin 3 On Hit] Inflict 1 Burn + 3 Bleed',
    ],
    desc: 'The cost of activating Effloresced E.G.O is paid in blood. Vergilius turns his own agony into an overwhelming force multiplier.',
  },
  {
    name: 'Blinding Bloodcleaver',
    affinity: 'Wrath',
    type: 'Slash',
    base: 35,
    coinPower: 6,
    coins: 3,
    coinType: 'unbreakable',
    effects: [
      'Deal +1% damage per (Bleed on self + Bleed on target) (max 20%)',
      '[On Use] Gain 3 Bleed + 5 Bleed Count',
      '[Coin 1 On Hit] Inflict 1 Burn + 3 Bleed + 1 Fragile',
      '[Coin 2 On Hit] Inflict 4 Bleed + 1 Fragile',
      '[Coin 3 On Hit] Inflict 4 Bleed and trigger Bleed Burst',
    ],
    desc: 'A blinding crimson arc that rends sinew and bone. Leaves nothing standing in its wake.',
  },
  {
    name: 'Drown in Blood',
    affinity: 'Wrath',
    type: 'Slash',
    base: 38,
    coinPower: 5,
    coins: 3,
    coinType: 'unbreakable',
    effects: [
      '[On Use] If target has 15+ Bleed, trigger Bloodfeast: deal 30% of target missing HP as fixed Wrath damage',
      '[Coin 1 On Hit] Inflict 3 Bleed and 2 Fragile',
      '[Coin 2 On Hit] Inflict 4 Bleed and 2 Fragile',
      '[Coin 3 On Hit] Inflict 5 Fragile and 10 Bleed',
    ],
    desc: 'The battlefield drowns in a lake of boiling crimson. The Red Gaze demands total submission.',
  },
  {
    name: 'Funeral for a Dead Bloodfiend',
    affinity: 'Wrath',
    type: 'Slash',
    base: 45,
    coinPower: 10,
    coins: 4,
    coinType: 'unbreakable',
    effects: [
      '[On Use] Consume all Shin (心) and Mang (望). Clashes cannot be lost.',
      '[Coin 1 On Hit] Deal +50% damage against Bloodfiends, Distortions, and Abnormalities',
      '[Coin 2 On Hit] Inflict 10 Bleed and 5 Fragile',
      '[Coin 3 On Hit] Sever target ties. Target cannot use E.G.O skills next turn',
      '[Coin 4 On Hit] Inflict 20 Bleed, 15 Burn, and 5 Vulnerable',
    ],
    desc: 'The ultimate awakening of Effloresced E.G.O::Lavacrum Sanguinis. A funeral rites strike executed in complete, chilling silence.',
  },
  {
    name: 'Shin (心) & Mang (望)',
    affinity: 'Wrath',
    type: 'Special',
    base: 30,
    coinPower: 8,
    coins: 2,
    coinType: 'unbreakable',
    effects: [
      '[On Use] At 0+ SP, generate 2 Mang (望) — Coin Power +2, +60% damage',
      '[Attack End] If Mang generated, consume 3 SP',
      '[Coin 1 On Hit] Inflict 5 Burn to target and adjacent units',
      '[Coin 2 On Hit] Gain 3 Protection and 2 Damage Up next turn',
    ],
    desc: 'Mang (望) is hope forged into a weapon. Each coin is a judgment Vergilius has already executed.',
  },
];

const PASSIVES = [
  {
    name: 'The Red Gaze',
    cost: 'Color Fixer Authority',
    affinity: 'Wrath',
    effects: [
      'Clash Power +5 in all clashes.',
      'Immune to Stagger and Panic. Sanity is locked at +45.',
      'Always acts first in the combat turn regardless of enemy Speed.',
    ],
  },
  {
    name: 'Bloody Tears',
    cost: 'Combat Passive',
    affinity: 'Wrath',
    effects: [
      'When striking targets with Bleed: heal Dante clock gauge and restore 15% HP to all Sinners.',
      'If any Sinner falls in combat, gain +50% damage for the remainder of the encounter.',
    ],
  },
  {
    name: 'White-hot Gladius',
    cost: 'Combat Passive',
    affinity: 'Wrath',
    effects: [
      'All attacks deal bonus Wrath damage proportional to target Burn count (up to +100%).',
      'Enemies defeated by Vergilius are reduced to ash; on-death effects cannot trigger.',
    ],
  },
  {
    name: 'Contractual Non-Intervention',
    cost: 'Corporate Mandate',
    affinity: 'Pride',
    effects: [
      '"I will step in only when all twelve of you are dead. Do not test my patience, Manager."',
      'Vergilius refuses to deploy for routine mirror dungeon farming.',
    ],
  },
];

const SIN_COLORS = {
  Wrath: '#dc2626',
  Lust: '#ea580c',
  Sloth: '#ca8a04',
  Gluttony: '#16a34a',
  Gloom: '#0ea5e9',
  Pride: '#4f46e5',
  Envy: '#9333ea',
};

function renderEffectLine(eff, i) {
  const triggerMatch = eff.match(/^\[(.*?)\]\s*(.*)$/);
  return (
    <div key={i} className="flex gap-3 text-xs text-gray-300 items-start">
      <div className="shrink-0 w-28 pt-0.5">
        {triggerMatch ? (
          <span className="text-[9px] font-black uppercase tracking-wider text-[#c9a84c] bg-[#c9a84c]/15 px-2 py-0.5 rounded border border-[#c9a84c]/40 text-center inline-block min-w-full">
            {triggerMatch[1]}
          </span>
        ) : (
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded border border-[#333] text-center inline-block min-w-full">
            EFFECT
          </span>
        )}
      </div>
      <div className="flex-1 leading-relaxed text-gray-200">
        {triggerMatch ? triggerMatch[2] : eff}
      </div>
    </div>
  );
}

function SkillBlock({ skill, index }) {
  const sinColor = SIN_COLORS[skill.affinity] || '#fff';
  const isUnbreakable = skill.coinType === 'unbreakable';
  const maxPower = skill.base + (skill.coinPower * skill.coins);

  return (
    <div className="mb-4 rounded-lg overflow-hidden border border-red-950/80 bg-[#0c0505]">
      {/* Skill Top Bar */}
      <div className="flex justify-between items-center p-3 border-b border-red-950/80 bg-black/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: sinColor }} />
            <span className="text-sm font-bold" style={{ color: sinColor }}>{skill.affinity}</span>
          </div>
          <span className="text-[#444]">|</span>
          <span className="text-sm font-bold text-gray-300">{skill.type}</span>
          {isUnbreakable && (
            <span className="text-[9px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-700/60 font-black uppercase tracking-wider">
              Unbreakable
            </span>
          )}
        </div>
        <span className="text-[9px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded border border-red-800/40 font-mono">
          [RESTRICTED DOSSIER]
        </span>
      </div>

      {/* Skill Name & Power Equation */}
      <div className="p-4 border-b border-red-950/80 bg-gradient-to-r from-[#180808] to-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 py-0.5 rounded bg-black/60 border border-red-900/50">
                Skill {index + 1}
              </span>
              <h4 className="text-lg font-black text-white tracking-wide">{skill.name}</h4>
            </div>
            <p className="text-xs text-red-300/70 italic leading-relaxed font-serif max-w-md">{skill.desc}</p>
          </div>

          {/* Base / Coin / Max Equation Box (Identical to IdDetailsModal) */}
          <div className="flex items-center gap-3 bg-black/90 px-3 py-2 rounded-lg border border-red-900/60 shadow-inner shrink-0 self-start sm:self-auto">
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Base</span>
              <span className="text-lg font-bold text-white">{skill.base}</span>
            </div>
            <span className="text-lg font-black text-[#c9a84c]">+</span>
            <div className="flex flex-col min-w-[70px]">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Coin</span>
              <div className="flex items-center gap-1 justify-center">
                <div className="flex gap-0.5">
                  {Array.from({ length: skill.coins || 1 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full border border-[#c9a84c] bg-[#c9a84c]/20 shadow-[0_0_5px_rgba(201,168,76,0.3)]" />
                  ))}
                </div>
                <span className="text-base font-bold text-white ml-1.5">x +{skill.coinPower}</span>
              </div>
            </div>
            <span className="text-lg font-black text-gray-600">=</span>
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Max</span>
              <span className="text-lg font-black text-yellow-500">{maxPower}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Effects */}
      <div className="p-4 flex flex-col gap-2 bg-[#080202]">
        {skill.effects.map((eff, i) => renderEffectLine(eff, i))}
      </div>
    </div>
  );
}

export default function VergiliusModal({ onClose }) {
  const [apologyCount, setApologyCount] = useState(0);
  const [activeTab, setActiveTab] = useState('canto6');
  const [imgSrc, setImgSrc] = useState(vergiliusImg);

  const handleApologize = () => {
    setApologyCount(prev => prev + 1);
  };

  const getApologyResponse = () => {
    if (apologyCount === 0) return null;
    if (apologyCount === 1) {
      return '<Tick-tock...> Dante frantically waves their hands and winds their clock head in apology. Vergilius stares coldly in complete silence, exhales cigarette smoke, and looks away.';
    }
    if (apologyCount === 2) {
      return "Vergilius narrows his crimson eyes: 'Did you think repeating yourself would change my answer, Manager? Get back to the bus.'";
    }
    return "Vergilius places his hand on the hilt of his Gladius. Dante's clock hands are trembling at maximum speed. Charon giggles in the distance: 'Dante is scared. Charon wants candy.'";
  };

  const tabs = [
    { id: 'canto6', label: 'Canto VI', sublabel: 'Assist Unit', icon: <Flame size={14} /> },
    { id: 'canto9', label: 'Canto IX', sublabel: 'Effloresced E.G.O', icon: <Skull size={14} /> },
    { id: 'passives', label: 'Passives & Lore', sublabel: 'Red Gaze Authority', icon: <Eye size={14} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="max-w-6xl w-full h-[90vh] relative bg-[#090303] border-2 border-red-600/80 shadow-[0_0_60px_rgba(239,68,68,0.35)] overflow-hidden flex flex-col md:flex-row rounded-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-950 via-red-500 to-red-950 z-30" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-400 hover:text-white transition-colors bg-red-950/70 p-2 rounded-full border border-red-800/50 z-30 shadow-md"
        >
          <X size={18} />
        </button>

        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-[340px] shrink-0 border-b md:border-b-0 md:border-r border-red-950/80 flex flex-col bg-black/70 relative z-10 overflow-y-auto">
          <div className="relative w-full aspect-[4/5] bg-black border-b border-red-950/80 overflow-hidden">
            <img
              src={imgSrc}
              alt="The Red Gaze Vergilius"
              className="w-full h-full object-cover object-top filter contrast-105"
              onError={() => setImgSrc(vergiliusImg)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3">
              <span className="text-[10px] bg-red-900/90 text-red-200 font-black px-2.5 py-1 rounded border border-red-500/60 uppercase tracking-widest shadow-md">
                Color Fixer
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-1.5 mb-1 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-base">★</span>
                ))}
              </div>
              <h2 className="text-2xl font-black text-white leading-tight drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]">
                The Red Gaze Vergilius
              </h2>
              <p className="text-red-400 text-xs font-bold mt-0.5 uppercase tracking-wider">
                Senior Guide • Mephistopheles
              </p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="bg-[#110505] border border-red-900/40 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="text-[10px] text-red-400 uppercase tracking-widest font-black border-b border-red-950 pb-1.5">
                Combat Parameters
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-medium">HP</span>
                <span className="text-green-400 font-bold font-mono text-sm">9,999</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-medium">Speed</span>
                <span className="text-yellow-400 font-bold font-mono text-sm">7–10</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-medium">Defense Level</span>
                <span className="text-white font-bold font-mono text-sm">120</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-medium">Stagger Threshold</span>
                <span className="text-red-400 font-bold uppercase tracking-wider text-[11px]">IMMUNE</span>
              </div>
            </div>

            <div className="bg-black/80 border border-red-950/60 rounded-lg p-3 text-xs italic text-gray-300 font-serif leading-relaxed">
              "Why are you looking here, Dante..? I am not one of your lackeys. Do you need.. a <strong className="text-red-400 font-bold underline decoration-red-600">consultation?</strong>"
            </div>

            <div className="space-y-2">
              <button
                onClick={handleApologize}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2"
              >
                <span>⏰</span>
                <span>Wind Clock & Apologize ({apologyCount})</span>
              </button>

              {getApologyResponse() && (
                <div className="p-2.5 rounded bg-black/90 border border-red-900/60 text-[11px] font-mono text-gray-300 leading-relaxed animate-fadeIn">
                  {getApologyResponse()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT MAIN PANEL */}
        <div className="flex-1 flex flex-col relative z-10 bg-[#090303]/90 overflow-hidden">
          <div className="p-4 md:px-6 md:pt-6 border-b border-red-950/80 bg-black/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80 block">
                Classified Sinner Dossier
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                Vergilius Combat Archives
              </h3>
            </div>

            <div className="flex bg-black/80 p-1 rounded-lg border border-red-950">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-red-900 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'canto6' && (
                <motion.div
                  key="canto6"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                        Canto VI: The Heartbreaking — Assist Unit Skills
                      </h4>
                    </div>
                    <span className="text-[10px] bg-red-950/60 border border-red-800/40 text-red-300 px-2 py-0.5 rounded font-mono">
                      WIKI VERIFIED
                    </span>
                  </div>

                  {CANTO6_SKILLS.map((skill, idx) => (
                    <SkillBlock key={skill.name} skill={skill} index={idx} />
                  ))}
                </motion.div>
              )}

              {activeTab === 'canto9' && (
                <motion.div
                  key="canto9"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                        Canto IX 9-42: Effloresced E.G.O::Lavacrum Sanguinis
                      </h4>
                    </div>
                    <span className="text-[10px] bg-red-950/60 border border-red-800/40 text-red-300 px-2 py-0.5 rounded font-mono">
                      AWAKENING DATA
                    </span>
                  </div>

                  {CANTO9_SKILLS.map((skill, idx) => (
                    <SkillBlock key={skill.name} skill={skill} index={idx} />
                  ))}
                </motion.div>
              )}

              {activeTab === 'passives' && (
                <motion.div
                  key="passives"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                        Color Fixer Passives & Dante Accord
                      </h4>
                    </div>
                  </div>

                  {PASSIVES.map(p => (
                    <div key={p.name} className="p-4 rounded-lg border border-red-950 bg-[#0c0505] space-y-2">
                      <div className="flex justify-between items-center border-b border-red-950/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SIN_COLORS[p.affinity] || '#ef4444' }} />
                          <h5 className="font-bold text-white text-sm">{p.name}</h5>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-red-900/40 text-red-300">
                          {p.cost}
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {p.effects.map((eff, i) => (
                          <div key={i} className="flex gap-2 text-xs text-gray-300 leading-relaxed">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{eff}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
