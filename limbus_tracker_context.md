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
- **Current Deployed Release**: `v1.0.92`

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
- **Subsystems & Click Abilities**:
  - **Team Selection & Scrolling**: Moves to `(196, 480)`, scrolls up `(21)` to list top, scrolls down `(-10)` per page to click target affinity team slot in `REG["teams"]`.
  - **Sinner Order & Deployment**: Clicks `(1713, 712)` ("Confirm_alt") to clear deployed roster, then sequentially clicks each sinner in user's saved turn order using exact `SINNERS` coordinates.
  - **Sinner Check Selection**: Scans `REG["probs"]` across `["VeryHigh", "High", "Normal", "Low", "VeryLow"]`, selects the highest success rate Sinner, and clicks `Commence` at `(1539, 906)`.
  - **Clash Struggle Mitigation & EGO Radials**: Holds skill for 1.5s to open radial menu, selects best EGO (Fluid Sac, etc.), double-clicks, and re-engages Win Rate `P`.
  - **Humanized Mouse Control**: Arc-length cubic spline with Fitts easing, micro-jitter, and mouse-wheel scrolling via user32 `mouse_event` (`0x0800`).
  - **24 Keywordless EGO Gifts**: 3-stage cycling (Keep, Buy, Uptie) via `config_panel.png`.
  - **Roster Flexibility**: Default is 0 selected (none), with persistent per-team order saving in `localStorage`.

---

## 3. Recent Verified Changes (v1.0.92)
1. **0 Default Sinners & Freedom of Selection**: Removed the 1-sinner minimum lock. Default is now empty/none (`[]`), allowing deselecting all sinners down to 0.
2. **Persistent Team Orders**: Sinner selections and turn orders are saved per-keyword (Burn, Bleed, Tremor, etc.) in `localStorage`. Switching teams auto-saves current and loads the new team's order.
3. **Turn Order Badges (#1 to #12)**: Displayed exact turn-order badges on Sinner portrait cards and an active turn-order preview strip. Added `Clear (0)`, `Preset (1-6)`, and `Save Team Order` buttons.
4. **All ChargeGrinder Click Abilities Integrated**:
   - `selectTeam`: Auto-scrolling team list via mouse wheel.
   - `selectSinnersOrder`: Clear roster + sequential click deployment.
   - `selectCheckSinner`: Probability scan and optimal Sinner check selection.
   - `openSinnerEgoRadial`: 1.5s long-press for EGO wheel clash mitigation.
5. **Packaged & Released**: Tested, committed, pushed to `origin/master`, and published `v1.0.92` GitHub Release with signed installer.

---

## 4. Key File Locations
- Main page for ChargeGrinder engine: `src/pages/MirrorGrinderPage.jsx`
- Automation backend: `electron/mirrorGrinderEngine.cjs`
- Assets directory: `public/assets/charge_grinder/` and `dist/assets/charge_grinder/`
- Installer include script: `build/installer.nsh`
- Package config: `package.json`
- Changelog memos: `src/pages/ChangelogPage.jsx`
