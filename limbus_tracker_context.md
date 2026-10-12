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
- **Current Deployed Release**: `v1.0.91`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64.
- **Routing**: `HashRouter` (required for Electron's `file://` protocol).

### 2.2 Updater & NSIS Configuration
- **One-Click Updates**: `oneClick: true`, `perMachine: false`, `allowToChangeInstallationDirectory: false` in `package.json`. Eliminates prompt wizards requesting destination folder or installation mode.
- **Taskbar Pin Preservation**: Custom NSIS script in `build/installer.nsh` prevents shortcut deletion during in-place updates:
  ```nsis
  !macro customUnInstall
    ${if} ${isUpdated}
      Return
    ${endIf}
  !macroend
  ```
- **Asset Path Handling**: Always use relative paths (`./assets/...` via `getChargeGrinderAsset`) rather than absolute root slashes (`/assets/...`) to ensure assets load properly under `file:///.../dist/index.html`.

### 2.3 ChargeGrinder Mirror & Luxcavation Engine
- **Source**: Reverse engineered from Charge-Grinder v3.5.3 (Walpth) using REA.
- **Attribution**: Walpth is credited in the UI header and documentation.
- **Supported Resolutions**: 1920x1080 and 1280x720 (16:9).
- **Subsystems**:
  - Humanized mouse movement (cubic spline with Fitts easing and micro-jitter).
  - Mirror Dungeon state machine with Win Rate clash pulsing, struggle mitigation, and reward card priority.
  - Luxcavation mode with automated Enkephalin crafting and Defeat recovery.
  - 24 Keywordless EGO gifts with 3-stage cycling (Keep, Buy, Uptie).
  - Discord webhook notifications with thread ID and live test pings.

---

## 3. Recent Verified Changes (v1.0.91)
1. **Eliminated Installer Wizard**: Converted NSIS installer to pure one-click mode.
2. **Prevented Taskbar Unpinning**: Added `build/installer.nsh` so Windows Explorer retains taskbar pins across updates.
3. **Fixed Image Assets**: Corrected asset resolution paths so all 12 Sinner cards, the chibi guide icon, the parchment guide, and 24 Keywordless EGO gifts render properly.
4. **Added Kenneth Memo**: Added stressed records keeper Kenneth memo for v1.0.91 in `src/pages/ChangelogPage.jsx`.
5. **Packaged & Released**: Compiled, code-signed, pushed to `origin/master`, and released `v1.0.91` with standalone installer on GitHub Releases.

---

## 4. Key File Locations
- Main page for ChargeGrinder engine: `src/pages/MirrorGrinderPage.jsx`
- Assets directory: `public/assets/charge_grinder/` and `dist/assets/charge_grinder/`
- Installer include script: `build/installer.nsh`
- Package config: `package.json`
- Changelog memos: `src/pages/ChangelogPage.jsx`
