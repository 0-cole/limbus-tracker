# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, and season milestone projections.
- **Latest Release**: `v1.0.79` (Git tag `v1.0.79`, release asset `Limbus.Tracker.Setup.1.0.79.exe`).
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker) (`master` branch up to date).

---

## 2. Critical Architecture & Invariants
- **Version Bump & Release Pipeline**:
  - Always increment `version` in `package.json`.
  - Compile with `npm run build` (Vite) and package with `npm run package` (electron-builder).
  - Output binary is produced at `release2/Limbus Tracker Setup <version>.exe` (~106 MB).
  - Release tagging and publication: `git tag v<version>`, `git push origin v<version>`, `gh release create v<version>`, and `gh release upload v<version> "release2\Limbus Tracker Setup <version>.exe" --clobber`.
- **Mephistopheles Bus Speed Invariant**:
  - Locked to physical pixels per second (`BUS_SPEED_PX_PER_SEC = 75` in `src/components/MephistophelesBorderTrack.jsx`).
  - Physical rate calculation: `frameDistance = (deltaSec * BUS_SPEED_PX_PER_SEC) / totalPerimeterPx`.
  - Traversal speed is completely identical across all pages regardless of page length.
- **Catalog Scrolling Performance**:
  - In `src/pages/IdentitiesPage.jsx` and `src/pages/EgoPage.jsx`, card items are standard `<div>` elements with `transform: translateZ(0)` hardware compositing.
  - Never introduce `contentVisibility: 'auto'` with arbitrary `containIntrinsicSize` or Framer Motion layout animation wrappers around catalog cards, as they trigger Chromium scroll rebound and boundingClientRect DOM thrashing.
- **Season Horizon & Burnout Logic**:
  - Season 8 fallback duration is set to **260 days / 37 weeks (~8.5 months)** (`src/utils/timeUtils.js` and `src/utils/limbusCalculator.js`), matching Season 7 actual lifespan.
  - Prevents false "High Burnout (4.1 MDs/day)" panic calculations.
- **Decoupled Crate / Shard Invariant**:
  - Mirror Dungeon and daily/weekly quest logs do **NOT** auto-generate choice crates or auto-convert crates into shards.
  - Battle Pass levels 1–120 give fixed milestone rewards; choice crates are only awarded at level 121+ (EX levels).
  - Shard and crate additions are strictly manual via the "+ Open Crates / Log Shards" dialog.
  - Quick logs for runs and shards disappear automatically at the daily server reset boundary (21:00 UTC / 06:00 KST / 5:00 PM EDT).

---

## 3. Recent Modifications & Verified State (v1.0.79)
- `src/components/MephistophelesBorderTrack.jsx`: Physical velocity engine deployed.
- `src/pages/IdentitiesPage.jsx` & `src/pages/EgoPage.jsx`: Rebound and jitter completely eliminated; silky 120 FPS scrolling restored.
- `src/utils/timeUtils.js` & `src/utils/limbusCalculator.js`: Recalibrated unknown season fallback to 260 days.
- `src/stores/useStore.js` & `src/components/DailyCycleTracker.jsx`: Decoupled MD crates; strict 21:00 UTC cycle timestamp filtering (`timestamp >= cycleStartMs`).
- `src/pages/DashboardPage.jsx`: Permanent Battle Pass Status card added with level/exp stepper buttons and EX level indicators.
- `src/components/Season8NoticeModal.jsx`: Season 8 Battle Pass Level detection, Level 1 reset button, and mandatory confirmation modal added.
- `src/pages/ChangelogPage.jsx`: Kenneth's v1.0.79 field report added.

---

## 4. Verification & Deployment State
- `npm run build`: Success (`✓ built in 19.07s`).
- `electron-builder`: Successfully built `release2/Limbus Tracker Setup 1.0.79.exe` (106,066,091 bytes).
- Git Commit & Push: Committed to `master` (`a7fcb3c`).
- GitHub Release: Published as `v1.0.79` with installer attached (`https://github.com/0-cole/limbus-tracker/releases/tag/v1.0.79`).
