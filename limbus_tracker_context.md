# Limbus Tracker — Project Context & State Handoff

> **Generated for AI Session Continuity**  
> **Last Updated**: 2026-09-12 (v1.0.63 Released)  
> **Workspace**: `C:\Users\cdbla\Documents\Antigravity Playground\limbus-tracker`

---

## 1. Executive Summary & High-Level Objective
**Limbus Tracker** is a feature-rich, high-performance desktop companion app for *Limbus Company* built with Electron, React, Vite, Tailwind CSS, and Zustand, featuring cloud sync via Supabase.

Key features include:
- Interactive **Identity & E.G.O Directory** with keyword filters, status effect matching, and damage-type classification.
- **Daily Cycle Tracker & Farm Manager**: Real-time Enkephalin regeneration, mirror dungeon run logger, crate/shard planner, and granular daily/weekly mission trackers.
- **In-Universe Settings & Manager Customization Console**: Manager call-sign, interactive avatar cropping studio (zoom & Y-offset for full-body art like Roland), Project Moon theme presets, Web Audio air horn, Sinner radio filters, and desktop tray controls.
- **Rich Easter Egg System**: Includes *Library of Ruina*, *Lobotomy Corporation*, *Die of Death* (Roblox) classified dossiers, and an immersive multi-stage *W.D. Gaster* ARG sequence.
- **Auto-Updater & Release Pipeline**: Fully configured GitHub release packaging with auto-update detection for Windows (`.exe` NSIS installer).

---

## 2. Critical Architecture & Invariants

### Tech Stack & Runtime
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, Canvas API for procedural visual effects (CRT scanlines, static noise).
- **Desktop Container**: Electron (`electron-main.cjs`, `preload.cjs`), `electron-builder` with NSIS packaging.
- **State Management**: Zustand store (`src/store/useStore.js`) with custom persistence and Supabase cloud sync (`src/services/syncEngine.js`).
- **Asset Handling**: All 37+ Easter egg character portraits and CGs are stored locally in `src/assets/easter_eggs/` to ensure 100% offline capability without external CDN dependencies.

### Invariants & Protocols
1. **Version Bump on Release**: `package.json` must be incremented whenever publishing changes. The client auto-updater strictly relies on newer semantic versions to trigger prompts.
2. **Release Creation**: Whenever building production installers, run `npm run build`, package with `npx electron-builder --win`, push commit & git tag (`vX.X.X`), and publish via `gh release create vX.X.X release2/*.exe`.
3. **Gaster OS Username Invariant**: W.D. Gaster's sequence intentionally bypasses manager call-signs and directly pulls the host Windows username (`getSystemUsername`) for maximum fourth-wall ARG impact.
4. **Official Enkephalin Scaling**: Caps follow official Limbus Company tables (Level 1 = 60, Level 35 = 119, Level 300 = 216). Passive regeneration runs at 1 Enkephalin per 6 minutes (10/hr), both in real-time and calculated retrospectively from `enkephalinLastSynced` on app launch.
5. **Task Polling Cadence**: Never rapidly poll long-running background tasks (like `electron-builder`) every second. Maintain at least 15–30+ second checks or rely on system notifications.

---

## 3. Recent Modifications & Verified State (Up through v1.0.63)

