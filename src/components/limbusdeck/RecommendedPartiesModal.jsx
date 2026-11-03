import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Youtube, ArrowRight, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import recommendedParties from '../../data/recommendedParties.json';
import { getCardImageUrl, getSinnerInfo } from '../../utils/textUtils.js';
import { LD_KEYWORD_COLORS } from '../../utils/limbusDeckEngine.js';

const KEYWORD_TABS = ['All', 'Burn', 'Bleed', 'Tremor', 'Rupture', 'Sinking', 'Poise', 'Charge'];

export default function RecommendedPartiesModal({ isOpen, onClose, onApplyParty, identitiesData, acquiredIds }) {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('All');

  // Fast map from ldId to identity object
  const identityByLdId = useMemo(() => {
    const map = new Map();
    for (const id of identitiesData || []) {
      if (id.ldId) map.set(id.ldId, id);
    }
    return map;
  }, [identitiesData]);

  const filteredParties = useMemo(() => {
    const q = search.trim().toLowerCase();
    const kwFilter = selectedKeyword.toLowerCase();

    return recommendedParties.filter(party => {
      // Keyword filter
      if (kwFilter !== 'all') {
        const hasKw = (party.targetKeywords || []).some(k => k.toLowerCase() === kwFilter);
        if (!hasKw) return false;
      }

      // Search query
      if (q) {
        const matchEn = (party.nameEn || '').toLowerCase().includes(q);
        const matchKo = (party.nameKo || '').toLowerCase().includes(q);
        const matchDesc = (party.descriptionEn || '').toLowerCase().includes(q);
        if (!matchEn && !matchKo && !matchDesc) return false;
      }

      return true;
    });
  }, [search, selectedKeyword]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-6xl bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-[#15120c] to-[#0a0a0c] border-b border-white/10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40 flex items-center gap-1">
                <Sparkles size={12} /> 76 Meta Archetypes
              </span>
              <span className="text-xs text-gray-400 font-mono">
                LimbusDeck Recommended Meta Parties
              </span>
            </div>
            <h2 className="text-2xl font-black font-limbus text-white">
              Recommended Meta Builds Directory
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search builds by archetype name, team strategy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121216] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-[#c9a84c] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {KEYWORD_TABS.map(kw => {
              const count = kw === 'All'
                ? recommendedParties.length
                : recommendedParties.filter(p => (p.targetKeywords || []).map(k => k.toLowerCase()).includes(kw.toLowerCase())).length;
              const color = LD_KEYWORD_COLORS[kw] || '#c9a84c';
              const active = selectedKeyword === kw;

              return (
                <button
                  key={kw}
                  onClick={() => setSelectedKeyword(kw)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#c9a84c] text-black shadow-[0_0_12px_rgba(201,168,76,0.5)] font-black'
                      : 'bg-black/50 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {kw !== 'All' && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
                  <span>{kw}</span>
                  <span className="text-[10px] opacity-60 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Parties List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredParties.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-base font-bold">No meta parties matched your filter.</p>
              <button
                onClick={() => { setSearch(''); setSelectedKeyword('All'); }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-[#c9a84c]/20 text-[#c9a84c] font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredParties.map(party => {
              // Calculate ownership
              const partyIdentities = party.members.map(m => identityByLdId.get(m.identityId)).filter(Boolean);
              const ownedCount = partyIdentities.filter(id => acquiredIds?.has(id.name)).length;
              const totalCount = party.members.length;
              const isFullyOwned = ownedCount === totalCount;

              return (
                <div
                  key={party.id}
                  className="rounded-2xl border border-white/10 bg-[#101014] p-5 shadow-lg space-y-4 hover:border-[#c9a84c]/40 transition-colors"
                >
                  {/* Party Top Row */}
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-black font-limbus text-white">
                          {party.nameEn}
                        </h3>
                        {party.nameKo && (
                          <span className="text-xs text-gray-400 font-mono">
                            ({party.nameKo})
                          </span>
                        )}
                        {party.isFeatured && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ★ Featured Meta
                          </span>
                        )}
                      </div>

                      {/* Keywords */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {party.targetKeywords?.map(kw => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm flex items-center gap-1"
                            style={{ backgroundColor: LD_KEYWORD_COLORS[kw] || '#666' }}
                          >
                            ● {kw}
                          </span>
                        ))}
                        {party.updatedAt && (
                          <span className="text-[10px] text-gray-500 font-mono ml-2">
                            Updated: {party.updatedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: YouTube & Deploy */}
                    <div className="flex flex-wrap items-center gap-2">
                      {party.youtubeUrl && (
                        <a
                          href={party.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-700/50 hover:bg-red-900/60 text-red-200 text-xs font-bold transition-all flex items-center gap-1.5"
                          title="Watch video demonstration"
                        >
                          <Youtube size={14} className="text-red-400" />
                          <span>{party.youtubeChannelName || 'Guide Video'}</span>
                        </a>
                      )}

                      <button
                        onClick={() => {
                          onApplyParty(party, partyIdentities);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#c9a84c] hover:bg-[#d4b96b] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(201,168,76,0.3)] cursor-pointer"
                      >
                        <ArrowRight size={14} /> Deploy to Squad
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {party.descriptionEn && (
                    <p className="text-xs text-gray-300 italic font-mono leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                      "{party.descriptionEn}"
                    </p>
                  )}

                  {/* 7 Members Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
                    {party.members.map(member => {
                      const id = identityByLdId.get(member.identityId);
                      const sinner = getSinnerInfo(member.sinnerId);
                      const isOwned = id ? acquiredIds?.has(id.name) : false;
                      const bgImg = id ? getCardImageUrl(id) : null;

                      return (
                        <div
                          key={member.sinnerId}
                          className={`relative rounded-xl overflow-hidden border-2 p-2 flex flex-col h-28 bg-[#0a0a0c] transition-all ${
                            isOwned
                              ? 'border-[#c9a84c]/60 shadow-[0_0_10px_rgba(201,168,76,0.15)]'
                              : 'border-white/10 opacity-70'
                          }`}
                        >
                          {/* Background Artwork */}
                          {bgImg && (
                            <img
                              src={bgImg}
                              alt={id?.name}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover object-top opacity-30 pointer-events-none"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 pointer-events-none" />

                          <div className="relative z-10 flex justify-between items-start text-[10px]">
                            <span className="font-bold drop-shadow" style={{ color: sinner?.color || '#fff' }}>
                              {sinner?.name}
                            </span>
                            <span className={`font-mono text-[9px] px-1 rounded ${isOwned ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'}`}>
                              {isOwned ? '✓ Owned' : '✕'}
                            </span>
                          </div>

                          <div className="relative z-10 mt-auto">
                            <span className="text-[10px] text-amber-400 font-bold block">
                              {'★'.repeat(id?.rarity || 3)}
                            </span>
                            <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {id?.name || `ID #${member.identityId}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ownership Status Bar */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1.5 font-bold">
                      {isFullyOwned ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Full Squad Ready to Deploy! ({ownedCount}/{totalCount})
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertCircle size={13} /> Squad Progress: {ownedCount}/{totalCount} Owned ({totalCount - ownedCount} Missing)
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">
                      Target Size: {party.members.length} Sinners
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
