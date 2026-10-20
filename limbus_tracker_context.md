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
- **Current Deployed Release**: `v1.0.100`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64 + standalone `portable` `.exe` target.
- **Differential Updates Permanently Suppressed**: `differentialPackage: false` configured in `package.json` to eliminate auxiliary `.blockmap` files and deliver pure direct executables.
- **Git Push Invariant**: Git remote configured via SSH over Port 443 (`git@github.com:0-cole/limbus-tracker.git`, `ssh.github.com:443`) bypassing school/institution Wi-Fi FortiGuard TLS DPI firewall restrictions.
- **Routing**: `HashRouter` (required for Electron's `file://` protocol).

### 2.2 Sinner Character Portraits
- All 12 official, full-color LCB character portraits (Yi Sang, Faust, Don Quixote, Ryōshū, Meursault, Hong Lu, Heathcliff, Ishmael, Rodion, Sinclair, Outis, Gregor) are bundled locally in `public/assets/sinners/{id}.webp` and packaged into `dist/assets/sinners/`, with high-res CDN fallback.

### 2.3 Updater & NSIS Configuration
- **One-Click Updates**: `oneClick: true`, `perMachine: false`, `allowToChangeInstallationDirectory: false` in `package.json`.
- **Taskbar Pin Preservation**: Custom NSIS script in `build/installer.nsh` prevents shortcut deletion during in-place updates.

### 2.4 Tenna Variety Show Infomercial & LCCB Terminal
- Clean Tenna sprite sheets and animations synchronized with Toby Fox's theme.
- Gritty Project Moon LCCB Department of Records & Automation terminal styling.

---

## 3. Recent Verified Changes (v1.0.100 & v1.0.99)

### 3.1 Full Architectural Metamorphosis Across All 7 Themes (v1.0.100)
1. **DORFic Architecture & Interior Design (`dorfic`)**:
   - **Vertical Liquid Bubble Column Pillar**: Animated glowing amber bubble tube running along the sidebar perimeter (`@keyframes dorfic-bubbles-rise`) with rising bubbles, chrome endcaps, and high-visibility glow (`rgba(255, 102, 0, 0.45)`).
   - **Glass Block Masonry**: Headers, table columns, and horizontal dividing borders feature 20px glass block grid textures inspired by 2000s commercial glass block architecture.
   - **Blobitecture Milk-Acrylic Cards**: Organic rounded corners (`border-radius: 22px`), top signal-orange indicator accent rims, and warm sunset cove ambient lighting.
   - **Molded Tangerine Lucite Buttons**: Glossy convex Lucite capsule buttons with white specular highlight reflection rims and deep amber drop shadows.
   - **Technical Oval Porthole Inputs**: Rounded capsule search and selector inputs with signal orange glow focus states.
2. **Frutiger Aero (`frutiger_aero`)**:
   - Animated luminous Aqua Hydro-Tube Pillar (`@keyframes fa-bubbles-rise`), bio-tech sky-dome ambient lighting, and convex water bubble cards with glossy specular top reflections.
3. **Dark Aero (`dark_aero`)**:
   - Vista Ultimate obsidian glass acrylic with animated Electric Cyan Aurora Glass Beam (`@keyframes dark-aero-aurora`) and beveled neon glass card styling.
4. **Y2K Futurism / Cybercore (`y2k_cybercore`)**:
   - Millennium Matrix Wireframe scanner beam (`@keyframes y2k-matrix-scan`), liquid chrome pill buttons, and `Orbitron` display typography.
5. **Neo-Brutalism (`neo_brutalism`)**:
   - 45° black/yellow Hazard-Stripe Pillar, raw blueprint drafting grid, 3.5px solid ink borders, and hard 5px–8px offset drop shadows.
6. **Vintage Editorial (`vintage_editorial`)**:
   - Fluted Architectural Brass Column, archival broadsheet rag paper grain, double-rule card borders, and pressed printer's ink & oxblood seal buttons.
7. **Dark Corporate Zen (`dark_corporate_zen`)**:
   - Chiseled Raked Basalt Pillar with Kyoto mineral sage ambient backlighting and monolithic matte slate cards.

### 3.2 Executable Packaging & GitHub SSH Delivery (v1.0.99 & v1.0.100)
- Configured `"differentialPackage": false` under `nsis` in `package.json` to permanently eliminate `.blockmap` auxiliary files.
- Dual executable generation:
  - Standalone portable executable: `release2/Limbus Tracker 1.0.100.exe` (~108 MB)
  - Seamless installer executable: `release2/Limbus Tracker Setup 1.0.100.exe` (~108 MB)
- Local installation updated and verified at `v1.0.100.0`.
- Added Records Keeper Kenneth memo for `v1.0.100` in `src/pages/ChangelogPage.jsx`.

---

## 4. Key File Locations
- Context summary: `C:\Users\cdbla\Documents\Antigravity Playground\Limbus Tracker\limbus_tracker_context.md`
- Theme registry: `src/styles/themes.js`
- Global theme CSS variables & bespoke surface rules: `src/styles/globals.css`
- Theme selector UI: `src/pages/SettingsPage.jsx`
- Tenna commercial modal: `src/components/TennaInfomercialModal.jsx`
- Charge Grinder tribute page: `src/pages/MirrorGrinderPage.jsx`
- Changelog memos: `src/pages/ChangelogPage.jsx`
- Package config: `package.json`
- Releases directory: `release2/`