### Verified Features & Fixes
- **v1.0.63 Release (Daily & Weekly Missions Overhaul)**:
  - **Individual Weekly Mission Tracking**:
    - Replaced the single binary weeklies toggle with a 5-card interactive grid matching official in-game weekly missions:
      1. `Clear Any Stage 10x` (+4 Pass EXP)
      2. `Enter Mirror Dungeon 1x` (+4 Pass EXP)
      3. `Defeat 100 Enemies` (+4 Pass EXP)
      4. `Thread Luxcavation 5x` (+4 Pass EXP)
      5. `EXP Luxcavation 5x` (+4 Pass EXP)
    - Added `toggleWeeklyMissionStep(step)` to `useStore.js` awarding +4 EXP per completed step with clean rollback.
    - Added `setAllWeeklyMissions(completeAll)` button ("Complete All 5 (+20 EXP)" or "Reset All Weeklies") with live `weekliesProgress / 5` counter.
    - Preserved complete backward compatibility with `weekliesDone` boolean for downstream components and archive sync.
    - Updated `limbusCalculator.js` to dynamically account for granular weekly progress (`(5 - weekliesProgress) * 4` EXP remaining).
  - **Daily Missions Enkephalin Auto-Conversion**:
    - Step 1 (`Assemble 1 Module`): Deducts 20 Enkephalin and grants +1 Module in inventory with amber badge indicators and rollback on uncheck.
    - Preserved interactive 2m/3m tier buttons for EXP Luxcavation (Step 4) and constant 2-module deduction for Thread Luxcavation (Step 5).
  - Packaged `release2/Limbus Tracker Setup 1.0.63.exe` (106 MB).
- **v1.0.62 Release (Settings & Manager Customization Console)**:
  - Built comprehensive multi-tab **Settings & Manager Customization Console** (`SettingsPage.jsx`):
    1. **Manager Profile**: Custom Manager Call-Sign, Favorite Sinner co-pilot, and avatar roster selector with an interactive **Live Avatar Cropper & Alignment Studio** (Zoom 1.0x–2.5x, Y-offset -50% to +50% for framing full-body portraits like Roland, X-offset, and reset).
    2. **Mephistopheles Navigation & Audio**: Bus track toggle (`busEnabled`), dual-tone brass air horn (Web Audio API synthesized 340Hz + 425Hz brass resonator with volume slider and audio test button), chatter frequency controls (`off`, `slow`, `normal`, `fast`), and Sinner radio comms filter with quick All/None toggles.
    3. **Themes & Visuals**: 6 Project Moon theme presets (`gold`, `crimson`, `amber`, `cyan`, `violet`, `monochrome`), CRT scanline overlay, and compact density mode.
    4. **Desktop Integration**: Auto-open on `LimbusCompany.exe` launch, close to Windows system tray, and native Enkephalin cap alerts.
    5. **Data Vault**: Export/import complete unencrypted JSON backup snapshots, Supabase force cloud push/pull, and factory reset wipe with double-confirmation.
  - Added `ManagerAvatar.jsx` component for uniform avatar rendering across Sidebar, Dashboard headers, and Settings Studio.
  - Added Settings nav item (`/settings`) and live Manager Profile card in `Sidebar.jsx`.
  - Added Manager Live Badge in `DashboardPage.jsx` header.
  - Added Electron Windows system tray integration and close-to-tray window interceptor in `electron/main.cjs`.
  - Added `/settings` character dialogue routes to `MephistophelesBorderTrack.jsx`.
