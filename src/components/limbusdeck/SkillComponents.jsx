// src/components/limbusdeck/SkillComponents.jsx
// Exact port of LimbusDeck's Skill Card (mod 829968), CoinEffects (mod 715704),
// Bracket Tag Parser (mod 524663), and StatusTermsProvider / StatusSection (mod 626587).

import React, { createContext, useContext, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Coins, Shield, Calculator, Sparkles } from 'lucide-react';
import {
  LD_SIN_COLORS,
  LD_KEYWORD_COLORS,
  splitEffectSegments,
  getBracketColor
} from '../../utils/limbusDeckEngine.js';

// --- Keyword Color Highlighter (LimbusDeck mod 715704 `v` & `y`) ---
const HIGHLIGHT_PATTERNS = [
  { pattern: 'Burn', color: LD_KEYWORD_COLORS.burn },
  { pattern: '화상', color: LD_KEYWORD_COLORS.burn },
  { pattern: 'Bleed', color: LD_KEYWORD_COLORS.bleed },
  { pattern: '출혈', color: LD_KEYWORD_COLORS.bleed },
  { pattern: 'Tremor Burst', color: LD_KEYWORD_COLORS.tremor },
  { pattern: 'Tremor', color: LD_KEYWORD_COLORS.tremor },
  { pattern: '진동', color: LD_KEYWORD_COLORS.tremor },
  { pattern: 'Rupture', color: LD_KEYWORD_COLORS.rupture },
  { pattern: '파열', color: LD_KEYWORD_COLORS.rupture },
  { pattern: 'Sinking', color: LD_KEYWORD_COLORS.sinking },
  { pattern: '침잠', color: LD_KEYWORD_COLORS.sinking },
  { pattern: 'Poise', color: LD_KEYWORD_COLORS.poise },
  { pattern: '호흡', color: LD_KEYWORD_COLORS.poise },
  { pattern: 'Charge', color: LD_KEYWORD_COLORS.charge },
  { pattern: '충전', color: LD_KEYWORD_COLORS.charge },
  { pattern: 'Fanatic', color: '#f97316' },
  { pattern: '광전', color: '#f97316' },
  { pattern: 'Voltaic Conduit', color: LD_KEYWORD_COLORS.charge },
  { pattern: 'Unbreakable Coin', color: '#f59e0b' },
  { pattern: 'Unbreakable', color: '#f59e0b' },
  { pattern: '파괴 불가', color: '#f59e0b' },
  { pattern: 'Clash Power', color: '#a78bfa' },
  { pattern: 'Base Power', color: '#a78bfa' },
  { pattern: 'Coin Power', color: '#a78bfa' },
  { pattern: 'Final Power', color: '#a78bfa' },
  { pattern: 'Aggro', color: '#fb923c' },
  { pattern: '도발치', color: '#fb923c' }
].sort((a, b) => b.pattern.length - a.pattern.length);

