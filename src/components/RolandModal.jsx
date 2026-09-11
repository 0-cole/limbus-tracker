import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Utensils, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

const ROLAND_WEAPONS = [
  {
    name: 'Durandal',
    type: 'Slash',
    affinity: 'Gloom',
    base: 14,
    coinPower: 4,
    coins: 3,
    desc: 'Roland\'s trusted signature longsword. Pristine, balanced, and wielded with effortless discipline.',
    effects: [
      '[Clash Win] Gain 2 Poise and +2 Poise Count',
      '[On Hit] Inflict 3 Sinking',
      '[Counter] Activate "Durandal Counter" on incoming attacks',
    ],
  },
  {
    name: 'Atelier Logic',
    type: 'Pierce',
    affinity: 'Pride',
    base: 11,
    coinPower: 3,
    coins: 4,
    desc: 'Dual suppressed workshop pistols firing armor-piercing rounds from point-blank range.',
    effects: [
      '[On Hit] Inflict 2 Fragile next turn (coin 2 & 4)',
      '[On Hit] Inflict 3 Smoke on target',
      'If target has 5+ Smoke, deal +30% damage',
    ],
  },
  {
    name: 'Wheels Industry',
    type: 'Blunt',
    affinity: 'Wrath',
    base: 18,
    coinPower: 6,
    coins: 1,
    desc: 'A colossal industrial slab blade that pulverizes concrete, bone, and defense dice alike.',
    effects: [
      '[Unbreakable Coin] Coin cannot be broken upon Clash Lose',
      '[On Hit] Trigger Tremor Burst and reduce target Defense Level by 5',
      '[On Hit] If target is Staggered, deal +50% bonus damage',
    ],
  },
  {
    name: 'Crystal Atelier & Allaria',
    type: 'Slash / Pierce',
    affinity: 'Envy',
    base: 12,
    coinPower: 4,
    coins: 3,
    desc: 'Rapid twin daggers and sewing needle rapiers weaving surgical lacerations.',
    effects: [
      '[On Hit] Inflict 4 Bleed and +2 Bleed Count',
      '[On Hit] Inflict 2 Bind next turn',
    ],
  },
  {
    name: 'Furioso (Climax Finisher)',
    type: 'Mass Attack (Slash/Pierce/Blunt)',
    affinity: 'Gloom',
    base: 24,
    coinPower: 8,
    coins: 4,
    desc: 'The Black Silence unleashes the full sequence of all 9 Atelier workshop weapons in blinding synergy.',
    effects: [
      '[On Use] Target 3 Slots simultaneously',
      '[On Hit] Inflict 10 Sinking, 10 Bleed, and trigger Tremor Burst',
      '[On Kill] Recover 30 SP and apply 3 Damage Up to all allies next turn',
    ],
  },
];

const SANDWICHES = [
  {
    name: 'Pork Cutlet Toast with Cabbage',
    review: '"Crispy katsu, sweet brown sauce, and thinly shredded cabbage. Kept me alive through countless night shifts. 9/10."',
  },
  {
    name: 'The Egg & Bacon Melt with Secret Mayo',
    review: '"Warm brioche, runny egg, smoky bacon... Angelica used to order this whenever we walked past District 9. Easily a 10/10."',
  },
  {
    name: 'Spicy Buldak Fried Chicken Sandwich',
    review: '"Now this has got some real kick. Even Charon would turn red after one bite. Have a glass of milk ready, Dante. 8.5/10."',
  },
  {
    name: 'Classic Smoked Ham & Gouda Panini',
    review: '"Simple, toasted just right on the grill. That\'s that, and this is this. Good comfort food. 9.5/10."',
  },
  {
    name: 'Sweet Strawberry Jam & Potato Salad Sandwich',
    review: '"Don\'t knock it till you try it. Sounds weird, tastes fantastic. You should get one for Faust and Don. 9/10."',
  },
];

