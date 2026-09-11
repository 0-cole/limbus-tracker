import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, ScrollText, Stamp } from 'lucide-react';
import pkg from '../../package.json';

function isNewerVersion(a, b) {
  const av = a.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  const bv = b.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    if ((av[i] || 0) > (bv[i] || 0)) return true;
    if ((av[i] || 0) < (bv[i] || 0)) return false;
  }
  return false;
}

function formatNotes(body) {
  if (!body) return [];
  return body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Overworked, powerless, stressed Records Keeper Kenneth (OC) memos
// Keyed specifically to notable updates, bugs fixed, or features added
const KENNETH_SPECIFIC_MEMOS = {
  'v1.0.40': "Someone filed an unregistered personnel dossier for a bug monarch, and then someone else left greasy HamHamPangPang wrappers and mysterious book catalog cards on the terminal keyboard. Also, thank you for brushing Gregor's coat and pulling Ryōshū out of her trance—the bus upholstery was starting to look like a crime scene. I'm going to take two aspirin and lie down under my desk.",
  'v1.0.39': "Dante ran an extra Mirror Dungeon before the 5 PM server reset, and the schedule tried to force another run tonight. I personally amended the roadmap ledger so you don't have to step foot into the dungeon twice in one day if you've already hit your quota. Please, go rest. I wish I could.",
  'v1.0.38': "Twenty seconds. Now the update radar scans GitHub every twenty seconds. If Corporate releases a patch while I'm eating my lukewarm noodles, the siren goes off. Please have mercy on my ears.",
  'v1.0.37': "I'm begging you, Dante... I set up an error alarm that flashes red whenever the cloud packet drops. Please don't throw your clock at the screen if it fails. I can't afford to requisition another monitor.",
  'v1.0.36': "The terminals kept yelling that they were 'already in sync' when you pressed the button, and then people panicked. I rewrote the memo. It now politely tells you everything is fine. Please breathe.",
  'v1.0.35': "Fifteen seconds. Every fifteen seconds, the pneumatic tube shoots another batch of mirror logs across the room. My desk is vibrating. I haven't blinked in two hours.",
  'v1.0.34': "A central account database... Corporate finally authorized it. If anyone forgets their password, please use the reset link and do NOT come knock on the Archives door at 3 AM.",
  'v1.0.33': "Dante kept spilling overfilled Enkephalin on the roadmap carpet, so I added a prompt to log it before it ruins another rug. Also, I formatted the bonus run counters so Faust stops glaring at me.",
  'v1.0.32': "Someone searched 'Vergilius' in the Sinner manifest. Vergilius actually walked into my cubicle, stared at my stamp for ten seconds in dead silence, and walked out. I almost fainted.",
  'v1.0.31': "The Quick Log checkbox was checking itself before you even finished the dungeon... I spent all night fixing the logic gates. I spilled bitter instant coffee on my tie.",
  'v1.0.30': "Added the ASAP Mode so you can grind Mirror Dungeons instead of waiting for passive weeklies. Heathcliff celebrated by punching a locker. My headache has doubled.",
  'v1.0.29': "Personal preset data imported. I had to manually transcribe 400 identity cards. My wrist has made a clicking sound since Tuesday.",
};

const DEFAULT_KENNETH_MEMOS = [
  "Incident report filed. Manager Dante has wound the clock 14 times this shift. My hand cramps from stamping paperwork.",
  "Log entry certified. The Department of Records requests that Sinners stop spilling blood directly on requisition forms.",
  "Amended and filed. Please remind Heathcliff that replacing broken bus upholstery comes out of team funds, not mine.",
  "Transmitted via pneumatic tube to Mephistopheles. All discrepancies cross-referenced with field black-box recordings.",
  "Approved by Records & Archival. I have not slept since Canto IV. Please stop requesting extra Enkephalin rations.",
  "Filed under: Routine Chaos. At this point, I just stamp whatever comes back from the Mirror Dungeons.",
];

function getKennethMemo(tag, body, idx) {
  const cleanTag = (tag || '').trim();
  if (KENNETH_SPECIFIC_MEMOS[cleanTag]) {
    return KENNETH_SPECIFIC_MEMOS[cleanTag];
  }
  const lowerBody = (body || '').toLowerCase();
  if (lowerBody.includes('sync') || lowerBody.includes('cloud')) {
    return "Another cloud transmission synchronized. If the connection flickers, blame the lightning storms outside Mephistopheles, not me.";
  }
  if (lowerBody.includes('mirror dungeon') || lowerBody.includes('hard mode')) {
    return "More Mirror Dungeon logs... Do the Sinners ever stop running these? There are stacks of parchment up to my ceiling.";
  }
  if (lowerBody.includes('crate') || lowerBody.includes('shard')) {
    return "Shards and crates tallied. If a crate count is off by one, Vergilius looks at me with that crimson glare. Everything is double-checked.";
  }
  return DEFAULT_KENNETH_MEMOS[idx % DEFAULT_KENNETH_MEMOS.length];
}

export default function ChangelogPage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVer, setCurrentVer] = useState(pkg.version || '1.0.0');

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then(ver => { if (ver) setCurrentVer(ver); });
    }
  }, []);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/0-cole/limbus-tracker/releases?per_page=20', {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        setReleases(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  return (
    <div className="p-8 pb-32 max-w-3xl mx-auto">

      {/* Records Keeper Header */}
      <div className="mb-8 border-b-2 border-[#c9a84c]/40 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center flex-shrink-0 mt-1">
            <ScrollText size={28} className="text-[#c9a84c]" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/60 mb-0.5">
              LIMBUS COMPANY — DEPARTMENT OF RECORDS & ARCHIVAL
            </div>
            <h1 className="text-3xl font-black uppercase tracking-wider text-[#c9a84c]">
              Operational Log
            </h1>
            <div className="mt-2 text-xs text-gray-500 font-mono leading-relaxed border-l-2 border-[#c9a84c]/20 pl-3">
              <span className="text-[#c9a84c]/70 font-bold">From:</span> Senior Archivist Kenneth, LCB Records & After-Action Division<br />
              <span className="text-[#c9a84c]/70 font-bold">To:</span> Manager Dante & Mephistopheles Onboard Terminal<br />
              <span className="text-[#c9a84c]/70 font-bold">Subject:</span> Official Tracker Updates, Patch Logs & Field Directives<br />
              <span className="text-gray-400 italic mt-1 block font-serif">
                "Another update filed, Manager. Please tell the Sinners not to smash the terminal again."
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-600 font-mono flex-shrink-0">
            <div className="text-gray-500">Current Installation</div>
            <div className="text-[#c9a84c] font-black text-sm">v{currentVer}</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-500 gap-3">
          <Loader size={20} className="animate-spin" />
          <span className="font-mono text-sm">Kenneth is digging through filing cabinets...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-24">
          <div className="text-[#c9a84c] font-mono text-sm mb-2">[TRANSMISSION INTERRUPTED]</div>
          <p className="font-bold text-red-400 mb-2">Archive records could not be retrieved</p>
          <p className="text-sm text-gray-500">{error}</p>
          <p className="text-sm text-gray-600 mt-2 italic">Kenneth notes: "Terminal connection timed out. Check your network before Corporate writes me up."</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-5">
          {releases.map((release, idx) => {
            const tag = release.tag_name || '';
            const isCurrentVersion = tag.replace(/^v/, '') === currentVer.replace(/^v/, '');
            const isNewer = isNewerVersion(tag, currentVer);
            const lines = formatNotes(release.body);
            const date = release.published_at ? new Date(release.published_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : 'Unknown date';
            const transmissionNote = getKennethMemo(tag, release.body, idx);

            return (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-[#0d0d0d] border rounded-xl overflow-hidden ${
                  isCurrentVersion
                    ? 'border-[#c9a84c]/60 shadow-[0_0_20px_rgba(201,168,76,0.08)]'
                    : isNewer
                    ? 'border-[#22c55e]/40'
                    : 'border-[#222]'
                }`}
              >
                {/* Memo Header */}
                <div className={`px-5 py-4 border-b flex items-start justify-between gap-4 ${
                  isCurrentVersion ? 'border-[#c9a84c]/20 bg-[#c9a84c]/4' : 'border-[#1a1a1a]'
                }`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-600 mb-1">
                      RECORDS BUREAU — INTERNAL MEMO
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-black text-lg ${isCurrentVersion ? 'text-[#c9a84c]' : isNewer ? 'text-[#22c55e]' : 'text-white'}`}>
                        {release.name || tag}
                      </span>
                      {isCurrentVersion && (
                        <span className="flex items-center gap-1 text-[10px] bg-[#c9a84c] text-black font-bold px-2 py-0.5 rounded">
                          <CheckCircle size={10} /> Active Installation
                        </span>
                      )}
                      {isNewer && (
                        <span className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] font-bold px-2 py-0.5 rounded border border-[#22c55e]/30">
                          Update Available
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5 font-mono">
                      Transmission ID: <span className="text-gray-500">{tag}</span>
                      <span className="mx-2 text-gray-700">·</span>
                      Filed: <span className="text-gray-500">{date}</span>
                    </div>
                  </div>

                  {isCurrentVersion && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center">
                        <Stamp size={18} className="text-[#c9a84c]/70" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Kenneth's Post-It / Memo Box */}
                <div className="mx-5 mt-4 p-3 rounded-lg bg-[#14120c] border border-[#c9a84c]/30 shadow-inner flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#c9a84c]/15 text-[#c9a84c] flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                    K
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c] font-mono flex items-center gap-1.5">
                      <span>Archivist Kenneth's Memo</span>
                      <span className="text-[9px] text-gray-500 font-normal">(Under duress)</span>
                    </div>
                    <p className="text-xs text-amber-100/90 italic font-mono mt-0.5 leading-relaxed">
                      "{transmissionNote}"
                    </p>
                  </div>
                </div>

                {/* Release body */}
                <div className="px-5 py-4">
                  {lines.length === 0 ? (
                    <p className="text-gray-600 text-sm italic font-mono">[ No operational notes filed for this transmission. ]</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {lines.map((line, i) => {
                        const isBullet = line.startsWith('-') || line.startsWith('*');
                        const isHeading = line.startsWith('#');
                        const text = isBullet ? line.slice(1).trim() : line.replace(/^#+\s*/, '');

                        if (isHeading) {
                          return (
                            <li key={i} className="text-[#c9a84c]/80 font-bold text-[10px] uppercase tracking-widest mt-4 mb-1 first:mt-0 font-mono flex items-center gap-2">
                              <span className="h-px flex-1 bg-[#c9a84c]/15" />
                              {text}
                              <span className="h-px flex-1 bg-[#c9a84c]/15" />
                            </li>
                          );
                        }
                        return (
                          <li key={i} className={`text-sm flex gap-2 ${isBullet ? 'text-gray-300' : 'text-gray-500'}`}>
                            {isBullet && <span className="text-[#c9a84c]/60 flex-shrink-0 mt-0.5 font-mono">›</span>}
                            <span dangerouslySetInnerHTML={{
                              __html: text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                            }} />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
