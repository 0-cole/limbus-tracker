import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShieldAlert, Swords, Star, Sparkles, AlertTriangle } from 'lucide-react';

const GEBURA_SKILLS = [
  {
    name: 'Upstanding Slash',
    affinity: 'Wrath',
    type: 'Slash',
    base: 18,
    coinPower: 12,
    coins: 3,
    effects: [
      '[On Use] Gain +3 Poise and +2 Slash Power Up next turn',
      '[Coin 1 On Hit] Inflict 4 Bleed',
      '[Coin 2 On Hit] Inflict 4 Bleed and +2 Bleed Count',
      '[Coin 3 On Hit] If target has 10+ Bleed, deal +50% bonus damage',
    ],
    desc: 'An unyielding upward cleave from the Mimicry Greatsword that cleaves through any defensive stance.'
  },
  {
    name: 'Spear',
    affinity: 'Pride',
    type: 'Pierce',
    base: 20,
    coinPower: 14,
    coins: 2,
    effects: [
      '[Clash Win] Gain +5 Offense Level Up this turn',
      '[Coin 1 On Hit] Inflict 3 Fragile next turn',
      '[Coin 2 On Hit] Deal bonus damage proportional to target missing HP',
    ],
    desc: 'A thrust of pure kinetic force that shatters the opponent\'s posture before they can react.'
  },
  {
    name: 'Greater Split: Horizontal',
    affinity: 'Wrath',
    type: 'Slash (Mass Attack)',
    base: 42,
    coinPower: 18,
    coins: 1,
    effects: [
      '[Indiscriminate Mass Attack] Targets all 7 enemy slots',
      '[On Use] Destroy all enemy defensive skills and counter dice',
      '[On Hit] Inflict 15 Bleed and 5 Bleed Count to all targets. Targets below 25% HP are instantly bisected.',
    ],
    desc: 'The legendary signature technique of the Red Mist. A single sweeping horizon cut that severs the fabric of the battlefield in two.'
  },
  {
    name: 'Greater Split: Vertical',
    affinity: 'Wrath',
    type: 'Slash',
    base: 45,
    coinPower: 20,
    coins: 1,
    effects: [
      '[On Use] Gain Unstoppable. Cannot be staggered or cancelled',
      '[On Hit] Deal 200% Stagger Damage. If target is staggered, immediately inflict Fatal damage.',
    ],
    desc: 'A thunderous downward plunge capable of cleaving reinforced Claw armor and Claw serum injectors with effortless brutality.'
  }
];

export default function GeburaModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('skills');
  const [manifested, setManifested] = useState(false);
  const [slashTriggered, setSlashTriggered] = useState(false);

  const handleGreaterSplit = () => {
    setSlashTriggered(true);
    setTimeout(() => setSlashTriggered(false), 800);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#0e0405] border-2 border-red-600 shadow-[0_0_60px_rgba(239,68,68,0.4)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Greater Split Screen Slash Effect */}
        <AnimatePresence>
          {slashTriggered && (
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 1, opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
            >
              <div className="w-full h-2 bg-white shadow-[0_0_50px_#ef4444,0_0_100px_#dc2626] rotate-[-12deg]" />
              <div className="absolute inset-0 bg-red-600/30 backdrop-invert" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-950 via-red-500 to-red-950" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-400 hover:text-white transition-colors bg-red-950/80 p-1.5 rounded-full border border-red-800/50 z-20 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* ── HEADER ── */}
        <div className="flex gap-4 items-start p-5 border-b border-red-900/40 bg-black/60">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex-shrink-0 bg-black">
            <img
              src="https://libraryofruina.wiki.gg/images/GeburaFullBody.png"
              alt="Gebura"
              className="w-full h-full object-cover object-top"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-1 left-0 right-0 text-center">
              <span className="text-[8px] bg-red-950/90 text-red-200 font-black px-1.5 py-0.5 rounded border border-red-600/50 uppercase tracking-wider">
                STRONGEST COLOR
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 tracking-widest uppercase mb-0.5">
              <Swords size={12} className="text-red-400" /> Legend of the City • The Red Mist
            </div>
            <h2 className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] leading-tight mb-0.5">
              Kali — Gebura
            </h2>
            <p className="text-xs text-red-400/80 mb-2">Patron of the Floor of Language / The First E.G.O Manifestor</p>
            <div className="text-xs italic text-red-200/90 font-serif bg-red-950/40 border border-red-800/40 rounded p-2 leading-relaxed">
              "Hmph. What are you staring at, clockhead? If you want to protect your Sinners, you better start swinging with conviction."
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-red-900/30 bg-black/40 text-center text-xs">
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Grade</span>
            <span className="font-black text-red-400">Color Fixer</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Weapon</span>
            <span className="font-bold text-gray-200">Mimicry Greatsword</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">E.G.O Armor</span>
            <span className="font-bold text-amber-300">{manifested ? 'Manifested E.G.O' : 'Physical Shell'}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase">Threat Level</span>
            <span className="font-black text-red-500 animate-pulse">Supreme</span>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-b border-red-900/30 px-5 pt-2 gap-4 text-xs font-bold bg-black/20">
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'skills' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Special Techniques ({GEBURA_SKILLS.length})
          </button>
          <button
            onClick={() => setActiveTab('lore')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'lore' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Archives & Records Memo
          </button>
        </div>

        {/* ── CONTENT BODY ── */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'skills' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-950/30 border border-red-800/40">
                <div>
                  <span className="font-bold text-white block text-sm">Greater Split Trigger Test</span>
                  <span className="text-gray-400 text-[11px]">Unleash Kali's horizontal severing technique on the terminal screen</span>
                </div>
                <button
                  onClick={handleGreaterSplit}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-colors cursor-pointer"
                >
                  ⚡ Execute Greater Split
                </button>
              </div>

              {GEBURA_SKILLS.map((skill, i) => (
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
                      <p key={j} className="text-[10px] font-mono text-gray-400">
                        {eff}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-black/60 border border-red-900/40 space-y-2">
                <span className="text-[11px] font-black uppercase text-red-400 block">The Red Mist Profile</span>
                <p className="text-gray-300 leading-relaxed">
                  Kali was the legendary Color Fixer hailed as the strongest combatant in the entire history of the City. Wielding the prototype E.G.O weapon Mimicry extracted from Nothing There, she annihilated an entire invasion force of Five Arbiters and Claws at the Old Lobotomy Facility.
                </p>
                <p className="text-gray-400 italic">
                  "I learned how to swing a blade to survive the backstreets. No fancy philosophy, no hollow excuses. If someone threatens the people I care about, they get split in half."
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  📋 Records Keeper Kenneth — Emergency File Note
                </span>
                <p className="text-gray-300 italic font-mono leading-relaxed">
                  "HOW DID THE RED MIST END UP IN OUR PERSONNEL REGISTRY?! Dante, she is not a Sinner on our payroll! Vergilius almost put his fist through my cubicle wall when he saw this record pop up. If she decides to swing that giant red cleaver inside Mephistopheles, the bus will be cut cleanly in half!"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="p-4 bg-black/60 border-t border-red-900/30 flex justify-between items-center">
          <button
            onClick={() => setManifested(!manifested)}
            className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
          >
            {manifested ? '✓ E.G.O Manifested: Active' : 'Toggle E.G.O Armor Manifestation'}
          </button>
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
