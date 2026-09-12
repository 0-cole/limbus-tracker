import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Swords, Sparkles, AlertTriangle, Flame, Eye, Skull, Crown, Star } from 'lucide-react';
import { useStore } from '../stores/useStore.js';

export default function SpecialDossierModal({ character, onClose }) {
  if (!character) return null;

  const [interactionCount, setInteractionCount] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (character?.id) {
      useStore.getState().markDossierDiscovered(character.id);
    }
  }, [character?.id]);

  const themeColors = character.themeColors || {
    border: 'border-[#c9a84c]',
    shadow: 'shadow-[0_0_50px_rgba(201,168,76,0.35)]',
    bg: 'from-[#14120c] via-[#0d0c08] to-black',
    accent: 'text-[#c9a84c]',
    badgeBg: 'bg-[#c9a84c]/20',
    badgeBorder: 'border-[#c9a84c]/50'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className={`relative bg-gradient-to-b ${themeColors.bg} border-2 ${themeColors.border} ${themeColors.shadow} rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-gray-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative z-10 p-5 border-b border-white/10 flex justify-between items-start bg-black/40">
          <div className="flex gap-4 items-center">
            <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${themeColors.border} bg-black/80 flex items-center justify-center shrink-0 shadow-lg`}>
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${themeColors.badgeBg} ${themeColors.accent} ${themeColors.badgeBorder}`}>
                  {character.categoryBadge || 'CLASSIFIED DOSSIER'}
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {character.code || 'NO-REF'}
                </span>
              </div>
              <h2 className={`text-2xl font-black ${themeColors.accent} tracking-wide mt-1 flex items-center gap-2 drop-shadow-md`}>
                {character.name}
              </h2>
              <p className="text-xs text-gray-300 font-medium">
                {character.subtitle}
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

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-120px)] custom-scrollbar">
          {/* Main Visual & Quote Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 flex justify-center">
              <div className={`relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden border-2 ${themeColors.border} shadow-2xl bg-gradient-to-b from-black/80 via-black/40 to-black`}>
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-gray-400 bg-black/70 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                  <span>{character.role || 'Combatant'}</span>
                  <span className={themeColors.accent}>{character.threat || 'Threat: Special'}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              {/* Quote */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 relative">
                <span className="absolute -top-3 left-4 text-xs font-mono font-bold px-2 py-0.5 rounded bg-black border border-white/20 text-gray-300">
                  RECORDED TRANSCRIPT
                </span>
                <p className="text-sm italic text-gray-200 font-serif leading-relaxed mt-1">
                  "{character.quote}"
                </p>
              </div>

              {/* Lore / Description */}
              <div className="text-xs text-gray-300 leading-relaxed space-y-2">
                <p>{character.description}</p>
              </div>

              {/* Traits / Keywords */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(character.keywords || []).map((kw, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-black/60 ${themeColors.accent} ${themeColors.badgeBorder}`}
                  >
                    ● {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Battle Abilities / Mechanism */}
          {character.abilities && character.abilities.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                  <Swords size={14} className={themeColors.accent} /> Classified Combat Disciplines
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  Synchronized Energy: {interactionCount}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {character.abilities.map((ability, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-white/20 transition-all space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-white flex items-center gap-1">
                          {ability.name}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                          {ability.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                        {ability.desc}
                      </p>
                    </div>
                    {ability.coins && (
                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono border-t border-white/5">
                        <span className="text-gray-500">Coins: {ability.coins}</span>
                        <span className={themeColors.accent}>{ability.effect}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kenneth's Archival Observation Note */}
          <div className="p-4 rounded-xl bg-black/70 border border-amber-900/40 text-xs font-mono space-y-1.5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-400 font-bold tracking-wider uppercase">
              <span>⚠ Records Keeper Kenneth's Filing Note:</span>
            </div>
            <p className="text-gray-300 leading-relaxed italic">
              {character.kennethNote || "I swear on my severance package I filed this away in deep quarantine. If Faust sees this record in the active terminal ledger, I will be cleaning Mephistopheles' engine exhaust for the next three centuries."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
