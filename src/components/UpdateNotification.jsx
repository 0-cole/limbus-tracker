import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import pkg from '../../package.json';

function isNewerVersion(latest, current) {
  if (!latest || !current) return false;
  const l = latest.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  const c = current.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    if ((l[i] || 0) > (c[i] || 0)) return true;
    if ((l[i] || 0) < (c[i] || 0)) return false;
  }
  return false;
}

export default function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [currentVer, setCurrentVer] = useState(pkg.version || '1.0.0');
  const [dlState, setDlState] = useState('idle'); // idle | downloading | done | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then(ver => { if (ver) setCurrentVer(ver); });
    }
  }, []);

  const checkGitHubRelease = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/0-cole/limbus-tracker/releases/latest', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) return;
      const release = await res.json();
      if (release?.tag_name && isNewerVersion(release.tag_name, currentVer)) {
        setUpdateInfo(release);
      }
    } catch (e) { /* Silently ignore */ }
  };

  useEffect(() => {
    checkGitHubRelease();
    const interval = setInterval(checkGitHubRelease, 20000); // Poll every 20 seconds
    return () => clearInterval(interval);
  }, [currentVer]);

  const handleDownload = async () => {
    if (!window.electronAPI?.downloadUpdate) {
      // Fallback: open browser
      const url = updateInfo.html_url || 'https://github.com/0-cole/limbus-tracker/releases/latest';
      window.electronAPI?.openExternalUrl(url) || window.open(url, '_blank');
      return;
    }

    // Find the .exe asset
    const exeAsset = updateInfo.assets?.find(a => a.name.endsWith('.exe'));
    if (!exeAsset) {
      window.electronAPI?.openExternalUrl(updateInfo.html_url);
      return;
    }

    setDlState('downloading');
    setProgress(0);

    window.electronAPI.onUpdateProgress((pct) => setProgress(pct));

    try {
      await window.electronAPI.downloadUpdate(exeAsset.browser_download_url, exeAsset.name);
      setDlState('done');
      window.electronAPI.removeUpdateProgress();
    } catch (e) {
      setDlState('error');
      window.electronAPI.removeUpdateProgress();
    }
  };

  if (!updateInfo || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-gradient-to-r from-[#1a1505] via-[#241c08] to-[#1a1505] border-b border-[#c9a84c]/50 px-6 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(201,168,76,0.15)] z-[90] relative"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c] flex items-center justify-center text-[#c9a84c] flex-shrink-0">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[#c9a84c] mr-2 text-sm">
              Update Available: {updateInfo.name || updateInfo.tag_name}
            </span>
            {dlState === 'downloading' && (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden max-w-[200px]">
                  <motion.div
                    className="h-full bg-[#c9a84c] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <span className="text-xs text-gray-400">{progress}%</span>
              </div>
            )}
            {dlState === 'done' && (
              <span className="text-green-400 text-xs flex items-center gap-1">
                <CheckCircle size={12} /> Installer launched — close the app and follow the prompts!
              </span>
            )}
            {dlState === 'error' && (
              <span className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> Download failed. Try again or visit GitHub manually.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {dlState === 'idle' && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#c9a84c] hover:bg-[#d8b85c] text-black font-bold text-xs rounded transition-colors shadow-sm"
            >
              <Download size={13} />
              <span>Download & Install</span>
            </button>
          )}
          {dlState === 'downloading' && (
            <span className="text-xs text-gray-400 italic">Downloading...</span>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