const HIGHLIGHT_REGEX = new RegExp(
  `(${HIGHLIGHT_PATTERNS.map(p => p.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'g'
);
const HIGHLIGHT_MAP = new Map(HIGHLIGHT_PATTERNS.map(p => [p.pattern, p.color]));

export function highlightGameKeywords(text) {
  if (!text || typeof text !== 'string') return text;
  const parts = text.split(HIGHLIGHT_REGEX);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const color = HIGHLIGHT_MAP.get(part);
    if (color) {
      return (
        <span key={i} className="font-semibold" style={{ color }}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// --- StatusTermsProvider & Interactive Popover Tooltip (LimbusDeck mod 626587) ---
const StatusTermsContext = createContext(null);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function StatusTermsProvider({ statuses = [], emphasizeUnique = true, children }) {
  const splitFn = useMemo(() => {
    const map = new Map();
    for (const s of statuses) {
      if (s && s.name && s.name.trim().length >= 2 && !map.has(s.name)) {
        map.set(s.name, s);
      }
    }
    if (map.size === 0) return null;
    const sortedNames = Array.from(map.keys()).sort((a, b) => b.length - a.length).map(escapeRegex);
    const re = new RegExp(`(?<![A-Za-z])(${sortedNames.join('|')})(?![A-Za-z])`, 'g');

    return (text) => {
      if (!text || typeof text !== 'string') return [text];
      const result = [];
      let lastIndex = 0;
      for (const match of text.matchAll(re)) {
        const matchedName = match[1];
        const statusObj = map.get(matchedName);
        if (statusObj) {
          if (match.index > lastIndex) {
            result.push(text.slice(lastIndex, match.index));
          }
          result.push({ status: statusObj, text: matchedName });
          lastIndex = match.index + matchedName.length;
        }
      }
      if (lastIndex === 0) return [text];
      if (lastIndex < text.length) result.push(text.slice(lastIndex));
      return result;
    };
  }, [statuses]);

  const [active, setActive] = useState(null); // { status, rect, termId, pinned }
  const closeTimerRef = useRef(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActive(prev => (prev && !prev.pinned ? null : prev));
    }, 150);
  }, []);

  const peek = useCallback((status, el, termId) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setActive(prev => (prev?.termId === termId ? prev : { status, rect, termId, pinned: false }));
  }, []);

  const toggle = useCallback((status, el, termId) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setActive(prev =>
      prev?.termId === termId && prev.pinned ? null : { status, rect, termId, pinned: true }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const ctxValue = useMemo(
    () => ({ split: splitFn, emphasizeUnique, active, peek, toggle, scheduleClose, cancelClose }),
    [splitFn, emphasizeUnique, active, peek, toggle, scheduleClose, cancelClose]
  );

  // Compute floating popover position
  const popoverPortal = active && typeof document !== 'undefined'
    ? createPortal(
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'fixed',
            top: Math.min(window.innerHeight - 220, active.rect.bottom + 8),
            left: Math.max(12, Math.min(window.innerWidth - 332, active.rect.left)),
            zIndex: 9999
          }}
          className="w-80 max-w-[calc(100vw-24px)] max-h-72 overflow-y-auto rounded-xl border border-[#c9a84c]/50 bg-[#0d0d12]/95 backdrop-blur-md p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-left"
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/10">
            <span className="text-sm font-bold text-white leading-snug">
              { highlightGameKeywords(active.status.name) }
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border ${
                active.status.unique
                  ? 'bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/40'
                  : 'bg-white/10 text-gray-300 border-white/20'
              }`}
            >
              {active.status.unique ? 'Unique Status' : 'Status'}
            </span>
          </div>
          <p className="whitespace-pre-line text-xs leading-relaxed text-gray-300">
            {highlightGameKeywords(active.status.desc)}
          </p>
        </div>,
        document.body
      )
    : null;

  return (
    <StatusTermsContext.Provider value={ctxValue}>
      {children}
      {popoverPortal}
    </StatusTermsContext.Provider>
  );
}

export function StatusTerm({ status, children }) {
  const ctx = useContext(StatusTermsContext);
  const termId = useRef(`st-${Math.random().toString(36).slice(2, 9)}`).current;
  const isOpen = ctx?.active?.termId === termId;
  const emphasize = ctx?.emphasizeUnique !== false;

  return (
    <span
      role="button"
      tabIndex={0}
      onMouseEnter={e => ctx?.peek(status, e.currentTarget, termId)}
      onMouseLeave={() => ctx?.scheduleClose()}
      onClick={e => {
        e.stopPropagation();
        ctx?.toggle(status, e.currentTarget, termId);
      }}
      className={`cursor-pointer rounded-sm underline decoration-current/55 decoration-dotted decoration-[1.5px] underline-offset-[3px] transition-colors hover:decoration-solid hover:text-[#c9a84c] ${
        emphasize && status.unique ? 'font-bold text-white' : ''
      } ${isOpen ? 'decoration-solid text-[#c9a84c]' : ''}`}
    >
      {children}
    </span>
  );
}

