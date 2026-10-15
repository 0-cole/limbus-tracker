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
  Play,
  FastForward,
  ShieldAlert,
  Zap,
  MousePointer,
  Flame,
  Award
} from 'lucide-react';

// Audio
import tennaIntroAudio from '../assets/tenna_intro.mp3';
import tennaExplosionAudio from '../assets/tenna_explosion.mp3';

// Brand & Static Assets
import anttennasLogo from '../assets/anttennas.png';
import tennaListening from '../assets/tenna_listening.png';
import tennaDancing from '../assets/tennadancing.gif';
import tennaFlying from '../assets/tennaflying.png';
import tennaMaxUp from '../assets/tennamaxup.png';
import tennaSlightlyUp from '../assets/tennaslightlyup.png';
import tennaWhisper from '../assets/tennawhisper.png';

// Sliced Equal-Proportion Animated GIFs from the Tenna Sprite Sheet
import tennaAnim1 from '../assets/tenna_anim1.gif'; // Walking / Presenting
import tennaAnim2 from '../assets/tenna_anim2.gif'; // Gesture / Talking
import tennaAnim3 from '../assets/tenna_anim3.gif'; // Dramatic TV Host Pose
import tennaAnim4 from '../assets/tenna_anim4.gif'; // Rhythmic Grooving
import tennaAnim5 from '../assets/tenna_anim5.gif'; // Expressive Hand Movements
import tennaAnim6 from '../assets/tenna_anim6.gif'; // Pointing / Dashing
import tennaAnim7 from '../assets/tenna_anim7.gif'; // Dramatic Shaking / Shock
import tennaAnim8 from '../assets/tenna_anim8.gif'; // Proud Variety Stance

const CHARGE_GRINDER_REPO_URL = 'https://github.com/Walpth/Charge-Grinder/';

