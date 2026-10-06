# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, season milestone projections, character tactical dossiers, and 12-Sinner deck building compositions.
- **Latest Release**: `v1.0.86` (Git tag `v1.0.86`, release asset `Limbus Tracker Setup 1.0.86.exe`).
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker) (`master` branch).

---

## 2. Critical Architecture & Invariants
- **Version Bump & Release Pipeline**:
  - Always increment `version` in `package.json`.
  - Compile with `npm run build` (Vite) and package with `npm run package` (electron-builder).
  - Output binary is produced at `release2/Limbus Tracker Setup <version>.exe` (~106 MB).
  - Release tagging and publication: `git tag v<version>`, `git push origin v<version>`, `gh release create v<version>`, and `gh release upload v<version> "release2\Limbus Tracker Setup <version>.exe" --clobber`.
- **Easter Egg Cloaking Invariant**:
  - Classified Easter eggs (Patron Librarians, The Head, Die of Death killers, ALEPH Abnormalities, etc.) MUST NOT match loose letters, fragments, or short common words (< 3 chars).
  - They strictly require explicit entity name matches (e.g. `Binah`, `Pursuer`, `WhiteNight`) or canonical category searches (e.g. `The Head`, `Die of Death`, `Library of Ruina`, `Lobotomy Corp`, `Color Fixer`).
- **Save & Cloud Sync Architecture**:
  - Local auto-save invariant: State changes save immediately to local disk/storage.
  - Manual-only cloud sync (Geometry Dash style): No background auto-sync polling or 1.5s debounced push loops to eliminate race conditions and overwrites from stale sessions.
  - Users explicitly choose when to sync via "Upload to Cloud" and "Load from Cloud" in Settings (Data Vault).
  - Total system wipe / reset explicitly deletes the user's Supabase cloud save row via `syncEngine.wipeCloudSave()` to prevent resurrecting cleared data.
- **Universal Tactical Intelligence Engine**:
  - Located at `src/utils/identityTactics.js`.
  - Provides **100% verified tactical intelligence across all 189 identities** in `identities.json` (including Haute Couture Le Noir Brand Manager Don Quixote and Haute Couture Alteration Shop Rodion).
  - Features curated dossiers and dynamic warnings for Minus Coins, Munitions, Discard, and Recoil.
  - Comprehensive Affiliations & Factions: `AFFILIATION_RULES` covering 30+ syndicates, Wings, and associations.
  - Tactical Duo Detection: `detectSynergyPairs` includes Haute Couture Le Noir Atelier duo synergy.

---

## 3. Recent Modifications & Verified State (v1.0.86)
- `src/pages/IdentitiesPage.jsx`: Replaced loose substring/trigger search on Easter egg dossiers with strict name and category filtering. Added min length requirement (>= 3 chars). Mapped "The Head", "Die of Death", "Library of Ruina", "Lobotomy Corp", and "Color Fixer" categories. Prevented single-letter searches from summoning secret files.
- `src/pages/EgoPage.jsx`: Restricted ALEPH Easter egg matching to require min length >= 3 chars and exact trigger/name/abnormality/category matching.
- `src/data/specialEasterEggs.js`: Removed colliding triggers (such as `liu association` on Xiao and `zayin` on One Sin) to prevent hijacking standard identity/EGO filter queries.
- `package.json`: Bumped version to `1.0.86`.
- `src/pages/ChangelogPage.jsx`: Added Kenneth's v1.0.86 dispatch memo.

---

## 4. Verification & Deployment State
- Build: `npm run build` tested and passing.
- Packaging: `npm run package` producing `release2/Limbus Tracker Setup 1.0.86.exe`.
- Git & Release: Prepared for git commit, push `origin/master`, tag `v1.0.86`, and GitHub Release publish.

