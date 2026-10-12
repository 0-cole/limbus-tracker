# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, season milestone projections, character tactical dossiers, 12-Sinner deck building compositions, and autonomous Mirror Dungeon grinding.
- **Latest Release**: `v1.0.87` (Git tag `v1.0.87`, release asset `Limbus Tracker Setup 1.0.87.exe`).
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker) (`master` branch).

---

## 2. Critical Architecture & Invariants
- **Authoritative Client Datamine Pipeline**:
  - Direct local extraction from `C:\Program Files (x86)\Steam\steamapps\common\Limbus Company\LimbusCompany_Data\Assets\Resources_moved\Localize\en\`.
  - Indexes all 191 Identities with official game IDs, authoritative skill names, and exact Uptie IV coin rolls (`coinlist`).
- **Charge Grinder MD Automation Hub (`electron/mirrorGrinderEngine.cjs`)**:
  - Clean-room automation engine inspired by Walpth's `Charge-Grinder`.
  - Account Safety Guard: Strict Gaussian micro-jitter input cadence (90ms ± 25ms hold duration) and instantaneous Alt+Tab auto-pausing when Limbus Company loses active focus.
  - Emergency Stop: User can disengage immediately via UI or hotkey.
- **Version Bump & Release Pipeline**:
  - Always increment `version` in `package.json`.
  - Compile with `npm run build` (Vite) and package with `npm run package` (electron-builder).
  - Output binary is produced at `release2/Limbus Tracker Setup <version>.exe`.
  - Release tagging and publication: `git tag v<version>`, `git push origin v<version>`, `gh release create v<version>`, and `gh release upload v<version> "release2\Limbus Tracker Setup <version>.exe" --clobber`.
- **Save & Cloud Sync Architecture**:
  - Local auto-save invariant: State changes save immediately to local disk/storage.
  - Manual-only cloud sync (Geometry Dash style): No background auto-sync polling or 1.5s debounced push loops to eliminate race conditions.
  - Total system wipe / reset explicitly deletes the user's Supabase cloud save row via `syncEngine.wipeCloudSave()`.

---

## 3. Recent Modifications & Verified State (v1.0.87)
- `scripts/mergeOfficialClientData.cjs` & `scripts/mergeOfficialClientEgos.cjs`: Authoritative game file ingestion pipeline.
- `src/data/identities.json` & `src/data/egos.json`: Enriched with official client skill coin lists, passives, and IDs across all 191 identities.
- `src/components/IdDetailsModal.jsx`: Added official game ID verification badges and authoritative Uptie IV coin breakdown view.
- `electron/mirrorGrinderEngine.cjs`: Clean-room safety-first Mirror Dungeon automation engine with Gaussian input cadence and active window focus detection.
- `electron/main.cjs` & `electron/preload.cjs`: IPC bridge for Mirror Grinder telemetry, status, start, and stop handlers.
- `src/pages/MirrorGrinderPage.jsx`: Full Mirror Dungeon automation suite with mode toggle, keyword presets, live terminal blackbox telemetry, and Project Moon safety consent guard.
- `src/components/Sidebar.jsx` & `src/App.jsx`: Added Charge Grinder route and navigation link.
- `package.json`: Version bumped to `1.0.87`.
- `src/pages/ChangelogPage.jsx`: Added Kenneth's v1.0.87 memo detailing client file ingestion and the Charge Grinder module.

---

## 4. Verification & Deployment State
- Build: `npm run build` tested and passing with 0 errors.
- Working Directory: `C:\Users\cdbla\Documents\Limbus Tracker`.