export function StatusText({ text }) {
  const ctx = useContext(StatusTermsContext);
  if (!text) return null;
  if (!ctx?.split) {
    return <>{highlightGameKeywords(text)}</>;
  }
  const parts = ctx.split(text);
  return (
    <>
      {parts.map((part, idx) =>
        typeof part === 'string' ? (
          <span key={idx}>{highlightGameKeywords(part)}</span>
        ) : (
          <StatusTerm key={idx} status={part.status}>
            {highlightGameKeywords(part.text)}
          </StatusTerm>
        )
      )}
    </>
  );
}

export function StatusChipButton({ status }) {
  const ctx = useContext(StatusTermsContext);
  const termId = useRef(`chip-${status.tag || status.name}`).current;
  const isOpen = ctx?.active?.termId === termId;

  return (
    <button
      type="button"
      onMouseEnter={e => ctx?.peek(status, e.currentTarget, termId)}
      onMouseLeave={() => ctx?.scheduleClose()}
      onClick={e => {
        e.stopPropagation();
        ctx?.toggle(status, e.currentTarget, termId);
      }}
      className={`btn-inline inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all cursor-pointer ${
        isOpen
          ? 'border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c]'
          : 'border-[#333] bg-[#141418] text-gray-200 hover:border-[#c9a84c]/60 hover:bg-[#1c1c22]'
      }`}
    >
      <span className="truncate">{highlightGameKeywords(status.name)}</span>
    </button>
  );
}

