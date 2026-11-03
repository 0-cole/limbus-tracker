import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Swords, Zap, Shield, Flame, Activity } from 'lucide-react';
import { LD_KEYWORD_COLORS, LD_SIN_COLORS } from '../../utils/limbusDeckEngine.js';

const AXES = [
  { key: 'performance', label: 'Performance', icon: Swords, desc: 'Base power, coin scaling, stats & HP' },
  { key: 'keyword', label: 'Keyword', icon: Flame, desc: 'Potency, count, inflict & boost roles' },
  { key: 'resonance', label: 'Resonance', icon: Zap, desc: 'Sin generation & 3+ A-Reson potential' },
  { key: 'coverage', label: 'Coverage', icon: Shield, desc: 'Slash, Pierce, Blunt damage balance' },
  { key: 'gimmick', label: 'Gimmick', icon: Sparkles, desc: 'Faction synergies (Liu, W Corp, BL, etc.)' },
];

export default function SynergyRadarChart({ analysis, targetKeyword = null }) {
  if (!analysis) return null;
  const { scores = {}, totalScore = 0, detectedFactions = [], sinDistribution = {}, attackTypeCoverage = {} } = analysis;

  const size = 300;
  const center = size / 2;
  const radius = 105;
  const angleStep = (Math.PI * 2) / AXES.length;
  // Start from top (-PI / 2)
  const startAngle = -Math.PI / 2;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index, valuePercent) => {
    const angle = startAngle + index * angleStep;
    const r = radius * (Math.max(0, Math.min(100, valuePercent)) / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build radar polygon points
  const polygonPoints = AXES.map((axis, i) => {
    const val = scores[axis.key] || 0;
    const { x, y } = getCoordinates(i, val);
    return `${x},${y}`;
  }).join(' ');

  // Tier rating label
  const getRating = (score) => {
    if (score >= 90) return { label: 'S+ Apex Synergy', color: '#ef4444', badge: 'bg-red-500/20 text-red-300 border-red-500/50' };
    if (score >= 80) return { label: 'S Tier Synergy', color: '#f59e0b', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
    if (score >= 70) return { label: 'A Tier Synergy', color: '#a855f7', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50' };
    if (score >= 60) return { label: 'B Tier Synergy', color: '#38bdf8', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/50' };
    return { label: 'Developing Squad', color: '#94a3b8', badge: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
  };

  const rating = getRating(totalScore);

  return (
    <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Radiant ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#c9a84c]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10 border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c] flex items-center gap-1.5 mb-1">
            <Activity size={14} /> 5-Axis Synergy Radar
          </span>
          <h3 className="text-xl font-black font-limbus text-white flex items-center gap-2">
            Squad Resonance Matrix
          </h3>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black font-limbus text-[#c9a84c] drop-shadow-[0_0_12px_rgba(201,168,76,0.5)]">
            {totalScore}<span className="text-sm text-gray-400 font-sans font-normal">/100</span>
          </div>
          <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${rating.badge}`}>
            {rating.label}
          </span>
        </div>
      </div>

      {/* SVG Radar Chart */}
      <div className="flex justify-center items-center my-2 relative">
        <svg width={size} height={size} className="overflow-visible select-none">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#ca8a04" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.05" />
            </radialGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Polygons */}
          {levels.map((lvl, lIdx) => {
            const pts = AXES.map((_, i) => {
              const { x, y } = getCoordinates(i, lvl * 100);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={lIdx}
                points={pts}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={lIdx === levels.length - 1 ? 1.5 : 1}
                strokeDasharray={lIdx === levels.length - 1 ? undefined : '2,3'}
              />
            );
          })}

          {/* Radial Spokes */}
          {AXES.map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data Polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#radarFill)"
            stroke="#c9a84c"
            strokeWidth="2.5"
            filter="url(#radarGlow)"
          />

          {/* Data Nodes & Labels */}
          {AXES.map((axis, i) => {
            const val = scores[axis.key] || 0;
            const node = getCoordinates(i, val);
            const labelPos = getCoordinates(i, 120);

            return (
              <g key={axis.key}>
                {/* Glowing Node */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="4.5"
                  fill="#c9a84c"
                  stroke="#000"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />

                {/* Axis Label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[11px] font-black uppercase tracking-wider fill-gray-300 pointer-events-none"
                >
                  {axis.label}
                </text>

                {/* Value Pill */}
                <text
                  x={labelPos.x}
                  y={labelPos.y + 13}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[10px] font-mono font-bold fill-[#c9a84c]"
                >
                  {val}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Axis Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-xs">
        {AXES.map((axis) => {
          const Icon = axis.icon;
          const score = scores[axis.key] || 0;
          return (
            <div key={axis.key} className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <Icon size={12} className="text-[#c9a84c]" /> {axis.label}
                </span>
                <span className="font-mono font-black text-white">{score}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-[#c9a84c] rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Factions Detected */}
      {detectedFactions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400">Active Factions:</span>
          {detectedFactions.map(f => (
            <span key={f.faction} className="px-2 py-0.5 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/40 text-[#c9a84c] text-[10px] font-bold">
              ● {f.faction} ({f.count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
