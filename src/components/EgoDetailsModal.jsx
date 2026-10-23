// src/components/EgoDetailsModal.jsx
// Complete LimbusDeck.com-style E.G.O Detail Modal (ported via REA from 0f0q2ngh8oa5_.js)
// Features Hero Overview, 7-Sin Resistances, Sin Resource Costs, Awakening & Corrosion Skill Cards
// with CoinEffects & 7-color Bracket Tags, E.G.O Passive with Status Tooltips, Statuses Glossary,
// Recommended Meta Teams, and Same-Sinner E.G.O Switcher.

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Maximize2,
  X,
  Calendar,
  ChevronRight,
  Layers,
  Coins
} from 'lucide-react';
import { useStore } from '../stores/useStore.js';
import {
  LD_SIN_COLORS,
  LD_KEYWORD_COLORS,
  LD_GRADE_COLORS,
  SINNER_META,
  recommendedParties
} from '../utils/limbusDeckEngine.js';
import {
  StatusTermsProvider,
  StatusSection,
  StatusText,
  CoinEffects,
  KeywordRoleBadge,
  SinBadge,
  CoinDots
} from './limbusdeck/SkillComponents.jsx';

function generateSlug(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const RESISTANCE_STYLES = {
  ineffective: { label: 'Ineffective (×0.5)', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  endured: { label: 'Endured (×0.75)', cls: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  normal: { label: 'Normal (×1.0)', cls: 'bg-white/10 text-gray-300 border-white/15' },
  fatal: { label: 'Fatal (×2.0)', cls: 'bg-red-500/15 text-red-300 border-red-500/30' }
};

export default function EgoDetailsModal({ egoData, onClose }) {
  const { egosData, acquiredEgos, toggleAcquiredEgo } = useStore();
  const [currentEgo, setCurrentEgo] = useState(egoData);
  const [showKo, setShowKo] = useState(false);
  const [activeAwakenTab, setActiveAwakenTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setCurrentEgo(egoData);
    setActiveAwakenTab(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [egoData]);

  const switchEgo = (nextEgo) => {
    if (!nextEgo) return;
    setCurrentEgo(nextEgo);
    setActiveAwakenTab(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const slug = currentEgo.slug || generateSlug(currentEgo.name);
  const bgUrl = `https://assets.limbusdeck.com/egos/full/${slug}.webp`;
  const gradeColor = LD_GRADE_COLORS[currentEgo.grade] || '#eab308';
  const sinKey = (currentEgo.sin || currentEgo.affinity || 'wrath').toLowerCase();
  const sinColor = LD_SIN_COLORS[sinKey] || '#dc2626';

  const sinnerMeta = useMemo(() => {
    return (
      SINNER_META.find(s => s.id === currentEgo.sinnerId) ||
      SINNER_META.find(s => s.name.toLowerCase() === (currentEgo.sinner || '').toLowerCase()) ||
      SINNER_META[0]
    );
  }, [currentEgo]);

  const isAcquired = acquiredEgos.has(currentEgo.name);

  // Awakening and Corrosion skills from LimbusDeck dataset (with fallback to legacy skills)
  const awakeningSkills = useMemo(() => {
    if (currentEgo.ldSkills && currentEgo.ldSkills.length > 0) return currentEgo.ldSkills;
    return (currentEgo.skills || []).filter(s => !s.isCorrosion && !(s.name || '').includes('Corrosion'));
  }, [currentEgo]);

  const corrosionSkills = useMemo(() => {
    if (currentEgo.ldCorrosionSkills && currentEgo.ldCorrosionSkills.length > 0) {
      return currentEgo.ldCorrosionSkills;
    }
    return (currentEgo.skills || []).filter(s => s.isCorrosion || (s.name || '').includes('Corrosion'));
  }, [currentEgo]);

  const passiveObj = useMemo(() => {
    if (currentEgo.ldPassive && (currentEgo.ldPassive.name || currentEgo.ldPassive.description)) {
      return currentEgo.ldPassive;
    }
    const firstP = (currentEgo.passives || [])[0];
    if (!firstP) return null;
    return {
      name: firstP.name || 'E.G.O Passive',
      nameKo: firstP.nameKo || '',
      description: Array.isArray(firstP.effects) ? firstP.effects.join('\n') : (firstP.description || firstP.effects || ''),
      descriptionKo: firstP.descriptionKo || ''
    };
  }, [currentEgo]);

  const costsList = useMemo(() => {
    if (currentEgo.costs && currentEgo.costs.length > 0) return currentEgo.costs;
    if (currentEgo.cost && typeof currentEgo.cost === 'object') {
      return Object.entries(currentEgo.cost).map(([sin, amount]) => ({
        sin: sin.toLowerCase(),
        amount
      }));
    }
    return [];
  }, [currentEgo]);

  const statuses = currentEgo.statuses || [];

  const relatedParties = useMemo(() => {
    if (!currentEgo.ldId) return [];
    return (recommendedParties || []).filter(p =>
      (p.members || []).some(m => (m.egoIds || []).includes(currentEgo.ldId))
    );
  }, [currentEgo.ldId]);

  const otherSameSinnerEgos = useMemo(() => {
    return (egosData || [])
      .filter(
        e =>
          e.name !== currentEgo.name &&
          (e.sinnerId === currentEgo.sinnerId || e.sinner === currentEgo.sinner)
      )
      .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
  }, [egosData, currentEgo]);

  const renderEgoSkillBlock = (sk, idx, isCorrosion = false) => {
    const sSin = (sk.sin || sk.affinity || sinKey).toLowerCase();
    const sColor = LD_SIN_COLORS[sSin] || sinColor;
    const sName = showKo && sk.nameKo ? sk.nameKo : (sk.nameEn || sk.rawName || sk.name || 'E.G.O Skill');
    const sAtk = sk.attackType || sk.type || currentEgo.attackType || 'Slash';
    const base = sk.basePower ?? 0;
    const coinPower = sk.coinPower ?? 0;
    const coinCount = sk.coinCount ?? sk.coins ?? 1;
    const totalMax = base + coinCount * coinPower;
    const effects = showKo && sk.coinEffectsKo?.length ? sk.coinEffectsKo : (sk.coinEffects || sk.effects || []);

    return (
      <div
        key={idx}
        className={`grid grid-cols-[5px_minmax(0,1fr)] overflow-hidden rounded-2xl border bg-[#111] shadow-md ${
          isCorrosion ? 'border-red-500/40' : 'border-[#333]'
        }`}
      >
        <div style={{ backgroundColor: sColor }} />
        <div className="min-w-0 p-4 sm:p-5 space-y-3">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {isCorrosion ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-xs font-black uppercase text-red-300">
                  <AlertTriangle size={12} /> Corrosion
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#c9a84c]/40 bg-[#c9a84c]/15 px-2 py-0.5 text-xs font-black uppercase text-[#c9a84c]">
                  <Sparkles size={12} /> Awakening
                </span>
              )}
              <h3 className="min-w-0 text-base font-black text-white">{sName}</h3>
              {sk.nameKo && !showKo && (
                <span className="text-xs text-gray-400 hidden sm:inline">{sk.nameKo}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <SinBadge sin={sSin} />
              <span className="inline-flex h-6 items-center rounded-md bg-[#1c1c24] border border-[#333] px-2.5 text-xs font-semibold text-gray-200 capitalize">
                {sAtk}
              </span>
            </div>
          </div>

          {/* Power Box */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-[#0a0a0e] border border-[#26262e] px-4 py-3">
            <div className="text-center">
              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Base Power
              </p>
              <p className="font-mono text-2xl font-black text-white">{base}</p>
            </div>
            <div className="text-lg font-black text-gray-500">+</div>
            <div className="text-center">
              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Coin
              </p>
              <div className="flex items-center gap-1.5">
                <CoinDots count={coinCount} negative={coinPower < 0} />
                <span
                  className={`ml-1 font-mono text-base font-black ${
                    coinPower < 0 ? 'text-red-400' : 'text-[#c9a84c]'
                  }`}
                >
                  ×{coinPower > 0 ? `+${coinPower}` : coinPower}
                </span>
              </div>
            </div>
            <div className="text-lg font-black text-gray-500">=</div>
            <div className="text-center">
              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Total Max
              </p>
              <p
                className={`font-mono text-2xl font-black ${
                  coinPower < 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {coinPower < 0 ? `${base} (Min ${totalMax})` : totalMax}
              </p>
            </div>
          </div>

          {/* CoinEffects */}
          {effects.length > 0 && effects.some(Boolean) && (
            <div className="rounded-xl bg-[#0a0a0e] border border-[#222] px-3.5 py-3">
              <CoinEffects effects={effects} />
            </div>
          )}

          {/* Keywords */}
          {sk.keywords && sk.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
              {sk.keywords.map((kw, kIdx) =>
                typeof kw === 'string' ? (
                  <KeywordRoleBadge key={kIdx} keyword={kw} />
                ) : (
                  <KeywordRoleBadge key={kIdx} keyword={kw.keyword} role={kw.role} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const sections = [
    { id: 'hero', label: 'Overview' },
    { id: 'skills', label: 'Awakening' },
    ...(corrosionSkills.length > 0 ? [{ id: 'corrosion', label: 'Corrosion' }] : []),
    ...(passiveObj ? [{ id: 'passive', label: 'Passive' }] : []),
    ...(statuses.length > 0 ? [{ id: 'statuses', label: `Statuses (${statuses.length})` }] : []),
    ...(relatedParties.length > 0 ? [{ id: 'parties', label: `Teams (${relatedParties.length})` }] : []),
    ...(otherSameSinnerEgos.length > 0 ? [{ id: 'related', label: `More ${sinnerMeta.name}` }] : [])
  ];

  const scrollToSection = (secId) => {
    setActiveSection(secId);
    const el = scrollContainerRef.current?.querySelector(`#ego-sec-${secId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 md:p-5 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-6xl w-full h-[90vh] flex flex-col bg-[#0a0a0e] border border-[#333] overflow-hidden relative shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Blurred Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-3xl pointer-events-none scale-110"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />

        {/* Top Header */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-[#333] bg-[#0d0d12]/95 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
            <span className="font-bold text-gray-300">E.G.O</span>
            <ChevronRight size={14} className="shrink-0 text-gray-600" />
            <span className="font-bold shrink-0" style={{ color: sinnerMeta.color }}>
              {sinnerMeta.name}
            </span>
            <ChevronRight size={14} className="shrink-0 text-gray-600" />
            <span className="font-bold text-white truncate">{currentEgo.nameEn || currentEgo.name}</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
            {sections.map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`btn-inline px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-[#c9a84c] text-black shadow-sm'
                    : 'bg-[#16161d] text-gray-400 hover:text-white border border-[#2a2a35]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentEgo.nameKo && (
              <button
                type="button"
                onClick={() => setShowKo(v => !v)}
                className={`btn-inline px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  showKo
                    ? 'border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c]'
                    : 'border-[#333] bg-[#16161d] text-gray-300 hover:text-white'
                }`}
              >
                {showKo ? '🇰🇷 한국어' : '🌐 EN / KO'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-inline w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-5 py-6 sm:px-8 space-y-9"
        >
          <StatusTermsProvider statuses={statuses}>
            {/* HERO SECTION */}
            <section
              id="ego-sec-hero"
              className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]"
            >
              <div className="flex flex-col gap-3 self-start">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="card-btn group relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-[#333] hover:border-[#c9a84c] bg-[#121218] cursor-pointer shadow-xl"
                >
                  <img
                    src={bgUrl}
                    alt={currentEgo.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span
                    className="absolute top-3 left-3 rounded-md px-2.5 py-0.5 font-mono text-xs font-black text-black shadow-md"
                    style={{ backgroundColor: gradeColor }}
                  >
                    {currentEgo.grade}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 p-1.5 text-gray-200">
                    <Maximize2 size={14} />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleAcquiredEgo(currentEgo.name)}
                  className={`btn-inline w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isAcquired
                      ? 'bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.4)]'
                      : 'bg-[#181820] text-white border border-white/20 hover:border-[#c9a84c]'
                  }`}
                >
                  <CheckCircle size={14} />
                  {isAcquired ? 'Owned in E.G.O Pool' : 'Add E.G.O to Pool'}
                </button>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <div>
                  <p className="mb-1 font-mono text-xs font-black uppercase tracking-[0.25em] text-[#c9a84c]">
                    E.G.O Detail
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span
                      className="rounded-md px-2 py-0.5 font-mono text-xs font-black border"
                      style={{
                        color: gradeColor,
                        borderColor: `${gradeColor}55`,
                        backgroundColor: `${gradeColor}18`
                      }}
                    >
                      {currentEgo.grade}
                    </span>
                    <span className="font-bold" style={{ color: sinnerMeta.color }}>
                      {sinnerMeta.name}
                    </span>
                    <span>·</span>
                    <span>
                      {currentEgo.isWalpurgis
                        ? `Walpurgisnacht ${currentEgo.ldSeason || ''}`
                        : currentEgo.isStandard
                        ? 'Standard'
                        : `Season ${currentEgo.ldSeason ?? currentEgo.season ?? 1}`}
                    </span>
                    {currentEgo.releaseDate && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-mono text-gray-300">
                          <Calendar size={12} className="text-[#c9a84c]" />
                          {currentEgo.releaseDate}
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white leading-tight">
                    {showKo && currentEgo.nameKo ? currentEgo.nameKo : (currentEgo.nameEn || currentEgo.name)}
                  </h1>
                  {(currentEgo.nameKo || currentEgo.nameJa) && (
                    <p className="mt-1 text-xs text-gray-400">
                      {[currentEgo.nameKo, currentEgo.nameJa].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                {/* 3-Box Core Stats */}
                <div>
                  <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-300">
                    Core Specifications
                  </h2>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-xl border border-[#333] bg-[#111] px-3.5 py-3">
                      <dt className="text-xs text-gray-400">Sin Affinity</dt>
                      <dd className="mt-1 flex items-center gap-2 text-base font-black text-white capitalize">
                        <span className="size-3 rounded-full" style={{ backgroundColor: sinColor }} />
                        {sinKey}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-[#333] bg-[#111] px-3.5 py-3">
                      <dt className="text-xs text-gray-400">Attack Type</dt>
                      <dd className="mt-1 text-base font-black text-white capitalize">
                        {currentEgo.attackType || awakeningSkills[0]?.attackType || awakeningSkills[0]?.type || 'Slash'}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-[#333] bg-[#111] px-3.5 py-3">
                      <dt className="text-xs text-gray-400">Sanity Cost</dt>
                      <dd className="mt-1 font-mono text-lg font-black text-white">
                        {currentEgo.sanity ?? currentEgo.sanityCost ?? 20} SP
                        {corrosionSkills.length > 0 && (
                          <span className="ml-1.5 text-red-400 text-sm">
                            / {(currentEgo.sanity ?? currentEgo.sanityCost ?? 20) * 2}
                          </span>
                        )}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Sin Resource Costs */}
                {costsList.length > 0 && (
                  <div>
                    <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-300">
                      E.G.O Resource Cost
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {costsList.map(c => {
                        const cColor = LD_SIN_COLORS[c.sin.toLowerCase()] || '#6b7280';
                        return (
                          <div
                            key={c.sin}
                            className="flex items-center justify-between rounded-xl border border-[#333] bg-[#111] px-3 py-2.5"
                          >
                            <span className="flex items-center gap-2 text-xs font-bold text-gray-200 capitalize">
                              <span className="size-2.5 rounded-full" style={{ backgroundColor: cColor }} />
                              {c.sin}
                            </span>
                            <span className="font-mono text-base font-black text-white">
                              ×{c.amount}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7-Sin Resistances */}
                {currentEgo.resistances && Object.keys(currentEgo.resistances).length > 0 && (
                  <div>
                    <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-300">
                      Sin Affinity Resistances
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {Object.entries(currentEgo.resistances).map(([rSin, rVal]) => {
                        const rColor = LD_SIN_COLORS[rSin.toLowerCase()] || '#6b7280';
                        const rStyle = RESISTANCE_STYLES[rVal] || RESISTANCE_STYLES.normal;
                        return (
                          <div
                            key={rSin}
                            className="flex items-center justify-between gap-2 rounded-xl border border-[#333] bg-[#111] px-3 py-2"
                          >
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-200 capitalize">
                              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: rColor }} />
                              {rSin}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${rStyle.cls}`}
                            >
                              {rVal.charAt(0).toUpperCase() + rVal.slice(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* AWAKENING SKILLS SECTION */}
            <section id="ego-sec-skills" className="scroll-mt-20 space-y-3">
              <div className="flex items-center justify-between border-b border-[#333] pb-2">
                <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
                  <Sparkles size={18} /> Awakening Skill
                </h2>
                {awakeningSkills.length > 1 && (
                  <div className="flex gap-1 bg-[#16161d] p-1 rounded-lg border border-[#333]">
                    {awakeningSkills.map((sk, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveAwakenTab(idx)}
                        className={`btn-inline px-3 py-1 rounded-md text-xs font-bold cursor-pointer ${
                          activeAwakenTab === idx
                            ? 'bg-[#c9a84c] text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {sk.nameEn || sk.name || `Skill ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {awakeningSkills.length > 1 ? (
                renderEgoSkillBlock(awakeningSkills[activeAwakenTab] || awakeningSkills[0], activeAwakenTab, false)
              ) : (
                <div className="space-y-3">
                  {awakeningSkills.map((sk, i) => renderEgoSkillBlock(sk, i, false))}
                </div>
              )}
            </section>

            {/* CORROSION SKILLS SECTION */}
            {corrosionSkills.length > 0 && (
              <section id="ego-sec-corrosion" className="scroll-mt-20 space-y-3">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <AlertTriangle size={18} /> Corrosion Skill
                  </h2>
                </div>
                <div className="space-y-3">
                  {corrosionSkills.map((sk, i) => renderEgoSkillBlock(sk, i, true))}
                </div>
              </section>
            )}

            {/* PASSIVE SECTION */}
            {passiveObj && (
              <section id="ego-sec-passive" className="scroll-mt-20 space-y-3">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
                    <Layers size={18} /> E.G.O Passive
                  </h2>
                </div>
                <div className="grid grid-cols-[5px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#333] bg-[#111] shadow-md">
                  <div style={{ backgroundColor: sinColor }} />
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base font-black text-white">
                        {showKo && passiveObj.nameKo ? passiveObj.nameKo : passiveObj.name}
                      </h3>
                      {passiveObj.nameKo && !showKo && (
                        <span className="text-xs text-gray-400">{passiveObj.nameKo}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line bg-[#0a0a0e] border border-[#222] rounded-xl p-3.5">
                      <StatusText
                        text={
                          showKo && passiveObj.descriptionKo
                            ? passiveObj.descriptionKo
                            : passiveObj.description
                        }
                      />
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* STATUSES GLOSSARY */}
            <StatusSection statuses={statuses} id="ego-sec-statuses" />

            {/* RECOMMENDED PARTIES USING THIS EGO */}
            {relatedParties.length > 0 && (
              <section id="ego-sec-parties" className="scroll-mt-20 space-y-3">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c]">
                    Recommended Meta Teams Using This E.G.O ({relatedParties.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {relatedParties.map(party => (
                    <div
                      key={party.id}
                      className="rounded-xl border border-[#333] bg-[#111] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white">
                          {party.nameEn || party.nameKo}
                        </h3>
                        <div className="flex gap-1">
                          {(party.targetKeywords || []).map(kw => (
                            <span
                              key={kw}
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                color: LD_KEYWORD_COLORS[kw] || '#c9a84c',
                                backgroundColor: `${LD_KEYWORD_COLORS[kw] || '#c9a84c'}20`
                              }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {party.descriptionEn || party.descriptionKo}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* OTHER EGOS OF THE SAME SINNER */}
            {otherSameSinnerEgos.length > 0 && (
              <section id="ego-sec-related" className="scroll-mt-20 space-y-3 pb-4">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c]">
                    Other E.G.O of {sinnerMeta.name} ({otherSameSinnerEgos.length})
                  </h2>
                  <span className="text-xs text-gray-400">Click any E.G.O card to switch</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {otherSameSinnerEgos.map(other => {
                    const oSlug = other.slug || generateSlug(other.name);
                    const oOwned = acquiredEgos.has(other.name);
                    const oGradeColor = LD_GRADE_COLORS[other.grade] || '#eab308';
                    return (
                      <button
                        key={other.name}
                        type="button"
                        onClick={() => switchEgo(other)}
                        className={`card-btn group relative aspect-[4/3] overflow-hidden rounded-xl border-2 text-left transition-all cursor-pointer ${
                          oOwned
                            ? 'border-[#c9a84c]/70 hover:border-[#c9a84c]'
                            : 'border-[#333] opacity-80 hover:opacity-100 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={`https://assets.limbusdeck.com/egos/full/${oSlug}.webp`}
                          alt={other.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-black text-black"
                            style={{ backgroundColor: oGradeColor }}
                          >
                            {other.grade}
                          </span>
                          {oOwned && (
                            <span className="rounded bg-[#c9a84c] px-1.5 py-0.5 text-[9px] font-black text-black">
                              OWNED
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                            {other.nameEn || other.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </StatusTermsProvider>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/95 flex flex-col items-center justify-center p-4"
              onClick={() => setLightboxOpen(false)}
            >
              <div className="flex items-center justify-between w-full max-w-4xl mb-3">
                <span className="text-sm font-bold text-white">
                  {currentEgo.nameEn || currentEgo.name} ({currentEgo.grade})
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="btn-inline px-3 py-1.5 rounded-lg bg-red-500/80 text-xs font-bold text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <img
                src={bgUrl}
                alt={currentEgo.name}
                className="max-h-[82vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
