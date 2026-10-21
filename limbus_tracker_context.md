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
- **Current Deployed Release**: `v1.0.105`

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

## 3. Recent Verified Changes (v1.0.105, v1.0.104 & v1.0.103)

### 3.1 Local Auto-Updater Fix & Installer Targeting (v1.0.105)
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

## 4. Key File Locations
- Context summary: `C:\Users\cdbla\Documents\Antigravity Playground\Limbus Tracker\limbus_tracker_context.md`
- Sinner portraits: `src/assets/sinners/` and `src/assets/sinners/index.js`
- Avatar component: `src/components/ManagerAvatar.jsx`
- Settings avatar picker: `src/pages/SettingsPage.jsx`
- Changelog memos: `src/pages/ChangelogPage.jsx`
- Update notification: `src/components/UpdateNotification.jsx`
- Package config: `package.json`
- Releases directory: `release2/`
