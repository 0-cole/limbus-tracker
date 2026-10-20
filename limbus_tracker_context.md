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
- **Current Deployed Release**: `v1.0.101`

---

## 2. Critical Architecture & Invariants

### 2.1 Technology Stack
- **Framework**: Electron (`v36.9.5`), React 19, Vite 6, Tailwind CSS 3, Zustand, Framer Motion.
- **Packaging**: `electron-builder` (`v26.15.3`) with NSIS targeting Windows x64 + standalone `portable` `.exe` target.
- **Differential Updates Permanently Suppressed**: `differentialPackage: false` configured in `package.json` to eliminate auxiliary `.blockmap` files and deliver pure direct executables.
- **Git Push Invariant**: Git remote configured via SSH over Port 443 (`git@github.com:0-cole/limbus-tracker.git`, `ssh.github.com:443`) bypassing school/institution Wi-Fi FortiGuard TLS DPI firewall restrictions.
- **Routing**: `HashRouter` (required for Electron's `file://` protocol).

### 2.2 Sinner Character Portraits & Avatars
- **Theater Menu Sinner Portraits**: Extracted via REA directly from Limbus Company's internal Unity assets (`StoryTheater_EmployeeCard` SpriteAtlas in `resources.assets`).
- All 12 official Sinner portraits (Yi Sang, Faust, Don Quixote, Ryōshū, Meursault, Hong Lu, Heathcliff, Ishmael, Rodion, Sinclair, Outis, Gregor) are hardcoded and bundled in `src/assets/sinners/` and `public/assets/sinners/` with zero external URL dependencies.
- Wired into `ManagerAvatar.jsx` and `SettingsPage.jsx` ("Choose Avatar Source") so every Sinner slot renders the crisp, official full-color character portrait instead of placeholder number/text monograms.

### 2.3 Updater & Firewall Bypass
- **School Firewall Mitigation**: FortiGuard intercepts `api.github.com` and `github.com`.
- **Changelog Fallback Engine**: `ChangelogPage.jsx` combines and prioritizes verified local operational memos (`v1.0.101` down to `v1.0.29`), preventing stale cached records (e.g. `v1.0.89`) from obscuring updates when the network is restricted.
- **Update Checks via `raw.githubusercontent.com`**: `UpdateNotification.jsx` includes a direct secondary route querying `raw.githubusercontent.com/0-cole/limbus-tracker/master/package.json` which bypasses firewall SSL blocks.

---

## 3. Recent Verified Changes (v1.0.101 & v1.0.100)

### 3.1 Sinner Theater Portraits Extraction & Wiring (v1.0.101)
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
