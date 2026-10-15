import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Star,
  Tv,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

// Assets
import tennaIntroAudio from '../assets/tenna_intro.mp3';
import tennaExplosionAudio from '../assets/tenna_explosion.mp3';
import anttennasLogo from '../assets/anttennas.png';
import tennaListening from '../assets/tenna_listening.png';
import tennaDancing from '../assets/tennadancing.gif';
import tennaFlying from '../assets/tennaflying.png';
import tennaMaxUp from '../assets/tennamaxup.png';
import tennaSlightlyUp from '../assets/tennaslightlyup.png';
import tennaWhisper from '../assets/tennawhisper.png';

const CHARGE_GRINDER_REPO_URL = 'https://github.com/Walpth/Charge-Grinder/';

export default function TennaInfomercialModal({ isOpen, onClose }) {
  const [scene, setScene] = useState(0); // 0 to 6
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [explosionPlayed, setExplosionPlayed] = useState(false);

  const audioRef = useRef(null);
  const explosionRef = useRef(null);
  const timerRef = useRef(null);

  const openUrl = (url) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Start audio & broadcast when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setScene(0);
      setCurrentTime(0);
      setExplosionPlayed(false);
      return;
    }

    // Attempt to start audio immediately
    const startShow = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 0.85;
          await audioRef.current.play();
          setIsPlaying(true);
          setAudioBlocked(false);
        } catch (err) {
          // Autoplay policy prevented playback until user interaction
          setAudioBlocked(true);
        }
      }
    };

    startShow();

    // Lock page navigation / escape keys while commercial is active
    const handleKeyDown = (e) => {
      // If still before finale (scene < 6), block escape and navigation
      if (scene < 6) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          e.preventDefault();
          e.stopPropagation();
        }
      } else if (e.key === 'Escape') {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  // Audio time update handler & scene synchronizer
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    // Timeline synchronized scene progression:
    // 0.0s - 4.5s: Scene 0 (The Hook / Problem)
    // 4.5s - 9.0s: Scene 1 (The Wacky Promise)
    // 9.0s - 14.5s: Scene 2 (The Big Reveal: Walpth's Charge Grinder)
    // 14.5s - 20.5s: Scene 3 (The Humanized Tech Specs)
    // 20.5s - 25.0s: Scene 4 (The Price Inquiry)
    // 25.0s - 29.5s: Scene 5 (The Climax Explosion: It's 100% Free!)
    // 29.5s+: Scene 6 (The Grand Finale & Call-to-Action)

    if (t < 4.5) {
      if (scene !== 0) setScene(0);
    } else if (t < 9.0) {
      if (scene !== 1) setScene(1);
    } else if (t < 14.5) {
      if (scene !== 2) setScene(2);
    } else if (t < 20.5) {
      if (scene !== 3) setScene(3);
    } else if (t < 25.0) {
      if (scene !== 4) setScene(4);
    } else if (t < 29.5) {
      if (scene !== 5) {
        setScene(5);
        if (!explosionPlayed && explosionRef.current) {
          explosionRef.current.volume = 0.9;
          explosionRef.current.currentTime = 0;
          explosionRef.current.play().catch(() => {});
          setExplosionPlayed(true);
        }
      }
    } else {
      if (scene !== 6) {
        setScene(6);
        localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
      }
    }
  };

  // Fallback timer in case audio fails to load or play
  useEffect(() => {
    if (!isOpen || isPlaying) return;

    // If audio is blocked or fails, advance scenes on real-time intervals
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.5;
        if (next >= 29.5) {
          setScene(6);
          localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
          clearInterval(interval);
        } else if (next >= 25.0) {
          setScene(5);
        } else if (next >= 20.5) {
          setScene(4);
        } else if (next >= 14.5) {
          setScene(3);
        } else if (next >= 9.0) {
          setScene(2);
        } else if (next >= 4.5) {
          setScene(1);
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  const handleStartWithClick = async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.85;
        await audioRef.current.play();
        setIsPlaying(true);
        setAudioBlocked(false);
      } catch (err) {
        setAudioBlocked(false);
      }
    }
  };

  const handleFinish = () => {
    localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (onClose) onClose();
  };

  const handleRestart = () => {
    setScene(0);
    setCurrentTime(0);
    setExplosionPlayed(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden select-none font-mono">
      {/* Hidden audio tags */}
      <audio
        ref={audioRef}
        src={tennaIntroAudio}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setScene(6);
          localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
        }}
      />
      <audio ref={explosionRef} src={tennaExplosionAudio} />

      {/* Retro CRT Outer Frame / Television Cabinet */}
      <div className="relative w-full h-full max-w-[1400px] max-h-[850px] p-4 md:p-8 flex flex-col items-center justify-center">
        {/* Antenna ears on top of the TV cabinet */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-end gap-16 pointer-events-none opacity-80 z-20">
          <div className="w-1.5 h-16 bg-gradient-to-t from-neutral-600 to-neutral-400 rotate-[-25deg] origin-bottom rounded-full shadow-lg" />
          <div className="w-1.5 h-20 bg-gradient-to-t from-neutral-600 to-neutral-400 rotate-[22deg] origin-bottom rounded-full shadow-lg" />
        </div>

        {/* The Curved CRT Screen Enclosure */}
        <div className="relative w-full h-full bg-neutral-950 rounded-[40px] border-[12px] border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
          {/* CRT Screen Glass & Scanlines Filter */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))`,
              backgroundSize: '100% 4px, 6px 100%'
            }}
          />

          {/* CRT Curved Screen Vignette & Phosphor Glow */}
          <div
            className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]"
            style={{
              borderRadius: '32px'
            }}
          />

          {/* Top TV Channel HUD Bar */}
          <div className="relative z-20 flex items-center justify-between px-6 py-3 bg-black/60 border-b border-neutral-800/80 backdrop-blur-sm text-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping inline-block" />
              <span className="font-black text-red-500 tracking-widest uppercase">● LIVE TV BROADCAST</span>
              <span className="text-neutral-500">|</span>
              <span className="font-bold text-yellow-400">CH-77 BTV (DISTRICT 23)</span>
              <span className="text-neutral-500">|</span>
              <span className="text-cyan-400 font-mono">RATINGS: 999.9%</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-neutral-400 font-mono">
                {currentTime.toFixed(1)}s / 30.0s
              </span>
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
              </button>
            </div>
          </div>

          {/* Autoplay Blocker Overlay (if browser needs a click gesture) */}
          {audioBlocked && (
            <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
              <motion.img
                src={anttennasLogo}
                alt="Anttennas"
                className="h-28 object-contain mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <h2 className="text-2xl md:text-3xl font-black text-yellow-400 mb-2 uppercase tracking-wide">
                📺 THE BROADCAST IS READY TO ROLL!
              </h2>
              <p className="text-neutral-300 text-sm max-w-md mb-6">
                CLICK BELOW TO TURN ON THE TV SPEAKER AND EXPERIENCE THE WACKIEST COMMERCIAL IN CITY HISTORY!
              </p>
              <motion.button
                onClick={handleStartWithClick}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.8)] flex items-center gap-3 uppercase tracking-wider"
              >
                <Play className="w-6 h-6 fill-current" />
                TURN ON THE T.V.!
              </motion.button>
            </div>
          )}

          {/* Main Television Variety Stage / Commercial Content */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-b from-[#180a2a] via-[#090514] to-[#040108]">
            {/* Animated Retro Grid Floor */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(236, 72, 153, 0.2) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Dynamic Rotating Stage Lights / Sunburst */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
              <motion.div
                className="w-[1200px] h-[1200px] rounded-full border-[2px] border-dashed border-yellow-400/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-[800px] h-[800px] rounded-full border-[2px] border-dotted border-pink-500/40"
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Neon Logo at Top of Stage */}
            <div className="relative z-10 mb-2">
              <motion.img
                src={anttennasLogo}
                alt="Anttennas"
                className="h-16 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* ================= SCENE 0: THE HOOK ================= */}
            <AnimatePresence mode="wait">
              {scene === 0 && (
                <motion.div
                  key="scene-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <motion.div
                    animate={{ rotate: [-2, 2, -2], y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="mb-4"
                  >
                    <img
                      src={tennaMaxUp}
                      alt="Tenna Max Up"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]"
                    />
                  </motion.div>

                  <div className="inline-block px-4 py-1 bg-red-600 text-white font-black text-sm uppercase rounded-full mb-3 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse">
                    ⚠️ ATTENTION ALL OVERWORKED MANAGERS!! ⚠️
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-yellow-300 uppercase tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-3">
                    ARE YOU TIRED OF TAPPING <span className="text-red-500 underline decoration-wavy">WIN RATE</span>?!
                  </h1>

                  <p className="text-base md:text-xl text-neutral-200 font-bold max-w-xl">
                    DO YOUR POOR MANAGER FINGERS CRAMP UP WHILE VERGILIUS STARES AT YOU WITH DISAPPOINTMENT?!
                  </p>
                </motion.div>
              )}

              {/* ================= SCENE 1: THE PROMISE ================= */}
              {scene === 1 && (
                <motion.div
                  key="scene-1"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl"
                >
                  <motion.div
                    animate={{ x: [-20, 20, -20], y: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="mb-4"
                  >
                    <img
                      src={tennaFlying}
                      alt="Tenna Flying"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(56,189,248,0.9)]"
                    />
                  </motion.div>

                  <div className="inline-block px-4 py-1.5 bg-cyan-500 text-black font-black text-sm uppercase rounded-full mb-3 shadow-[0_0_25px_rgba(56,189,248,0.8)]">
                    ⚡ STOP RIGHT THERE! ⚡
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-cyan-300 uppercase tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-3">
                    WANT A <span className="text-yellow-400 font-extrabold animate-bounce inline-block">WAAACKY</span> AUTOMATIC MIRROR DUNGEON GRINDER?!
                  </h1>

                  <div className="px-6 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.8)]">
                    <span className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                      LOOK NO FURTHER!!
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ================= SCENE 2: THE REVEAL ================= */}
              {scene === 2 && (
                <motion.div
                  key="scene-2"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="mb-3"
                  >
                    <img
                      src={tennaDancing}
                      alt="Tenna Dancing"
                      className="h-44 md:h-60 object-contain drop-shadow-[0_0_35px_rgba(250,204,21,0.9)]"
                    />
                  </motion.div>

                  <div className="inline-block px-5 py-1 bg-yellow-400 text-black font-black text-sm uppercase rounded-full mb-2 shadow-[0_0_25px_rgba(250,204,21,0.9)]">
                    ✨ INTRODUCING THE LEGEND ✨
                  </div>

                  <h1 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 uppercase tracking-tight leading-tight drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)] mb-2">
                    WALPTH'S CHARGE GRINDER v3.5.3!
                  </h1>

                  <p className="text-base md:text-xl text-yellow-200 font-bold max-w-xl">
                    THE #1 MIRROR DUNGEON AUTOMATION BEHEMOTH OF DISTRICT 23!
                  </p>
                </motion.div>
              )}

              {/* ================= SCENE 3: THE SPECS ================= */}
              {scene === 3 && (
                <motion.div
                  key="scene-3"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl"
                >
                  <div className="flex items-center gap-6 mb-3">
                    <img
                      src={tennaWhisper}
                      alt="Tenna Whisper"
                      className="h-32 md:h-44 object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]"
                    />
                    <div className="text-left">
                      <div className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                        SECRET SAUCE UNLOCKED
                      </div>
                      <div className="text-xl md:text-2xl font-black text-white">
                        LISTEN TO THESE COLD HARD SPECS:
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                    <div className="p-3 bg-neutral-900/90 border border-yellow-400/50 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                      <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-yellow-200">
                        BIOMECHANICAL SPLINE CURVES! (SMOOTH HUMAN MOUSE FLOW!)
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-900/90 border border-cyan-400/50 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                      <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-cyan-200">
                        0-SECOND EVENT SNIPING! (WARP THROUGH FLOORS!)
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-900/90 border border-pink-400/50 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                      <Sparkles className="w-5 h-5 text-pink-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-pink-200">
                        AUTO TEAM & SINNER SELECTION!
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-900/90 border border-green-400/50 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                      <Sparkles className="w-5 h-5 text-green-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-green-200">
                        SUPPORTS 1920x1080 & 1280x720!
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= SCENE 4: THE PRICE ================= */}
              {scene === 4 && (
                <motion.div
                  key="scene-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <motion.div
                    animate={{ rotate: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="mb-4"
                  >
                    <img
                      src={tennaListening}
                      alt="Tenna Listening"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"
                    />
                  </motion.div>

                  <div className="inline-block px-4 py-1 bg-amber-500 text-black font-black text-sm uppercase rounded-full mb-3">
                    💰 WHAT'S THE DAMAGE, YOU ASK?! 💰
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-2">
                    FOUR HUNDRED SHARDS?!
                  </h1>

                  <p className="text-xl md:text-2xl text-red-400 font-extrabold line-through mb-4">
                    1,300 LUNACY?! SELLING CHARON'S BUS SEATS?!
                  </p>

                  <div className="px-6 py-2 bg-red-600 text-white font-black text-2xl uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse">
                    NO!! ABSOLUTELY NOT!!
                  </div>
                </motion.div>
              )}

              {/* ================= SCENE 5: THE CLIMAX / EXPLOSION ================= */}
              {scene === 5 && (
                <motion.div
                  key="scene-5"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [1, 1.1, 1] }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                    className="mb-3"
                  >
                    <img
                      src={tennaMaxUp}
                      alt="Tenna Max Up"
                      className="h-44 md:h-64 object-contain drop-shadow-[0_0_50px_rgba(74,222,128,1)]"
                    />
                  </motion.div>

                  <div className="px-6 py-1.5 bg-green-500 text-black font-black text-base md:text-lg uppercase rounded-full mb-2 shadow-[0_0_30px_rgba(74,222,128,0.9)]">
                    🎉 UNBELIEVABLE ZERO-AHN SPECIAL! 🎉
                  </div>

                  <h1 className="text-4xl md:text-7xl font-black text-green-400 uppercase tracking-tighter drop-shadow-[0_6px_20px_rgba(0,0,0,1)] mb-2">
                    IT'S 100% [[FREE]]!!
                  </h1>

                  <p className="text-xl md:text-2xl text-yellow-300 font-black tracking-wide">
                    OPEN SOURCE ON GITHUB! ZERO CHARGE! NO HYPERLINK BLOCKED!
                  </p>
                </motion.div>
              )}

              {/* ================= SCENE 6: THE FINALE / CALL TO ACTION ================= */}
              {scene === 6 && (
                <motion.div
                  key="scene-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full"
                >
                  <div className="flex items-center justify-center gap-6 mb-3">
                    <img
                      src={tennaDancing}
                      alt="Tenna Dancing"
                      className="h-28 md:h-36 object-contain drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]"
                    />
                    <div className="text-left">
                      <div className="inline-block px-3 py-1 bg-yellow-400 text-black font-black text-xs uppercase rounded-full mb-1">
                        ⭐ NOW'S YOUR CHANCE TO BE A ⭐
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black text-yellow-300 tracking-tight leading-none">
                        [[BIG SHOT]] MANAGER!!
                      </h1>
                    </div>
                  </div>

                  {/* Big Glowing Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-6">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openUrl(CHARGE_GRINDER_REPO_URL)}
                      className="p-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-black font-black rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.7)] flex items-center justify-center gap-3 text-base md:text-lg uppercase tracking-wider"
                    >
                      <ExternalLink className="w-6 h-6 stroke-[3]" />
                      VISIT WALPTH'S REPO!
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openUrl(CHARGE_GRINDER_REPO_URL)}
                      className="p-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black font-black rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.7)] flex items-center justify-center gap-3 text-base md:text-lg uppercase tracking-wider"
                    >
                      <Star className="w-6 h-6 fill-current stroke-[2]" />
                      STAR THE REPO!
                    </motion.button>
                  </div>

                  {/* Sub-actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleRestart}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl flex items-center gap-2 border border-neutral-700 transition-colors uppercase tracking-wider"
                    >
                      <RotateCcw className="w-4 h-4 text-cyan-400" />
                      REPLAY COMMERCIAL
                    </button>

                    <button
                      onClick={handleFinish}
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-yellow-400 font-black text-sm rounded-xl flex items-center gap-2 border-2 border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                      ENTER THE TERMINAL
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom TV Status Bar */}
          <div className="relative z-20 px-6 py-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>SPAMTON / TENNA COMMERCIAL PROTOCOL ACTIVE</span>
            </div>
            <div className="text-yellow-500 font-bold">
              {scene < 6 ? '⚠️ LOCKED: ENJOY THE WACKY BROADCAST' : '✅ BROADCAST CONCLUDED - UNLOCKED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
