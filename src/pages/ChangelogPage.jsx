import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Tag, Calendar, CheckCircle, Loader } from 'lucide-react';
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
      <div className="flex items-center gap-3 mb-8 border-b-2 border-[#333] pb-4">
        <GitBranch size={28} className="text-[#c9a84c]" />
        <div>
          <h1 className="text-4xl font-black uppercase tracking-wider text-[#c9a84c]">Changelog</h1>
          <p className="text-gray-500 text-sm mt-0.5">You are on <span className="text-white font-bold">v{currentVer}</span></p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-500 gap-3">
          <Loader size={20} className="animate-spin" />
          <span>Fetching release history from GitHub...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-24 text-red-400">
          <p className="font-bold mb-2">Could not load changelogs</p>
          <p className="text-sm text-gray-500">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Make sure you're connected to the internet.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {releases.map((release, idx) => {
            const tag = release.tag_name || '';
            const isCurrentVersion = tag.replace(/^v/, '') === currentVer.replace(/^v/, '');
            const isNewer = isNewerVersion(tag, currentVer);
            const lines = formatNotes(release.body);
            const date = release.published_at ? new Date(release.published_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : 'Unknown date';

            return (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-[#111] border rounded-xl overflow-hidden ${
                  isCurrentVersion
                    ? 'border-[#c9a84c] shadow-[0_0_20px_rgba(201,168,76,0.1)]'
                    : isNewer
                    ? 'border-[#22c55e]/50'
                    : 'border-[#333]'
                }`}
              >
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between border-b ${
                  isCurrentVersion ? 'border-[#c9a84c]/30 bg-[#c9a84c]/5' : 'border-[#222]'
                }`}>
                  <div className="flex items-center gap-3">
                    <Tag size={16} className={isCurrentVersion ? 'text-[#c9a84c]' : isNewer ? 'text-[#22c55e]' : 'text-gray-500'} />
                    <span className={`font-black text-lg ${isCurrentVersion ? 'text-[#c9a84c]' : isNewer ? 'text-[#22c55e]' : 'text-white'}`}>
                      {release.name || tag}
                    </span>
                    {isCurrentVersion && (
                      <span className="flex items-center gap-1 text-xs bg-[#c9a84c] text-black font-bold px-2 py-0.5 rounded">
                        <CheckCircle size={11} /> Current
                      </span>
                    )}
                    {isNewer && (
                      <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] font-bold px-2 py-0.5 rounded border border-[#22c55e]/30">
                        Newer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Calendar size={12} />
                    {date}
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                  {lines.length === 0 ? (
                    <p className="text-gray-600 text-sm italic">No release notes provided.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {lines.map((line, i) => {
                        const isBullet = line.startsWith('-') || line.startsWith('*');
                        const isHeading = line.startsWith('#');
                        const text = isBullet ? line.slice(1).trim() : line.replace(/^#+\s*/, '');

                        if (isHeading) {
                          return (
                            <li key={i} className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-3 mb-1 first:mt-0">
                              {text}
                            </li>
                          );
                        }
                        return (
                          <li key={i} className={`text-sm flex gap-2 ${isBullet ? 'text-gray-300' : 'text-gray-500'}`}>
                            {isBullet && <span className="text-[#c9a84c] flex-shrink-0 mt-0.5">•</span>}
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
