# Task: Add a "Charge Grinder"-style Mirror Dungeon feature to Limbus Tracker (and use REA for game data)

You already have project context (`limbus_tracker_context.md`). This sheet adds what was researched and decided so far. Verify anything marked UNVERIFIED before relying on it.

## 1. Goal
1. Implement functionality inspired by **Charge-Grinder** (Mirror Dungeon automation bot for Limbus Company) inside Limbus Tracker, and make it **better** than the original.
2. Use **REA (Reverse Engineer Anything)** to extract real game data (identities, EGOs, stat tables, schedules) from the Limbus client, instead of relying only on wiki scraping (`wiki_cache`, Playwright/cheerio).

## 2. Project facts (Limbus Tracker)
- Electron + React (Vite, Tailwind, zustand, Supabase, framer-motion). Current version **v1.0.86**.
- Repo: `https://github.com/0-cole/limbus-tracker` (branch `master`).
- Three identical-looking local copies exist (last touched 2026-10-07):
  - `C:\Users\cdbla\Documents\Limbus Tracker` (this file lives here)
  - `C:\Users\cdbla\Documents\Antigravity Playground\Limbus Tracker`
  - `C:\Users\cdbla\Documents\Antigravity Playground\limbus-tracker`
  - **Ask the user which is canonical before editing. Do not delete the others without confirmation.**
- Release pipeline invariants (from context file): bump `version` in `package.json`; `npm run build`; `npm run package` -> `release2/Limbus Tracker Setup <version>.exe`; `git tag v<version>`, push tag, `gh release create`, `gh release upload ... --clobber`. Cloud sync is manual-only; local auto-save is immediate. Keep the search token-indexing invariant (min 3 chars).

## 3. Charge-Grinder (reference project)
- Repo: **`Walpth/Charge-Grinder`**, Python, **GPL-3.0**, last pushed 2026-09-17. "Bot for Limbus Company to grind mirror dungeon so you don't have to (no OCR required)."
- Fork: **`Bonkier/workerbeev2`**, Python, GPL-3.0, last pushed 2026-10-08. Adds Luxcavation and a scheduler.
- Local clones: none yet. Clone to a scratch dir to read; do not copy code into the tracker (see licensing).
- It is plain Python source, so **REA is not needed to understand it**; read it directly.
- UNVERIFIED: exact mechanism (the "no OCR" claim, UI-state vs. image matching), game settings it requires (reportedly English UI), and current maintenance status. Read the source to confirm.

## 4. Decisions / blockers to resolve with the user FIRST
Ask these before writing code:
1. **Scope:** build the bot into the tracker (Mirror Dungeon automation), or only borrow tracking/scheduling ideas?
2. **License:** GPL-3.0 is copyleft. Copying/porting its code makes the distributed tracker GPL-3.0. Check the tracker repo's license. Default plan: **clean-room reimplementation** (analyze behavior, write new code, no copied code) unless the user accepts GPL-3.0.
3. **Canonical folder** (see section 2).

## 5. Risk and compliance (must be surfaced to the user and in the UI)
- Game bots/macros violate Project Moon's Terms of Service and can lead to account suspension. The tracker is publicly distributed via GitHub releases, so users inherit that risk.
- Recommended mitigations: make any automation **opt-in and off by default**, show a clear warning/consent screen, and consider keeping it a separate, user-installed module instead of bundling it in the main installer.
- Do not add anti-detection or evasion features.

## 6. Architecture options
- The tracker is Electron/Node; Charge-Grinder is Python.
  - **A. Rewrite in JS/TS** inside the Electron main process (preferred if clean-room).
  - **B. Python sidecar** launched by Electron (only if GPL-3.0 is accepted and the sidecar is kept as a separate process).
- Ideas to make it "better" (confirm with user): GUI controls and live status in the tracker, scheduling tied to the tracker's existing schedule/weekly data, run logs/stats saved to the tracker's store, safe stop/hotkey, resolution/DPI robustness, error recovery, and integration with deck/identity data.

## 7. REA setup (state as of 2026-10-12)
- REA repo: `https://github.com/morluto/rea` (cloned to `C:\Users\cdbla\.gemini\antigravity\scratch\rea`).
- CLI **`rea-agents` 6.4.0 installed globally via npm** (Node v24.15.0). Confirmed only via `npm ls -g`; a `rea --version` call **hung** and was killed, so the CLI is **not yet confirmed working**. Test with `npx -y rea-agents@latest --help` and add a timeout.
- Agent registration NOT done. `npx rea-agents setup` edits agent configs (registers an MCP server for chosen agents, with approval). Run it only with the user's go-ahead.
- Requirements: Node 22 (>=22.19), 24 (>=24.11) or 26+, plus npm. Native analysis uses Ghidra, Hopper or IDA (none confirmed installed); static JS analysis needs none.
- Example: `npx -y rea-agents@latest analyze-javascript-application <absolute path> --json`.
- Use REA on: the Limbus Company client files for data extraction (check ToS/EULA implications of datamining), and optionally other community trackers/apps for feature research. Do not copy others' code or assets; reimplement behavior.

## 8. Suggested plan
1. Ask the section 4 questions; wait for answers.
2. Confirm REA works (section 7); with permission run `npx rea-agents setup`.
3. Locate the Limbus client install; use REA to map where identity/EGO/schedule data lives; write an extraction script that outputs JSON compatible with `identities.json` and other `src/data` files. Compare against the current wiki-scraped data and report differences.
4. Clone and read `Walpth/Charge-Grinder` (and optionally `workerbeev2`); write a short behavior spec.
5. Implement the feature per the chosen architecture, opt-in with warnings.
6. Test, `npm run build`, bump version, update `ChangelogPage.jsx` and `limbus_tracker_context.md`, then ask the user before pushing/releasing to GitHub.

## 9. Other installed items (for reference)
- Spotifast v0.12.0 portable (Windows x64) at `C:\Users\cdbla\.gemini\antigravity\scratch\spotifast-app\spotifast-v0.12.0-x86_64-pc-windows-msvc\spotifast.exe`; source at `...\scratch\spotifast`. Unrelated to this task.