export function StatusSection({ statuses = [], id = 'statuses' }) {
  if (!statuses || statuses.length === 0) return null;
  const uniqueStatuses = statuses.filter(s => s.unique);
  const standardStatuses = statuses.filter(s => !s.unique);

  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between border-b border-[#333] pb-2">
        <h2 className="text-lg font-black uppercase tracking-wider text-[#c9a84c] flex items-center gap-2">
          <Sparkles size={18} /> Statuses & Mechanics ({statuses.length})
        </h2>
        <span className="text-xs text-gray-400">Hover or click any status in skills to inspect</span>
      </div>

      {uniqueStatuses.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-gray-400">
            Unique Statuses ({uniqueStatuses.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {uniqueStatuses.map(st => (
              <article
                key={st.tag || st.name}
                className="min-w-0 rounded-xl border border-[#333] bg-[#111] p-4 shadow-md hover:border-[#c9a84c]/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-white/5">
                  <h4 className="text-sm font-black text-white leading-snug">
                    {highlightGameKeywords(st.name)}
                  </h4>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/30 shrink-0">
                    Unique
                  </span>
                </div>
                <p className="whitespace-pre-line text-xs leading-relaxed text-gray-300">
                  <StatusText text={st.desc} />
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {standardStatuses.length > 0 && (
        <div className={uniqueStatuses.length > 0 ? 'pt-2' : ''}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            Other Statuses ({standardStatuses.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {standardStatuses.map(st => (
              <StatusChipButton key={st.tag || st.name} status={st} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// --- CoinEffects Component (LimbusDeck mod 715704) ---
function PreRollEffectRow({ effect }) {
  const segments = splitEffectSegments(effect);
  if (segments.length === 0) return null;
  return (
    <div className="flex gap-2 text-xs leading-relaxed">
      <span className="text-[#c9a84c]/80 select-none shrink-0 w-5 flex justify-end pt-1" title="Skill / Pre-Roll Effect">
        <Coins className="h-3.5 w-3.5" />
      </span>
      <span className="text-gray-200 flex-1">
        {segments.map((seg, idx) => (
          <span key={idx}>
            {idx > 0 && <br />}
            {seg.prefix && (
              <span
                className="font-bold mr-1"
                style={{ color: getBracketColor(seg.prefix) }}
              >
                {seg.prefix}
              </span>
            )}
            <StatusText text={seg.text} />
          </span>
        ))}
      </span>
    </div>
  );
}

function CoinNumberEffectRow({ effect, coinNumber }) {
  const segments = splitEffectSegments(effect);
  if (segments.length === 0) return null;
  return (
    <div className="flex gap-2 text-xs leading-relaxed">
      <span className="text-[#c9a84c] font-bold font-mono select-none shrink-0 w-5 text-right">
        {coinNumber}.
      </span>
      <span className="text-gray-200 flex-1">
        {segments.map((seg, idx) => (
          <span key={idx}>
            {idx > 0 && <br />}
            {seg.prefix && (
              <span
                className="font-bold mr-1"
                style={{ color: getBracketColor(seg.prefix) }}
              >
                {seg.prefix}
              </span>
            )}
            <StatusText text={seg.text} />
          </span>
        ))}
      </span>
    </div>
  );
}

export function CoinEffects({ effects = [] }) {
  if (!effects || effects.length === 0) return null;
  const hasAny = effects.some(e => e && String(e).trim().length > 0);
  if (!hasAny) return null;

  const preRoll = effects[0];
  const perCoin = effects.slice(1);

  return (
    <div className="space-y-1.5">
      {preRoll && String(preRoll).trim() && <PreRollEffectRow effect={String(preRoll)} />}
      {perCoin.map((eff, i) =>
        eff && String(eff).trim() ? (
          <CoinNumberEffectRow key={i} effect={String(eff)} coinNumber={i + 1} />
        ) : null
      )}
    </div>
  );
}

// --- Visual Coin Dots & Badges (LimbusDeck mod 829968) ---
export function CoinDots({ count = 1, negative = false }) {
  const safeCount = Math.max(1, Math.min(12, Number(count) || 1));
  return (
    <span className="inline-flex items-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: safeCount }).map((_, i) => (
        <span
          key={i}
          className={`size-2.5 rounded-full ${
            negative
              ? 'bg-red-500 shadow-[inset_0_-2px_0_rgba(0,0,0,0.35)]'
              : 'bg-[#eab308] shadow-[inset_0_-2px_0_rgba(0,0,0,0.35)]'
          }`}
        />
      ))}
    </span>
  );
}

export function SinBadge({ sin, className = '' }) {
  if (!sin) return null;
  const color = LD_SIN_COLORS[sin] || LD_SIN_COLORS[sin.toLowerCase()] || '#6b7280';
  const label = sin.charAt(0).toUpperCase() + sin.slice(1).toLowerCase();
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-md px-2 text-xs font-bold text-white shadow-sm ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

const ROLE_LABELS = {
  inflict: 'Inflict',
  consume: 'Consume',
  boost: 'Boost'
};

export function KeywordRoleBadge({ keyword, role }) {
  if (!keyword) return null;
  const capKw = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
  const color = LD_KEYWORD_COLORS[keyword.toLowerCase()] || '#c9a84c';
  const roleLabel = ROLE_LABELS[role] || role;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border"
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}18`
      }}
    >
      <span>●</span>
      <span>{capKw}</span>
      {roleLabel && <span className="opacity-80 font-medium">({roleLabel})</span>}
    </span>
  );
}

// --- LimbusDeckSkillCard (Exact Port of `sc` in 3u3bm5ir4bed9.js) ---
export function LimbusDeckSkillCard({
  skill,
  index = 0,
  isDefense = false,
  showKo = false,
  onOpenClashCalc = null
}) {
  if (!skill) return null;

  const sinKey = (skill.sin || skill.affinity || '').toLowerCase();
  const sinColor = LD_SIN_COLORS[sinKey] || '#6b7280';
  const nameEn = skill.nameEn || skill.name || 'Unknown Skill';
  const nameKo = skill.nameKo || '';
  const attackType = skill.attackType || skill.type || (isDefense ? 'Guard' : 'Slash');
  const capAttackType = attackType.charAt(0).toUpperCase() + attackType.slice(1).toLowerCase();

  const basePower = skill.basePower ?? 0;
  const coinPower = skill.coinPower ?? 0;
  const coinCount = skill.coinCount ?? skill.coins ?? 1;
  const totalMax = basePower + coinCount * coinPower;
  const targetCount = skill.targetCount ?? (isDefense ? 0 : index === 0 ? 3 : index === 1 ? 2 : 1);
  const offenseLevel = skill.offenseLevel;
  const atkWeight = skill.atkWeight || 1;

  const coinEffects = useMemo(() => {
    if (showKo && skill.coinEffectsKo && skill.coinEffectsKo.length > 0) {
      return skill.coinEffectsKo;
    }
    if (skill.coinEffects && skill.coinEffects.length > 0) {
      return skill.coinEffects;
    }
    return skill.effects || [];
  }, [skill, showKo]);

  const variants = skill.variants || [];

  return (
    <article className="grid grid-cols-[5px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#333] bg-[#111] shadow-md">
      {/* Left 5px Sin Affinity Accent Bar */}
      <span aria-hidden="true" style={{ backgroundColor: sinColor }} />

      <div className="grid min-w-0 gap-3 p-4 sm:px-5">
        {/* Row 1: Slot, Sin Badge, Skill Name, Attack Type, Offense Level, Copies, Clash Calc */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {isDefense ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded border border-[#c9a84c]/30">
              <Shield className="size-3.5 shrink-0" />
              DEF {index > 0 ? index + 1 : ''}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-black text-white">
              S{index + 1}
            </span>
          )}

          {sinKey && sinKey !== 'none' && <SinBadge sin={sinKey} />}

          <div className="min-w-0 flex items-baseline gap-2">
            <h3 className="text-[16px] font-black text-white leading-snug">
              {showKo && nameKo ? nameKo : nameEn}
            </h3>
            {nameKo && !showKo && (
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                {nameKo}
              </span>
            )}
          </div>

          <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#1c1c22] border border-[#333] px-2.5 text-xs font-semibold text-gray-200">
            {capAttackType}
          </span>

          {offenseLevel !== undefined && offenseLevel !== null && (
            <span
              className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#1c1c22] border border-[#333] px-2.5 text-xs font-mono font-semibold text-gray-300"
              title="Offense / Defense Level Offset"
            >
              Lv {offenseLevel >= 0 ? `+${offenseLevel}` : offenseLevel}
            </span>
          )}

          {atkWeight > 1 && (
            <span
              className="inline-flex h-6 shrink-0 items-center rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 text-xs font-mono font-bold text-amber-300"
              title="Attack Weight (Targets)"
            >
              ⧠ Weight {atkWeight}
            </span>
          )}

          <div className="sm:ml-auto flex items-center gap-2">
            {targetCount > 0 && (
              <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-[#1c1c22] border border-[#333] px-2.5 text-xs font-medium text-gray-300">
                Copies <b className="font-mono font-black text-white">×{targetCount}</b>
              </span>
            )}

            {!isDefense && onOpenClashCalc && (
              <button
                type="button"
                onClick={() => onOpenClashCalc(skill, index, null)}
                className="btn-inline inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-2.5 text-xs font-bold text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors cursor-pointer"
                title="Load this skill into Clash Calculator"
              >
                <Calculator className="size-3.5" />
                Clash Calc
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Base Power, Coin Dots + Coin Power, Total Max */}
        {(basePower > 0 || coinCount > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#1a1a20] border border-[#333] px-3 text-xs font-medium text-gray-300">
              Base Power <b className="font-mono text-sm font-black text-white tabular-nums">{basePower}</b>
            </span>

            <span className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full bg-[#1a1a20] border border-[#333] px-3 text-xs font-medium text-gray-300">
              <span>Coin</span>
              <CoinDots count={coinCount} negative={coinPower < 0} />
              <b className={`font-mono text-sm font-black tabular-nums ${coinPower < 0 ? 'text-red-400' : 'text-white'}`}>
                {coinPower > 0 ? `+${coinPower}` : coinPower}
              </b>
            </span>

            <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#c9a84c] px-3 text-xs font-bold text-black shadow-sm">
              Total Max{' '}
              <b className="font-mono text-sm font-black tabular-nums">
                {coinPower < 0 ? `${basePower} (Min ${totalMax})` : totalMax}
              </b>
            </span>
          </div>
        )}

        {/* Row 3: Keyword Role Badges */}
        {skill.keywords && skill.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skill.keywords.map((kw, kIdx) =>
              typeof kw === 'string' ? (
                <KeywordRoleBadge key={kIdx} keyword={kw} />
              ) : (
                <KeywordRoleBadge key={kIdx} keyword={kw.keyword} role={kw.role} />
              )
            )}
          </div>
        )}

        {/* Row 4: CoinEffects Box */}
        {coinEffects.length > 0 && coinEffects.some(Boolean) && (
          <div className="rounded-xl bg-[#0a0a0e] border border-[#26262e] px-3.5 py-3">
            <CoinEffects effects={coinEffects} />
          </div>
        )}

        {/* Row 5: Conditional Skill Variants (LimbusDeck `e.variants`) */}
        {variants.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {variants.map((variant, vIdx) => {
              const vName = (showKo && variant.nameKo) ? variant.nameKo : (variant.nameEn || variant.name || nameEn);
              const vCond = (showKo && variant.conditionKo) ? variant.conditionKo : (variant.conditionEn || variant.conditionKo || '');
              const vBase = variant.basePower ?? basePower;
              const vCoinCount = variant.coinCount ?? coinCount;
              const vCoinPower = variant.coinPower ?? coinPower;
              const vMax = vBase + vCoinCount * vCoinPower;
              const vEffects = (showKo && variant.coinEffectsKo?.length) ? variant.coinEffectsKo : (variant.coinEffects || []);

              return (
                <div
                  key={vIdx}
                  className="rounded-xl border border-dashed border-[#c9a84c]/50 bg-[#0d0d12] p-3.5 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="rounded-md border border-[#c9a84c]/50 bg-[#c9a84c]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#c9a84c]">
                        Variant {variants.length > 1 ? vIdx + 1 : ''}
                      </span>
                      <span className="text-sm font-bold text-white">{vName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {variant.sin && <SinBadge sin={variant.sin} />}
                      {variant.attackType && (
                        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#1c1c22] border border-[#333] px-2.5 text-xs font-semibold text-gray-200">
                          {variant.attackType.charAt(0).toUpperCase() + variant.attackType.slice(1)}
                        </span>
                      )}
                      {!isDefense && onOpenClashCalc && (
                        <button
                          type="button"
                          onClick={() => onOpenClashCalc(variant, index, vIdx)}
                          className="btn-inline inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-2.5 text-xs font-bold text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors cursor-pointer"
                        >
                          <Calculator className="size-3.5" />
                          Clash Calc
                        </button>
                      )}
                    </div>
                  </div>

                  {vCond && (
                    <p className="text-xs leading-relaxed text-amber-300/90 bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-1.5 font-medium">
                      <strong className="uppercase tracking-wider text-[10px] mr-1.5">Condition:</strong>
                      <StatusText text={vCond} />
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#1a1a20] border border-[#333] px-2.5 text-gray-300">
                      Base: <strong className="font-mono text-white">{vBase}</strong>
                    </span>
                    <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[#1a1a20] border border-[#333] px-2.5 text-gray-300">
                      Coin: <CoinDots count={vCoinCount} negative={vCoinPower < 0} />
                      <strong className="font-mono text-white">
                        {vCoinCount}×{vCoinPower > 0 ? `+${vCoinPower}` : vCoinPower}
                      </strong>
                    </span>
                    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 px-2.5 text-[#c9a84c] font-bold">
                      Total Max: <strong className="font-mono">{vMax}</strong>
                    </span>
                  </div>

                  {vEffects.length > 0 && vEffects.some(Boolean) && (
                    <div className="rounded-xl bg-[#08080b] border border-[#222] px-3 py-2.5">
                      <CoinEffects effects={vEffects} />
                    </div>
                  )}

                  {variant.keywords && variant.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {variant.keywords.map((kw, kIdx) => (
                        <KeywordRoleBadge key={kIdx} keyword={kw.keyword} role={kw.role} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

// --- LimbusDeckPassiveCard (Exact Port of `su` in 3u3bm5ir4bed9.js) ---
export function LimbusDeckPassiveCard({ passive, showKo = false }) {
  if (!passive) return null;
  const isSupport = passive.type === 'support';
  const nameEn = passive.nameEn || passive.name || 'Passive';
  const nameKo = passive.nameKo || '';
  const desc = (showKo && passive.descriptionKo)
    ? passive.descriptionKo
    : (passive.descriptionEn || (Array.isArray(passive.effects) ? passive.effects.join('\n') : passive.effects) || passive.description || '');

  // Collect all sin conditions (main + extraConditions)
  const conditions = [];
  if (passive.sin && passive.sin.toLowerCase() !== 'none' && (passive.requiredResonance || 0) > 0) {
    conditions.push({
      sin: passive.sin.toLowerCase(),
      count: passive.requiredResonance,
      conditionType: passive.conditionType || 'owned'
    });
  }
  if (Array.isArray(passive.extraConditions)) {
    for (const ec of passive.extraConditions) {
      if (ec.sin && ec.requiredResonance > 0) {
        conditions.push({
          sin: ec.sin.toLowerCase(),
          count: ec.requiredResonance,
          conditionType: passive.conditionType || 'owned'
        });
      }
    }
  }

  return (
    <article className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-[#333] bg-[#111] p-4 sm:px-5 shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border ${
            isSupport
              ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
              : 'bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/40'
          }`}
        >
          {isSupport ? 'Support' : 'Combat'}
        </span>

        <h3 className="min-w-0 text-[15px] font-black text-white leading-snug">
          {showKo && nameKo ? nameKo : nameEn}
        </h3>
        {nameKo && !showKo && (
          <span className="text-xs text-gray-400">{nameKo}</span>
        )}

        {conditions.length > 0 && (
          <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
            {conditions.map((cond, idx) => {
              const color = LD_SIN_COLORS[cond.sin] || '#c9a84c';
              const sinLabel = cond.sin.charAt(0).toUpperCase() + cond.sin.slice(1);
              return (
                <span
                  key={idx}
                  className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs font-bold"
                  style={{
                    color,
                    borderColor: `${color}66`,
                    backgroundColor: `${color}18`
                  }}
                >
                  <span>{sinLabel}</span>
                  <span className="font-mono">×{cond.count}</span>
                  <span className="font-normal opacity-85">
                    {cond.conditionType === 'resonance' ? 'Reson' : 'Owned'}
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Structured Passive Effect Tags (`passive.structuredEffects` or `passive.effects` objects) */}
      {Array.isArray(passive.structuredEffects) && passive.structuredEffects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {passive.structuredEffects.map((ef, idx) => {
            if (!ef || typeof ef !== 'object') return null;
            const targetLabel = ef.target === 'self' ? 'Self' : ef.target === 'ally' ? 'Ally' : ef.target === 'enemy' ? 'Enemy' : 'Target';
            const kwLabel = ef.keyword ? ef.keyword.charAt(0).toUpperCase() + ef.keyword.slice(1) : '';
            const valStr = ef.value ? `+${ef.value}` : '';
            return (
              <span
                key={idx}
                className="inline-flex h-6 items-center rounded-full bg-[#1a1a22] border border-[#333] px-2.5 text-[11px] font-semibold text-gray-300"
              >
                [{targetLabel}] {kwLabel} {ef.effectType?.replace(/_/g, ' ')} {valStr}
              </span>
            );
          })}
        </div>
      )}

      <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-line bg-[#0a0a0e] border border-[#222] rounded-xl p-3">
        <StatusText text={desc} />
      </div>
    </article>
  );
}
