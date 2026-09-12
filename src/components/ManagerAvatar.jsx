import React from 'react';
import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';
import vergiliusImg from '../assets/vergilius.png';
import mephistophelesImg from '../assets/mephistopheles.png';
import sinnersData from '../data/sinners.json';
import { useStore } from '../stores/useStore.js';

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-32 h-32 text-3xl',
  '3xl': 'w-40 h-40 text-4xl',
};

export default function ManagerAvatar({
  profile: propProfile,
  size = 'md',
  className = '',
  showBorder = true,
  borderColor,
}) {
  const storeProfile = useStore((s) => s.managerProfile);
  const profile = propProfile || storeProfile || {};

  const {
    avatarType = 'sinner',
    avatarId = 'yi-sang',
    avatarZoom = 1.0,
    avatarXOffset = 0,
    avatarYOffset = 0,
    callSign = 'Dante',
  } = profile;

  const sizeClass = SIZES[size] || SIZES.md;

  // 1. Check if avatar is an image-based avatar
  let imgSrc = null;
  let sinnerMatch = null;

  if (avatarType === 'dossier') {
    imgSrc = EASTER_EGG_IMAGES[avatarId] || (avatarId === 'vergilius' ? vergiliusImg : null);
  } else {
    // Sinner type
    if (avatarId === 'dante') {
      imgSrc = EASTER_EGG_IMAGES.dante;
    } else if (avatarId === 'vergilius') {
      imgSrc = vergiliusImg;
    } else if (avatarId === 'mephistopheles') {
      imgSrc = mephistophelesImg;
    } else {
      sinnerMatch = sinnersData.find((s) => s.id === avatarId);
    }
  }

  const borderStyle = showBorder
    ? borderColor
      ? `border-2 ${borderColor}`
      : 'border-2 border-[#c9a84c]/60 shadow-[0_0_12px_rgba(201,168,76,0.25)]'
    : '';

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none flex items-center justify-center bg-black ${sizeClass} ${borderStyle} ${className}`}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={callSign || 'Manager'}
          className="w-full h-full object-cover object-top origin-[center_18%] pointer-events-none transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${avatarZoom}) translate(${avatarXOffset}%, ${avatarYOffset}%)`,
          }}
          draggable={false}
        />
      ) : sinnerMatch ? (
        <div
          className="w-full h-full flex flex-col items-center justify-center font-limbus font-black relative overflow-hidden"
          style={{
            background: `radial-gradient(circle at center, ${sinnerMatch.color}33 0%, #0a0a0a 85%)`,
            border: `1px solid ${sinnerMatch.color}55`,
          }}
        >
          {/* Sinner Roman / Number Monogram */}
          <span
            className="font-mono font-black tracking-tight"
            style={{ color: sinnerMatch.color }}
          >
            {sinnerMatch.number < 10 ? `0${sinnerMatch.number}` : sinnerMatch.number}
          </span>
          <span
            className="text-[8px] uppercase tracking-widest -mt-0.5 opacity-80"
            style={{ color: sinnerMatch.color }}
          >
            {sinnerMatch.name.split(' ')[0].substring(0, 3)}
          </span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-black font-bold text-[#c9a84c]">
          {callSign?.charAt(0)?.toUpperCase() || 'D'}
        </div>
      )}
    </div>
  );
}
