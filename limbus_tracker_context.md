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
- **Current Deployed Release**: `v1.0.99`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64 + standalone `portable` `.exe` target.
- **Differential Updates Suppressed**: `differentialPackage: false` configured in `package.json` to eliminate auxiliary `.blockmap` files and deliver pure direct executables.
- **Routing**: `HashRouter` (required for Electron's `file://` protocol).

### 2.2 Sinner Character Portraits
- All 12 official, full-color LCB character portraits (Yi Sang, Faust, Don Quixote, Ryōshū, Meursault, Hong Lu, Heathcliff, Ishmael, Rodion, Sinclair, Outis, Gregor) are bundled locally in `public/assets/sinners/{id}.webp` and packaged into `dist/assets/sinners/`, with high-res CDN fallback.

### 2.3 Updater & NSIS Configuration
- **One-Click Updates**: `oneClick: true`, `perMachine: false`, `allowToChangeInstallationDirectory: false` in `package.json`.
- **Taskbar Pin Preservation**: Custom NSIS script in `build/installer.nsh` prevents shortcut deletion during in-place updates.

### 2.4 Tenna Variety Show Infomercial & LCCB Terminal
- **Clean Tenna Assets**: Uses official 59-frame 256x256 Deltarune dance (`tennadancing.gif`), clean walk cycles (`tenna_walk_clean.gif`), high-res TV portrait (`tenna_listening.png`), flying TV zoom (`tennaflying.png`), and Anttennas studio logo (`anttennas.png`) with zero border artifacts or clipping.
- **Punchy Pacing**: 5 focused, comedic acts (Emergency Bulletin -> The Wacky Pitch -> The Reveal -> The Price Inquiry -> Climax Explosion -> Grand Finale), perfectly synchronized with Toby Fox's *Tenna Introduction* theme and explosion SFX.
- **Authentic LCCB Terminal Layout**: Stripped all "vibecoded" neon marketing banners. Restructured as a true, gritty Project Moon LCCB Department of Records & Automation terminal:
  - `[LCCB ADVISORY: EXT-0353 // REF: WALPTH / CHARGE-GRINDER]` header with live clearance status.
  - Tactical command deck with gold-bordered action cards (`Open Repository on GitHub`, `Download Latest Release`, `Star on GitHub`).
  - Terminal bash/powershell clone strip with copy button (`git clone https://github.com/Walpth/Charge-Grinder.git`).
  - Records Keeper Kenneth's official resignation & transition memorandum.
  - Sinner field debrief cards featuring authentic portraits for Outis, Faust, Don Quixote, Ryōshū, Meursault, and Dante.

---

## 3. Recent Verified Changes (v1.0.99 & v1.0.98)
1. **Executable Packaging Overhaul (v1.0.99)**:
   - Configured `"differentialPackage": false` under `nsis` in `package.json` to permanently eliminate auxiliary `.blockmap` file generation.
   - Added `"target": ["nsis", "portable"]` to produce both a clean NSIS installer (`Limbus Tracker Setup 1.0.99.exe`) and a standalone, zero-installation portable executable (`Limbus Tracker 1.0.99.exe`).
   - Cleaned up obsolete installer artifacts from `release2/`.
   - Verified local silent installation to `v1.0.99.0`.
2. **Full UI Style Architecture & Anatomy Transformation for All 7 Themes (v1.0.98)**:
   - Integrated Google Fonts (`Space Grotesk`, `Orbitron`, `Playfair Display`, `Plus Jakarta Sans`) into `src/index.html`.
   - **Frutiger Aero** (`frutiger_aero`): Skeuomorphic Web 2.0 overhaul — rounded glossy gel buttons with top specular reflections, convex glass bubble cards (`inset 0 2px 2px #fff`, `0 6px 20px #0088cc`), rounded pill filter chips, and sky-dew canvas gradient.
   - **DORFic** (`dorfic`): Sharp architectural vector UI — bold uppercase typography, DIN/Grotesk headers, high-visibility Signal Orange (`#ff5500`) & Laser Red (`#ff2a2a`) rectangular buttons and 3px warning bars.
   - **Dark Aero** (`dark_aero`): Vista Ultimate acrylic dark glass — midnight frosted backdrops with specular glass rims, glowing cyan neon button rims, and aurora mesh background.
   - **Y2K Futurism / Cybercore** (`y2k_cybercore`): Year 2000 cybernetic HUD — `Orbitron` display typography, liquid chrome metallic pill buttons with cyan/magenta neon glow, and chrome-beveled cards.
   - **Neo-Brutalism** (`neo_brutalism`): Bold Gumroad-style raw geometry — thick 3px black ink borders across cards and inputs, `Space Grotesk` font, and tactile hard unblurred 5px-to-8px offset drop shadows (`5px 5px 0px #000`) that bounce on press.
   - **Vintage Editorial** (`vintage_editorial`): Broadsheet newspaper aesthetic — `Playfair Display` serif typography, double-rule borders, archival linen broadsheet parchment, and pressed-ink seal buttons.
   - **Dark Corporate Zen** (`dark_corporate_zen`): Quiet luxury executive suite — `Plus Jakarta Sans` typography, matte charcoal monolith cards, and understated Kyoto mineral sage (`#7fa99b`) accents.
2. **Changelog & Version Bump**: Added Kenneth's `v1.0.98` memo in `src/pages/ChangelogPage.jsx` and bumped version to `1.0.98`.

---

## 4. Key File Locations
- Theme registry: `src/styles/themes.js`
- Global theme CSS variables & bespoke surface rules: `src/styles/globals.css`
- Theme selector UI: `src/pages/SettingsPage.jsx`
- Tenna commercial modal: `src/components/TennaInfomercialModal.jsx`
- Charge Grinder tribute page: `src/pages/MirrorGrinderPage.jsx`
- Changelog memos: `src/pages/ChangelogPage.jsx`
- Package config: `package.json`
