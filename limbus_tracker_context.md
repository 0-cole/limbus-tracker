# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, and season milestone projections.
- **Latest Release**: `v1.0.80` (Git tag `v1.0.80`, release asset `Limbus Tracker Setup 1.0.80.exe`).
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker) (`master` branch).

---

## 2. Critical Architecture & Invariants
- **Version Bump & Release Pipeline**:
  - Always increment `version` in `package.json`.
  - Compile with `npm run build` (Vite) and package with `npm run package` (electron-builder).
  - Output binary is produced at `release2/Limbus Tracker Setup <version>.exe` (~106 MB).
  - Release tagging and publication: `git tag v<version>`, `git push origin v<version>`, `gh release create v<version>`, and `gh release upload v<version> "release2\Limbus Tracker Setup <version>.exe" --clobber`.
- **Pre-120 Battle Pass Shard Invariant**:
  - Battle Pass levels 1–120 award fixed milestone rewards (decals, banners, tickets, lunacy, thread) rather than choice crates.
  - Choice Egoshard crates only start generating at Level 121+ (EX levels).
  - In `limbusCalculator.js` (`generateRoadmap`), daily crate gain is strictly 0 while `simulatedBpLevel <= 120`. `SchedulePage.jsx` renders `Pass Lv. X/120 (EX Crates at Lv. 121)` without auto-incrementing target shard counts.
- **Multi-Device Cloud Sync Architecture**:
  - Background passive Enkephalin regeneration ticker (`useStore.js`) calls `saveStore(false)` with `isUserAction = false`. This prevents idle devices from updating `lastLocalUserEdit` or issuing background cloud pushes that overwrite active sessions.
  - Devices are uniquely identified via persistent `deviceId` and `deviceName`.
  - Divergence across key settings (`paceMode`, `dailyMissionSteps`, `bpLevel`, `bpExp`) triggers a Supabase Realtime broadcast and mounts `<SyncConflictModal />` on both devices simultaneously.
  - Selecting "Keep This Device" or "Keep Other Device" resolves the conflict authoritatively, saves to cloud, broadcasts `conflict_resolved`, and dismisses modals on both screens.
- **Mephistopheles Bus Speed Invariant**:
  - Locked to physical pixels per second (`BUS_SPEED_PX_PER_SEC = 75` in `src/components/MephistophelesBorderTrack.jsx`).
  - Physical rate calculation: `frameDistance = (deltaSec * BUS_SPEED_PX_PER_SEC) / totalPerimeterPx`.
- **Catalog Scrolling Performance**:
  - In `src/pages/IdentitiesPage.jsx` and `src/pages/EgoPage.jsx`, card items are standard `<div>` elements with `transform: translateZ(0)` hardware compositing without layout-animating wrappers.
- **Season Horizon & Burnout Logic**:
  - Season 8 fallback duration is set to **260 days / 37 weeks (~8.5 months)** (`src/utils/timeUtils.js` and `src/utils/limbusCalculator.js`), matching Season 7 actual lifespan.
- **Decoupled Crate / Shard Invariant**:
  - Quick logs for runs and shards disappear automatically at the daily server reset boundary (21:00 UTC / 06:00 KST / 5:00 PM EDT).

---

## 3. Recent Modifications & Verified State (v1.0.80)
- `src/utils/limbusCalculator.js`: Added pre-120 pass awareness in `calculateLimbusGrind` and `generateRoadmap`. Suppressed phantom crate gains before Level 120.
- `src/pages/SchedulePage.jsx`: Rendered `Pass Lv. X/120 (EX Crates at Lv. 121)` badge and `(Manual Quick Log)` tag when `row.isPreEx`.
- `src/services/syncEngine.js`: Added device ID/name tracking, Supabase Realtime event listeners, conflict divergence detector, and authoritative resolution broadcast.
- `src/components/SyncConflictModal.jsx`: New interactive comparison modal comparing device state, timestamps, pace mode, dailies progress, and BP level.
- `src/stores/useStore.js`: Added `isUserAction` guard on `saveStore()`, isolating passive enkephalin regen from cloud push triggers.
- `src/App.jsx`: Mounted `<SyncConflictModal />` at the root layout.
- `src/pages/ChangelogPage.jsx`: Added Kenneth's v1.0.80 dispatch memo.
- `scratch/test_calculator_pre120.js`: Automated unit test verifying pre-120 zero crate allocation and post-120 crate distribution.

---

## 4. Verification & Deployment State
- Unit Test: Passed cleanly with exit code 0 (`scratch/test_calculator_pre120.js`).
- Build: `npm run build` completed cleanly in 15.16s with 0 errors.
- Packaging: `npm run package` produced `release2/Limbus Tracker Setup 1.0.80.exe` (106,068,238 bytes).
