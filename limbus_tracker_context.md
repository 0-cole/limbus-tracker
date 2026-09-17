# Limbus Tracker — System Context & Architecture Guide

## 1. Executive Summary & High-Level Objective
Limbus Tracker is an Electron + React desktop tracking companion for Project Moon's *Limbus Company*. It manages Sinner Egoshards, nominable/random crate inventories, Mirror Dungeon runs, extraction banner timelines, season milestone projections, character tactical dossiers, and 12-Sinner deck building compositions.
- **Latest Release**: `v1.0.84` (Git tag `v1.0.84`, release asset `Limbus Tracker Setup 1.0.84.exe`).
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
  - Comprehensive Affiliations & Factions: `AFFILIATION_RULES` covering 30+ syndicates, Wings, and associations (The Thumb, The Middle, The Ring, The Index, The Pinky, Zwei Assoc., Blade Lineage, Kurokumo Clan, Shi Assoc., Cinq Assoc., Seven Assoc., Liu Assoc., Dieci Assoc., Devyat' Assoc., Öufi Assoc., W Corp., R Corp., K Corp., T Corp., N Corp., La Manchaland Bloodfiends, Heishou Pack, Dawn Office, Full-Stop Office, Molar Office, MultiCrack Office, The Pequod, Edgar Family, Haute Couture, Lobotomy E.G.O).
  - Tactical Duo Detection: `detectSynergyPairs` identifies specialized tactical interactions (Inquisitor Vanguard, Sinking Deluge, Blade Lineage Homeland Poise, Captain Assist, Charge Battery Transfer, Time Moratorium Storage, Shared Bloodfeast, Debuff Roulette).
- **Interactive Deck Builder (`src/pages/DeckBuilderPage.jsx`)**:
  - Exact styling and layout replication from LimbusDeck (`limbusdeck.com/en/party-builder`):
    - Responsive 2-column grid (`grid-cols-1 lg:grid-cols-[1fr_380px]`).
    - Sticky left deck board with Keyword Deck pills, `My Pool Only` toggle, `Clear All`, `Share` export, and Preset selector.
    - **No Auto-Fill**: Pure player-directed manual squad construction as requested.
    - 12 canonical Sinner slots with exact empty/filled styling matching LimbusDeck.
    - Slotted identities show card art, star ratings, sinner name, affiliation badge, keywords, and a direct "Tactics" button opening the full tactical dossier modal.
    - 380px right sidebar with:
      - `Synergy Map`: Orbital SVG constellation graph connecting sinners via shared Sins and Keywords.
      - `Keyword Coverage`: All 7 keywords with active counts and progress bars.
      - `Faction Synergy`: Active affiliations, member counts, syndicate perks, and member tags.
      - `Sin Distribution`: Wrath, Lust, Sloth, Gluttony, Gloom, Pride, Envy and Attack Types (Slash, Pierce, Blunt).
      - `Synergy Pairs`: Tactical duos detection and synergy notes.
      - `Resonance`: 7 sin pills with 0.3 opacity scaling when inactive and glowing `⚡ A-Reson (4+)` badges.
      - `Analyze Card`: Overall squad assessment, dominant archetype, resonance viability, damage blindspots, and combat tips.
  - Identity Selection Modal:
    - Search query, Attack Type filter (Slash, Pierce, Blunt), Keyword filter (7 keywords), **Affiliation filter dropdown** (Thumb, Middle, Ring, Index, Pinky, Zwei, Blade Lineage, etc.), and Rarity filter (000, 00, 0).
    - Every candidate displays affiliation badge, keywords, sin affinities, and a "Tactics" preview button.

---

## 3. Recent Modifications & Verified State (v1.0.84)
- `src/pages/DeckBuilderPage.jsx`: Rebuilt in exact LimbusDeck UI layout. Removed Auto-Fill. Added Affiliation badges, Sinner slot styling, 380px sidebar cards, SVG Synergy Constellation Map, and modal Affiliation filter.
- `src/utils/identityTactics.js`: Added `AFFILIATION_RULES`, `getIdentityAffiliation`, `detectSynergyPairs`, and upgraded `analyzeTeamSynergy` to export `activeAffiliations` and `synergyPairs`.
- `package.json`: Bumped version to `1.0.84`.
- `src/pages/ChangelogPage.jsx`: Added Kenneth's v1.0.84 dispatch memo.

---

## 4. Verification & Deployment State
- Build: `npm run build` completed cleanly with 0 errors (14.41s).
- Packaging: `npm run package` produced signed installer `release2/Limbus Tracker Setup 1.0.84.exe` (106 MB).
- Git & Release: Ready to commit, push `origin/master`, tag `v1.0.84`, push tags, and publish GitHub Release.