- **v1.0.61 Release Published**:
  - Successfully packaged `release2/Limbus Tracker Setup 1.0.61.exe` (106 MB).
  - Pushed git tag `v1.0.61` to `origin/master` and published [GitHub Release v1.0.61](https://github.com/0-cole/limbus-tracker/releases/tag/v1.0.61).
  - Fixed Daily Mission descriptions to clarify that **Thread Luxcavation is always 2 Modules (40 Enk)** across all levels (Lv 20–60), while **EXP Luxcavation is 2–3 Modules (40–60 Enk)** depending on Canto level (Cantos I–III = 2 Modules; Cantos IV+ = 3 Modules).
  - Added an interactive `[2m | 3m]` tier selector directly to the Daily Missions EXP Luxcavation card in `DailyCycleTracker.jsx`.
  - Updated `toggleDailyMissionStep` in `useStore.js` to dynamically deduct 2 or 3 modules (or equivalent Enkephalin) and preserve exact deduction amounts for clean rollback on uncheck.
  - Added Records Keeper Kenneth's v1.0.61 patch memo to `ChangelogPage.jsx`.
- **v1.0.60 Release Published**:
  - Successfully packaged `release2/Limbus Tracker Setup 1.0.60.exe` (106 MB).
  - Pushed git tag `v1.0.60` to `origin/master` and published [GitHub Release v1.0.60](https://github.com/0-cole/limbus-tracker/releases/tag/v1.0.60).
- **Enkephalin Offline & Passive Auto-Balance**:
  - Added `src/utils/enkephalinLevels.js` with complete Level 1–300 cap table.
  - Implemented `recalculateEnkephalin()` in `useStore.js` to calculate energy restored while the app was closed.
  - Added company level input with auto-balanced cap synchronization across `DailyCycleTracker` and `InventoryPage`.
  - Added automated module/enkephalin deductions for Daily Luxcavations (missions 4 & 5) and Mirror Dungeon runs.
- **Cross-Device Sync Integrity**:
  - Resolved `ReferenceError: state is not defined` crash in `saveStore`.
  - Added de-duplication merge by unique ID for `todayLoggedRuns` and `todayLoggedShards` in `syncEngine.js`.
  - Preserved quick logs across active 24h reset cycles until official reset time (21:00 UTC).
- **W.D. Gaster ARG Overhaul**:
  - Implemented initial corrupted ID card and realistic `GasterCorruptedModal.jsx` (aspect 2/3 black frame, `NaN` stats, unallocated heap stack traces, zero eye emojis).
  - Adjusted `GasterSequenceModal.jsx` to a narrow 25% peeking margin (`25vw`) and a slow procedural static rise (building over 5.2s) matching *Shipwrecked 64* aesthetic.
- **Special Dossier Modal & Character Expansion**:
  - Added 37 high-resolution local assets and classified dossier profiles for Library of Ruina Librarians, The Head (Claw, Arbiters), ALEPH Abnormalities, and Die of Death characters.

---

## 4. Key File Map

| Path | Purpose |
| :--- | :--- |
| `src/store/useStore.js` | Core Zustand store (Enkephalin timers, daily missions, quick logs, cross-device sync triggers) |
| `src/utils/enkephalinLevels.js` | Canonical Enkephalin caps for company levels 1–300 |
| `src/services/syncEngine.js` | Supabase cloud save / pull / conflict resolution engine |
| `src/pages/DailyCycleTracker.jsx` | Daily missions, Enkephalin progress ring, timer display, quick logging |
| `src/pages/IdentitiesPage.jsx` | Identity search grid, filter controls, Easter egg card injection |
| `src/components/modals/GasterCorruptedModal.jsx` | Initial corrupted deserialization error modal for Gaster |
| `src/components/modals/GasterSequenceModal.jsx` | Full-screen interactive Gaster reveal sequence (25% margin, static audio) |
| `src/components/modals/SpecialDossierModal.jsx` | Classified dossiers for Ruina, Lobotomy, and Die of Death entities |
| `src/data/specialEasterEggs.js` | Database of classified abilities, lore memos, and threat levels |
| `src/assets/easter_eggs/` | Offline character CGs and portraits |
| `package.json` | Project scripts, dependencies, and current app version (`1.0.60`) |

---

## 5. Immediate Next Steps / Pending Roadmap

1. **User Testing on v1.0.60**:
   - Verify client auto-updater prompts update on secondary/fresh devices.
   - Confirm Enkephalin values and daily missions remain synchronized across sessions.
2. **Potential Future Additions (from user brainstorming)**:
   - "Gasharpoon" (Captain Ahab) LARP / Blame Citation easter egg modal (*"CRITICAL CITATION #0001-AHAB // COMPASS CORRUPTION"*).
   - Die of Death Special Civilians (Loveshot, Caretaker, etc.).
   - Additional sound effects or audio toggles for the classified dossiers.
