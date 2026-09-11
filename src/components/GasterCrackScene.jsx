import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function GasterCrackScene() {
  const [phase, setPhase] = useState('shatter'); // 'shatter' | 'desktop' | 'reforming'
  const audioCtxRef = useRef(null);

  // Play audio safely
  const playSound = (type) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      if (type === 'glass_shatter') {
        // High impact glass shatter noise burst
        const bufferSize = ctx.sampleRate * 0.6;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1800, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.75, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);

        // Low resonant impact thump
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(75, now);
        bass.frequency.exponentialRampToValueAtTime(25, now + 0.5);
        bassGain.gain.setValueAtTime(0.6, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.start(now);
        bass.stop(now + 0.55);
      } else if (type === 'reform_snap') {
        // Reverse warp suction & snap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Ensure HTML and body are 100% transparent so the desktop shows through!
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    // 1. Play massive glass shatter immediately
    playSound('glass_shatter');

    // 2. Shards fall off screen into desktop view (held for ~1.5s)
    const desktopTimer = setTimeout(() => {
      setPhase('desktop');
    }, 1800);

    // 3. Shards violently fly back in and reform
    const reformTimer = setTimeout(() => {
      playSound('reform_snap');
      setPhase('reforming');
    }, 3000);

    // 4. Sequence complete: close transparent overlay and restore main window
    const finishTimer = setTimeout(() => {
      if (window.electronAPI?.finishGasterWindowCrack) {
        window.electronAPI.finishGasterWindowCrack();
      }
    }, 4200);

    return () => {
      clearTimeout(desktopTimer);
      clearTimeout(reformTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  const isFalling = phase === 'shatter' || phase === 'desktop';
  const isReformed = phase === 'reforming';

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent select-none pointer-events-none z-[999999]">
      {/* Shard 1: Top-Left */}
      <motion.div
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={
          isReformed
            ? { x: 0, y: 0, rotate: 0 }
            : isFalling
            ? { x: -350, y: 1600, rotate: -24 }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={{
          duration: isReformed ? 0.65 : 1.4,
          ease: isReformed ? [0.16, 1, 0.3, 1] : [0.55, 0.05, 0.95, 0.4]
        }}
        className="absolute inset-0 bg-black"
        style={{
          clipPath: 'polygon(0 0, 53% 0, 48% 52%, 0 55%)'
        }}
      >
        <div className="w-full h-full bg-[#050505] border-r-2 border-b-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
      </motion.div>

      {/* Shard 2: Top-Right */}
      <motion.div
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={
          isReformed
            ? { x: 0, y: 0, rotate: 0 }
            : isFalling
            ? { x: 420, y: 1650, rotate: 28 }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={{
          duration: isReformed ? 0.65 : 1.45,
          ease: isReformed ? [0.16, 1, 0.3, 1] : [0.55, 0.05, 0.95, 0.4]
        }}
        className="absolute inset-0 bg-black"
        style={{
          clipPath: 'polygon(53% 0, 100% 0, 100% 50%, 48% 52%)'
        }}
      >
        <div className="w-full h-full bg-[#050505] border-l-2 border-b-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
      </motion.div>

      {/* Shard 3: Bottom-Left */}
      <motion.div
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={
          isReformed
            ? { x: 0, y: 0, rotate: 0 }
            : isFalling
            ? { x: -260, y: 1550, rotate: -18 }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={{
          duration: isReformed ? 0.65 : 1.35,
          ease: isReformed ? [0.16, 1, 0.3, 1] : [0.55, 0.05, 0.95, 0.4]
        }}
        className="absolute inset-0 bg-black"
        style={{
          clipPath: 'polygon(0 55%, 48% 52%, 52% 100%, 0 100%)'
        }}
      >
        <div className="w-full h-full bg-[#050505] border-r-2 border-t-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
      </motion.div>

      {/* Shard 4: Bottom-Right */}
      <motion.div
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={
          isReformed
            ? { x: 0, y: 0, rotate: 0 }
            : isFalling
            ? { x: 320, y: 1700, rotate: 22 }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={{
          duration: isReformed ? 0.65 : 1.5,
          ease: isReformed ? [0.16, 1, 0.3, 1] : [0.55, 0.05, 0.95, 0.4]
        }}
        className="absolute inset-0 bg-black"
        style={{
          clipPath: 'polygon(48% 52%, 100% 50%, 100% 100%, 52% 100%)'
        }}
      >
        <div className="w-full h-full bg-[#050505] border-l-2 border-t-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
      </motion.div>

      {/* Jagged Fracture Glow Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_25px_#ffffff] z-50">
        <polyline
          points="53vw,0 48vw,52vh 52vw,100vh"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={phase === 'desktop' ? 'opacity-0' : 'opacity-100 animate-pulse'}
        />
        <polyline
          points="0,55vh 48vw,52vh 100vw,50vh"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={phase === 'desktop' ? 'opacity-0' : 'opacity-100 animate-pulse'}
        />
      </svg>
    </div>
  );
}
