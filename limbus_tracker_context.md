# Limbus Tracker — Comprehensive Project Context & Handoff

## 1. Executive Summary & Core Objective
- **Project**: Limbus Tracker — an Electron + React companion app for *Limbus Company* (Project Moon).
- **Core Capabilities**:
  - Full Identity & EGO library with advanced multi-attribute filtering, tier lists, and shard expense calculator.
  - Interactive schedule & weekly checklist tracker.
  - Spotifast-inspired lightweight UI architecture (ultra-low CPU/RAM footprint, tactile mechanical keyboard palettes).
  - Dedicated **Walpth Charge Grinder Tribute Hub** (`/mirror-grinder`): A hilarious, over-the-top, late-night BTV infomercial celebrating Walpth's [Charge-Grinder](https://github.com/Walpth/Charge-Grinder/) repository.
  - **Spamton / Tenna Style TV Broadcast**: Unskippable retro CRT variety show presentation locking onto the screen, featuring Toby Fox's *Tenna Introduction* theme, 8 sliced equal-proportion animated GIFs from the official Tenna sprite sheet (`tenna_anim1.gif` through `tenna_anim8.gif`), dancing animations, and 10 extended, comfortably-paced comedy scenes.
- **Repository**: [0-cole/limbus-tracker](https://github.com/0-cole/limbus-tracker)
- **Current Deployed Release**: `v1.0.106`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64 (`oneClick: true`, `perMachine: false`). Portable standalone build removed to eliminate asset conflict in GitHub release feeds.
- **Auto-Updater Asset Targeting Invariant**: Updaters strictly target `/setup.*\.exe$/i` installer binaries. Releases only publish the NSIS setup installer so older clients (such as `v1.0.84`) never accidentally download the portable standalone `.exe` which triggers Kenneth's single-instance lock dialog.
- **Differential Updates Permanently Suppressed**: `differentialPackage: false` configured in `package.json` to eliminate auxiliary `.blockmap` files and deliver pure direct executables.
- **Git Push Invariant**: Git remote configured via SSH over Port 443 (`git@github.com:0-cole/limbus-tracker.git`, `ssh.github.com:443`) bypassing school/institution Wi-Fi FortiGuard TLS DPI firewall restrictions.
- **Routing**: `HashRouter` (required for Electron's `file://` protocol).

### 2.2 Aesthetic Architecture & High-Contrast Light Inversion Engine
- **7 Bespoke Aesthetic Themes**:
  1. **Frutiger Aero**: 2000s Bio-Tech sky-domes with rolling green meadow horizon auras, floating frosted glass capsule dock sidebars (`backdrop-filter: blur(16px)`, specular top highlight rim), segmented frosted glass cards, and high-gloss aqua gel pill navigation tabs ("Hot", "New", "Top").
  2. **DORFic Architecture**: 2000s blobitecture with 3D topographic wireframe curves, curving amber fluid tubes, concentric sonar/light pulse waves, milk-acrylic cards with molten orange fluid rims, glass block masonry textures on table headers and dividers, and convex molded tangerine Lucite buttons.
  3. **Dark Aero**: Vista Ultimate obsidian acrylic windows, electric cyan & emerald aurora borealis sweeps, and neon glass bevels.
  4. **Y2K Cybercore**: 3D perspective wireframe matrix floors, holographic matrix scanner columns, HUD brackets `[ ]`, and liquid mercury chrome buttons with sharp horizon reflections.
  5. **Neo-Brutalism**: Bauhaus blueprint drafting dot-grids, 45° industrial yellow/black hazard warning stripes, 3.5px solid black ink borders, and 6px hard offset drop shadows.
  6. **Vintage Editorial**: 19th-century broadsheet rag paper, fluted classical brass column moldings, double-rule architectural picture frames, and oxblood wax-seal buttons.
  7. **Dark Corporate Zen**: Kyoto raked basalt stone grooves, quarried dark basalt monolith blocks with razor-thin titanium seams, and serene mineral sage ambient glows.
- **Contrast Invariant for Light Themes**:
  - `globals.css` maps all dark utility classes (`.bg-[#111]`, `.bg-[#141414]`, `.bg-[#161616]`, `.bg-[#181818]`, `.bg-[#1a1a1a]`, `.bg-[#222]`, `.bg-[#333]`, `.border-[#222]`, `.border-[#333]`, `.border-[#444]`, etc.) to proper high-contrast surfaces (`var(--bg-card)`, `var(--bg-surface)`, `var(--border-subtle)`), preventing invisible dark text on black cards.
  - `DailyCycleTracker.jsx` uses semantic `glass-card bg-limbus-card border-limbus-border/60 text-limbus-text` so cards cleanly adapt to each theme's bespoke geometry.
  - `App.jsx` syncs `document.documentElement.setAttribute('data-theme', ...)` so top-level modals and overlays inherit the active theme.

### 2.3 Sinner Character Portraits & Avatars
- **Theater Menu Sinner Portraits**: Extracted via REA directly from Limbus Company's internal Unity assets (`StoryTheater_EmployeeCard` SpriteAtlas in `resources.assets`).
- All 12 official Sinner portraits (Yi Sang, Faust, Don Quixote, Ryōshū, Meursault, Hong Lu, Heathcliff, Ishmael, Rodion, Sinclair, Outis, Gregor) are hardcoded and bundled in `src/assets/sinners/` and `public/assets/sinners/` with zero external URL dependencies.
- Wired into `ManagerAvatar.jsx` and `SettingsPage.jsx` ("Choose Avatar Source") so every Sinner slot renders the crisp, official full-color character portrait instead of placeholder number/text monograms.

### 2.3 Updater & Firewall Bypass
- **School Firewall Mitigation**: FortiGuard intercepts `api.github.com` and `github.com`.
- **Changelog Fallback Engine**: `ChangelogPage.jsx` combines and prioritizes verified local operational memos (`v1.0.101` down to `v1.0.29`), preventing stale cached records (e.g. `v1.0.89`) from obscuring updates when the network is restricted.
- **Update Checks via `raw.githubusercontent.com`**: `UpdateNotification.jsx` includes a direct secondary route querying `raw.githubusercontent.com/0-cole/limbus-tracker/master/package.json` which bypasses firewall SSL blocks.

---

## 3. Recent Verified Changes (v1.0.106, v1.0.105 & v1.0.104)

### 3.1 Walpth Charge Grinder Infomercial Speed & Skip Overhaul (v1.0.106)
1. **Instant Skip Ability & Keyboard Controls**:
   - Added prominent yellow `[SKIP AD]` button with `<FastForward />` icon in the BTV Live Broadcast top bar visible during every scene (0 through 4).
   - Added `Escape`, `Space`, and `Enter` key listeners that immediately trigger `skipToFinale()` during scenes 0–4.
   - Added top-right `[X]` close button to dismiss the modal instantly.
   - Pressing `Escape` at scene 5 (finale) cleanly closes the modal.
2. **Speed & Comedic Pacing Compression**:
   - Default audio playback rate increased to `1.3x`, delivering high-energy variety show comedy pacing.
   - Added `1.0x / 1.3x / 2.0x` speed toggle button directly in the header with live audio playback rate synchronization.
   - Compressed scene durations from 54 seconds down to ~14.6 real seconds (~19s audio time):
     - Scene 0 (Emergency Special Report): 0.0s – 3.5s
     - Scene 1 (The Wacky Pitch): 3.5s – 7.0s
     - Scene 2 (The Reveal): 7.0s – 11.0s
     - Scene 3 (The Price Inquiry): 11.0s – 15.0s
     - Scene 4 (Climax Explosion): 15.0s – 19.0s
     - Scene 5 (Finale & Unlocked Actions): 19.0s+ (with audio volume dropping gracefully to 0.4 for reading comfort).
   - Snappy motion delays: reduced text animation delays from 1.2s–2.5s down to 0.35s–0.7s so punchlines hit rapidly.
3. **Packaging & Verification**:
   - Bumped `package.json` to `1.0.106`.
   - Added Records Keeper Kenneth memo for `v1.0.106` in `src/pages/ChangelogPage.jsx`.

### 3.2 Local Auto-Updater Fix & Installer Targeting (v1.0.105)
1. **Root Cause of v1.0.84 Inability to Update**:
   - In `v1.0.84`, `UpdateNotification.jsx` executed `assets?.find(a => a.name.endsWith('.exe'))`.
   - Releases attached two executables: `Limbus Tracker X.X.X.exe` (portable) and `Limbus Tracker Setup X.X.X.exe` (installer).
   - Because `Limbus Tracker` sorted alphabetically before `Limbus Tracker Setup`, older clients downloaded the portable executable to `%TEMP%` and launched it.
   - The portable instance detected the active installed app, failed to acquire the single-instance lock, and displayed Kenneth's advisory dialog: `"Cannot start app, as there is already a running app, silly! — Kenneth"`, leaving the local installation un-updated.
2. **Permanent Resolution**:
   - Purged `portable` from `package.json` build targets so GitHub releases publish only `Limbus Tracker Setup ${version}.exe`. Older clients (`v1.0.84`) now find the real installer.
   - Refactored `src/components/UpdateNotification.jsx` to strictly prioritize `/setup.*\.exe$/i` and reject any standalone portable binaries.
   - Refactored `electron/main.cjs` `download-update` handler: when the installer completes downloading, it launches the NSIS installer in silent one-click mode (`/S`) detached, clears `app.pid`, and cleanly quits the app (`app.quit()`), allowing NSIS to overwrite files with zero file locks and automatically restart the application into the latest version.
3. **Packaging & Verification**:
   - Bumped `package.json` to `1.0.105`.
   - Added Kenneth memo for `v1.0.105` in `ChangelogPage.jsx`.

### 3.2 Mephistopheles Comms & HUD Overlay Contrast Immunity (v1.0.104)
1. **Direct-Track Radio Comms Speech Bubble Insulation**:
   - Diagnosed root cause of invisible speech bubble text on Mephistopheles border bus: while the card retained its dark glass chassis (`bg-[#0d0d12]/95`), `globals.css` forced `.text-gray-100` to `var(--text-primary)` (`#211611`), causing dark brown text to render directly over pitch-black glass.
   - Refactored `MephistophelesBorderTrack.jsx` to use `.mephi-bubble`, `.mephi-comms-text`, and `.mephi-comms-tag` with inline color locks (`#f9fafb` and `#9ca3af`).
   - Added high-priority protection rules in `globals.css` ensuring `.mephi-bubble`, `.mephi-comms-text`, `.dante-chrono-toast`, `.dante-chrono-text`, `.angela-modal-card`, and `.artful-modal-card` are completely immune to light-theme text inversions and preserve radiant white/silver typography against their dark tactical containers.
2. **Packaging & Verification**:
   - Bumped `package.json` to `1.0.104`.
   - Added Kenneth memo for `v1.0.104` in `ChangelogPage.jsx`.

### 3.2 Button Clipping Fix & Universal Typography Contrast (v1.0.103)
1. **Button Selector Over-Catch Elimination**:
   - Diagnosed root cause of mission cards squashing into 9999px pill shapes with clipped headers ("Clear Any Stage 10x") and footers ("Weekly Rota"): `globals.css` applied `border-radius: 9999px !important;` to all `button:not(...)` elements without excluding cards or inline utilities.
   - Refined button selectors across all 7 themes with `:not(.card-btn):not(.btn-inline):not(.glass-card):not([class*="glass-card"]):not([class*="rounded-xl"]):not([class*="rounded-lg"]):not([class*="rounded-2xl"])`.
   - Designed bespoke `.card-btn` geometry for each theme: molded milk-acrylic tiles for DORFic, glossy aqua glass for Frutiger Aero, cyber plates for Y2K, tactile ink blocks for Neo-Brutalism, warm broadsheet for Vintage Editorial, and matte obsidian for Dark Corporate Zen.
2. **Weekly Calendar Overview & Typography Contrast**:
   - Replaced washed-out Active Cycle badge with high-contrast dual light/dark styling (deep royal purple on lavender tint for post-reset; deep amber on gold tint for pre-reset).
   - Upgraded calendar day cards to semantic `bg-limbus-surface`, `border-limbus-border`, `text-limbus-text`, and `text-limbus-muted`, eliminating hardcoded `#737373` and `#555` faint text.
   - Styled inline triggers (like "✓ Mark Done" and "🔄 Reset Calendar") with `.btn-inline` so they remain compact and elegant.
3. **Packaging & Verification**:
   - Produced verified standalone executable `Limbus Tracker 1.0.103.exe` and one-click silent installer `Limbus Tracker Setup 1.0.103.exe` in `release2/`. Purged obsolete `1.0.102` files.
   - Added Records Keeper Kenneth memo for `v1.0.103` in `ChangelogPage.jsx`.

### 3.2 DORFic Contrast Fix & Rich Architectural Features (v1.0.102)
1. **DORFic & Light Theme Contrast Fix**:
   - Diagnosed root cause of unreadable text on DORFic cards ("Log a Mirror Dungeon Run", "Egoshard Crates & Shard Manager", "Daily Missions", etc.): components had hardcoded `bg-[#111] border-[#333]`, while light themes converted text to dark brown `var(--text-primary)` (`#211611`), creating invisible near-black text on pitch-black cards.
   - Refactored `DailyCycleTracker.jsx` to use semantic classes `glass-card bg-limbus-card border-limbus-border/60 text-limbus-text` and `text-limbus-muted`.
   - Expanded `src/styles/globals.css` inversion selectors to cover `.bg-[#111]`, `.bg-[#111111]`, `.bg-[#121212]`, `.bg-[#141414]`, `.bg-[#161616]`, `.bg-[#181818]`, `.bg-[#1a1a1a]`, `.bg-[#222]`, `.bg-[#333]`, `.border-[#222]`, `.border-[#333]`, `.border-[#444]`, `.border-[#555]`.
   - Wired `data-theme` synchronization to `document.documentElement` in `App.jsx` so top-level portals, modals, and tooltips cleanly inherit the active theme.
2. **Elevated Architectural & Web Design Systems**:
   - **DORFic Architecture**: Added 3D topographic wireframe contours, curving amber fluid ducts, concentric pulse arcs, molded milk-acrylic blobitecture cards with glowing orange fluid rims, glass block masonry headers/dividers, and convex molded Lucite pill buttons.
   - **Frutiger Aero**: Added dual-horizon Bliss sky-domes with rolling green meadow horizon auras, floating frosted glass capsule dock sidebars (`backdrop-filter: blur(16px)`, specular top rim highlight), Windows 7 Aero glass panels, and glossy aqua gel pill navigation tabs ("Hot", "New", "Top") with 3D reflection lines and water droplet sheen.
   - **Other Themes**: Enhanced Dark Aero (Vista Ultimate obsidian acrylic with electric cyan/emerald aurora meshes), Y2K Cybercore (perspective wireframe matrix floors and liquid mercury chrome buttons), Neo-Brutalism (blueprint dot-grids and 3.5px solid ink borders with 6px offset drop shadows), Vintage Editorial (fluted brass column moldings and oxblood wax-seal buttons), and Dark Corporate Zen (Kyoto basalt stone grooves with serene sage glow).
3. **Packaging & Verification**:
   - Produced verified standalone executable `Limbus Tracker 1.0.102.exe` and one-click silent installer `Limbus Tracker Setup 1.0.102.exe` in `release2/`. Purged obsolete `1.0.101` files.
   - Added Records Keeper Kenneth memo for `v1.0.102` in `ChangelogPage.jsx`.

### 3.2 Sinner Theater Portraits Extraction & Wiring (v1.0.101)
1. **Extracted from Unity Game Assets via REA & UnityPy**:
   - Located `StoryTheater_EmployeeCard` SpriteAtlas in `resources.assets`.
   - Extracted all 12 cards (`MainUI_PersonalityStory_7_0` through `MainUI_PersonalityStory_7_11`) at 333x503 resolution.
   - Saved locally to `src/assets/sinners/` (`yi_sang.png`, `faust.png`, `don_quixote.png`, `ryoshu.png`, `meursault.png`, `hong_lu.png`, `heathcliff.png`, `ishmael.png`, `rodion.png`, `sinclair.png`, `outis.png`, `gregor.png`) and `public/assets/sinners/`.
   - Created centralized registry in `src/assets/sinners/index.js`.
2. **Avatar UI Integration**:
   - Updated `ManagerAvatar.jsx` to load `SINNER_PORTRAITS[avatarId]` when `avatarType === 'sinner'`.
   - Updated `SettingsPage.jsx` "Choose Avatar Source" grid to display all 12 portraits with full avatar zoom/offset support.

### 3.2 Changelog & Update Network Resilience (v1.0.101)
1. Overhauled `ChangelogPage.jsx` fallback logic: eliminated bug where stale `v1.0.89` in `localStorage` shadowed newer local records. The changelog now always surfaces all operational memos up to `v1.0.101`.
2. Added `raw.githubusercontent.com` update check fallback to `UpdateNotification.jsx` to detect updates behind school Fortinet filters.
3. Added Records Keeper Kenneth memo for `v1.0.101` in `src/pages/ChangelogPage.jsx`.

---

## 4. LimbusDeck.com Complete REA Reverse-Engineering Inventory (Ready for Integration)
All 126 unique Next.js Turbopack JavaScript chunks (551 exported modules across all 29 routes) and full datasets from `https://limbusdeck.com/en` have been captured and extracted via REA into `C:\Users\cdbla\.gemini\antigravity\brain\9beca90b-f2da-4618-bde8-a9209f8a8a44\scratch\multiroute_extracted\`:

1. **Complete Datasets Extracted**:
   - **Full Identities DB with Skill & Coin Effect Text**: `3o-8c1-ji611u.js` (1.26 MB, module `554884`) — 190+ Identities with full `skills` (`coinEffects`, `coinEffectsKo`, `variants`, `keywords`), `defenseSkills`, `passives` (`descriptionEn`, `descriptionKo`, `conditionType`, `requiredSin`, `requiredCount`), `hpBase`, `hpGrowth`, `speedMin`/`speedMax`, `staggerThresholds`, `resistances`, `traits`, and `isWalpurgis`.
   - **Lightweight Identities Summary DB**: `0jeieeit2ti93.js` (357 KB, module `501738`).
   - **Full E.G.O DB with Awakening, Corrosion & Passive Text**: `0fsrk512cua9c.js` (373 KB) — 116+ E.G.O with full Awakening `coinEffects`, Corrosion `coinEffects`, passive descriptions, sin `costs`, SP `sanity` costs, and sin `resistances`.
   - **Lightweight E.G.O Summary DB**: `0akfwzoof2v4-.js` (95 KB, module `224710`).
   - **76 Recommended Meta Parties JSON**: `api_recommended-parties.html` (110 KB JSON) — 76 community archetypes with `coreMembers`, `members`, `targetKeywords`, `descriptionEn`, and `youtubeUrl`.
   - **Records & Statuses Index**: `3py36gywokrwg.js` (`RECORDS_INDEX`), `40b153jlm65cu.js` (`DUMMY_IDENTITIES`).

2. **Reverse-Engineered Systems & Modules**:
   - **Skill Card UI & Bracket Tag Parser (`444a_5rtna8p8.js`, `3z15am40gf--d.js`, `3u3bm5ir4bed9.js`)**:
     - `CoinEffects` (`715704`): `coinEffects[0]` = pre-roll (`[On Use]`/`[Combat Start]`), `coinEffects[1..N]` = per-coin effects.
     - `splitEffectSegments` & `getBracketColor`: 7-tier semantic color parser (`#fbbf24` Hit/Heads, `#a78bfa` On Use, `#60a5fa` Combat/Turn Start, `#34d399` Clash Win/Lose, `#f59e0b` Unbreakable Coin, `#fb923c` Self/Enemy/Ally, `#94a3b8` Turn End/Default).
     - Interactive Status Keyword Highlighting & Hover Tooltips (`highlightEffectText`, `renderStatusSegments`, `buildTermPattern`).
     - Conditional Skill Variants (`skill.variants`) & Multiple Defense Skills.
     - **Advanced Effect Search** (`EFFECT_SCOPES`, `EffectMatchCardLine` in `3z15am40gf--d.js`): Searches inside skill/passive descriptions and highlights matching effect lines on the card.
   - **10-Section Identity & E.G.O Detail Pages (`3u3bm5ir4bed9.js`, `2u0h43u5x5dml.js`)**:
     - Hero, Level Scaling (`HP = floor(hpBase + hpGrowth * (level - 1))`) & Resistances, "Based on my pool" synergy & comparison, Artwork Lightbox (Pre-Uptie vs Uptie 3/4), S1–S3 Skills, Defense Skills, Combat/Support Passives, Status Glossary (`Unique statuses` vs `Other statuses`), Common Teammates, and Same-Sinner Alternatives.
   - **Clash Calculator (`37h1ypx2wtpri.js`, mod `803245` & `542101`)**:
     - Exact Markov-chain DP solver (`solveClash`), SP clamp `[-45, 45]`, offense level bonus `floor(abs(lvA - lvB) / 3)`, Paralysis per-round coin consumption, expected post-win skill damage, and URL query state sync.
   - **Party Builder, Deck Finder & Synergy Analyzer (`1c7n7tg_cu3b3.js`, `3yx2j8ito-4p2.js`, `3q5xzuqgwtdy2.js`)**:
     - Base64URL `?b=` deck serialization (`partySize|keywords|12_identityIds|egoSegment`).
     - Passive feasibility engine (`checkPartyPassives`, `PASSIVE_HARD_SHARE = 0.15`).
     - 5-Axis Party Synergy Analyzer (`analyzeParty`: performance, keyword `sqrt(potency * count)`, gimmick, resonance, coverage).
     - Deck Finder with `EGO_LINKED_KEYWORDS`, fixed/excluded Sinner/ID filters, and Slot 1 `+2` slot priority.
   - **Counter Finder (`2ka0xmbph2vkr.js`, mod `513411`)**:
     - Dual-axis weakness multiplier (`physMult * sinMult` up to `4.0x`) ranked by `skillPowerRange(skill).max`.
   - **My Pool, Shard Advisor (`0yfxn5q8z-4th.js`), Schedule (`130i4hoix-2_9.js`) & Reports (`39z8522m8n5f_.js`, `253e-k_l_0g-x.js`)**:
     - `Ready decks` (7/7) vs `One short` (6/7), `pullImpact`/`partyImpact` recommendation engine, KST 06:00 / Thursday reset timers, Meta Report, Community Stats, Release Timeline, and Records.
   - **Fun & Minigames (`3irv8euffrkhx.js`, `0gjnfo6-l_g_q.js`, `0s1_ovx34azw8.js`, `02xm5_n6_iqna.js`)**:
     - Limbusdle (Daily, Archive, Unlimited, Hard, Custom Creator), 6 Minigames (`higher-lower`, `timeline`, `skill-name`, `art-zoom`, `memory`, `connections`), Mock Exam (`/exam`), Sinner Personality Test (`/sinner-test`), Worldcups (`/worldcup`, `/party-worldcup`), Tier Maker (`/tier-maker`), Image Maker Suite (`/wallpaper`, `/card-maker`, `/meme-maker`), and Achievement Badges (`useBadgesStore`).

---

## 5. LimbusDeck Integration Progress

### Phase 1 — COMPLETED & VERIFIED (`npx vite build` passed with 0 errors):
1. **Complete Database Enrichment (`scripts/syncLimbusDeckComplete.cjs`)**:
   - `src/data/identities.json`: All 190 LimbusDeck Identities enriched in-place with `ldId`, `sinnerId`, `nameEn`/`nameKo`/`nameJa`, `releaseDate`, `isStandard`, `isWalpurgis`, `hpBase`, `hpGrowth`, `minSpeed`, `maxSpeed`, `defenseLevel`, `resistances`, `staggerThresholds`, `ldSkills` (full `coinEffects`, `coinEffectsKo`, `variants`, `keywords`), `ldDefenseSkills`, `ldPassives` (`conditionType`, `requiredSin`, `requiredCount`, `descriptionEn`, `descriptionKo`), `traits`, `metaTier`, and resolved `statuses`.
   - `src/data/egos.json`: All 116 LimbusDeck E.G.O enriched in-place with `ldId`, `sinnerId`, `nameEn`/`nameKo`/`nameJa`, `releaseDate`, `sanity`, `costs`, `resistances`, `ldSkills`, `ldCorrosionSkills`, `ldPassive`, and resolved `statuses`.
   - `src/data/recommendedParties.json`: All 76 LimbusDeck recommended meta builds.
   - `src/data/recordsIndex.json`: All 190 `RECORDS_INDEX` entries for Hall of Records rank badges.
   - `src/data/traitsDictionary.json`: All 92 localized traits & `IDENTITY_META_TIERS`.
   - `src/data/statusDictionary.json`: 1,444 unique status effects extracted and cleaned directly from the Limbus Company game client (`EN_BattleKeywords*.json`).
2. **Core Engine (`src/utils/limbusDeckEngine.js`)**:
   - `getBracketColor`, `splitEffectSegments`, `segmentDisplayText` (7-color bracket tag parser), `getIdentityRecordRank`, `computeIdentityPoolImpact`, `searchIdentityEffects`, `EFFECT_SCOPES`, and exact Markov-chain DP `solveClash` solver.
3. **LimbusDeck Skill & Status Components (`src/components/limbusdeck/SkillComponents.jsx`)**:
   - `StatusTermsProvider`, `StatusTerm`, `StatusText`, `StatusSection` (with portal-based hover/click popover tooltips and `Unique Statuses` vs `Other Statuses` glossary), `CoinEffects` (`effects[0]` pre-roll + `1..N` numbered coins), `CoinDots`, `SinBadge`, `KeywordRoleBadge`, `LimbusDeckSkillCard` (with conditional `variants` and `Clash Calc` trigger), and `LimbusDeckPassiveCard`.
4. **10-Section Character & E.G.O Detail Modals (`src/components/IdDetailsModal.jsx` & `src/components/EgoDetailsModal.jsx`)**:
   - Sticky section quick-jump pills, `EN / KO` language toggle, interactive Lv 1–60 stat scaler, Hall of Records rank badges, Physical/Sin Resistances & Stagger, "Based on My Pool" impact diagnostics, Pre/Post-Uptie Artwork Viewer (with Side-by-Side & Fullscreen Lightbox), S1–S3 Skills + Variants, Defense Skills, Combat/Support Passives, Statuses Glossary, Tactical Playbook, Common Teammates & Recommended Meta Teams, Same-Sinner Switcher, and built-in Markov-chain Clash Simulator drawer.
5. **Advanced Effect Search & Filters (`src/pages/IdentitiesPage.jsx` & `src/pages/EgoPage.jsx`)**:
   - Added LimbusDeck's Effect Text Search bar + Scope selector (`All`, `Attack`, `S1`, `S2`, `S3`, `Defense`, `Passives`) + `+Variants` toggle + Faction/Trait dropdown + Meta Tier filter (`S`/`A`/`B`/`C`), with `EffectMatchCardLine` highlighting on `IdCard`.

### Next Phases (Ready to Execute):
- **Phase 2**: Party Builder, 76 Recommended Meta Builds, Deck Finder, Passive Feasibility (`checkPartyPassives`), 5-Axis Synergy Radar (`analyzeParty`), and Base64URL `?b=` Deck Sharing.
- **Phase 3**: Standalone Clash Calculator Page, Enemy Weakness Counter Finder, My Pool & Shard Advisor, and Reports Hub (Meta Report, Community Stats, Release Timeline, Hall of Records).
- **Phase 4**: Fun & Minigames Hub (Limbusdle, Higher or Lower, Skill Name Quiz, Art Zoom Quiz, Connections, Memory Match, Mock Exam, Sinner Personality Test, Worldcups, Tier Maker, Wallpaper/Card/Meme Studio, and Badges).

---

## 6. Key File Locations
- Context summary: `C:\Users\cdbla\Documents\Antigravity Playground\Limbus Tracker\limbus_tracker_context.md`
- Extracted LimbusDeck chunks & DBs: `C:\Users\cdbla\.gemini\antigravity\brain\9beca90b-f2da-4618-bde8-a9209f8a8a44\scratch\multiroute_extracted\`
- LimbusDeck sync script: `scripts/syncLimbusDeckComplete.cjs`
- LimbusDeck engine: `src/utils/limbusDeckEngine.js`
- LimbusDeck skill/status UI: `src/components/limbusdeck/SkillComponents.jsx`
- Character & E.G.O Detail Modals: `src/components/IdDetailsModal.jsx`, `src/components/EgoDetailsModal.jsx`
- Sinner portraits: `src/assets/sinners/` and `src/assets/sinners/index.js`
- Avatar component: `src/components/ManagerAvatar.jsx`
- Settings avatar picker: `src/pages/SettingsPage.jsx`
- Changelog memos: `src/pages/ChangelogPage.jsx`
- Update notification: `src/components/UpdateNotification.jsx`
- Package config: `package.json`
- Releases directory: `release2/`
