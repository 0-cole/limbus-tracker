import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, ExternalLink } from 'lucide-react';
import pkg from '../../package.json';

function isNewerVersion(latest, current) {
  if (!latest || !current) return false;
  const cleanLatest = latest.replace(/^v/, '').trim();
  const cleanCurrent = current.replace(/^v/, '').trim();
  
  const lParts = cleanLatest.split('.').map(n => parseInt(n) || 0);
  const cParts = cleanCurrent.split('.').map(n => parseInt(n) || 0);
  
  for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
    const l = lParts[i] || 0;
    const c = cParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export default function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [currentVer, setCurrentVer] = useState(pkg.version || '1.0.12');

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getAppVersion) {
      window.electronAPI.getAppVersion().then(ver => {
        if (ver) setCurrentVer(ver);
      });
    }
  }, []);

  const checkGitHubRelease = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/0-cole/limbus-tracker/releases/latest', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) return;
      const release = await res.json();
      if (release && release.tag_name) {
        if (isNewerVersion(release.tag_name, currentVer)) {
          setUpdateInfo(release);
        }
      }
    } catch (e) {
      // Silently ignore network failures
    }
  };

  useEffect(() => {
    checkGitHubRelease();
    // Check GitHub every 5 minutes (300,000 ms)
    const interval = setInterval(checkGitHubRelease, 300000);
    return () => clearInterval(interval);
  }, [currentVer]);

  if (!updateInfo || dismissed) return null;

  const handleOpenRelease = () => {
    const url = updateInfo.html_url || 'https://github.com/0-cole/limbus-tracker/releases/latest';
    if (window.electronAPI && window.electronAPI.openExternalUrl) {
      window.electronAPI.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-gradient-to-r from-[#1a1505] via-[#241c08] to-[#1a1505] border-b border-[#c9a84c]/50 px-6 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(201,168,76,0.15)] z-[90] relative"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c] flex items-center justify-center text-[#c9a84c]">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div className="text-sm">
            <span className="font-bold text-[#c9a84c] mr-2">
              Update Available: {updateInfo.name || updateInfo.tag_name}
            </span>
            <span className="text-gray-300 hidden md:inline text-xs">
              (Your save data in Documents will automatically be kept!)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenRelease}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#c9a84c] hover:bg-[#d8b85c] text-black font-bold text-xs rounded transition-colors shadow-sm"
          >
            <Download size={13} />
            <span>Download Update</span>
            <ExternalLink size={12} className="ml-0.5 opacity-70" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