export default function TennaInfomercialModal({ isOpen, onClose }) {
  const [scene, setScene] = useState(0); // 0 to 9
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [explosionPlayed, setExplosionPlayed] = useState(false);

  const audioRef = useRef(null);
  const explosionRef = useRef(null);

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

    const startShow = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 0.85;
          await audioRef.current.play();
          setIsPlaying(true);
          setAudioBlocked(false);
        } catch (err) {
          setAudioBlocked(true);
        }
      }
    };

    startShow();

    // Lock page navigation / escape keys while commercial broadcast is active
    const handleKeyDown = (e) => {
      if (scene < 9) {
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

  // Synchronized Scene Progression (Extended for Relaxed, Comfortable Reading Pace):
  // 0.0s - 9.0s: Scene 0 (Emergency Bulletin: Tired of Tapping Win Rate?)
  // 9.0s - 19.0s: Scene 1 (The Wacky Pitch: Want a WAAACKY MD Grinder? Look No Further!)
  // 19.0s - 30.0s: Scene 2 (The Legend Arrives: Walpth's Charge Grinder v3.5.3)
  // 30.0s - 42.0s: Scene 3 (Biomechanical Curves & Gaussian Jitter: Pure Human Flow)
  // 42.0s - 54.0s: Scene 4 (Zero-Second Event Sniping: Sprint Through Peccatula)
  // 54.0s - 66.0s: Scene 5 (Clash Struggle Mitigation & Emergency Fluid Sac)
  // 66.0s - 78.0s: Scene 6 (Custom Keyword Teams, Saved Turn Orders & 1080p/720p)
  // 78.0s - 90.0s: Scene 7 (The Price Inquiry: 400 Shards? 1300 Lunacy? NO!!)
  // 90.0s - 102.0s: Scene 8 (The Climax Explosion: It's 100% FREE on GitHub!)
  // 102.0s+: Scene 9 (The Grand Finale & Call-to-Action Unlock)
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    if (t < 9.0) {
      if (scene !== 0) setScene(0);
    } else if (t < 19.0) {
      if (scene !== 1) setScene(1);
    } else if (t < 30.0) {
      if (scene !== 2) setScene(2);
    } else if (t < 42.0) {
      if (scene !== 3) setScene(3);
    } else if (t < 54.0) {
      if (scene !== 4) setScene(4);
    } else if (t < 66.0) {
      if (scene !== 5) setScene(5);
    } else if (t < 78.0) {
      if (scene !== 6) setScene(6);
    } else if (t < 90.0) {
      if (scene !== 7) setScene(7);
    } else if (t < 102.0) {
      if (scene !== 8) {
        setScene(8);
        if (!explosionPlayed && explosionRef.current) {
          explosionRef.current.volume = 0.9;
          explosionRef.current.currentTime = 0;
          explosionRef.current.play().catch(() => {});
          setExplosionPlayed(true);
        }
      }
    } else {
      if (scene !== 9) {
        setScene(9);
        localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
      }
    }
  };

  // Fallback timer if audio fails to load
  useEffect(() => {
    if (!isOpen || isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.5;
        if (next >= 102.0) {
          setScene(9);
          localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
          clearInterval(interval);
        } else if (next >= 90.0) {
          setScene(8);
        } else if (next >= 78.0) {
          setScene(7);
        } else if (next >= 66.0) {
          setScene(6);
        } else if (next >= 54.0) {
          setScene(5);
        } else if (next >= 42.0) {
          setScene(4);
        } else if (next >= 30.0) {
          setScene(3);
        } else if (next >= 19.0) {
          setScene(2);
        } else if (next >= 9.0) {
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

  const skipToFinale = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 102.0;
    }
    setScene(9);
    localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden select-none font-mono">
      {/* Audio elements */}
      <audio
        ref={audioRef}
        src={tennaIntroAudio}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setScene(9);
          localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
        }}
      />
      <audio ref={explosionRef} src={tennaExplosionAudio} />

      {/* Retro CRT Television Enclosure */}
      <div className="relative w-full h-full max-w-[1440px] max-h-[880px] p-4 md:p-8 flex flex-col items-center justify-center">
        {/* Antenna ears on top of the cabinet */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-end gap-16 pointer-events-none opacity-80 z-20">
          <div className="w-1.5 h-16 bg-gradient-to-t from-neutral-600 to-neutral-400 rotate-[-25deg] origin-bottom rounded-full shadow-lg" />
          <div className="w-1.5 h-20 bg-gradient-to-t from-neutral-600 to-neutral-400 rotate-[22deg] origin-bottom rounded-full shadow-lg" />
        </div>

        {/* Curved CRT Screen Container */}
        <div className="relative w-full h-full bg-neutral-950 rounded-[40px] border-[12px] border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
          {/* Scanlines Filter */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))`,
              backgroundSize: '100% 4px, 6px 100%'
            }}
          />

          {/* CRT Screen Edge Vignette */}
          <div
            className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]"
            style={{ borderRadius: '32px' }}
          />

          {/* Top Channel Broadcast Header */}
          <div className="relative z-20 flex items-center justify-between px-6 py-2.5 bg-black/70 border-b border-neutral-800 backdrop-blur-sm text-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping inline-block" />
              <span className="font-black text-red-500 tracking-widest uppercase">● LIVE TV BROADCAST</span>
              <span className="text-neutral-500">|</span>
              <span className="font-bold text-yellow-400">CH-77 BTV (DISTRICT 23)</span>
              <span className="text-neutral-500">|</span>
              <span className="text-cyan-400 font-mono">SCENE {scene + 1}/10</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-neutral-400 font-mono">
                {currentTime.toFixed(1)}s / 102s
              </span>
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
              </button>
              {scene > 0 && scene < 9 && (
                <button
                  onClick={skipToFinale}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Skip to Finale"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>SKIP TO FINALE</span>
                </button>
              )}
            </div>
          </div>

          {/* Autoplay Fallback Prompt */}
          {audioBlocked && (
            <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-6 text-center">
              <motion.img
                src={anttennasLogo}
                alt="Anttennas"
                className="h-28 object-contain mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <h2 className="text-2xl md:text-3xl font-black text-yellow-400 mb-2 uppercase tracking-wide">
                📺 THE BROADCAST IS WAITING FOR YOU!
              </h2>
              <p className="text-neutral-300 text-sm max-w-md mb-6">
                CLICK BELOW TO TURN ON THE TV AND BLAST THE THEME MUSIC!
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

          {/* Variety Show Stage */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-b from-[#180a2a] via-[#090514] to-[#040108]">
            {/* Animated Retro Grid Floor */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(236, 72, 153, 0.2) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Rotating Stage Lights */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
              <motion.div
                className="w-[1200px] h-[1200px] rounded-full border-[2px] border-dashed border-yellow-400/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-[800px] h-[800px] rounded-full border-[2px] border-dotted border-pink-500/40"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Neon Logo at Top */}
            <div className="relative z-10 mb-2">
              <motion.img
                src={anttennasLogo}
                alt="Anttennas"
                className="h-14 md:h-18 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* ========================================================= */}
            {/* SCENES (Carefully Paced at 10-12s with Staggered Reading)  */}
            {/* ========================================================= */}
            <AnimatePresence mode="wait">

              {/* SCENE 0 (0-9s): Emergency Special Bulletin */}
              {scene === 0 && (
                <motion.div
                  key="scene-0"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <motion.div
                    animate={{ rotate: [-2, 2, -2], y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="mb-3"
                  >
                    <img
                      src={tennaAnim7}
                      alt="Tenna Dramatic Shock"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]"
                    />
                  </motion.div>

                  <div className="inline-block px-4 py-1 bg-red-600 text-white font-black text-xs uppercase rounded-full mb-3 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse">
                    ⚠️ SPECIAL EMERGENCY REPORT — DISTRICT 23 ⚠️
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-yellow-300 uppercase tracking-tight leading-snug drop-shadow mb-2">
                    ARE YOU TIRED OF TAPPING <span className="text-red-500 underline decoration-wavy">WIN RATE</span>?!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    className="text-sm md:text-lg text-neutral-200 font-bold max-w-xl leading-relaxed"
                  >
                    DO YOUR POOR MANAGER FINGERS CRAMP WHILE VERGILIUS GIVES YOU THE DEATH GLARE?!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.5, duration: 0.4 }}
                    className="mt-3 px-4 py-1.5 bg-black/60 border border-amber-500/50 rounded-xl text-xs text-amber-300 font-medium"
                  >
                    CHARON WANTS CANDIES! KENNETH CRIED THREE TIMES TODAY! YOUR HANDS DESERVE BETTER!
                  </motion.div>
                </motion.div>
              )}

              {/* SCENE 1 (9-19s): The Wacky Promise */}
              {scene === 1 && (
                <motion.div
                  key="scene-1"
                  initial={{ opacity: 0, x: -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 80 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl"
                >
                  <motion.div
                    animate={{ x: [-15, 15, -15], y: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    className="mb-3"
                  >
                    <img
                      src={tennaAnim1}
                      alt="Tenna Walking Presenting"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(56,189,248,0.9)]"
                    />
                  </motion.div>

                  <div className="inline-block px-4 py-1 bg-cyan-500 text-black font-black text-xs uppercase rounded-full mb-3 shadow-[0_0_20px_rgba(56,189,248,0.8)]">
                    ⚡ STOP RIGHT THERE, SILLY MANAGER! ⚡
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-cyan-300 uppercase tracking-tight leading-snug mb-2">
                    WANT A <span className="text-yellow-400 font-extrabold animate-bounce inline-block">WAAACKY</span> AUTOMATIC MIRROR DUNGEON GRINDER?!
                  </h1>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.8)] my-2"
                  >
                    <span className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                      LOOK NO FURTHER!!
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5, duration: 0.4 }}
                    className="text-xs md:text-sm text-neutral-300 font-semibold max-w-lg mt-1"
                  >
                    TIRED OF FARMING 400 FLOORS JUST FOR THREE SHARD CRATES?! WE HAVE THE GREATEST INVENTION IN THE CITY!
                  </motion.p>
                </motion.div>
              )}

              {/* SCENE 2 (19-30s): The Hero Entrance: Walpth's Charge Grinder */}
              {scene === 2 && (
                <motion.div
                  key="scene-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 0.45 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 0.7 }}
                    className="mb-2"
                  >
                    <img
                      src={tennaAnim3}
                      alt="Tenna Dramatic Pose"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_35px_rgba(250,204,21,0.9)]"
                    />
                  </motion.div>

                  <div className="inline-block px-5 py-1 bg-yellow-400 text-black font-black text-xs uppercase rounded-full mb-2 shadow-[0_0_25px_rgba(250,204,21,0.9)]">
                    ✨ INTRODUCING THE LEGEND ✨
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 uppercase tracking-tight leading-tight mb-2">
                    WALPTH'S CHARGE GRINDER v3.5.3!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    className="text-sm md:text-lg text-yellow-200 font-bold max-w-xl mb-3"
                  >
                    THE #1 MIRROR DUNGEON AUTOMATION BEHEMOTH IN ALL OF DISTRICT 23!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5, duration: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-neutral-300"
                  >
                    <span className="px-3 py-1 bg-neutral-900 border border-yellow-400/40 rounded-lg text-yellow-300">
                      ★ CLEAN PYTHON ENGINE
                    </span>
                    <span className="px-3 py-1 bg-neutral-900 border border-cyan-400/40 rounded-lg text-cyan-300">
                      ★ BILLIONS OF ENKEPHALIN MODULES TESTED
                    </span>
                    <span className="px-3 py-1 bg-neutral-900 border border-pink-400/40 rounded-lg text-pink-300">
                      ★ 100% COMMUNITY PRAISED
                    </span>
                  </motion.div>
                </motion.div>
              )}

              {/* SCENE 3 (30-42s): Biomechanical Splines & Human Jitter */}
              {scene === 3 && (
                <motion.div
                  key="scene-3"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <div className="flex items-center gap-5 mb-3">
                    <img
                      src={tennaAnim5}
                      alt="Tenna Expressive Gestures"
                      className="h-36 md:h-48 object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]"
                    />
                    <div className="text-left">
                      <div className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                        FEATURE SPOTLIGHT #1
                      </div>
                      <div className="text-lg md:text-2xl font-black text-white leading-tight">
                        BIOMECHANICAL SPLINE CURVES!
                      </div>
                      <div className="text-xs text-neutral-400 font-medium mt-1">
                        NO TELEPORTING BOT CLICKS! 100% NATURAL CURVES!
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-yellow-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <MousePointer className="w-5 h-5 text-yellow-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-yellow-200">
                        CUBIC BEZIER ARCS GLIDE SMOOTHLY LIKE REAL HANDS!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.2, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-cyan-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-cyan-200">
                        GAUSSIAN MICRO-JITTER (±1.5px) PREVENTS BOT DETECTION!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.5, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-pink-400/50 rounded-xl flex items-center gap-3 shadow md:col-span-2"
                    >
                      <Award className="w-5 h-5 text-pink-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-pink-200">
                        90ms TO 115ms HUMAN KEY & CLICK DWELL DURATION!
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* SCENE 4 (42-54s): Zero-Second Event Sniping */}
              {scene === 4 && (
                <motion.div
                  key="scene-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <div className="flex items-center gap-5 mb-3">
                    <img
                      src={tennaAnim6}
                      alt="Tenna Pointing Dashing"
                      className="h-36 md:h-48 object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.8)]"
                    />
                    <div className="text-left">
                      <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
                        FEATURE SPOTLIGHT #2
                      </div>
                      <div className="text-lg md:text-2xl font-black text-white leading-tight">
                        0-SECOND EVENT SNIPING!
                      </div>
                      <div className="text-xs text-neutral-400 font-medium mt-1">
                        WARP PAST TEDIOUS PECCATULA AT MACH SPEED!
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-amber-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-amber-200">
                        AUTO W / D / S ROUTING FAVORS 0-SECOND ABNORMALITY EVENTS!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.2, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-green-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-green-200">
                        INTELLIGENT CHECK SCANS: VERY HIGH &gt; HIGH &gt; COMMENCE!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.5, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-blue-400/50 rounded-xl flex items-center gap-3 shadow md:col-span-2"
                    >
                      <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-blue-200">
                        SKIPS 50+ MINUTE COMBAT GRINDS INTO FAST 10-MINUTE RUNS!
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* SCENE 5 (54-66s): Clash Struggle Mitigation & Emergency Fluid Sac */}
              {scene === 5 && (
                <motion.div
                  key="scene-5"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <div className="flex items-center gap-5 mb-3">
                    <img
                      src={tennaAnim4}
                      alt="Tenna Grooving"
                      className="h-36 md:h-48 object-contain drop-shadow-[0_0_25px_rgba(244,63,94,0.8)]"
                    />
                    <div className="text-left">
                      <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">
                        FEATURE SPOTLIGHT #3
                      </div>
                      <div className="text-lg md:text-2xl font-black text-white leading-tight">
                        TACTICAL CLASH SAFETY &amp; FLUID SAC!
                      </div>
                      <div className="text-xs text-neutral-400 font-medium mt-1">
                        FAUST HERSELF COULD NOT DEVISE A BETTER SAFETY NET!
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-rose-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <Flame className="w-5 h-5 text-rose-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-rose-200">
                        1.5s RADIAL WHEEL LONG-PRESS MITIGATES CLASH STRUGGLES!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.2, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-emerald-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-emerald-200">
                        INSTANT ALT-TAB FAILSAFE: PAUSES THE SECOND GAME LOSES FOCUS!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.5, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-purple-400/50 rounded-xl flex items-center gap-3 shadow md:col-span-2"
                    >
                      <Award className="w-5 h-5 text-purple-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-purple-200">
                        AUTO FLUID SAC DEPLOYMENT KEEPS SANITY MAXED AT +45!
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* SCENE 6 (66-78s): Custom Teams & 1080p / 720p */}
              {scene === 6 && (
                <motion.div
                  key="scene-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <div className="flex items-center gap-5 mb-3">
                    <img
                      src={tennaAnim8}
                      alt="Tenna Proud Stance"
                      className="h-36 md:h-48 object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]"
                    />
                    <div className="text-left">
                      <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                        FEATURE SPOTLIGHT #4
                      </div>
                      <div className="text-lg md:text-2xl font-black text-white leading-tight">
                        YOUR TEAMS &amp; YOUR RESOLUTION!
                      </div>
                      <div className="text-xs text-neutral-400 font-medium mt-1">
                        CALIBRATED FOR BOTH 1920x1080 &amp; 1280x720 (16:9)!
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-indigo-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-indigo-200">
                        SAVED TURN ORDERS (#1 TO #12) FOR ALL 7 KEYWORD TEAMS!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.2, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-teal-400/50 rounded-xl flex items-center gap-3 shadow"
                    >
                      <MousePointer className="w-5 h-5 text-teal-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-teal-200">
                        SCROLLS TEAM LIST VIA NATIVE MOUSE WHEEL DRIVER!
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.5, duration: 0.3 }}
                      className="p-3 bg-neutral-900/90 border border-yellow-400/50 rounded-xl flex items-center gap-3 shadow md:col-span-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                      <span className="text-xs md:text-sm font-black text-yellow-200">
                        KEYWORDLESS EGO GIFT CUSTOMIZER: BUY, KEEP &amp; UPTIE PRESETS!
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* SCENE 7 (78-90s): The Price Inquiry */}
              {scene === 7 && (
                <motion.div
                  key="scene-7"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <motion.div
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="mb-3"
                  >
                    <img
                      src={tennaAnim2}
                      alt="Tenna Talking"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]"
                    />
                  </motion.div>

                  <div className="inline-block px-4 py-1 bg-amber-500 text-black font-black text-xs uppercase rounded-full mb-3">
                    💰 WHAT'S THE DAMAGE, YOU ASK?! 💰
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-snug mb-2">
                    FOUR HUNDRED NOMINABLE SHARDS?!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.3 }}
                    className="text-lg md:text-2xl text-red-400 font-extrabold line-through mb-3"
                  >
                    1,300 LUNACY?! SELLING CHARON'S BUS SEATS?!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.5, duration: 0.4 }}
                    className="px-6 py-2 bg-red-600 text-white font-black text-xl md:text-2xl uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse"
                  >
                    NO!! NOT A SINGLE AHN!!
                  </motion.div>
                </motion.div>
              )}

              {/* SCENE 8 (90-102s): The Climax / Explosion: It's 100% Free! */}
              {scene === 8 && (
                <motion.div
                  key="scene-8"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [1, 1.08, 1] }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-4xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.45 }}
                    className="mb-2"
                  >
                    <img
                      src={tennaMaxUp}
                      alt="Tenna Max Up Screaming"
                      className="h-44 md:h-64 object-contain drop-shadow-[0_0_50px_rgba(74,222,128,1)]"
                    />
                  </motion.div>

                  <div className="px-5 py-1.5 bg-green-500 text-black font-black text-sm md:text-base uppercase rounded-full mb-2 shadow-[0_0_30px_rgba(74,222,128,0.9)]">
                    🎉 UNBELIEVABLE ZERO-AHN SPECIAL! 🎉
                  </div>

                  <h1 className="text-4xl md:text-7xl font-black text-green-400 uppercase tracking-tighter drop-shadow-[0_6px_20px_rgba(0,0,0,1)] mb-2">
                    IT'S 100% [[FREE]]!!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    className="text-lg md:text-2xl text-yellow-300 font-black tracking-wide"
                  >
                    OPEN SOURCE ON GITHUB! ZERO CHARGE! NO HYPERLINK BLOCKED!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5, duration: 0.4 }}
                    className="mt-3 text-xs text-neutral-300 font-bold max-w-md"
                  >
                    WALPTH GIVES IT FREELY TO ALL MANAGERS OF THE CITY AS AN ACT OF PURE JUSTICE!
                  </motion.div>
                </motion.div>
              )}

              {/* SCENE 9 (102s+): The Grand Finale & Call to Action */}
              {scene === 9 && (
                <motion.div
                  key="scene-9"
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
              {scene < 9 ? '⚠️ LOCKED: ENJOY THE WACKY BROADCAST' : '✅ BROADCAST CONCLUDED - UNLOCKED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
