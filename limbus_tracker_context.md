# Limbus Tracker — Comprehensive Project Context & Handoff

## 1. Executive Summary & Core Objective
- **Project**: Limbus Tracker — an Electron + React companion app for *Limbus Company* (Project Moon).
- **Core Capabilities**:
  - Full Identity & EGO library with advanced multi-attribute filtering, tier lists, and shard expense calculator.
  - Interactive schedule & weekly checklist tracker.
  - Spotifast-inspired lightweight UI architecture (ultra-low CPU/RAM footprint, tactile mechanical keyboard palettes).
  - Dedicated **Walpth Charge Grinder Tribute Hub** (`/mirror-grinder`): A hilarious, over-the-top, late-night BTV infomercial celebrating Walpth's [Charge-Grinder](https://github.com/Walpth/Charge-Grinder/) repository.
  - **Spamton / Tenna Style TV Broadcast**: Unskippable retro CRT variety show presentation locking onto the screen, featuring Toby Fox's *Tenna Introduction* theme, animated dancing TV sprites (`tennadancing.gif`, `tennaflying.png`, `tennamaxup.png`, etc.), and explosive pitch scenes.
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker)
- **Current Deployed Release**: `v1.0.94`

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

### 2.4 Walpth's Charge Grinder Tribute & Tenna Infomercial
- **Attribution**: Full creator attribution and promotion for Walpth's Charge Grinder.
- **Components**:
  - `src/components/TennaInfomercialModal.jsx`: Fullscreen CRT television simulation, scanline overlays, channel bugs (`CH-77 BTV LIVE`), audio synchronization (`tenna_intro.mp3` & `tenna_explosion.mp3`), and Spamton/Tenna style dialogue cards.
  - `src/pages/MirrorGrinderPage.jsx`: The billboard hub with copyable `git clone` command, Project Moon customer testimonials (Vergilius, Faust, Don Quixote, Ryōshū, Meursault, Heathcliff, Charon), Dante's clock-head panic soundboard, and replay TV broadcast controls.

---

## 3. Recent Verified Changes (v1.0.94)
1. **Tenna Infomercial Broadcast**: Integrated unskippable page-locking variety show TV sequence matching Deltarune Chapter 3's Tenna theme, using user-provided sprites and audio.
2. **Charge Grinder Page Conversion**: Converted the automation engine tab into an over-the-top tribute advertisement hub for [Walpth's Charge-Grinder](https://github.com/Walpth/Charge-Grinder/).
3. **Kenneth's v1.0.94 Memo**: Added humorous resignation and retirement announcement to `src/pages/ChangelogPage.jsx`.
4. **Sidebar Update**: Updated sidebar navigation description to "Walpth's Masterpiece".

---

## 4. Key File Locations
- Tenna commercial modal: `src/components/TennaInfomercialModal.jsx`
- Charge Grinder tribute page: `src/pages/MirrorGrinderPage.jsx`
- Sinner portraits: `public/assets/sinners/` and `dist/assets/sinners/`
- Tenna assets: `src/assets/tenna*`, `src/assets/anttennas.png`, `public/assets/tenna*`
- Changelog memos: `src/pages/ChangelogPage.jsx`
- Package config: `package.json`
