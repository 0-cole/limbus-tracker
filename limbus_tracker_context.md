# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, and season milestone projections.
- **Latest Release**: `v1.0.81` (Git tag `v1.0.81`, release asset `Limbus Tracker Setup 1.0.81.exe`).
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
- **Sinner Shard Mini Calculator Invariant**:
  - In `src/pages/InventoryPage.jsx`, `<SinnerShardCalculatorInput />` allows arithmetic expressions (e.g. `18+4`, `50-10`, `20*2`) with live preview.
  - Clamped strictly to `[0, 1500]` on evaluation to block absurd numbers like `18+4000`.
- **Crate Unconstrained Tracking**:
  - In `src/stores/useStore.js` (`openCratesForSinner`), players can open and log any quantity of Choice Crates or Random Crates without being blocked by an in-tracker crate ceiling.
  - Crate tracker removed from `InventoryPage.jsx`; extraction tickets are housed in a dedicated card.
- **Weekly Calendar Local Date Alignment**:
  - In `src/pages/DashboardPage.jsx`, weekly calendar grid columns and rollover checks anchor to local calendar date (`new Date().getDay()` and `localTodayKey`). Thursday evening post-reset (5:00 PM – 11:59 PM EDT) remains active and is never marked missed. Includes a manual `🔄 Reset Calendar` button.
- **Startup Auto-Cleaner**:
  - In `electron/main.cjs`, `cleanupOldTempInstallers()` runs on `app.whenReady()` to unlink old `Limbus.Tracker.Setup.*.exe` files in `%TEMP%`.

---

## 3. Recent Modifications & Verified State (v1.0.81)
- `src/pages/InventoryPage.jsx`: Added `SinnerShardCalculatorInput` with live `= [result]` preview, arithmetic evaluator, and 1,500 shard cap. Replaced Dispensary Crates with Extraction Tickets card.
- `src/components/DailyCycleTracker.jsx`: Added Random (Non-Nominable) Crates tab; removed crate ceiling from Choice Crates tab.
- `src/stores/useStore.js`: Added `resetWeeklyCalendar()` action; updated `openCratesForSinner` to support both nominable and random crate batches without box limits.
- `src/pages/DashboardPage.jsx`: Fixed Thursday evening calendar display bug; added manual `🔄 Reset Calendar` button.
- `electron/main.cjs`: Added startup cleanup daemon to purge old installer files in `%TEMP%`.
- `package.json`: Version bumped to `1.0.81`.
- `src/pages/ChangelogPage.jsx`: Added Kenneth's v1.0.81 memo.

---

## 4. Verification & Deployment State
- Build: `npm run build` completed cleanly with 0 errors.
- Packaging: `npm run package` produced `release2/Limbus Tracker Setup 1.0.81.exe` (106,068,773 bytes).
- Git & Release: Pushed to `master`, tagged `v1.0.81`, and published to GitHub Releases.
