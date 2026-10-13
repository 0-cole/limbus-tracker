# Limbus Tracker — Comprehensive Project Context & Handoff

## 1. Executive Summary & Core Objective
- **Project**: Limbus Tracker — an Electron + React companion app for *Limbus Company* (Project Moon).
- **Core Capabilities**:
  - Full Identity & EGO library with advanced multi-attribute filtering, tier lists, and shard expense calculator.
  - Interactive schedule & weekly checklist tracker.
  - Spotifast-inspired lightweight UI architecture (ultra-low CPU/RAM footprint, tactile mechanical keyboard palettes).
  - Autonomous **Mirror Dungeon & Luxcavation Engine** completely reverse-engineered from Walpth's *Charge-Grinder v3.5.3* via REA (Reverse Engineer Anything).
  - 100% authentic ChargeGrinder UI fidelity: 12-Sinner portrait grid, Guide modal with parchment backdrop, 24 Keywordless EGO gifts Customization Panel, Luxcavation console, and live telemetry log terminal.
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker)
- **Current Deployed Release**: `v1.0.93`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64.
- **Routing**: `HashRouter` (required for Electron's `file://` protocol).

### 2.2 Sinner Character Portraits
- In ChargeGrinder's upstream repository, `sel1.png` through `sel12.png` are literally transparent PNGs containing plain grey number boxes (1 to 12).
- In Limbus Tracker v1.0.93+, all 12 official, full-color LCB character portraits (Yi Sang, Faust, Don Quixote, Ryōshū, Meursault, Hong Lu, Heathcliff, Ishmael, Rodion, Sinclair, Outis, Gregor) are bundled locally in `public/assets/sinners/{id}.webp` and packaged into `dist/assets/sinners/`, with high-res CDN fallback.

### 2.3 Updater & NSIS Configuration
- **One-Click Updates**: `oneClick: true`, `perMachine: false`, `allowToChangeInstallationDirectory: false` in `package.json`. Eliminates prompt wizards requesting destination folder or installation mode.
- **Taskbar Pin Preservation**: Custom NSIS script in `build/installer.nsh` prevents shortcut deletion during in-place updates.

### 2.4 ChargeGrinder Mirror & Luxcavation Engine
- **Source**: Reverse engineered from Charge-Grinder v3.5.3 (Walpth) using REA.
- **Attribution**: Walpth is credited in the UI header and documentation.
- **Subsystems & Click Abilities**:
  - `selectTeam`: Auto-scrolling team list via mouse wheel (`SCROLL_WHEEL` user32 `mouse_event 0x0800`).
  - `selectSinnersOrder`: Reset deployed roster at `(1713, 712)` and sequentially click sinners in user's saved turn order.
  - `selectCheckSinner`: Probability scan across `VeryHigh > High > Normal > Low` and click `(1539, 906)` Commence.
  - `openSinnerEgoRadial`: 1.5s long-press for EGO wheel clash struggle mitigation.
  - Realistic smooth cursor movements via cubic Bezier arc with Fitts's Law smootherstep velocity and ±1.5px micro-jitter.

---

## 3. Recent Verified Changes (v1.0.93)
1. **Bundled Real Character Portraits**: Downloaded and packaged all 12 official full-color LCB character portraits into `public/assets/sinners/` and `dist/assets/sinners/`.
2. **Replaced Number Placeholder Art**: Sinner cards now display the authentic character artwork, signature sin color indicator, and deployment order badges (`#1` to `#12`).
3. **Packaged & Released**: Tested, committed, pushed to `origin/master`, and published `v1.0.93` GitHub Release with signed installer.

---

## 4. Key File Locations
- Main page for ChargeGrinder engine: `src/pages/MirrorGrinderPage.jsx`
- Sinner portraits: `public/assets/sinners/` and `dist/assets/sinners/`
- Automation backend: `electron/mirrorGrinderEngine.cjs`
- Installer include script: `build/installer.nsh`
- Package config: `package.json`
- Changelog memos: `src/pages/ChangelogPage.jsx`
