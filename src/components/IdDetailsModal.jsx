// src/components/IdDetailsModal.jsx
// Complete LimbusDeck.com-style Character Detail Modal (ported via REA from 3u3bm5ir4bed9.js & 444a_5rtna8p8.js)
// Features all 10 LimbusDeck detail sections + interactive Status Popover Tooltips +
// 7-color Bracket Tag Parser + Level 1-60 Stat Scaler + Pre/Post-Uptie Side-by-Side & Lightbox +
// "Based on My Pool" Synergy Check + Built-in Markov-Chain Clash Simulator + Tactical Dossier.

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Zap,
  Shield,
  Sparkles,
  CheckCircle,
  Columns,
  Maximize2,
  X,
  Calendar,
  Users,
  Award,
  Calculator,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Swords,
  Layers
} from 'lucide-react';
import { useStore } from '../stores/useStore.js';
import { getShardabilityStatus } from '../utils/limbusCalculator.js';
import { getIdentityTactics, KEYWORD_THEMES } from '../utils/identityTactics.js';
import {
  LD_SIN_COLORS,
  LD_KEYWORD_COLORS,
  SINNER_META,
  getEgoLinkedInfo,
  getTraitLabel,
  getMetaTierLabel,
  getIdentityRecordRank,
  computeIdentityPoolImpact,
  solveClash,
  headsProbability
} from '../utils/limbusDeckEngine.js';
import {
  StatusTermsProvider,
  StatusSection,
  LimbusDeckSkillCard,
  LimbusDeckPassiveCard,
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

function QuickClashDrawer({ initialSkill, identityName, allIdentities, onClose }) {
  const [sideA, setSideA] = useState(() => ({
    label: `${identityName} — ${initialSkill?.nameEn || initialSkill?.name || 'Skill'}`,
    basePower: initialSkill?.basePower ?? 4,
    coinPower: initialSkill?.coinPower ?? 4,
    coinCount: initialSkill?.coinCount ?? initialSkill?.coins ?? 2,
    sanity: 45,
    paralysis: 0,
    offenseLevel: 60 + (initialSkill?.offenseLevel ?? 0),
    mods: { base: 0, coin: 0, final: 0, clash: 0 }
  }));

  const [sideB, setSideB] = useState({
    label: 'Enemy / Opponent Skill',
    basePower: 4,
    coinPower: 4,
    coinCount: 3,
    sanity: 0,
    paralysis: 0,
    offenseLevel: 60,
    mods: { base: 0, coin: 0, final: 0, clash: 0 }
  });

  const [enemyPresetSearch, setEnemyPresetSearch] = useState('');

  const outcome = useMemo(() => solveClash(sideA, sideB), [sideA, sideB]);

  const matchingPresets = useMemo(() => {
    const q = enemyPresetSearch.trim().toLowerCase();
    if (!q) return [];
    const list = [];
    for (const id of (allIdentities || [])) {
      if ((id.name || '').toLowerCase().includes(q) || (id.sinner || '').toLowerCase().includes(q)) {
        (id.ldSkills || id.skills || []).forEach((sk, idx) => {
          list.push({
            idName: id.name,
            slot: `S${idx + 1}`,
            skill: sk
          });
        });
        if (list.length >= 12) break;
      }
    }
    return list.slice(0, 12);
  }, [enemyPresetSearch, allIdentities]);

  const renderSideControls = (side, setSide, accentColor) => (
    <div className="rounded-xl border border-[#333] bg-[#111] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-xs font-black uppercase tracking-wider truncate" style={{ color: accentColor }}>
          {side.label}
        </span>
        <span className="text-[11px] font-mono text-gray-400 shrink-0">
          Heads: {Math.round(headsProbability(side.sanity) * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="text-[11px] text-gray-400 flex flex-col gap-1">
          <span>Base Power</span>
          <input
            type="number"
            value={side.basePower}
            onChange={e => setSide(s => ({ ...s, basePower: Number(e.target.value) || 0 }))}
            className="bg-[#0a0a0e] border border-[#333] rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
          />
        </label>
        <label className="text-[11px] text-gray-400 flex flex-col gap-1">
          <span>Coin Power</span>
          <input
            type="number"
            value={side.coinPower}
            onChange={e => setSide(s => ({ ...s, coinPower: Number(e.target.value) || 0 }))}
            className="bg-[#0a0a0e] border border-[#333] rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
          />
        </label>
        <label className="text-[11px] text-gray-400 flex flex-col gap-1">
          <span>Coin Count</span>
          <input
            type="number"
            min={1}
            max={12}
            value={side.coinCount}
            onChange={e => setSide(s => ({ ...s, coinCount: Math.max(1, Math.min(12, Number(e.target.value) || 1)) }))}
            className="bg-[#0a0a0e] border border-[#333] rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="text-[11px] text-gray-400 flex flex-col gap-1">
          <span>Sanity (-45..45)</span>
          <input
            type="number"
            min={-45}
            max={45}
            value={side.sanity}
            onChange={e => setSide(s => ({ ...s, sanity: Math.max(-45, Math.min(45, Number(e.target.value) || 0)) }))}
            className="bg-[#0a0a0e] border border-[#333] rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
          />
        </label>
        <label className="text-[11px] text-gray-400 flex flex-col gap-1">
          <span>Offense Lv</span>
          <input
            type="number"
            value={side.offenseLevel}
            onChange={e => setSide(s => ({ ...s, offenseLevel: Number(e.target.value) || 60 }))}
            className="bg-[#0a0a0e] border border-[#333] rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
          />
        </label>
        <label className="text-[11px] text-gray-400 flex flex-col gap-1">
          <span>Paralysis</span>
          <input
            type="number"
            min={0}
            max={20}
            value={side.paralysis}
            onChange={e => setSide(s => ({ ...s, paralysis: Math.max(0, Number(e.target.value) || 0) }))}
            className="bg-[#0a0a0e] border border-[#333] rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white"
          />
        </label>
      </div>
    </div>
  );

  const winPct = (outcome.win * 100).toFixed(1);
  const losePct = (outcome.lose * 100).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-[#c9a84c]/50 bg-[#0c0c10] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#333] pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="text-[#c9a84c]" size={20} />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Markov-Chain Clash Calculator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn-inline rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Win Rate Bar */}
        <div className="rounded-xl border border-[#333] bg-[#14141a] p-4 space-y-2.5">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-400 block">Ally Win Rate</span>
              <span className="text-3xl font-black font-mono text-emerald-400">{winPct}%</span>
            </div>
            <div className="text-center">
              <span className="text-[11px] text-gray-400 font-mono block">
                Avg Clash Rounds: <strong className="text-white">{outcome.expectedRounds.toFixed(2)}</strong>
              </span>
              <span className="text-[11px] text-gray-400 font-mono block">
                Round 1: W {(outcome.first.win * 100).toFixed(0)}% · T {(outcome.first.tie * 100).toFixed(0)}% · L {(outcome.first.lose * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-red-400 block">Opponent Win Rate</span>
              <span className="text-3xl font-black font-mono text-red-400">{losePct}%</span>
            </div>
          </div>

          <div className="h-3.5 w-full rounded-full bg-red-500/30 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, outcome.win * 100))}%` }}
            />
          </div>

          {/* Remaining Coins Breakdown */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Ally Wins by Remaining Coins
              </span>
              <div className="flex flex-wrap gap-1.5">
                {outcome.winByCoins.slice(1).map((prob, idx) => (
                  <span key={idx} className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
                    {idx + 1}c: {(prob * 100).toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Opponent Wins by Remaining Coins
              </span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {outcome.loseByCoins.slice(1).map((prob, idx) => (
                  <span key={idx} className="rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 font-mono text-[11px] text-red-300">
                    {idx + 1}c: {(prob * 100).toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Opponent Preset Loader */}
        <div className="space-y-1.5">
          <input
            type="text"
            placeholder="Load opponent skill from any Identity (type Sinner or Identity name)..."
            value={enemyPresetSearch}
            onChange={e => setEnemyPresetSearch(e.target.value)}
            className="w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-xs text-white outline-none focus:border-[#c9a84c]"
          />
          {matchingPresets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
              {matchingPresets.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSideB(s => ({
                      ...s,
                      label: `${item.idName} (${item.slot}: ${item.skill.nameEn || item.skill.name})`,
                      basePower: item.skill.basePower ?? 4,
                      coinPower: item.skill.coinPower ?? 4,
                      coinCount: item.skill.coinCount ?? item.skill.coins ?? 1,
                      offenseLevel: 60 + (item.skill.offenseLevel ?? 0)
                    }));
                    setEnemyPresetSearch('');
                  }}
                  className="btn-inline rounded-md border border-[#333] bg-[#181820] px-2 py-1 text-[11px] text-gray-200 hover:border-[#c9a84c] hover:text-[#c9a84c] cursor-pointer"
                >
                  <strong>{item.slot}</strong> {item.idName} — {item.skill.nameEn || item.skill.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSideControls(sideA, setSideA, '#34d399')}
          {renderSideControls(sideB, setSideB, '#f87171')}
        </div>
      </div>
    </div>
  );
}

export default function IdDetailsModal({ idData, onClose }) {
  const { identitiesData, acquiredIds, toggleAcquiredId } = useStore();
  const [currentId, setCurrentId] = useState(idData);
  const [level, setLevel] = useState(60);
  const [showKo, setShowKo] = useState(false);
  const [artTab, setArtTab] = useState(1); // 0 = Before Uptie, 1 = After Uptie
  const [artSideBySide, setArtSideBySide] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [clashSkill, setClashSkill] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setCurrentId(idData);
    setArtTab(idData?.rarity === 1 ? 0 : 1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [idData]);

  const switchIdentity = (nextId) => {
    if (!nextId) return;
    setCurrentId(nextId);
    setArtTab(nextId.rarity === 1 ? 0 : 1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const slug = currentId.slug || generateSlug(currentId.name);
  const rarity = currentId.rarity || 3;
  const hasUptiedArt = rarity > 1 && !currentId.isDummy;
  const artBeforeUrl = `https://assets.limbusdeck.com/identities/full/${slug}.webp`;
  const artAfterUrl = `https://assets.limbusdeck.com/identities/${hasUptiedArt ? 'full-uptied' : 'full'}/${slug}.webp`;
  const heroBgUrl = hasUptiedArt ? artAfterUrl : artBeforeUrl;

  const sinnerMeta = useMemo(() => {
    return (
      SINNER_META.find(s => s.id === currentId.sinnerId) ||
      SINNER_META.find(s => s.name.toLowerCase() === (currentId.sinner || '').toLowerCase()) ||
      SINNER_META[0]
    );
  }, [currentId]);

  const isAcquired = acquiredIds.has(currentId.name);
  const shardStatus = useMemo(() => getShardabilityStatus(currentId), [currentId]);
  const tactics = useMemo(() => getIdentityTactics(currentId), [currentId]);
  const tierInfo = useMemo(() => getMetaTierLabel(currentId.metaTier), [currentId.metaTier]);
  const egoLinked = useMemo(() => getEgoLinkedInfo(slug), [slug]);

  const poolImpact = useMemo(
    () => computeIdentityPoolImpact(currentId, acquiredIds, identitiesData || []),
    [currentId, acquiredIds, identitiesData]
  );

  // Scaled HP formula from LimbusDeck (mod 992418): floor(hpBase + hpGrowth * (level - 1))
  const scaledHp = useMemo(() => {
    if (currentId.hpBase && currentId.hpGrowth !== undefined) {
      return Math.floor(currentId.hpBase + currentId.hpGrowth * (level - 1));
    }
    return currentId.hp || '?';
  }, [currentId, level]);

  const hpRank = useMemo(() => getIdentityRecordRank(currentId.ldId, 'hpMax'), [currentId.ldId]);
  const speedRank = useMemo(() => getIdentityRecordRank(currentId.ldId, 'speedMax'), [currentId.ldId]);
  const powerRank = useMemo(() => getIdentityRecordRank(currentId.ldId, 'power'), [currentId.ldId]);

  const skills = currentId.ldSkills?.length ? currentId.ldSkills : (currentId.skills || []);
  const defenseSkills = currentId.ldDefenseSkills?.length
    ? currentId.ldDefenseSkills
    : (currentId.defense && typeof currentId.defense === 'object' ? [currentId.defense] : []);
  const passives = currentId.ldPassives?.length ? currentId.ldPassives : (currentId.passives || []);
  const statuses = currentId.statuses || [];

  const otherSameSinnerIdentities = useMemo(() => {
    return (identitiesData || [])
      .filter(
        i =>
          !i.isDummy &&
          i.name !== currentId.name &&
          (i.sinnerId === currentId.sinnerId || i.sinner === currentId.sinner)
      )
      .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
  }, [identitiesData, currentId]);

  const daysSinceRelease = useMemo(() => {
    if (!currentId.releaseDate) return null;
    const rel = new Date(currentId.releaseDate);
    if (isNaN(rel.getTime())) return null;
    const diff = Math.floor((Date.now() - rel.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `${diff}d ago` : `in ${-diff}d`;
  }, [currentId.releaseDate]);

  const sections = [
    { id: 'hero', label: 'Overview' },
    { id: 'pull', label: 'My Pool' },
    { id: 'art', label: 'Artwork' },
    { id: 'skills', label: `Skills (${skills.length})` },
    ...(defenseSkills.length > 0 ? [{ id: 'defense', label: 'Defense' }] : []),
    ...(passives.length > 0 ? [{ id: 'passives', label: `Passives (${passives.length})` }] : []),
    ...(statuses.length > 0 ? [{ id: 'statuses', label: `Statuses (${statuses.length})` }] : []),
    { id: 'tactics', label: 'Tactics' },
    ...(poolImpact?.containingCount > 0 || poolImpact?.commonTeammates?.length > 0
      ? [{ id: 'parties', label: 'Teams' }]
      : []),
    ...(otherSameSinnerIdentities.length > 0
      ? [{ id: 'related', label: `More ${sinnerMeta.name}` }]
      : [])
  ];

  const scrollToSection = (secId) => {
    setActiveSection(secId);
    const el = scrollContainerRef.current?.querySelector(`#modal-sec-${secId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const lightboxImages = hasUptiedArt
    ? [
        { src: artBeforeUrl, label: 'Pre-Uptie (Uptie I)' },
        { src: artAfterUrl, label: 'Uptied (Uptie III / IV)' }
      ]
    : [{ src: artBeforeUrl, label: 'Identity Artwork' }];

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 md:p-5 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-6xl w-full h-[92vh] flex flex-col bg-[#0a0a0e] border border-[#333] overflow-hidden relative shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Blurred Artwork Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 blur-3xl pointer-events-none scale-110"
          style={{ backgroundImage: `url(${heroBgUrl})` }}
        />

        {/* Sticky Top Header & Section Jump Bar */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-[#333] bg-[#0d0d12]/95 backdrop-blur-md">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
            <span className="font-bold text-gray-300">Identities</span>
            <ChevronRight size={14} className="shrink-0 text-gray-600" />
            <span className="font-bold shrink-0" style={{ color: sinnerMeta.color }}>
              {sinnerMeta.name}
            </span>
            <ChevronRight size={14} className="shrink-0 text-gray-600" />
            <span className="font-bold text-white truncate">{currentId.nameEn || currentId.name}</span>
          </div>

          {/* Section Quick-Jump Pills */}
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

          {/* Language Toggle & Close */}
          <div className="flex items-center gap-2">
            {currentId.nameKo && (
              <button
                type="button"
                onClick={() => setShowKo(v => !v)}
                className={`btn-inline px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  showKo
                    ? 'border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c]'
                    : 'border-[#333] bg-[#16161d] text-gray-300 hover:text-white'
                }`}
                title="Toggle English / Korean Skill & Passive Text"
              >
                {showKo ? '🇰🇷 한국어' : '🌐 EN / KO'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-inline w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main Scrollable LimbusDeck Detail Body */}
        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-5 py-6 sm:px-8 space-y-10"
        >
          <StatusTermsProvider statuses={statuses}>
            {/* SECTION 1: HERO & OVERVIEW (`#hero`) */}
            <section
              id="modal-sec-hero"
              className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]"
            >
              {/* Left Column: Portrait Card with Hover Uptie Preview & Jump to Art */}
              <div className="flex flex-col gap-3 self-start">
                <button
                  type="button"
                  onClick={() => scrollToSection('art')}
                  className="card-btn group relative block w-full aspect-[4/5] overflow-hidden rounded-2xl border-2 border-[#333] hover:border-[#c9a84c] bg-[#121218] transition-all cursor-pointer shadow-xl text-left"
                  title="Click to jump to full Artwork Viewer & Lightbox"
                >
                  <img
                    src={heroBgUrl}
                    alt={currentId.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-yellow-400 text-sm font-black drop-shadow-md">
                      {'★'.repeat(rarity)}
                    </span>
                    <span className="rounded-md bg-black/75 border border-white/15 px-2 py-0.5 text-[10px] font-bold text-gray-200">
                      {hasUptiedArt ? 'Uptie III/IV Art' : 'Base Art'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-200">
                    <span className="font-bold text-[#c9a84c] group-hover:underline">
                      View Pre/Post-Uptie Art &rarr;
                    </span>
                    <Maximize2 size={14} className="text-gray-300" />
                  </div>
                </button>

                {/* Acquire & Shardability Status Card */}
                <div className="rounded-xl border border-[#333] bg-[#111] p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                      Dispenser Status
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        shardStatus.shardable ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      ● {shardStatus.message}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAcquiredId(currentId.name)}
                    className={`btn-inline shrink-0 px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAcquired
                        ? 'bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.4)]'
                        : 'bg-[#1c1c24] text-white border border-white/20 hover:border-[#c9a84c]'
                    }`}
                  >
                    <CheckCircle size={14} />
                    {isAcquired ? 'Owned in Pool' : 'Add to Pool'}
                  </button>
                </div>
              </div>

              {/* Right Column: Metadata, Keywords, Traits, Interactive Level Stats & Resistances */}
              <div className="flex min-w-0 flex-col gap-4">
                <div>
                  <p className="mb-1 font-mono text-xs font-black uppercase tracking-[0.25em] text-[#c9a84c]">
                    {currentId.isWalpurgis
                      ? `Identity · Walpurgisnacht ${currentId.ldSeason || ''}`
                      : currentId.isStandard
                      ? `Identity · Standard Fare`
                      : `Identity · Season ${currentId.ldSeason ?? currentId.season ?? ''}`}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span className="text-yellow-400 font-black text-sm">
                      {'★'.repeat(rarity)}
                    </span>
                    <span className="font-bold text-white" style={{ color: sinnerMeta.color }}>
                      {sinnerMeta.name}
                    </span>
                    <span>·</span>
                    <span
                      className="rounded-md px-2 py-0.5 font-mono text-xs font-black border"
                      style={{
                        color: tierInfo.color,
                        backgroundColor: tierInfo.bg,
                        borderColor: `${tierInfo.color}55`
                      }}
                    >
                      {tierInfo.tier}
                    </span>
                    {currentId.releaseDate && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-mono text-gray-300">
                          <Calendar size={13} className="text-[#c9a84c]" />
                          {currentId.releaseDate}
                          {daysSinceRelease && (
                            <span className="text-gray-400">({daysSinceRelease})</span>
                          )}
                        </span>
                      </>
                    )}
                    {powerRank && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                          <Award size={12} />#{powerRank.rank} Max Power ({powerRank.value})
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                    {showKo && currentId.nameKo ? currentId.nameKo : (currentId.nameEn || currentId.name)}
                  </h1>
                  {(currentId.nameKo || currentId.nameJa) && (
                    <p className="mt-1 text-xs text-gray-400 font-medium">
                      {[currentId.nameKo, currentId.nameJa].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                {/* Keywords & EGO-Linked Keywords */}
                {((currentId.keywords && currentId.keywords.length > 0) || egoLinked) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(currentId.keywords || []).map(kw => {
                      const color = LD_KEYWORD_COLORS[kw.toLowerCase()] || '#c9a84c';
                      return (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border shadow-sm"
                          style={{
                            color,
                            borderColor: `${color}66`,
                            backgroundColor: `${color}1a`
                          }}
                        >
                          <span>●</span> {kw}
                        </span>
                      );
                    })}

                    {egoLinked && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#c9a84c]/60 bg-[#c9a84c]/10 px-3 py-1 text-xs font-semibold text-gray-200"
                        title="Keyword unlocked when paired with linked E.G.O"
                      >
                        <span className="text-[#c9a84c]">E.G.O Link · {egoLinked.viaEn}:</span>
                        {egoLinked.keywords.map(k => (
                          <span
                            key={k}
                            className="font-bold uppercase"
                            style={{ color: LD_KEYWORD_COLORS[k] || '#fff' }}
                          >
                            {k}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                )}

                {/* Traits / Factions Row */}
                {currentId.traits && currentId.traits.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-xs font-black uppercase tracking-wider text-[#c9a84c]">
                      Traits:
                    </span>
                    {currentId.traits.map(tr => (
                      <span
                        key={tr}
                        className="inline-flex h-6 items-center rounded-full bg-[#181820] border border-[#333] px-2.5 text-xs font-semibold text-gray-300"
                      >
                        {getTraitLabel(tr)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive Level 1–60 Stat Scaler & 4-Stat Grid */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                      Combat Stats (Lv. {level})
                    </span>
                    {currentId.hpBase && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 font-mono">Lv 1</span>
                        <input
                          type="range"
                          min={1}
                          max={60}
                          value={level}
                          onChange={e => setLevel(Number(e.target.value))}
                          className="w-28 accent-[#c9a84c] cursor-pointer"
                        />
                        <span className="text-[#c9a84c] font-mono font-bold">Lv 60</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* HP Box */}
                    <div className="rounded-xl border border-[#333] bg-[#111] px-3.5 py-3">
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Heart className="size-3.5 text-emerald-400 shrink-0" /> HP
                      </p>
                      <p className="font-mono text-xl font-black text-white tabular-nums mt-0.5">
                        {scaledHp}
                      </p>
                      {hpRank && (
                        <p className="text-[11px] font-semibold text-[#c9a84c] mt-0.5">
                          Rank #{hpRank.rank} / {hpRank.total}
                        </p>
                      )}
                    </div>

                    {/* Speed Box */}
                    <div className="rounded-xl border border-[#333] bg-[#111] px-3.5 py-3">
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Zap className="size-3.5 text-amber-400 shrink-0" /> Speed
                      </p>
                      <p className="font-mono text-xl font-black text-white tabular-nums mt-0.5">
                        {currentId.minSpeed && currentId.maxSpeed
                          ? `${currentId.minSpeed}~${currentId.maxSpeed}`
                          : currentId.speed || '?'}
                      </p>
                      {speedRank && (
                        <p className="text-[11px] font-semibold text-[#c9a84c] mt-0.5">
                          Rank #{speedRank.rank} / {speedRank.total}
                        </p>
                      )}
                    </div>

                    {/* Defense Type Box */}
                    <div className="rounded-xl border border-[#333] bg-[#111] px-3.5 py-3">
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Shield className="size-3.5 text-sky-400 shrink-0" /> Defense
                      </p>
                      <p className="text-base font-black text-white capitalize mt-0.5">
                        {defenseSkills[0]?.attackType || defenseSkills[0]?.type || 'Guard'}
                        {currentId.defenseLevel !== undefined && (
                          <span className="ml-1.5 text-xs font-mono text-gray-400">
                            ({currentId.defenseLevel >= 0 ? `+${currentId.defenseLevel}` : currentId.defenseLevel})
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Defense Sin Box */}
                    <div className="rounded-xl border border-[#333] bg-[#111] px-3.5 py-3">
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <span
                          className="size-3 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              LD_SIN_COLORS[(defenseSkills[0]?.sin || defenseSkills[0]?.affinity || '').toLowerCase()] ||
                              '#6b7280'
                          }}
                        />
                        Defense Sin
                      </p>
                      <div className="mt-1">
                        {defenseSkills[0]?.sin || defenseSkills[0]?.affinity ? (
                          <SinBadge sin={defenseSkills[0].sin || defenseSkills[0].affinity} />
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resistances & Stagger Thresholds */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-300">
                    Physical Resistances & Stagger
                  </h3>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['slash', 'pierce', 'blunt'].map(atk => {
                      const resKey = currentId.resistances?.[atk] || 'normal';
                      const style = RESISTANCE_STYLES[resKey] || RESISTANCE_STYLES.normal;
                      return (
                        <div
                          key={atk}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-xl border border-[#333] bg-[#111] px-3 py-2.5 text-xs"
                        >
                          <span className="font-bold text-gray-200 capitalize">{atk}</span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${style.cls}`}
                          >
                            {style.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {currentId.staggerThresholds && currentId.staggerThresholds.length > 0 && (
                    <div className="flex items-center justify-between rounded-xl border border-[#333] bg-[#111] px-3.5 py-2.5 text-xs">
                      <span className="font-bold text-gray-300">
                        Stagger Thresholds ({currentId.staggerThresholds.length}×)
                      </span>
                      <span className="font-mono text-sm font-black text-[#c9a84c]">
                        {currentId.staggerThresholds.join('% / ')}% HP
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: "BASED ON MY POOL" IMPACT (`#pull`) */}
            {poolImpact && (
              <section
                id="modal-sec-pull"
                className="scroll-mt-20 rounded-2xl border border-[#333] bg-[#111] overflow-hidden shadow-lg"
              >
                <div className="px-5 py-4 border-b border-[#333] flex flex-wrap items-center justify-between gap-2 bg-[#15151c]">
                  <div>
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#c9a84c] block">
                      My Pool Diagnostics
                    </span>
                    <h2 className="text-lg font-black text-white">
                      Based on My Roster ({isAcquired ? 'Currently Owned' : 'If Dispensed / Pulled'})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {poolImpact.readyAfter > 0 && (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 font-bold text-emerald-300">
                        {poolImpact.readyAfter} Ready Meta {poolImpact.readyAfter === 1 ? 'Team' : 'Teams'}
                      </span>
                    )}
                    {poolImpact.oneShortCount > 0 && (
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/40 px-3 py-1 font-bold text-amber-300">
                        {poolImpact.oneShortCount} One-Short {poolImpact.oneShortCount === 1 ? 'Team' : 'Teams'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2a2a35]">
                  {/* Col 1: Keyword Decks */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                      Archetype Decks Enabled
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(currentId.keywords || []).length > 0 ? (
                        (currentId.keywords || []).map(kw => {
                          const color = LD_KEYWORD_COLORS[kw.toLowerCase()] || '#c9a84c';
                          return (
                            <span
                              key={kw}
                              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold"
                              style={{ color, borderColor: `${color}55`, backgroundColor: `${color}15` }}
                            >
                              ● {kw} Deck
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-500">Generalist / Raw Power Unit</span>
                      )}
                      {(currentId.keywords || []).length >= 2 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a84c]/50 bg-[#c9a84c]/15 px-3 py-1 text-xs font-bold text-[#c9a84c]">
                          ✦ {currentId.keywords.slice(0, 2).join(' · ')} Hybrid
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Recommended Parties Readiness */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Recommended Teams
                      </h3>
                      <span className="text-xs font-mono text-gray-400">
                        In {poolImpact.containingCount} builds
                      </span>
                    </div>
                    {poolImpact.containingCount === 0 ? (
                      <p className="text-xs text-gray-500 pt-1">Not required in curated meta presets.</p>
                    ) : (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Ready Teams (All Owned):</span>
                          <strong className="font-mono text-emerald-400">
                            {poolImpact.readyBefore} &rarr; {poolImpact.readyAfter}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">1 Short (6/7 Owned):</span>
                          <strong className="font-mono text-amber-400">{poolImpact.oneShortCount}</strong>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {poolImpact.partyChanges.slice(0, 3).map(({ party, status, owned, total }) => (
                            <span
                              key={party.id}
                              onClick={() => scrollToSection('parties')}
                              className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-[#333] bg-[#181820] px-2 py-0.5 text-[11px] hover:border-[#c9a84c]"
                            >
                              <span
                                className={`rounded-full px-1.5 text-[9px] font-black uppercase ${
                                  status === 'complete'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : status === 'near'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-white/10 text-gray-400'
                                }`}
                              >
                                {owned}/{total}
                              </span>
                              <span className="truncate max-w-[120px] text-gray-200">
                                {party.nameEn || party.name}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Col 3: Sinner & Faction Collection Progress */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                      {sinnerMeta.name} & Faction Set
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{sinnerMeta.name} Owned:</span>
                        <strong className="font-mono text-white">
                          {poolImpact.sinnerStats.owned}/{poolImpact.sinnerStats.total}{' '}
                          <span className="text-[#c9a84c]">
                            (★★★ {poolImpact.sinnerStats.threeStarOwned}/{poolImpact.sinnerStats.threeStarTotal})
                          </span>
                        </strong>
                      </div>

                      {poolImpact.traitSet && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-300 truncate">{poolImpact.traitSet.traitName} Set:</span>
                            <strong className="font-mono text-[#c9a84c]">
                              {poolImpact.traitSet.owned}/{poolImpact.traitSet.total}
                            </strong>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#1c1c24] overflow-hidden">
                            <div
                              className="h-full bg-[#c9a84c] transition-all"
                              style={{
                                width: `${
                                  poolImpact.traitSet.total > 0
                                    ? (poolImpact.traitSet.owned / poolImpact.traitSet.total) * 100
                                    : 0
                                }%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: ARTWORK VIEWER & LIGHTBOX (`#art`) */}
            <section id="modal-sec-art" className="scroll-mt-20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333] pb-2">
                <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c]">
                  Illustration & Uptie Artwork
                </h2>

                <div className="flex items-center gap-2">
                  {hasUptiedArt && !artSideBySide && (
                    <div className="inline-flex rounded-lg bg-[#16161d] p-1 border border-[#333]">
                      <button
                        type="button"
                        onClick={() => setArtTab(0)}
                        className={`btn-inline px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          artTab === 0 ? 'bg-[#c9a84c] text-black' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Pre-Uptie (I)
                      </button>
                      <button
                        type="button"
                        onClick={() => setArtTab(1)}
                        className={`btn-inline px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          artTab === 1 ? 'bg-[#c9a84c] text-black' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Uptied (III / IV)
                      </button>
                    </div>
                  )}

                  {hasUptiedArt && (
                    <button
                      type="button"
                      onClick={() => setArtSideBySide(v => !v)}
                      className={`btn-inline inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        artSideBySide
                          ? 'border-[#c9a84c] bg-[#c9a84c] text-black'
                          : 'border-[#333] bg-[#16161d] text-gray-300 hover:text-white'
                      }`}
                    >
                      <Columns size={14} />
                      Side-by-Side
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setLightboxIndex(artSideBySide ? 0 : artTab)}
                    className="btn-inline inline-flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#16161d] px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:border-[#c9a84c] transition-colors cursor-pointer"
                  >
                    <Maximize2 size={14} />
                    Enlarge
                  </button>
                </div>
              </div>

              {artSideBySide && hasUptiedArt ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[
                    { src: artBeforeUrl, label: 'Pre-Uptie (Uptie I)', idx: 0 },
                    { src: artAfterUrl, label: 'Uptied (Uptie III / IV)', idx: 1 }
                  ].map(item => (
                    <figure key={item.idx} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(item.idx)}
                        className="card-btn relative block aspect-video w-full overflow-hidden rounded-2xl border border-[#333] bg-[#0d0d12] hover:border-[#c9a84c] transition-colors cursor-pointer"
                      >
                        <img
                          src={item.src}
                          alt={item.label}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </button>
                      <figcaption className="text-center text-xs text-gray-400 font-semibold">
                        {item.label}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(artTab)}
                  className="card-btn relative block aspect-video w-full overflow-hidden rounded-2xl border border-[#333] bg-[#0d0d12] hover:border-[#c9a84c] transition-colors cursor-pointer"
                >
                  <img
                    src={artTab === 1 && hasUptiedArt ? artAfterUrl : artBeforeUrl}
                    alt={currentId.name}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-black/75 border border-white/15 px-2.5 py-1 text-xs font-bold text-white">
                    {artTab === 1 && hasUptiedArt ? 'Uptied (Uptie III / IV)' : 'Pre-Uptie (Uptie I)'}
                  </span>
                </button>
              )}
            </section>

            {/* SECTION 4: SKILLS (`#skills`) */}
            <section id="modal-sec-skills" className="scroll-mt-20 space-y-3">
              <div className="flex items-center justify-between border-b border-[#333] pb-2">
                <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
                  <Swords size={18} /> Combat Skills ({skills.length})
                </h2>
                <span className="text-xs text-gray-400">
                  Click any dotted status name for tooltip · Click "Clash Calc" to simulate
                </span>
              </div>

              {skills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#333] p-6 text-center text-sm text-gray-500">
                  Skill data pending release sync.
                </div>
              ) : (
                <div className="grid gap-3.5">
                  {skills.map((sk, idx) => (
                    <LimbusDeckSkillCard
                      key={idx}
                      skill={sk}
                      index={idx}
                      showKo={showKo}
                      onOpenClashCalc={skillObj => setClashSkill(skillObj)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 5: DEFENSE SKILLS (`#defense`) */}
            {defenseSkills.length > 0 && (
              <section id="modal-sec-defense" className="scroll-mt-20 space-y-3">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
                    <Shield size={18} /> Defense Skills ({defenseSkills.length})
                  </h2>
                </div>
                <div className="grid gap-3.5">
                  {defenseSkills.map((df, idx) => (
                    <LimbusDeckSkillCard
                      key={idx}
                      skill={df}
                      index={idx}
                      isDefense={true}
                      showKo={showKo}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 6: PASSIVES (`#passives`) */}
            {passives.length > 0 && (
              <section id="modal-sec-passives" className="scroll-mt-20 space-y-3">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
                    <Layers size={18} /> Combat & Support Passives ({passives.length})
                  </h2>
                </div>
                <div className="grid gap-3.5 md:grid-cols-2">
                  {passives.map((pas, idx) => (
                    <LimbusDeckPassiveCard key={idx} passive={pas} showKo={showKo} />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 7: STATUSES & MECHANICS GLOSSARY (`#statuses`) */}
            <StatusSection statuses={statuses} id="modal-sec-statuses" />

            {/* SECTION 8: TACTICAL DOSSIER & TURN ROTATION (`#tactics`) */}
            {tactics && (
              <section id="modal-sec-tactics" className="scroll-mt-20 space-y-4">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c]">
                    ⚔️ Tactical Playbook & Turn Rotation
                  </h2>
                  <span className="text-xs text-gray-400 font-mono">
                    Role: <strong className="text-white">{tactics.role}</strong>
                  </span>
                </div>

                {tactics.hazardAlert && (
                  <div className="p-4 rounded-xl border border-red-500/60 bg-red-950/30 flex items-start gap-3">
                    <span className="text-xl shrink-0">⚠️</span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-red-400 block">
                        Critical Combat Warning ({tactics.hazardAlert.badge})
                      </span>
                      <p className="text-xs text-red-200/90 mt-0.5 leading-relaxed">
                        {tactics.hazardAlert.message}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {[
                    { step: 1, title: 'Turn 1: Opener', text: tactics.combatRotation.opener },
                    { step: 2, title: 'Mid-Fight: Clash & Engine', text: tactics.combatRotation.midGame },
                    { step: 3, title: 'Finisher: Win Condition', text: tactics.combatRotation.finisher }
                  ].map(rot => (
                    <div key={rot.step} className="rounded-xl border border-[#333] bg-[#111] p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/50 text-[#c9a84c] text-xs font-black flex items-center justify-center">
                          {rot.step}
                        </span>
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          {rot.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{rot.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 9: COMMON TEAMMATES & RECOMMENDED META TEAMS (`#parties`) */}
            {poolImpact && (poolImpact.commonTeammates.length > 0 || poolImpact.partyChanges.length > 0) && (
              <section id="modal-sec-parties" className="scroll-mt-20 space-y-6">
                {poolImpact.commonTeammates.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#333] pb-2">
                      <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
                        <Users size={18} /> Common Teammates (Synergy Partners)
                      </h2>
                      <span className="text-xs text-gray-400">Click any teammate to inspect</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {poolImpact.commonTeammates.map(({ identity: partner, rate }) => {
                        const partnerOwned = partner.rarity === 1 || acquiredIds.has(partner.name);
                        const pSlug = partner.slug || generateSlug(partner.name);
                        return (
                          <button
                            key={partner.name}
                            type="button"
                            onClick={() => switchIdentity(partner)}
                            className="card-btn flex items-center gap-3 rounded-xl border border-[#333] bg-[#111] p-3 hover:border-[#c9a84c] transition-all text-left cursor-pointer"
                          >
                            <img
                              src={`https://assets.limbusdeck.com/identities/thumbnail/${pSlug}.webp`}
                              onError={e => {
                                e.currentTarget.src = `https://assets.limbusdeck.com/identities/full/${pSlug}.webp`;
                              }}
                              alt={partner.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#333]"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-white truncate">
                                  {partner.nameEn || partner.name}
                                </span>
                                {partnerOwned && (
                                  <span className="text-[10px] font-bold text-emerald-400 shrink-0">✓ Owned</span>
                                )}
                              </div>
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="h-1.5 flex-1 rounded-full bg-[#222] overflow-hidden">
                                  <div
                                    className="h-full bg-[#c9a84c]"
                                    style={{ width: `${Math.min(100, rate)}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs font-bold text-[#c9a84c] shrink-0">
                                  {rate}%
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {poolImpact.partyChanges.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#333] pb-2">
                      <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c]">
                        Recommended Meta Teams Featuring This Identity ({poolImpact.partyChanges.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {poolImpact.partyChanges.map(({ party, status, owned, total, missingMembers }) => (
                        <div
                          key={party.id}
                          className="rounded-xl border border-[#333] bg-[#111] p-4 flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="text-sm font-black text-white">
                                {party.nameEn || party.nameKo}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                                  status === 'complete'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                    : status === 'near'
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                    : 'bg-white/10 text-gray-300 border-white/20'
                                }`}
                              >
                                {status === 'complete'
                                  ? `✓ Ready (${owned}/${total})`
                                  : status === 'near'
                                  ? `1 Short (${owned}/${total})`
                                  : `${owned}/${total} Owned`}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {party.descriptionEn || party.descriptionKo}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                            <div className="flex flex-wrap gap-1">
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
                            {party.youtubeUrl && (
                              <a
                                href={party.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#c9a84c] hover:underline"
                              >
                                Video Guide <ExternalLink size={12} />
                              </a>
                            )}
                          </div>

                          {missingMembers && missingMembers.length > 0 && (
                            <p className="text-[11px] text-amber-300/90">
                              Missing: {missingMembers.map(m => m.nameEn || m.name).join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* SECTION 10: OTHER IDENTITIES OF THE SAME SINNER (`#related`) */}
            {otherSameSinnerIdentities.length > 0 && (
              <section id="modal-sec-related" className="scroll-mt-20 space-y-3 pb-4">
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                  <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c]">
                    Other Identities of {sinnerMeta.name} ({otherSameSinnerIdentities.length})
                  </h2>
                  <span className="text-xs text-gray-400">Click any card to switch dossier</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {otherSameSinnerIdentities.map(other => {
                    const oSlug = other.slug || generateSlug(other.name);
                    const oOwned = other.rarity === 1 || acquiredIds.has(other.name);
                    return (
                      <button
                        key={other.name}
                        type="button"
                        onClick={() => switchIdentity(other)}
                        className={`card-btn group relative aspect-[5/6] overflow-hidden rounded-xl border-2 text-left transition-all cursor-pointer ${
                          oOwned
                            ? 'border-[#c9a84c]/70 hover:border-[#c9a84c]'
                            : 'border-[#333] opacity-80 hover:opacity-100 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={`https://assets.limbusdeck.com/identities/${other.rarity === 1 ? 'full' : 'full-uptied'}/${oSlug}.webp`}
                          onError={e => {
                            e.currentTarget.src = `https://assets.limbusdeck.com/identities/full/${oSlug}.webp`;
                          }}
                          alt={other.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                          <span className="text-yellow-400 text-xs font-black">
                            {'★'.repeat(other.rarity || 1)}
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

        {/* Fullscreen Lightbox Overlay */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/95 flex flex-col items-center justify-center p-4"
              onClick={() => setLightboxIndex(null)}
            >
              <div
                className="flex items-center justify-between w-full max-w-5xl mb-3"
                onClick={e => e.stopPropagation()}
              >
                <span className="text-sm font-bold text-white">
                  {currentId.nameEn || currentId.name} — {lightboxImages[lightboxIndex]?.label}
                </span>
                <div className="flex items-center gap-2">
                  {lightboxImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(i => (i === 0 ? 1 : 0))}
                        className="btn-inline px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={14} /> Switch Pre / Post-Uptie <ChevronRight size={14} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(null)}
                    className="btn-inline px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-xs font-bold text-white cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
              <img
                src={lightboxImages[lightboxIndex]?.src}
                alt={currentId.name}
                className="max-h-[82vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Built-in Markov-Chain Clash Simulator Drawer */}
        {clashSkill && (
          <QuickClashDrawer
            initialSkill={clashSkill}
            identityName={currentId.nameEn || currentId.name}
            allIdentities={identitiesData}
            onClose={() => setClashSkill(null)}
          />
        )}
      </motion.div>
    </div>
  );
}
