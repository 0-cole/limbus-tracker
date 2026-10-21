import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Star,
  Tv,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Play,
  FastForward,
  Sparkles,
  Zap,
  X
} from 'lucide-react';

// Audio
import tennaIntroAudio from '../assets/tenna_intro.mp3';
import tennaExplosionAudio from '../assets/tenna_explosion.mp3';

// Clean, high-res authentic Deltarune Tenna assets
import anttennasLogo from '../assets/anttennas.png';
import tennaListening from '../assets/tenna_listening.png';
import tennaDancing from '../assets/tennadancing.gif';
import tennaFlying from '../assets/tennaflying.png';
import tennamaxup from '../assets/tennamaxup.png';

const CHARGE_GRINDER_REPO_URL = 'https://github.com/Walpth/Charge-Grinder/';

// Compressed, snappy comedic timeline (~19s total audio duration)
const SCENE_TIMES = {
  SCENE_1: 3.5,
  SCENE_2: 7.0,
  SCENE_3: 11.0,
  SCENE_4: 15.0,
  FINALE: 19.0
};

export default function TennaInfomercialModal({ isOpen, onClose }) {
  const [scene, setScene] = useState(0); // 0 to 5
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.3); // 1.3x default for high-energy infomercial pacing!
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

  const handleFinish = () => {
    localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (explosionRef.current) {
      explosionRef.current.pause();
    }
    if (onClose) onClose();
  };

  const skipToFinale = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = SCENE_TIMES.FINALE;
      audioRef.current.volume = 0.4;
    }
    setScene(5);
    localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
  };

  const cycleSpeed = () => {
    const nextSpeed = speed === 1.0 ? 1.3 : speed === 1.3 ? 2.0 : 1.0;
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Sync speed changes to audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

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
          audioRef.current.playbackRate = speed;
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

    // Keyboard controls: ESC/Space/Enter skips ad immediately, ESC at finale closes modal
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (scene < 5) {
          skipToFinale();
        } else {
          handleFinish();
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (scene < 5) {
          e.preventDefault();
          e.stopPropagation();
          skipToFinale();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, scene, speed]);

  // Fast-paced scene progression (~3.5s to 4.0s per act)
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    if (t < SCENE_TIMES.SCENE_1) {
      if (scene !== 0) setScene(0);
    } else if (t < SCENE_TIMES.SCENE_2) {
      if (scene !== 1) setScene(1);
    } else if (t < SCENE_TIMES.SCENE_3) {
      if (scene !== 2) setScene(2);
    } else if (t < SCENE_TIMES.SCENE_4) {
      if (scene !== 3) setScene(3);
    } else if (t < SCENE_TIMES.FINALE) {
      if (scene !== 4) {
        setScene(4);
        if (!explosionPlayed && explosionRef.current) {
          explosionRef.current.volume = 0.9;
          explosionRef.current.currentTime = 0;
          explosionRef.current.play().catch(() => {});
          setExplosionPlayed(true);
        }
      }
    } else {
      if (scene !== 5) {
        setScene(5);
        if (audioRef.current) {
          audioRef.current.volume = 0.4;
        }
        localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
      }
    }
  };

  // Fallback timer if audio fails to load
  useEffect(() => {
    if (!isOpen || isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.3 * speed;
        if (next >= SCENE_TIMES.FINALE) {
          setScene(5);
          localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
          clearInterval(interval);
        } else if (next >= SCENE_TIMES.SCENE_4) {
          setScene(4);
        } else if (next >= SCENE_TIMES.SCENE_3) {
          setScene(3);
        } else if (next >= SCENE_TIMES.SCENE_2) {
          setScene(2);
        } else if (next >= SCENE_TIMES.SCENE_1) {
          setScene(1);
        }
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, speed]);

  const handleStartWithClick = async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = 0.85;
        await audioRef.current.play();
        setIsPlaying(true);
        setAudioBlocked(false);
      } catch (err) {
        setAudioBlocked(false);
      }
    }
  };

  const handleRestart = () => {
    setScene(0);
    setCurrentTime(0);
    setExplosionPlayed(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speed;
      audioRef.current.volume = 0.85;
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
    <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center overflow-hidden select-none font-sans">
      {/* Audio tags */}
      <audio
        ref={audioRef}
        src={tennaIntroAudio}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setScene(5);
          localStorage.setItem('limbus_chargegrinder_commercial_seen', 'true');
        }}
      />
      <audio ref={explosionRef} src={tennaExplosionAudio} />

      {/* Clean Retro TV Screen Housing */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[820px] p-4 md:p-6 flex flex-col items-center justify-center">
        {/* Subtle retro antenna */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-end gap-12 pointer-events-none opacity-60 z-20">
          <div className="w-1.5 h-12 bg-neutral-600 rotate-[-20deg] origin-bottom rounded-full" />
          <div className="w-1.5 h-14 bg-neutral-500 rotate-[18deg] origin-bottom rounded-full" />
        </div>

        {/* Clean Monitor Frame */}
        <div className="relative w-full h-full bg-[#0d0914] rounded-2xl border-4 border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Subtle vignette border glow */}
          <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] rounded-xl" />

          {/* Top Channel Header with Instant Skip & Speed Controls */}
          <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-black/85 border-b border-neutral-800 text-xs">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
              <span className="font-black text-red-400 tracking-wider uppercase text-[11px] sm:text-xs">
                ● BTV LIVE BROADCAST
              </span>
              <span className="text-neutral-600 hidden sm:inline">|</span>
              <span className="font-bold text-yellow-400 hidden sm:inline">CH-77 (DISTRICT 23)</span>
              <span className="text-neutral-600 hidden sm:inline">|</span>
              <span className="text-neutral-300 font-mono text-[11px] sm:text-xs">
                {scene < 5 ? `SCENE ${scene + 1}/5` : 'FINALE'}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Speed Multiplier Button */}
              <button
                onClick={cycleSpeed}
                className="px-2 py-1 rounded bg-neutral-800/90 hover:bg-neutral-700 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-bold flex items-center gap-1 transition-colors border border-cyan-500/20"
                title="Cycle playback speed (1.0x / 1.3x / 2.0x)"
              >
                <Zap className="w-3 h-3 text-cyan-400 fill-current" />
                <span>{speed.toFixed(1)}x</span>
              </button>

              {/* Timestamp */}
              <span className="text-neutral-400 font-mono text-[11px] sm:text-xs">
                {Math.min(currentTime, SCENE_TIMES.FINALE).toFixed(1)}s / {SCENE_TIMES.FINALE}s
              </span>

              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
              </button>

              {/* Prominent, Instant Skip Button (Always Available in Scenes 0-4) */}
              {scene < 5 && (
                <button
                  onClick={skipToFinale}
                  className="px-2.5 sm:px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95 uppercase tracking-wider"
                  title="Skip Ad to Finale [ESC or SPACE]"
                >
                  <FastForward className="w-3.5 h-3.5 fill-current" />
                  <span>SKIP AD</span>
                </button>
              )}

              {/* Close Window Button */}
              <button
                onClick={handleFinish}
                className="p-1.5 rounded-md bg-neutral-800/80 hover:bg-red-900/60 text-neutral-400 hover:text-red-300 transition-colors"
                title="Close Ad [ESC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Autoplay Fallback Prompt */}
          {audioBlocked && (
            <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-6 text-center">
              <motion.img
                src={anttennasLogo}
                alt="Anttennas"
                className="h-24 object-contain mb-6 drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <h2 className="text-2xl font-black text-yellow-400 mb-2 uppercase tracking-wide">
                📺 THE BROADCAST IS WAITING FOR YOU!
              </h2>
              <p className="text-neutral-300 text-sm max-w-md mb-6">
                Click below to turn on the TV sound and watch the show!
              </p>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleStartWithClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-7 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base rounded-xl shadow-lg flex items-center gap-2 uppercase tracking-wider"
                >
                  <Play className="w-5 h-5 fill-current" />
                  TURN ON THE T.V.!
                </motion.button>
                <button
                  onClick={skipToFinale}
                  className="px-5 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-sm rounded-xl transition-colors"
                >
                  SKIP STRAIGHT TO DOSSIER
                </button>
              </div>
            </div>
          )}

          {/* Clean Stage Content */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden bg-gradient-to-b from-[#180a28] via-[#0b0614] to-[#040108]">
            
            {/* Subtle retro backdrop */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(236, 72, 153, 0.15) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px)`,
                backgroundSize: '48px 48px'
              }}
            />

            {/* Neon Logo */}
            <div className="relative z-10 mb-2">
              <motion.img
                src={anttennasLogo}
                alt="Anttennas"
                className="h-14 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* ======================================================== */}
            {/* COMEDIC ACTS (Punchy, fast-paced, rapid fire jokes)       */}
            {/* ======================================================== */}
            <AnimatePresence mode="wait">

              {/* ACT 0: Emergency Special Report */}
              {scene === 0 && (
                <motion.div
                  key="scene-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-2xl"
                >
                  <motion.div
                    animate={{ rotate: [-2, 2, -2], y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="mb-3"
                  >
                    <img
                      src={tennamaxup}
                      alt="Tenna Panic"
                      className="h-44 md:h-56 object-contain drop-shadow-lg"
                    />
                  </motion.div>

                  <div className="inline-block px-3.5 py-1 bg-red-600 text-white font-black text-xs uppercase rounded-full mb-3 shadow animate-pulse">
                    ⚠️ SPECIAL REPORT — DISTRICT 23 ⚠️
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-yellow-300 uppercase tracking-tight leading-snug mb-2">
                    ARE YOU TIRED OF TAPPING <span className="text-red-500 underline decoration-wavy">WIN RATE</span>?!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.25 }}
                    className="text-sm md:text-lg text-neutral-200 font-bold max-w-lg leading-relaxed"
                  >
                    DO YOUR POOR MANAGER FINGERS CRAMP WHILE VERGILIUS GIVES YOU THE DEATH GLARE?!
                  </motion.p>
                </motion.div>
              )}

              {/* ACT 1: The Wacky Pitch */}
              {scene === 1 && (
                <motion.div
                  key="scene-1"
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 60 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <motion.div
                    animate={{ x: [-15, 15, -15], y: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }}
                    className="mb-3"
                  >
                    <img
                      src={tennaFlying}
                      alt="Tenna Flying"
                      className="h-44 md:h-56 object-contain drop-shadow-lg"
                    />
                  </motion.div>

                  <div className="inline-block px-3.5 py-1 bg-cyan-500 text-black font-black text-xs uppercase rounded-full mb-3">
                    ⚡ STOP RIGHT THERE, SILLY MANAGER! ⚡
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-cyan-300 uppercase tracking-tight leading-snug mb-2">
                    WANT A <span className="text-yellow-400 font-extrabold animate-bounce inline-block">WAAACKY</span> AUTOMATIC MIRROR DUNGEON GRINDER?!
                  </h1>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, duration: 0.25 }}
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg my-2"
                  >
                    <span className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                      LOOK NO FURTHER!!
                    </span>
                  </motion.div>
                </motion.div>
              )}

              {/* ACT 2: The Reveal: Walpth's Charge Grinder */}
              {scene === 2 && (
                <motion.div
                  key="scene-2"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 0.7 }}
                    className="mb-2"
                  >
                    {/* The authentic, official 59-frame full-res Deltarune dance! */}
                    <img
                      src={tennaDancing}
                      alt="Tenna Dancing"
                      className="h-44 md:h-56 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                    />
                  </motion.div>

                  <div className="inline-block px-4 py-1 bg-yellow-400 text-black font-black text-xs uppercase rounded-full mb-2">
                    ✨ INTRODUCING THE MASTERPIECE ✨
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 uppercase tracking-tight leading-tight mb-2">
                    WALPTH'S CHARGE GRINDER v3.5.3!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.25 }}
                    className="text-sm md:text-lg text-yellow-200 font-bold max-w-lg mb-2"
                  >
                    THE #1 MIRROR DUNGEON BEHEMOTH IN ALL OF DISTRICT 23!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.25 }}
                    className="text-xs text-neutral-300 font-medium bg-black/60 px-4 py-1.5 rounded-lg border border-neutral-700"
                  >
                    Kenneth has officially retired to run a tea shop in the Outskirts! Walpth is your god now!
                  </motion.div>
                </motion.div>
              )}

              {/* ACT 3: The Price Inquiry */}
              {scene === 3 && (
                <motion.div
                  key="scene-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-2xl"
                >
                  <motion.div
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="mb-3"
                  >
                    <img
                      src={tennaListening}
                      alt="Tenna Listening"
                      className="h-44 md:h-56 object-contain drop-shadow-lg"
                    />
                  </motion.div>

                  <div className="inline-block px-3.5 py-1 bg-amber-500 text-black font-black text-xs uppercase rounded-full mb-3">
                    💰 WHAT'S THE DAMAGE, YOU ASK?! 💰
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-snug mb-2">
                    FOUR HUNDRED NOMINABLE SHARDS?!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.25 }}
                    className="text-lg md:text-2xl text-red-400 font-extrabold line-through mb-3"
                  >
                    1,300 LUNACY?! SELLING CHARON'S BUS SEATS?!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.25 }}
                    className="px-6 py-2 bg-red-600 text-white font-black text-xl md:text-2xl uppercase tracking-widest rounded-xl shadow-lg animate-pulse"
                  >
                    NO!! NOT A SINGLE AHN!!
                  </motion.div>
                </motion.div>
              )}

              {/* ACT 4: The Climax / Explosion: 100% Free! */}
              {scene === 4 && (
                <motion.div
                  key="scene-4"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: [1, 1.06, 1] }}
                  exit={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.35 }}
                    className="mb-2"
                  >
                    <img
                      src={tennamaxup}
                      alt="Tenna Screaming"
                      className="h-44 md:h-60 object-contain drop-shadow-[0_0_40px_rgba(74,222,128,0.8)]"
                    />
                  </motion.div>

                  <div className="px-4 py-1 bg-green-500 text-black font-black text-xs md:text-sm uppercase rounded-full mb-2">
                    🎉 UNBELIEVABLE ZERO-AHN SPECIAL! 🎉
                  </div>

                  <h1 className="text-4xl md:text-7xl font-black text-green-400 uppercase tracking-tighter drop-shadow-md mb-2">
                    IT'S 100% [[FREE]]!!
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.25 }}
                    className="text-lg md:text-2xl text-yellow-300 font-black tracking-wide"
                  >
                    OPEN SOURCE ON GITHUB! ZERO CHARGE! NO HYPERLINK BLOCKED!
                  </motion.p>
                </motion.div>
              )}

              {/* ACT 5: Finale & Call to Action */}
              {scene === 5 && (
                <motion.div
                  key="scene-5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full"
                >
                  <div className="flex items-center justify-center gap-5 mb-4">
                    <img
                      src={tennaDancing}
                      alt="Tenna Dancing"
                      className="h-28 md:h-36 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]"
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

                  {/* Clean, high-impact buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full max-w-xl mb-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openUrl(CHARGE_GRINDER_REPO_URL)}
                      className="p-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl shadow-lg flex items-center justify-center gap-2.5 text-base uppercase tracking-wider transition-colors"
                    >
                      <ExternalLink className="w-5 h-5 stroke-[2.5]" />
                      VISIT WALPTH'S REPO!
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openUrl(CHARGE_GRINDER_REPO_URL)}
                      className="p-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl shadow-lg flex items-center justify-center gap-2.5 text-base uppercase tracking-wider transition-colors"
                    >
                      <Star className="w-5 h-5 fill-current stroke-[2]" />
                      STAR THE REPO!
                    </motion.button>
                  </div>

                  {/* Sub-actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRestart}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                      REPLAY SHOW
                    </button>

                    <button
                      onClick={handleFinish}
                      className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-yellow-400 font-black text-xs rounded-lg flex items-center gap-2 border border-yellow-400/50 shadow transition-all uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                      PROCEED TO DOSSIER
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Bar */}
          <div className="relative z-20 px-6 py-2 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>SPAMTON / TENNA COMMERCIAL PROTOCOL</span>
            </div>
            <div className="text-yellow-500 font-bold">
              {scene < 5 ? '⚡ BROADCAST IN PROGRESS — PRESS ESC / SPACE TO SKIP' : '✅ BROADCAST CONCLUDED — DOSSIER UNLOCKED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
