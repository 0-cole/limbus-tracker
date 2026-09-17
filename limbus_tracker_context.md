# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, season milestone projections, character tactical dossiers, and 12-Sinner deck building compositions.
- **Latest Release**: `v1.0.83` (Git tag `v1.0.83`, release asset `Limbus Tracker Setup 1.0.83.exe`).
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker) (`master` branch).

---

## 2. Critical Architecture & Invariants
- **Version Bump & Release Pipeline**:
  - Always increment `version` in `package.json`.
  - Compile with `npm run build` (Vite) and package with `npm run package` (electron-builder).
  - Output binary is produced at `release2/Limbus Tracker Setup <version>.exe` (~106 MB).
  - Release tagging and publication: `git tag v<version>`, `git push origin v<version>`, `gh release create v<version>`, and `gh release upload v<version> "release2\Limbus Tracker Setup <version>.exe" --clobber`.
- **Universal Tactical Intelligence Engine**:
  - Located at `src/utils/identityTactics.js`.
  - Provides **100% verified tactical intelligence across all 187 identities** in `identities.json`.
  - Features 25 curated dossiers for high-complexity IDs (N Sinclair, N Faust, R Ishmael, R Heathcliff, W Don, K Hong Lu, Spicebush Yi Sang, Magic Bullet Outis, Dieci Rodion, T Corp Don, La Manchaland Don, Yurodivy Hong Lu, Shi Ishmael, Cinq Don, Haute Couture Ishmael, Index Yi Sang, Ring Yi Sang, Wild Hunt Heathcliff, Blade Lineage Meursault, Solemn Lament Yi Sang, Captain Ishmael, Dawn Sinclair, Devyat Rodion, MultiCrack Faust, W Ryōshū).
  - Upgraded universal dynamic engine for all other 162 IDs detecting Minus Coins, Limited Munitions, Discard & Insight cycling, and Self-HP consumption.
  - Generates striking `hazardAlert` banners for friendly-fire risks (Mind Whip under 10 Charge, 7th Magic Bullet low SP), lethal overdose (K Corp 5 Ampules), minus coin inversions, and ammo limits.
  - Handles minus-coin clash math properly (`maxPower = basePower` at negative SP / tails roll) so players see real clash ceilings (e.g. 30 on N Sinclair S3).
- **Identity Details Modal Integration (`src/components/IdDetailsModal.jsx`)**:
  - "⚔️ Tactics" (Tactical Dossier) is the primary default tab.
  - Displays LimbusDeck-style Combat Profile stats (HP, Speed, Defense type/affinity, Max Clash Power, Keywords).
  - Shows animated Critical Combat Warning hazard alerts.
  - Contains Turn-by-Turn Combat Guides (Opener, Mid-Game, Finisher) and skill coin calculations.
- **Interactive Deck Builder (`src/pages/DeckBuilderPage.jsx`)**:
  - Accessible via `/deckbuilder` in sidebar navigation.
  - 12-Sinner squad grid demarcated into Frontline Combatants (Slots 1–6+) and Support Bench (Passives Active).
  - 7 status keyword filter pills (Burn, Bleed, Tremor, Rupture, Sinking, Poise, Charge) with 1-click `⚡ Auto-Fill`.
  - "My Pool Only" toggle restricting selection to acquired IDs.
  - Real-time Synergy HUD displaying Dominant Archetype, Sin Affinity Resonance gauges with `⚡ A-Reson (4+)` alerts, Slash/Pierce/Blunt damage balance, and active faction synergies.
  - Custom Squad Preset creation, loading, renaming, and deletion with cloud and local disk synchronization.

---

## 3. Recent Modifications & Verified State (v1.0.83)
- `src/utils/identityTactics.js`: Expanded to 25 curated dossiers and enhanced dynamic analyzer covering all 187 identities. Added hazard alerts, minus-coin calculations, ammo tracking, and refined keyword application notes.
- `src/components/IdDetailsModal.jsx`: Added Critical Combat Warning hazard banner, updated minus-coin power multipliers display (`x -4`), fixed Tails Max calculation, and calibrated Combat Profile Max Clash to respect minus coins.
- `package.json`: Bumped version to `1.0.83`.
- `src/pages/ChangelogPage.jsx`: Added Kenneth's v1.0.83 dispatch memo.

---

## 4. Verification & Deployment State
- Build: `npm run build` completed cleanly with 0 errors.
- Verification script (`verify_all_187.mjs`): 187/187 identities verified with 0 errors, 25 curated dossiers, 18 hazard alerts, correct Sinclair max clash of 30.
- Packaging: `npm run package` produced signed installer `release2/Limbus Tracker Setup 1.0.83.exe`.
- Git & Release: Pushed to `origin/master`, tagged `v1.0.83`, pushed tags, and published to GitHub Releases.