export default function RolandModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('weapons');
  const [sandwichIndex, setSandwichIndex] = useState(0);
  const [orderedCount, setOrderedCount] = useState(0);

  const orderNextSandwich = () => {
    setSandwichIndex((prev) => (prev + 1) % SANDWICHES.length);
    setOrderedCount((c) => c + 1);
  };

  const currentSandwich = SANDWICHES[sandwichIndex];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#09090b] border-2 border-slate-500/70 shadow-[0_0_60px_rgba(148,163,184,0.3)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-900 via-slate-300 to-slate-900" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors bg-slate-900/80 p-1.5 rounded-full border border-slate-700/50 z-20"
        >
          <X size={16} />
        </button>

        {/* ── HEADER ── */}
        <div className="flex gap-4 items-start p-5 border-b border-slate-800 bg-black/60">
          {/* Avatar / Portrait */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-400 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex-shrink-0 bg-black">
            <img
              src="https://libraryofruina.wiki.gg/images/RolandFullBody.png"
              alt="Roland"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-1 left-0 right-0 text-center">
              <span className="text-[8px] bg-slate-900/90 text-slate-200 font-black px-1.5 py-0.5 rounded border border-slate-500/50 uppercase tracking-wider">
                COLOR FIXER
              </span>
            </div>
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5">
              <ShieldAlert size={12} className="text-slate-300" /> Patron Librarian • General Works
            </div>
            <h2 className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] leading-tight mb-0.5">
              The Black Silence — Roland
            </h2>
            <p className="text-xs text-slate-400 mb-2">Grade 1 Fixer / Former Charles' Office Fixer</p>
            <div className="text-xs italic text-slate-300 font-serif bg-slate-950/60 border border-slate-800 rounded p-2 leading-relaxed relative">
              <span className="text-slate-400 text-base absolute -top-2 left-2">"</span>
              That's that, and this is this. ...Say Dante, you got any HamHamPangPang sandwiches in that bus fridge?{' '}
              <strong className="text-slate-200 underline decoration-slate-400/60">I'm starving.</strong>
              <span className="text-slate-400 text-base absolute -bottom-3 right-2">"</span>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-slate-800 bg-black/40 text-center text-xs">
          {[
            { label: 'HP', value: '4,850', color: 'text-slate-200' },
            { label: 'Speed', value: '3–8', color: 'text-white' },
            { label: 'Armament', value: '9 Workshops', color: 'text-slate-300' },
            { label: 'Specialty', value: 'HamHamPangPang', color: 'text-amber-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/60 border border-slate-800 rounded py-1.5">
              <span className="text-[9px] text-slate-500 block font-bold uppercase">{stat.label}</span>
              <span className={`font-mono font-black text-xs md:text-sm ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ── TAB NAV ── */}
        <div className="flex border-b border-slate-800 bg-black/40 px-5">
          {[
            { id: 'weapons', label: 'Workshop Armory', icon: <Swords size={12} /> },
            { id: 'sandwich', label: 'HamHamPangPang Bistro', icon: <Utensils size={12} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all mr-1 ${
                activeTab === tab.id
                  ? 'border-slate-300 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === 'weapons' ? (
              <motion.div key="weapons" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-[0_0_8px_#ffffff]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Atelier Workshop Arsenal</h3>
                  <span className="text-[9px] text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded font-mono ml-auto">
                    LIBRARY OF RUINA ARCHIVE
                  </span>
                </div>

                {ROLAND_WEAPONS.map((wep, idx) => (
                  <div key={wep.name} className="mb-4 rounded-lg overflow-hidden border border-slate-800 bg-[#0c0c10]">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b border-slate-900 bg-black/60">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200">{wep.affinity}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-xs font-bold text-slate-400">{wep.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-white font-bold text-sm">{wep.base}</span>
                        <span className="text-slate-500 text-xs"> base </span>
                        <span className="font-mono text-slate-300 font-bold text-sm">+{wep.coinPower}</span>
                        <span className="text-slate-500 text-xs"> × {wep.coins}🪙</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center bg-[#15151c] rounded border border-slate-800 py-0.5">
                          {idx === 4 ? 'Climax' : `Weapon ${idx + 1}`}
                        </span>
                        <span className="text-sm font-bold text-white">{wep.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 italic leading-relaxed mb-2 font-serif">{wep.desc}</p>
                    </div>

                    {/* Effects */}
                    <div className="px-4 pb-3 space-y-1">
                      {wep.effects.map((eff, i) => (
                        <div key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                          <span className="text-slate-400 flex-shrink-0">•</span>
                          <span>{eff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="sandwich" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="bg-[#121218] border border-amber-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils size={18} className="text-amber-400" />
                    <h4 className="font-bold text-amber-300 text-sm">HamHamPangPang Catering Menu</h4>
                    <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded font-mono ml-auto">
                      Sandwiches Sampled: {orderedCount}
                    </span>
                  </div>

                  <div className="bg-black/60 border border-amber-900/40 rounded-lg p-4 mb-4">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Current Order:</div>
                    <div className="text-base font-black text-white mb-2">{currentSandwich.name}</div>
                    <div className="text-xs italic text-slate-300 font-serif leading-relaxed pl-3 border-l-2 border-amber-500">
                      {currentSandwich.review}
                    </div>
                  </div>

                  <button
                    onClick={orderNextSandwich}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  >
                    <Utensils size={14} /> Order Another Sandwich for Roland & Dante
                  </button>
                </div>

                <div className="bg-black/60 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 leading-relaxed">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Patron Note — Floor of General Works</div>
                  "If you ever find yourself near District 9 after a long Distortion suppression, drop by HamHamPangPang. Tell them Roland sent you. They might even throw in extra pickles."
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-slate-800 bg-black/50">
          <span className="text-xs font-mono text-slate-500">
            "That's that, and this is this."
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-black bg-slate-200 text-black hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
