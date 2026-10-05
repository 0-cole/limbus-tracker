# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, season milestone projections, character tactical dossiers, and 12-Sinner deck building compositions.
- **Latest Release**: `v1.0.85` (Git tag `v1.0.85`, release asset `Limbus Tracker Setup 1.0.85.exe`).
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker) (`master` branch).

---

## 2. Critical Architecture & Invariants
- **Version Bump & Release Pipeline**:
  - Always increment `version` in `package.json`.
  - Compile with `npm run build` (Vite) and package with `npm run package` (electron-builder).
  - Output binary is produced at `release2/Limbus Tracker Setup <version>.exe` (~106 MB).
  - Release tagging and publication: `git tag v<version>`, `git push origin v<version>`, `gh release create v<version>`, and `gh release upload v<version> "release2\Limbus Tracker Setup <version>.exe" --clobber`.
- **Save & Cloud Sync Architecture**:
  - Local auto-save invariant: State changes save immediately to local disk/storage.
  - Manual-only cloud sync (Geometry Dash style): No background auto-sync polling or 1.5s debounced push loops to eliminate race conditions and overwrites from stale sessions.
  - Users explicitly choose when to sync via "Upload to Cloud" and "Load from Cloud" in Settings (Data Vault).
  - Total system wipe / reset explicitly deletes the user's Supabase cloud save row via `syncEngine.wipeCloudSave()` to prevent resurrecting cleared data.
- **Universal Tactical Intelligence Engine**:
  - Located at `src/utils/identityTactics.js`.
  - Provides **100% verified tactical intelligence across all 189 identities** in `identities.json` (including the latest Haute Couture Le Noir Brand Manager Don Quixote and Haute Couture Alteration Shop Rodion).
  - Features curated dossiers and dynamic warnings for Minus Coins, Munitions, Discard, and Recoil.
  - Comprehensive Affiliations & Factions: `AFFILIATION_RULES` covering 30+ syndicates, Wings, and associations.
  - Tactical Duo Detection: `detectSynergyPairs` includes Haute Couture Le Noir Atelier duo synergy.

---

## 3. Recent Modifications & Verified State (v1.0.85)
- `src/services/syncEngine.js`: Removed background auto-sync interval and debounced push queue. Added `wipeCloudSave()` for cloud-clean data wipes.
- `src/stores/useStore.js`: Removed auto cloud push from `saveStore()`. Added `syncEngine.wipeCloudSave()` to `resetAllData()`. Updated default S8 extraction banner to Haute Couture Don Quixote & Rodion.
- `src/pages/SettingsPage.jsx`: Removed auto cloud push from profile save. Added cloud save wipe to `handleConfirmWipe()`. Revamped Data Vault tab copy with Geometry Dash-style manual cloud save explanation and renamed action buttons.
- `src/data/identities.json` & `slugMap.json`: Added Season 8 identities Haute Couture::Le Noir Brand Manager Don Quixote (000) and Haute Couture::Alteration Shop Rodion (000).
- `src/utils/identityTactics.js`: Added Haute Couture Le Noir Atelier tactical synergy pair.
- `package.json`: Bumped version to `1.0.85`.
- `src/pages/ChangelogPage.jsx`: Added Kenneth's v1.0.85 dispatch memo.

---

## 4. Verification & Deployment State
- Build: `npm run build` completed cleanly with 0 errors.
- Packaging: `npm run package` producing `release2/Limbus Tracker Setup 1.0.85.exe`.
- Git & Release: Prepared for git commit, push `origin/master`, tag `v1.0.85`, and GitHub Release publish.

