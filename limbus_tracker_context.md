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
- **Current Deployed Release**: `v1.0.97`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64.
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

## 3. Recent Verified Changes (v1.0.97)
1. **Added 7 New Design System Themes (`src/styles/themes.js` & `src/styles/globals.css`)**:
   - **Frutiger Aero** (`frutiger_aero`): Glossy Web 2.0 aqua glass capsules, sky-blue gradients, and emerald aurora dew.
   - **DORFic** (`dorfic`): Daylight white-silver surfaces, vector-black typography, and a high-visibility Signal Orange (`#ff5500`) & Laser Red (`#ff2a2a`) indicator bar.
   - **Dark Aero** (`dark_aero`): Vista midnight obsidian acrylic, electric cyan-aurora mesh glows, and specular glass rims.
   - **Y2K Futurism / Cybercore** (`y2k_cybercore`): Liquid chrome bevels, cybernetic navy-void backgrounds, and acid cyan + hyper-magenta neon.
   - **Neo-Brutalism** (`neo_brutalism`): Raw architectural putty paper, thick `2px solid #111111` ink borders, sharp `4px` corners, and hard unblurred `4px 4px 0px #111111` offset drop shadows.
   - **Vintage Editorial** (`vintage_editorial`): Archival cream broadsheet paper, aged parchment cards, oxblood crimson accents, and editorial serif headings.
   - **Dark Corporate Zen** (`dark_corporate_zen`): Meditative monolith slate, quiet negative space, and Kyoto mineral sage (`#7fa99b`) & brushed champagne (`#c2b280`) accents.
2. **Changelog & Version Bump**: Added Kenneth's `v1.0.97` memo in `src/pages/ChangelogPage.jsx` and bumped version to `1.0.97`.

---

## 4. Key File Locations
- Theme registry: `src/styles/themes.js`
- Global theme CSS variables & bespoke surface rules: `src/styles/globals.css`
- Theme selector UI: `src/pages/SettingsPage.jsx`
- Tenna commercial modal: `src/components/TennaInfomercialModal.jsx`
- Charge Grinder tribute page: `src/pages/MirrorGrinderPage.jsx`
- Changelog memos: `src/pages/ChangelogPage.jsx`
- Package config: `package.json`
