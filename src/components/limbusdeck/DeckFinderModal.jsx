import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Sparkles, Sliders, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { findOptimalDecks, KEYWORDS, SINNER_META, LD_KEYWORD_COLORS } from '../../utils/limbusDeckEngine.js';
import { getCardImageUrl, getSinnerInfo } from '../../utils/textUtils.js';

export default function DeckFinderModal({ isOpen, onClose, onApplySquad, identitiesData, acquiredIds }) {
  if (!isOpen) return null;

  const [targetKeyword, setTargetKeyword] = useState('burn');
  const [partySize, setPartySize] = useState(7);
  const [userPoolOnly, setUserPoolOnly] = useState(false);
  const [fixedSinner, setFixedSinner] = useState('');
  const [excludedSinner, setExcludedSinner] = useState('');

  const result = useMemo(() => {
    return findOptimalDecks({
      identities: identitiesData || [],
      targetKeyword,
      ownedIds: userPoolOnly ? acquiredIds : null,
      fixedSinners: fixedSinner ? [fixedSinner] : [],
      excludedSinners: excludedSinner ? [excludedSinner] : [],
      partySize
    });
  }, [identitiesData, targetKeyword, userPoolOnly, fixedSinner, excludedSinner, partySize, acquiredIds]);

  const { members = [], analysis, passives, metaMatch } = result || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-5xl bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-[#15120c] to-[#0a0a0c] border-b border-white/10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40 flex items-center gap-1">
                <Sliders size={12} /> Auto-Formation Engine
              </span>
              <span className="text-xs text-gray-400 font-mono">
                LimbusDeck Deck Finder
              </span>
            </div>
            <h2 className="text-2xl font-black font-limbus text-white">
              Tactical Deck Finder & Squad Synthesizer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Controls Deck */}
        <div className="p-4 bg-black/40 border-b border-white/5 space-y-3">
          {/* Keyword Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 w-24">Keyword:</span>
            {KEYWORDS.map(kw => {
              const active = targetKeyword.toLowerCase() === kw.toLowerCase();
              const color = LD_KEYWORD_COLORS[kw] || '#c9a84c';
              return (
                <button
                  key={kw}
                  onClick={() => setTargetKeyword(kw)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'text-white shadow-lg font-black'
                      : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                  }`}
                  style={active ? { backgroundColor: color } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {kw}
                </button>
              );
            })}
          </div>

          {/* Size & Pool */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-400 w-24">Party Size:</span>
              {[5, 6, 7, 12].map(size => (
                <button
                  key={size}
                  onClick={() => setPartySize(size)}
                  className={`px-3 py-1 rounded-lg font-bold font-mono transition-all cursor-pointer ${
                    partySize === size
                      ? 'bg-[#c9a84c] text-black font-black'
                      : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {size} Slots
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold select-none ml-auto text-white">
              <input
                type="checkbox"
                checked={userPoolOnly}
                onChange={() => setUserPoolOnly(!userPoolOnly)}
                className="limbus-checkbox"
              />
              <span>Restrict to My Owned Identities Only</span>
            </label>
          </div>

          {/* Fixed / Excluded Sinners */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-400 w-24">Must Include:</span>
              <select
                value={fixedSinner}
                onChange={(e) => setFixedSinner(e.target.value)}
                className="bg-[#121216] border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 focus:border-[#c9a84c] outline-none"
              >
                <option value="">None (Auto-pick all)</option>
                {SINNER_META.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.nameKo})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-400">Exclude:</span>
              <select
                value={excludedSinner}
                onChange={(e) => setExcludedSinner(e.target.value)}
                className="bg-[#121216] border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 focus:border-[#c9a84c] outline-none"
              >
                <option value="">None</option>
                {SINNER_META.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.nameKo})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Generated Result Deck */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Summary Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-[#121216] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 rounded-xl bg-black/60 border border-[#c9a84c]/30">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Synergy Score</span>
                <span className="text-3xl font-black font-limbus text-[#c9a84c]">
                  {analysis?.totalScore || 0}<span className="text-xs text-gray-500 font-sans font-normal">/100</span>
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-white capitalize">
                  Optimal {targetKeyword} Formation ({members.length} Sinners)
                </h4>
                {metaMatch && (
                  <p className="text-xs text-[#c9a84c] font-mono mt-0.5">
                    ★ Correlates with: <strong>{metaMatch.party.nameEn}</strong> ({metaMatch.shared}/{metaMatch.total} members)
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>Passives:</span>
                  <span className="text-emerald-400 font-mono font-bold">✓ {passives?.combat?.possible || 0} Possible</span>
                  <span className="text-amber-400 font-mono font-bold">⚠️ {passives?.combat?.hard || 0} Low-Share</span>
                  <span className="text-rose-400 font-mono font-bold">✕ {passives?.combat?.impossible || 0} Impossible</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onApplySquad(members.map(m => m.identity));
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#c9a84c] hover:bg-[#d4b96b] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(201,168,76,0.4)] cursor-pointer"
            >
              <ArrowRight size={16} /> Deploy Formation to Squad
            </button>
          </div>

          {/* Members Roster */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {members.map(({ sinner, identity, alternatives }) => {
              const bgImg = identity ? getCardImageUrl(identity) : null;
              const isOwned = identity ? acquiredIds?.has(identity.name) : false;

              return (
                <div
                  key={sinner.id}
                  className="rounded-xl border border-white/10 bg-[#101014] p-3 flex flex-col justify-between relative overflow-hidden h-44 shadow-md group hover:border-[#c9a84c]/50 transition-all"
                >
                  {bgImg && (
                    <img
                      src={bgImg}
                      alt={identity?.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover object-top opacity-30 pointer-events-none group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 pointer-events-none" />

                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black tracking-wide" style={{ color: sinner.color }}>
                        {sinner.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        Slot #{sinner.id}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isOwned ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'}`}>
                      {isOwned ? '✓ Owned' : '✕ Unowned'}
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <span className="text-[10px] text-amber-400 font-bold block">
                      {'★'.repeat(identity?.rarity || 3)}
                    </span>
                    <h5 className="font-bold text-white text-xs leading-snug line-clamp-2">
                      {identity?.name}
                    </h5>

                    {/* Alternatives pill */}
                    {alternatives?.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                        Alt: {alternatives.map(a => a.name.split(' ').slice(0, 2).join(' ')).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
