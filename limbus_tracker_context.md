# Limbus Tracker — Comprehensive Project Context & Handoff

## 1. Executive Summary & Core Objective
- **Project**: Limbus Tracker — an Electron + React companion app for *Limbus Company* (Project Moon).
- **Core Capabilities**:
  - Full Identity & EGO library with advanced multi-attribute filtering, tier lists, and shard expense calculator.
  - Interactive schedule & weekly checklist tracker.
  - Spotifast-inspired lightweight UI architecture (ultra-low CPU/RAM footprint, tactile mechanical keyboard palettes).
  - Dedicated **Walpth Charge Grinder Tribute Hub** (`/mirror-grinder`): A hilarious, over-the-top, late-night BTV infomercial celebrating Walpth's [Charge-Grinder](https://github.com/Walpth/Charge-Grinder/) repository.
  - **Spamton / Tenna Style TV Broadcast**: Unskippable retro CRT variety show presentation locking onto the screen, featuring Toby Fox's *Tenna Introduction* theme, 8 sliced equal-proportion animated GIFs from the official Tenna sprite sheet (`tenna_anim1.gif` through `tenna_anim8.gif`), dancing animations, and 10 extended, comfortably-paced comedy scenes.
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker)
- **Current Deployed Release**: `v1.0.95`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64.
- **Routing**: `HashRouter` (required for Electron's `file://` protocol).

### 2.2 Sinner Character Portraits
- All 12 official, full-color LCB character portraits (Yi Sang, Faust, Don Quixote, Ryōshū, Meursault, Hong Lu, Heathcliff, Ishmael, Rodion, Sinclair, Outis, Gregor) are bundled locally in `public/assets/sinners/{id}.webp` and packaged into `dist/assets/sinners/`, with high-res CDN fallback.

### 2.3 Updater & NSIS Configuration
- **One-Click Updates**: `oneClick: true`, `perMachine: false`, `allowToChangeInstallationDirectory: false` in `package.json`.
- **Taskbar Pin Preservation**: Custom NSIS script in `build/installer.nsh` prevents shortcut deletion during in-place updates.

### 2.4 Tenna Variety Show Infomercial & Animations
- **Sprite Sheet Extraction**: Processed `PC _ Computer - Deltarune - Enemies & Bosses (Chapter 3) - Tenna.png` to generate 8 uniform, pixel-anchored, zero-jitter animation GIFs (`tenna_anim1.gif` through `tenna_anim8.gif`).
- **Pacing**: Extended the broadcast to 10 distinct scenes (102 seconds total) with comfortable 10–12 second durations per scene and staggered typography animations for optimal reading enjoyment.
- **Components**:
  - `src/components/TennaInfomercialModal.jsx`: Fullscreen CRT television simulation, scanline overlays, channel bugs (`CH-77 BTV LIVE`), audio synchronization (`tenna_intro.mp3` & `tenna_explosion.mp3`), and Spamton/Tenna style dialogue cards.
  - `src/pages/MirrorGrinderPage.jsx`: The billboard hub with copyable `git clone` command, Project Moon customer testimonials (Vergilius, Faust, Don Quixote, Ryōshū, Meursault, Heathcliff, Charon), Dante's clock-head panic soundboard, and replay TV broadcast controls.

---

## 3. Recent Verified Changes (v1.0.95)
1. **Sprite Sheet Animation Slicing**: Sliced 8 equal-proportion, baseline-anchored animated GIFs from the Tenna sprite sheet with transparent backgrounds.
2. **Extended Comfortable Pacing**: Expanded the commercial from 30s to 102s across 10 hilarious scenes, allowing users to comfortably read all jokes and pitch details without rushing.
3. **Changelog & Version Bump**: Added Kenneth's `v1.0.95` memo and bumped `package.json` to `1.0.95`.
4. **Packaged Windows Installer**: Compiled code-signed `release2/Limbus Tracker Setup 1.0.95.exe` (143.4 MB).

---

## 4. Key File Locations
- Tenna commercial modal: `src/components/TennaInfomercialModal.jsx`
- Charge Grinder tribute page: `src/pages/MirrorGrinderPage.jsx`
- Tenna animation GIFs: `src/assets/tenna_anim*.gif` and `public/assets/tenna_anim*.gif`
- Sinner portraits: `public/assets/sinners/` and `dist/assets/sinners/`
- Changelog memos: `src/pages/ChangelogPage.jsx`
- Package config: `package.json`
