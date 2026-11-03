import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Zap, ShieldAlert, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { LD_SIN_COLORS, SINS } from '../../utils/limbusDeckEngine.js';

export default function PassiveFeasibilityMatrix({ passivesData }) {
  const [expandedSinner, setExpandedSinner] = useState(null);
  if (!passivesData) return null;

  const { supply = { copies: {}, holders: {}, total: 0 }, rows = [], combat = {}, support = {} } = passivesData;

  const toggleExpand = (sId) => {
    setExpandedSinner(prev => prev === sId ? null : sId);
  };

  const getStatusBadge = (status, reason) => {
    if (status === 'possible') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <CheckCircle2 size={11} /> Possible
        </span>
      );
    }
    if (status === 'hard') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40" title="Low sin share (<15%)">
          <AlertTriangle size={11} /> Low Share (&lt;15%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40" title={reason === 'none' ? 'No sin copies available' : 'Short on resonance'}>
        <XCircle size={11} /> Impossible
      </span>
    );
  };

  return (
    <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c] flex items-center gap-1.5 mb-1">
            <Zap size={14} /> Passive Feasibility Engine
          </span>
          <h3 className="text-xl font-black font-limbus text-white">
            Combat & Support Passive Feasibility
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Evaluates sin resonance and held resource requirements against active squad deck distribution (S1×3, S2×2, S3×1, Def×1).
          </p>
        </div>

        {/* Global Feasibility Badges */}
        <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-2 rounded-xl text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Combat Passives</span>
            <div className="flex items-center gap-1.5 font-bold font-mono mt-0.5">
              <span className="text-emerald-400">✓ {combat.possible || 0}</span>
              <span className="text-amber-400">⚠️ {combat.hard || 0}</span>
              <span className="text-rose-400">✕ {combat.impossible || 0}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Support Passives</span>
            <div className="flex items-center gap-1.5 font-bold font-mono mt-0.5">
              <span className="text-emerald-400">✓ {support.possible || 0}</span>
              <span className="text-amber-400">⚠️ {support.hard || 0}</span>
              <span className="text-rose-400">✕ {support.impossible || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sin Supply Bar */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 block">
          Squad Sin Resource Generation Pool ({supply.total} Total Skill Copies)
        </span>
        <div className="flex flex-wrap gap-2">
          {SINS.map(sin => {
            const count = supply.copies[sin] || 0;
            const holders = supply.holders[sin] || 0;
            const share = supply.total > 0 ? Math.round((count / supply.total) * 100) : 0;
            const color = LD_SIN_COLORS[sin] || '#999';

            return (
              <div
                key={sin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-black/50 text-xs shadow-sm"
                style={{ borderColor: count > 0 ? `${color}40` : 'rgba(255,255,255,0.05)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-bold capitalize text-white">{sin}</span>
                <span className="font-mono font-black text-[#c9a84c] text-sm">×{count}</span>
                <span className="text-[10px] text-gray-500 font-mono">({share}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Roster Breakdown */}
      <div className="space-y-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
          Individual Sinner Passive Activation Roster
        </span>

        {rows.map(row => {
          const isExpanded = expandedSinner === row.sinnerId;
          const allPassives = [...row.combat, ...row.support];
          const hasImpossible = allPassives.some(p => p.status === 'impossible');
          const hasHard = allPassives.some(p => p.status === 'hard');

          return (
            <div
              key={row.sinnerId}
              className="rounded-xl border border-white/10 bg-black/30 overflow-hidden transition-all duration-200"
            >
              {/* Row Bar */}
              <div
                onClick={() => toggleExpand(row.sinnerId)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black border border-[#c9a84c]/30 flex items-center justify-center font-bold font-limbus text-[#c9a84c] text-sm">
                    {row.sinnerId}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{row.identity?.name || `Sinner ${row.sinnerId}`}</h4>
                    <span className="text-[11px] text-gray-400 font-mono">{row.identity?.sinner}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {allPassives.map((p, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full ${
                          p.status === 'possible' ? 'bg-emerald-400' : (p.status === 'hard' ? 'bg-amber-400' : 'bg-rose-500')
                        }`}
                        title={`${p.name}: ${p.status}`}
                      />
                    ))}
                  </div>

                  {getStatusBadge(row.status)}

                  <button className="text-gray-400 hover:text-white transition-colors p-1">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded Passive Breakdown */}
              {isExpanded && (
                <div className="p-4 bg-black/60 border-t border-white/10 space-y-3">
                  {allPassives.map((p, idx) => {
                    const sinColor = LD_SIN_COLORS[p.sin] || '#888';
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black border border-white/10 text-gray-300">
                              {p.type}
                            </span>
                            <span className="font-bold text-white text-xs">{p.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {p.sin && (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white flex items-center gap-1"
                                style={{ backgroundColor: sinColor }}
                              >
                                {p.sin} {p.conditionType === 'resonance' ? `Reson ×${p.required}` : `Held ×${p.required}`}
                              </span>
                            )}
                            {getStatusBadge(p.status, p.reason)}
                          </div>
                        </div>

                        {p.description && (
                          <p className="text-xs text-gray-300 leading-relaxed font-mono">
                            {typeof p.description === 'string' ? p.description : JSON.stringify(p.description)}
                          </p>
                        )}

                        <div className="text-[10px] text-gray-400 font-mono pt-1 border-t border-white/5 flex items-center justify-between">
                          <span>
                            Squad Pool: <strong className="text-white">{p.copies} copies</strong> available ({Math.round(p.share * 100)}% share)
                          </span>
                          <span>
                            Status: <strong className={p.status === 'possible' ? 'text-emerald-400' : (p.status === 'hard' ? 'text-amber-400' : 'text-rose-400')}>{p.reason}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
