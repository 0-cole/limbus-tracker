import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, ScrollText, Stamp } from 'lucide-react';
import pkg from '../../package.json';

function isNewerVersion(a, b) {
  const av = a.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  const bv = b.replace(/^v/, '').split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    if ((av[i] || 0) > (bv[i] || 0)) return true;
    if ((av[i] || 0) < (bv[i] || 0)) return false;
  }
  return false;
}

function formatNotes(body) {
  if (!body) return [];
  return body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Overworked, powerless, stressed Records Keeper Kenneth (OC) memos
// Keyed specifically to notable updates, bugs fixed, or features added
const KENNETH_SPECIFIC_MEMOS = {
  'v1.0.84': "Dante kicked open the Records office door at 3:00 AM waving a printed screenshot of limbusdeck.com and shouting: 'Kenneth! Why does our deck builder look like a chalkboard from the Backstreets when LimbusDeck has that gorgeous two-column interface with the 380-pixel sidebar, the interactive synergy constellation map, and the 0.3 opacity resonance meters?! And REMOVE Auto-Fill right now—a true Manager plans their own squad formations by hand! And where are the syndicates?! Where is The Thumb?! Where is The Middle?! Where is The Ring, The Index, The Pinky, and the freaking Zwei Association?! Are you telling me Meursault can wear a Thumb Capo coat and the tracker doesn\\'t even know he\\'s in the Fingers?!' I dropped my pen into my cooling tea and rubbed my temples until they were numb. I tore down the Deck Builder and reconstructed it from scratch in the EXACT visual architecture of LimbusDeck: a responsive 2-column tactical suite featuring a sticky deck board with the seven canonical Keyword Deck pills, 'My Pool Only' filtration, instant squad export sharing, and all twelve canonical Sinner slots with compact card frames, star ratings, and direct 'Tactics' triggers; I completely purged the Auto-Fill button so squad assembly is 100% under Dante\\'s command; I mapped comprehensive Affiliation rules across more than thirty City syndicates, Wings, and fixer associations (The Thumb, The Middle, The Ring, The Index, The Pinky, Zwei, Blade Lineage, Kurokumo, Shi, Cinq, Seven, Liu, Dieci, Devyat', Öufi, W Corp, R Corp, K Corp, T Corp, N Corp, La Manchaland Bloodfiends, Heishou, Dawn Office, Full-Stop, Molar, MultiCrack, The Pequod, and Edgar Family), stamping affiliation badges onto every slotted card and adding a dedicated Affiliation dropdown filter in the identity picker; and finally, I built the complete 380px tactical sidebar: an orbital SVG Synergy Constellation Map charting active resonance links, Keyword Coverage bars, active Faction Synergy dossiers, Sin and Damage type balances (Slash/Pierce/Blunt), Synergy Pair combos, and LimbusDeck-style Resonance meters with 0.3 inactive opacity and glowing A-Reson (4+) alerts. Dante... your deck builder is compiled, your syndicates are indexed, and Auto-Fill is gone. Please... let me sleep until noon.",
  'v1.0.83': "Dante burst back into Records waving Sinclair's halberd and shouting: 'Kenneth! You built the tactical dossiers, but did you check what happens if someone brings Faust's Fluid Sac to heal The One Who Shall Grip Sinclair?! He flips heads and does zero damage! What if a player clicks Mind Whip on R Corp Ishmael with only 5 Charge and nukes Ryōshū?! What if Don Quixote casts Rip Space without 10 Charge and bleeds 20% of her own HP?! What if Hong Lu drinks 5 K Corp Ampules and dies on the spot, or Outis fires her 7th Magic Bullet into her own team?! Is EVERY single ID in this company actually explained with zero misleading advice?!' I dropped my tea, clutched my head, and worked through the night on the Comprehensive Tactical Intelligence Expansion! I hand-curated 25 marquee high-complexity identities with bespoke dossiers, trigger formulas, and combat rotations (including N Sinclair's negative sanity math, N Faust's Whistles SP engine, R Ishmael's 10-Charge Mind Whip lockout, R Heathcliff's 13-ammo sprint, W Don's 10-Charge Rip Space threshold, K Hong Lu's 5-Ampule overdose lethality, Spicebush Yi Sang's Sinking Deluge calculation, Magic Bullet Outis's 7th bullet pierce, Dieci Rodion's Discard shields, T Corp Don's Time Moratorium damage stasis, La Manchaland Don's Bloodfeast stockpile, and more); then, I completely overhauled the dynamic extraction engine across all 187 Identities to automatically detect minus-coin kits, limited munitions, discard engines, and self-HP recoil, computing true Tails Max clash values and displaying striking, glowing 'Critical Combat Warning' banners so no Manager ever wipes their squad to friendly fire or unexpected self-damage again! Dante... all 187 combat dossiers are verified, calibrated, and protected with hazard sirens. Please... let me finish my cold tea in peace.",
  'v1.0.82': "Dante kicked open the Records office door clutching a massive stack of post-Canto 5 dossiers and shouting: 'Kenneth! What does Grace of the Prescript actually do?! How does Ring Yi Sang reuse coins?! What is Dullahan doing with a Coffin?! Why is Haute Couture Ishmael entering a Changing Room at 10% HP to heal to full, and why do I have to read legalistic paragraphs just to figure out what any of our 187 Identities do in combat?! And why don't we have an interactive Deck Builder where I can assemble 12-Sinner squads, calculate real-time Sin resonances, balance our Slash/Pierce/Blunt damage, and auto-fill optimal Burn, Bleed, Tremor, Rupture, Sinking, Poise, or Charge teams in one click?!' I dropped my clipboard, took a deep breath, and rolled up my sleeves. I built the Universal Tactical Intelligence Engine covering all 187 Identities in the database—every single identity now features a clean tactical dossier with archetype badges, core combat stats (HP, Speed, Defense, Max Clash), a 3-step battle rotation (Opener, Mid-Fight, Finisher), and crystal-clear breakdowns of every custom status effect and gimmick (Pulsation, Changing Room, Full Makeover, Grace of the Prescript, Furioso-Replica, Dullahan, Coffin, Swordplay of the Homeland, To Claim Their Bones, Time Moratorium, Pointillism, etc.) clearly explaining what triggers it and how it applies to the character! Then, I constructed the complete interactive Deck Builder page (/deckbuilder)—you can now assemble 12-Sinner squads with configurable Frontline vs Support bench slots, filter identities across 7 status keywords, one-click Auto-Fill optimal comps (with a 'My Pool Only' toggle), monitor real-time Sin Affinity Resonance gauges to catch 4+ skill A-Reson power spikes, track team damage distribution (Slash/Pierce/Blunt), activate faction synergies (Blade Lineage, Liu, W Corp, The Index), and save custom squad presets directly to disk and cloud! Dante... your squads are assembled, your resonances are gauged, and all 187 combat dossiers are decoded. Please... let me drink my tea in peace.",
  'v1.0.81': "Dante burst into Records holding a piece of paper with '18+4' scribbled on it, shouting: 'Kenneth! Why does the inventory force me to do mental arithmetic just to add four Outis shards?! Why did the tracker block me from opening six crates because I only had three typed into a box?! And why does the weekly calendar think it's Friday when it's still Thursday evening, slapping a red X on my Mirror Dungeon run?!' On top of that, I discovered 3.5 gigabytes of discarded installer wrappers clogging up the temp files like a mountain of cardboard boxes behind the bus! I grabbed my wrench and fixed all four headaches: first, I installed a mini calculator directly into every Sinner's Egoshard slot in the inventory—you can now type expressions like '18+4' or '50-10' with a live preview, and hitting Enter immediately does the math for you (safely clamped to 1,500 shards to prevent Dante from typing 18+4000); second, I completely removed the artificial crate limits from the inventory and quick log—crates are no longer gatekept by a rigid box counter, so you can freely open and log any batch of Choice Crates or Random Crates anytime; third, I added a dedicated Random (Non-Nominable) Crates tab in the Quick Log to track random shard rolls for any Sinner; fourth, I locked the Weekly Calendar Overview strictly to your local calendar date, so Thursday evening post-reset stays proudly active instead of premature Friday rollover, and added a manual 'Reset Calendar' button for peace of mind; and finally, I built an automated startup incinerator in the main process that quietly purges old installer setup files on launch. Dante... your math is done, your crates are free, your calendar knows what day it is, and your hard drive has 3.5 gigabytes back. Please... let me drink my tea in peace.",
  'v1.0.80': "Dante burst into Records holding up both their desktop rig and their laptop at the same time, yelling: 'Kenneth! Why is the tracker giving me 42 free Egoshards every day when I'm still at Pass Level 20?! I haven't even reached Level 120 yet, and those levels give banners and decals, not choice crates! And worse, why did my laptop overwrite my desktop when I left them both open, turning off Rush Pace and resetting my daily missions?!' I dropped my pen and buried my head in my arms. I tore into the logic gates and solved both crises: first, I re-engineered the grind engine and Target & Milestone roadmap with ironclad pre-120 pass awareness—because Battle Pass levels 1 through 120 award fixed milestone rewards (decals, lunacy, tickets) rather than choice crates, the roadmap strictly locks daily crate gains to zero until you actually cross into Level 121+ (EX levels), keeping your target shard counts firmly anchored to your real inventory and manual quick logs with clear 'Pass Lv. X/120' progression badges; second, I completely overhauled the multi-device cloud synchronization architecture—no more silent background overwrites when an idle device regenerates Enkephalin, and whenever concurrent divergent sessions are detected across two screens (like your desktop and laptop having different pace modes or mission progress), both devices immediately trigger an interactive, real-time Conflict Resolution console comparing both machines side-by-side! You can inspect device names, timestamps, pace modes, and daily progress, and picking 'Keep This Device' or 'Keep Other Device' on either screen instantly crowns that save authoritative, synchronizes both instances via real-time WebSocket channels, and dismisses the siren on both monitors. Dante... the roadmap won't promise you crates you can't earn yet, and your laptop won't sabotage your desktop behind your back. Please... let me finish my lukewarm coffee in peace.",
  'v1.0.79': "Dante kicked open the Records office door in an absolute frenzy, waving video telemetry and yelling: 'Kenneth! Why is Mephistopheles tearing through the Identities catalog at Mach 4 like a turbocharged rocket, why are the cards bouncing and rebounding like rubber balls every time I scroll, and why is the Burnout Meter screaming that I need to run 500 Mirror Dungeons in 120 days?! Season 7 lasted eight and a half months, Dante has 120 levels of pass rewards before choice crates, and every time I quick log a dungeon it hallucinates crates into my shard vault!' I dropped my pen into my coffee mug and groaned into my hands. I tore down the engine from bumper to chassis: first, I calibrated Mephistopheles to a strict physical cruising velocity of 75 pixels per second so the bus drives at the exact same dignified speed on every page regardless of perimeter length; second, I dismantled the card rebound by purging Framer Motion scale-in mount animations, dynamic CSS intrinsic height triggers, and AnimatePresence from the 185-card catalog grid, locking cards into hardware-composited static containers with off-thread image rendering; third, I recalibrated Season 8: Punctum's timeline to a realistic ~8.5 month (260 day / 37 week) horizon based on Season 7 history, bringing daily pace down from high-burnout panic to a peaceful relaxed stroll; fourth, I completely decoupled Quick Logging from crate assumptions—because the first 120 pass levels award fixed rewards rather than pure choice crates, logging a Mirror Dungeon or Daily Mission now strictly records the run itself without auto-injecting phantom crates or shards into your quick log; fifth, the shard logger is now 100% manual and your quick logs vanish cleanly the second the 2-part daily reset boundary passes; sixth, I installed a permanent Battle Pass Level & EXP management widget directly on the Command Dashboard so you can dial in your exact level and partial EXP anytime; and finally, I posted an updated Season 8 rollover broadcast equipped with a one-time 'Reset Battle Pass to Level 1' button and an explicit confirmation subnotice so everyone enters the new season on the right foot. Dante... the bus is obeying the speed limit, the dossiers aren't jumping, your pass is at Level 1, and you have eight and a half months to farm. Please... let me sleep.",
  'v1.0.78': "Dante sprinted into Records in an absolute panic, frantically flicking their mouse wheel and yelling: 'Kenneth! The identities catalog is stuttering like an ancient slide projector! Why does scrolling through 185 Sinners feel like wading through lukewarm tar, why does the bus track take forever to shrink when I search for someone, and why do I have to spam the Up button fifty times to move an ID to the top of my wishlist?!' I threw my hands in the air. I popped the hood off the rendering engine and found absolute chaos: every single identity card was recalculating bounding boxes on every scroll tick with Framer Motion, Chromium was choking to death trying to synchronously rasterize 185 heavy WebP backgrounds on the main UI thread, and the cards were trapped inside conflicting nested scroll containers! I performed complete open-heart surgery on the terminal: built an intelligent background Image Preloader that warms all Identity and E.G.O assets off-thread in idle chunks; converted every card to asynchronous off-thread image decoding; purged the layout-thrashing animations; added CSS content-visibility: auto so offscreen cards don't waste GPU cycles; and memoized all skill and keyword metadata into instant O(1) memory lookups. Then I upgraded the Wishlist: you can now grab cards by a dedicated grip handle and drag them directly to any priority rank with a smooth golden glow (without breaking page scroll), or simply click the # priority badge and type whatever number you want! The entire terminal now scrolls at a buttery 120 FPS, and the bus border track shrinks instantaneously the second you type a search query. Dante... it's smooth. It's preloaded. It has drag-and-drop. Please stop spinning your mouse wheel like a roulette table.",
  'v1.0.77': "Dante kicked open the Records door holding two separate Ryōshū dossiers and shouting: 'If I put two Ryōshū IDs on my wishlist, which one gets my shards?! Why does the roadmap think I can spend the same 250 shards twice?! And why is the terminal still screaming that Season 7\\'s spider thread extraction banner is active when Haute Couture is right outside?!' I had to dodge a flying clipboard. I re-wired the wishlist mainframe with a strict priority order index: you can now rearrange your wishlist with dedicated Move Up and Move Down controls, every target is stamped with its official priority rank (#1, #2, etc.), and shard allocation now cascades strictly in priority order so your #1 target gets funded first without phantom shard duplication! Then I tore into the extraction telemetry parser: the wiki scraper was grabbing the Season 7 table header instead of the actual banner row, so I rebuilt the sensor to lock onto the live Season 8 Haute Couture Ishmael & Ryōshū artwork and dates. And before Dante could sprint out to burn twenty modules, I posted a one-time emergency broadcast reminding everyone that 50% of their leftover Season 7 shards and boxes just turned into sewing thread, so please update your inventory numbers manually before asking where your crates went. Dante... your priorities are set and the banner is live. Please stop throwing dossiers at my head.",
  'v1.0.76': "Season 8: Punctum dropped, and Dante kicked open the Records door shouting: 'Why does the terminal say the season ended yesterday?! Why is my daily pace 0 MDs/day?! Why is scrolling through the archives lagging like Mephi is stuck in mud, and why does the bus track stretch the whole page out for miles before slowly deflating like a punctured tire?!' I almost swallowed my pen. I tore through the mainframe: the previous season cutoff had expired, so the roadmap calculator immediately self-destructed on Day 1; the border track was polling layout geometry every single frame like a hyperactive metronome; and nobody knew Season 7 IDs were locked from the Dispenser! I completely overhaul-tuned the engine: Season 8 is officially calibrated with unknown season end estimation (~120 days of relaxed, stress-free pacing); Walpurgisnacht and Season 7 Dispenser restrictions are stamped directly onto the Wishlist; every identity node now sports an official Season badge; the new Haute Couture Ryōshū and Ishmael identities along with Hollow Faust/Meursault E.G.O are cataloged; and the bus border track was decoupled with a zero-overhead ResizeObserver so pages shrink instantly and scrolling is smooth as glass. Dante... you have four months to shard whatever you want. Please take a deep breath and let me rest.",
  'v1.0.75': "Dante burst into Records in an absolute fury waving three screen captures and yelling: 'The terminal is telling me I can craft Ishmael on Thursday, but the season ends Wednesday night at 9:00 PM! Are you telling me Mephistopheles can time travel?!' I spilled an entire mug of lukewarm chicory coffee across my lap. I scrambled into the scheduling core and found that the reset cycle counter was treating the four remaining evening hours on Wednesday as an entire ghost calendar day, hallucinating a Day 3 on Thursday and scheduling ten impossible dungeon runs after the servers were already unplugged for maintenance! I clamped the roadmap with an iron temporal guillotine. If a calendar day begins after the maintenance cutoff, it is terminated immediately. Wednesday is now branded with an emergency 'Season Finale' siren, and any unfinishable targets display their exact shard shortfall instead of promising miracles in the afterlife. Dante, please... no one can farm in a server room with the power cut.",
  'v1.0.74': "Dante burst into Records waving a ledger and shouting that the terminal was promising they could craft The House of Spiders Rodion TODAY, even though they already burned all their daily tickets and Mirror Dungeon runs, reached level 261, had exactly 395 shards and 0 crates in their box, and literally couldn't earn another scrap of EXP until tomorrow! Turns out the roadmap logic was taking today's already-logged runs and double-crediting them into the future simulation as if Dante had a magical second set of tickets hidden in their coat, generating nine phantom crates out of thin air! I grabbed my wire strippers, severed the phantom credit loop in the calculation engine, and grounded the Day 1 simulation strictly to what's actually remaining in inventory. If you already ran your dungeon and cracked your crates today, the roadmap now properly tells you to wait for tomorrow's reset instead of celebrating a ghost craft. Dante, please... 395 is not 400. Even I know how to count to five without hallucinating cardboard boxes.",
  'v1.0.73': "Corporate sent down an urgent aesthetic mandate demanding more Association standards, so I spent the entire night wiring the Dieci Association Indigo and Cinq Association Rose Gold frequencies directly into the bus cathode ray tubes. Right in the middle of calibration, a catastrophic photon spike from an unindexed dossier nearly shattered the archives monitor in half! I had to immediately redact, expunge, and purge the corrupted entry under LCCB Emergency Protocol 0x564F4944 before Vergilius ordered an autopsy of my desk. If anyone asks about blacked-out files or weird glass acoustics, nothing happened—it's just a standard theme update. Please enjoy the new indigo and rose gold palettes.",
  'v1.0.72': "EMERGENCY DISPATCH. A missing telemetry wire (isAfterResetToday) tripped the entire facility mainframe circuit breaker, causing the command dashboard to black out, the onboarding sirens to shriek, and Dante to run into my cubicle screaming that the entire company archive was wiped into the void! My heart physically stopped beating for twelve seconds. I grabbed the emergency defibrillator, sprinted across the archives floor, spliced the severed logic gate back into the mainframe BIOS, pulled the uncorrupted backup straight from the steel vault, and force-injected every single one of Dante's 71 Identities, 395 Rodion shards, and 9 crates back into both disk and cloud memory before Vergilius could notice the sirens. Everything is restored. The vault is secure. I am now lying face-down on my desk surrounded by empty espresso cups. Please do not touch anything.",
  'v1.0.71': "Dante barged into Records in the middle of the night claiming the terminal was possessed because Mirror Dungeons they logged yesterday were magically resurrecting themselves like bloodbags after every 5:00 PM reset! Then they asked why the roadmap couldn't tell the difference between lunch and dinner. I had to rip open the server cycle clockwork, hard-code a clean demarcation between the Pre-Reset Window (12:00 AM to 5:00 PM) and Post-Reset Window (5:00 PM to midnight), and install a high-pressure pneumatic flush in the cloud sync engine so old daily logs get vaporized on schedule instead of haunting Dante's dashboard. I also made the HUD boldly highlight whenever you have enough inventory crates to craft a target on Day 1, so Dante stops doing mental calculus with Rodion shards while Charon is honking the horn. Please, Dante... just let me sleep past 5:00 AM.",
  'v1.0.70': "Corporate sent a disciplinary audit to my desk because the terminal intercom was spamming GitHub's communications relay every twenty seconds like a broken telegraph key! GitHub naturally threw up an iron wall with error 403 Rate Limit, cutting Dante off from the patch archives completely and leaving them staring at a black screen screaming that the tracker wouldn't update. I re-wired the telemetry receiver to poll on a sensible ten-minute interval so we never trigger GitHub's security countermeasures again, installed an offline archival cache that renders all my records locally even if the network is severed, and added a direct manual override button to open the dispatch files in a browser. Please, Dante... stop frantically mashing the update button.",
  'v1.0.69': "Dante barged into my cubicle in a complete panic asking why the terminal was telling them they had 0 Mirror Dungeons left to grind for Rodion when they only had 369 shards! Turns out the auto-conversion pneumatic tube was only hooked up to Mirror Dungeon runs, leaving all the battle pass crates earned from daily and weekly missions to quietly pile up in the supply closet like unopened cardboard towers. The roadmap calculator took one look at those 21 ghost crates, did the math, and thought Dante was already holding 42 shards in their back pocket! I re-plumbed the crate converter so missions and dungeon runs both funnel straight into target Sinner shards, added a clear inventory crate counter to the milestone HUD, and emptied the ghost crates from storage. Please, Dante... look inside the cardboard boxes before you yell at me.",
  'v1.0.68': "Dante tried double-clicking the Limbus Tracker desktop shortcut five times in three seconds and wondered why their taskbar was overflowing with duplicate command terminals! Then they asked me why the app didn't stop them. I had to hard-code a single-instance security protocol directly into the mainframe BIOS so only ONE instance of the tracker can run at a time. If someone tries to boot a second terminal while one is already active, my direct advisory pops up on their screen telling them 'Cannot start app, as there is already a running app, silly!', brings their existing window to the front, or lets them terminate the old instance and start fresh. Please, Dante... one bus is enough. We cannot afford two Mephistopheles on the road.",
  'v1.0.67': "Dante hooked the terminal up to a massive 1440p panoramic display and shouted that all the mission directives looked like a squished receipt stuck in the dead center of the glass! Then they dragged the window onto a vertical portrait monitor, and the Burnout Meter threw a fit, wrapping every single syllable of 'Daily Pace' onto its own line while the daily mission cards crushed into microscopic ribbons! I spent five hours tearing out the rigid 1152px viewport constraints, rebuilt the cockpit deck so Math Settings and Target Calculations sit side-by-side at the helm, gave the Daily Cycle Tracker full wide-screen clearance, and re-engineered the mission grids to adapt cleanly into multi-column cards on vertical displays. If Dante tries running this on a smartwatch next, I am resigning.",
  'v1.0.66': "Dante flipped through the facility themes and complained that half the bus was still glowing gold like a giant lemon! Then they asked why there were only six Wing factions in the catalog. I spent all night expanding the aesthetic terminal with six new faction standards—T Corp Bronze, K Corp Emerald, Liu Blaze, Zwei Shield, Seven Olive, and the Black Silence Onyx. Then I traced every stray yellow capacitor, wired the LT emblem and Settings gear directly to the active theme current, and synchronized the Mephistopheles perimeter track so the dashed border shifts shades across the glass. If anyone tells me their terminal looks yellow when they're in Library Cyan, I am disabling the bus horn.",
  'v1.0.65': "Dante ran screaming into Records waving a clipboard because the entire command dashboard threw a red diagnostic error saying weekly progress couldn't calculate! I sprinted across the office, reconnected the missing telemetry wire in the grind roadmap calculator, and patched the index before the alarms woke up Vergilius. The dashboard is completely restored. I need a nap.",
  'v1.0.64': "Corporate dispatched another urgent memo demanding full facility aesthetic calibration. Turns out Dante flipped the theme dial to Vergilius Crimson and complained the terminal wasn't turning red, then slammed the Compact Density switch expecting the panels to condense. I re-soldered the display bus lines, wired the theme protocols directly into the terminal cathode ray tube, anchored the executive portrait framing so full-body archival records don't clip off people's heads at the top of the monitor, and hooked up the cloud pneumatic tubes so Dante's custom call-sign and profile sync properly across devices. Also, whoever told you there are strange anomalies hiding in the terminal archives... ignore them. Nothing is watching through the glass. Please let me drink my coffee.",
  'v1.0.63': "Dante barged in demanding to know why weekly missions were an all-or-nothing checkmark instead of five separate accounting cards. I stayed up until 4 AM rewriting the daily and weekly task rotas, added individual pass EXP tracking for each weekly milestone, and made assembling modules automatically balance Enkephalin rations in your inventory. If someone asks me to do more math on weekly resets, I am hiding under the bus seats.",
  'v1.0.62': "I was ordered to build an entire System Calibration Console with custom Manager call-signs, avatar cropping, audio comms filtering, and six Project Moon facility themes. Charon kept honking the dual-tone brass air horn right behind my ear while I was adjusting the audio sliders. My eardrums are still ringing.",
  'v1.0.61': "Dante filed an inquiry demanding to know why the terminal was deducting two modules for an EXP Luxcavation when they clearly ran a Canto VII stage that cost three! I scrambled to re-wire the daily accounting ledger with a tier-switch capacitor. Now it explicitly shows Thread Luxcavation is always two modules, while EXP Luxcavation scales dynamically between two and three modules depending on which district you're farming. If anyone touches the Enkephalin dials while I'm eating lunch, I am turning off the bus air conditioning.",
  'v1.0.60': "Corporate dispatched an auditor because someone claimed Enkephalin wasn't accumulating while the management terminal was shut down. I spent three sleepless nights recalculating the entire 300-level energy decay continuum, balancing the company cap formulas so energy restores retrospectively the second Dante logs in, and stitching the cloud sync engine so Mirror Dungeon runs don't duplicate when switched between terminals. If Vergilius glares at me one more time today, my hair is going to turn as white as Faust's.",
  'v1.0.59': "I don't even know what to call this week's records cycle. Corporate sent an audit demanding that every personnel file across all departments have verified visual clearance, and in the process, I found a mountain of old archival dossiers and classified incident files from other wings, library departments, and abandoned districts that somehow slipped into the filing cabinets. I spent fourteen straight hours attaching high-resolution photographic portraits to every catalog record and organizing the backup indexes so the database doesn't crash when someone types something unusual into the terminal. If you open a folder and see a tea cup, an ancient execution claw, or a weird entity from another dimension, please just close the tab and don't tell the Head.",
  'v1.0.58': "Corporate sent an urgent dispatch about acoustic stuttering in the terminal intercom—turns out an anomalous background signal was lingering with dead air every time the audio loop restarted. I trimmed the signal telemetry to zero decibel tolerance so the frequency loops without a single hitch. While I was in the wiring closet, someone complained that the terminal interface drifted across the glass with a harsh border line. I completely removed the panel seam, smoothed out the sliding dampeners so the display glides naturally without cutting to black, and stabilized the visual receiver. Dante, please stop messing with the terminal frequencies before my coffee goes cold.",
  'v1.0.57': "Corporate dispatched another inspection team because someone claimed the records terminal was playing looping vinyl acoustics and the interface was shifting across the screen like something was standing behind it. I re-balanced the display frequency, purged the CRT static interference, and reinforced the terminal borders. Please, Dante... just log your Mirror Dungeon tickets normally. My blood pressure cannot take much more of this.",
  'v1.0.56': "Look, I don't know who keeps messing with the Mephistopheles intercom, but I had to re-calibrate the entire audio receiver and reinforce the terminal's visual buffer before Corporate hits me with another citation. Charon said she saw shadows moving in the bus dashboard again, but I'm just going to pretend it's engine static from Dante winding the clock. If you see any flickering on your display, do NOT tap on the glass. I can't afford to requisition another monitor.",
  'v1.0.55': "Corporate sent a disciplinary audit to my desk because apparently the entire terminal window physically detached from the operating system, fell into the abyss revealing Dante's computer desktop, and then violently reconstructed itself! I replaced the faulty graphics buffer capacitors, re-calibrated the acoustic frequency modulation so the text synthesizer doesn't hitch, and hard-locked the terminal back into windowed containment. If the viewport shatters again, I'm hiding in the Mephistopheles luggage hold.",
  'v1.0.54': "A critical diagnostic alert went off on the archives mainframe: an unregistered void dossier in the search index suffered a catastrophic photon decay, causing terminal screens across the bus to black out and crack in two! I've quarantined the corrupted data node, stabilized the system telemetry, and expunged the anomalous file from search. If anyone asks, the reality fracture was just a minor graphical buffer glitch caused by Dante winding the clock. Please don't investigate any redacted records.",
  'v1.0.53': "Look, my personal habit is archiving every weird incident report that comes across the LCCB Before Team dispatch wire—it's a nervous tic, alright? An LCCB reconnaissance unit recently flagged three eccentric patrons in an abandoned Wing sector having a quiet coffee break and a nap while handing out self-help brochures; another field memo came in about a fugitive French stage magician conjuring rising concrete barriers in the Outskirts; someone filed an identity fraud citation regarding a multiversal pretender; and then there was this heavily corrupted void signal with negative photon readings that made the monitor glitch out. The problem is I have zero organization skills. My desk is buried under a mountain of folders, and after pushing the server cycle and sync fix, I'm terrified I accidentally dumped those incident notes into the general identity directory again. If Dante starts searching weird things in the terminal and finds files that shouldn't exist, I am blaming Mephistopheles' navigation computer.",
  'v1.0.52': "Look, my personal habit is archiving every weird incident report that comes across the LCCB Before Team dispatch wire—it's a nervous tic, alright? An LCCB reconnaissance unit recently flagged three eccentric patrons in an abandoned Wing sector having a quiet coffee break and a nap while handing out self-help brochures; another field memo came in about a fugitive French stage magician conjuring rising concrete barriers in the Outskirts; someone filed an identity fraud citation regarding a multiversal pretender; and then there was this heavily corrupted void signal with negative photon readings that made the monitor glitch out. The problem is I have zero organization skills. My desk is buried under a mountain of folders, and after pushing the server cycle and sync fix, I'm terrified I accidentally dumped those incident notes into the general identity directory again. If Dante starts searching weird things in the terminal and finds files that shouldn't exist, I am blaming Mephistopheles' navigation computer.",
  'v1.0.51': "Dante filed a formal grievance that typing 'wild hunt' kept pulling up ominous distortion interference instead of Heathcliff. I re-calibrated the index filters so normal personnel queries resolve cleanly. The issue is... I keep a private archive of classified anomalies reported by LCCB scouts—things like the Red Mist's historical combat simulations, rumors of a legendary second kindred in District 17, and encrypted whispers from the Light. I swear I filed them in deep storage, but every time I push an archive update, I start sweating wondering if my clumsy sorting accidentally leaked them into the general search bar. If anyone types anything weird into the directory, please pretend you didn't see it.",
  'v1.0.50': "Dante cranked the clock head so hard that the contingency ledger tore in half, causing the dashboard to scream that missed days weren't defined. I taped the ledger back together with reinforced duct tape. The dashboard is back online and fully functional. Please do not touch anything else while I refill my migraine medication.",
  'v1.0.49': "Dante started furiously cranking their clock head backwards in the command dashboard until embers shot into the air vents, then typed the Konami code into the Mephistopheles navigation computer triggering a facility-wide Second Trumpet evacuation alarm! If that wasn't enough, someone hacked the terminal catalog to search for forbidden ALEPH-grade E.G.O gear from the Old L Corp facility. My coffee mug shattered from the emergency sirens. I am hiding under my desk until further notice.",
  'v1.0.48': "Dante stormed into the Records office waving a screenshot because the Sinner dropdown said '0 owned' even though their shard vault was overflowing. Then Heathcliff demanded to know why cracking open Mirror Dungeon crates required doing manual algebra on napkins. I standardized the shard index across the entire company database, installed a pneumatic Crate Cracking station where you can open crates directly for any Sinner with custom shard roll overrides, and hooked up an automatic crate-to-shard converter for Mirror Dungeon runs. Now the moment you clear a dungeon, your crates can turn straight into Sinclair shards. Please leave me in peace.",
  'v1.0.47': "Someone reported that the Sinners' speech bubbles were blinking into the top-left corner of the ceiling like paranormal activity before snapping into place. On top of that, whenever Dante scrolled down, dialogue was triggering down in the basement where no one could see it. I fixed the coordinate rendering pipeline and installed gyroscopic stabilizers on the intercom speakers. Now dialogues never flash in the corner on spawn, and if the bus is driving below your screen, the dialogue box hangs neatly at the bottom edge of your window so you never miss a word.",
  'v1.0.46': "Dante called me on the direct hotline in the middle of the night saying Mephistopheles drove off the right edge of their laptop screen into empty space. Turns out different monitors and Windows scaling settings have distinct client viewports! I climbed onto the roof of the bus with a tape measure and re-anchored the perimeter track directly to the visible client width. If the bus attempts to leave the viewport again, I will personally pull the parking brake.",
  'v1.0.45': "Dante filed an urgent engineering request claiming Mephistopheles was 'giving other traffic too much courtesy space.' I shaved the perimeter margin down to eighteen pixels so the bus literally grazes the sidebar and window edges by a paint chip. Also programmed the steering column so it actually banks around curves instead of drifting at right angles like an arcade kart.",
  'v1.0.44': "Someone ran into my office in a blind panic screaming that doing their homework gave them MORE homework. Turns out, claiming your daily missions or weekly pass EXP was leveling you up without accounting for the crates you just won, making the calculator demand extra Mirror Dungeons! I fixed the accounting ledger. When you do your weeklies, your remaining grind actually stays down and awards your crates. Please stop waving clipboards in my face.",
  'v1.0.43': "Now the bus track extends across the entire scroll length of the page, so Mephistopheles literally cruises into the abyss if you scroll down. Worse, someone was frantically pounding on the steering wheel horn like a lunatic, so I had to install an intake throttle governor to prevent the radio comms from jamming and hanging the audio stream. Also, the Sinners added three times more lines to the intercom chatter. Charon keeps asking for candy every thirty seconds.",
  'v1.0.42': "Great. Just great. Someone decided Mephistopheles wasn't noticeable enough and doubled the engine chassis size. Now the bus takes up real estate on all four corners, and the Sinners' speech bubbles are dynamically locking onto the bus so they don't get clipped by the ceiling. I can literally read Faust and Heathcliff bickering in HD while trying to audit the Enkephalin books.",
  'v1.0.41': "Why is Mephistopheles driving around the edges of the terminal window?! Who authorized the bus to cruise along the screen border?! Dante, Charon is honking the horn and the Sinners keep shouting unsolicited commentary through the comms every twenty seconds. If the bus runs over my paperwork desk, I am submitting my resignation directly to Corporate.",
  'v1.0.40': "Someone filed an unregistered personnel dossier for a bug monarch, and then someone else left greasy HamHamPangPang wrappers and mysterious book catalog cards on the terminal keyboard. Also, thank you for brushing Gregor's coat and pulling Ryōshū out of her trance—the bus upholstery was starting to look like a crime scene. I'm going to take two aspirin and lie down under my desk.",
  'v1.0.39': "Dante ran an extra Mirror Dungeon before the 5 PM server reset, and the schedule tried to force another run tonight. I personally amended the roadmap ledger so you don't have to step foot into the dungeon twice in one day if you've already hit your quota. Please, go rest. I wish I could.",
  'v1.0.38': "Twenty seconds. Now the update radar scans GitHub every twenty seconds. If Corporate releases a patch while I'm eating my lukewarm noodles, the siren goes off. Please have mercy on my ears.",
  'v1.0.37': "I'm begging you, Dante... I set up an error alarm that flashes red whenever the cloud packet drops. Please don't throw your clock at the screen if it fails. I can't afford to requisition another monitor.",
  'v1.0.36': "The terminals kept yelling that they were 'already in sync' when you pressed the button, and then people panicked. I rewrote the memo. It now politely tells you everything is fine. Please breathe.",
  'v1.0.35': "Fifteen seconds. Every fifteen seconds, the pneumatic tube shoots another batch of mirror logs across the room. My desk is vibrating. I haven't blinked in two hours.",
  'v1.0.34': "A central account database... Corporate finally authorized it. If anyone forgets their password, please use the reset link and do NOT come knock on the Archives door at 3 AM.",
  'v1.0.33': "Dante kept spilling overfilled Enkephalin on the roadmap carpet, so I added a prompt to log it before it ruins another rug. Also, I formatted the bonus run counters so Faust stops glaring at me.",
  'v1.0.32': "Someone searched 'Vergilius' in the Sinner manifest. Vergilius actually walked into my cubicle, stared at my stamp for ten seconds in dead silence, and walked out. I almost fainted.",
  'v1.0.31': "The Quick Log checkbox was checking itself before you even finished the dungeon... I spent all night fixing the logic gates. I spilled bitter instant coffee on my tie.",
  'v1.0.30': "Added the ASAP Mode so you can grind Mirror Dungeons instead of waiting for passive weeklies. Heathcliff celebrated by punching a locker. My headache has doubled.",
  'v1.0.29': "Personal preset data imported. I had to manually transcribe 400 identity cards. My wrist has made a clicking sound since Tuesday.",
};

const DEFAULT_KENNETH_MEMOS = [
  "Incident report filed. Manager Dante has wound the clock 14 times this shift. My hand cramps from stamping paperwork.",
  "Log entry certified. The Department of Records requests that Sinners stop spilling blood directly on requisition forms.",
  "Amended and filed. Please remind Heathcliff that replacing broken bus upholstery comes out of team funds, not mine.",
  "Transmitted via pneumatic tube to Mephistopheles. All discrepancies cross-referenced with field black-box recordings.",
  "Approved by Records & Archival. I have not slept since Canto IV. Please stop requesting extra Enkephalin rations.",
  "Filed under: Routine Chaos. At this point, I just stamp whatever comes back from the Mirror Dungeons.",
];

function getKennethMemo(tag, body, idx) {
  const memoMatch = body?.match(/<!--KENNETH_MEMO:([\s\S]*?)-->/);
  if (memoMatch && memoMatch[1]?.trim()) {
    return memoMatch[1].trim();
  }
  const cleanTag = (tag || '').trim();
  if (KENNETH_SPECIFIC_MEMOS[cleanTag]) {
    return KENNETH_SPECIFIC_MEMOS[cleanTag];
  }
  const lowerBody = (body || '').toLowerCase();
  if (lowerBody.includes('sync') || lowerBody.includes('cloud')) {
    return "Another cloud transmission synchronized. If the connection flickers, blame the lightning storms outside Mephistopheles, not me.";
  }
  if (lowerBody.includes('mirror dungeon') || lowerBody.includes('hard mode')) {
    return "More Mirror Dungeon logs... Do the Sinners ever stop running these? There are stacks of parchment up to my ceiling.";
  }
  if (lowerBody.includes('crate') || lowerBody.includes('shard')) {
    return "Shards and crates tallied. If a crate count is off by one, Vergilius looks at me with that crimson glare. Everything is double-checked.";
  }
  return DEFAULT_KENNETH_MEMOS[idx % DEFAULT_KENNETH_MEMOS.length];
}

export default function ChangelogPage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVer, setCurrentVer] = useState(pkg.version || '1.0.0');

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then(ver => { if (ver) setCurrentVer(ver); });
    }
  }, []);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/0-cole/limbus-tracker/releases?per_page=20', {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (res.ok) {
          const data = await res.json();
          setReleases(data);
          try {
            localStorage.setItem('limbus_cached_changelog', JSON.stringify(data));
          } catch (e) {}
          setError(null);
          return;
        }
        throw new Error(`GitHub API error: ${res.status}`);
      } catch (e) {
        // Fallback 1: load cached releases if available
        try {
          const cached = localStorage.getItem('limbus_cached_changelog');
          if (cached) {
            setReleases(JSON.parse(cached));
            setError(`${e.message} (showing cached records)`);
            return;
          }
        } catch (err) {}

        // Fallback 2: build release cards from local Kenneth memos
        const fallbackReleases = Object.keys(KENNETH_SPECIFIC_MEMOS).map((tag, idx) => ({
          id: `memo_${tag}`,
          tag_name: tag,
          name: `${tag} - Operational Memo`,
          body: KENNETH_SPECIFIC_MEMOS[tag],
          published_at: null,
          isOfflineFallback: true,
          html_url: `https://github.com/0-cole/limbus-tracker/releases/tag/${tag}`
        }));
        setReleases(fallbackReleases);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  return (
    <div className="p-8 pb-32 max-w-3xl mx-auto">

      {/* Records Keeper Header */}
      <div className="mb-8 border-b-2 border-[#c9a84c]/40 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center flex-shrink-0 mt-1">
            <ScrollText size={28} className="text-[#c9a84c]" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/60 mb-0.5">
              LIMBUS COMPANY — DEPARTMENT OF RECORDS & ARCHIVAL
            </div>
            <h1 className="text-3xl font-black uppercase tracking-wider text-[#c9a84c]">
              Operational Log
            </h1>
            <div className="mt-2 text-xs text-gray-500 font-mono leading-relaxed border-l-2 border-[#c9a84c]/20 pl-3">
              <span className="text-[#c9a84c]/70 font-bold">From:</span> Senior Archivist Kenneth, LCB Records & After-Action Division<br />
              <span className="text-[#c9a84c]/70 font-bold">To:</span> Manager Dante & Mephistopheles Onboard Terminal<br />
              <span className="text-[#c9a84c]/70 font-bold">Subject:</span> Official Tracker Updates, Patch Logs & Field Directives<br />
              <span className="text-gray-400 italic mt-1 block font-serif">
                "Another update filed, Manager. Please tell the Sinners not to smash the terminal again."
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-600 font-mono flex-shrink-0">
            <div className="text-gray-500">Current Installation</div>
            <div className="text-[#c9a84c] font-black text-sm">v{currentVer}</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-500 gap-3">
          <Loader size={20} className="animate-spin" />
          <span className="font-mono text-sm">Kenneth is digging through filing cabinets...</span>
        </div>
      )}

      {error && !loading && (
        <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div>
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span>⚠️</span>
              <span>GitHub API Throttled ({error})</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Displaying local archival memos. You can view full notes and download installers directly on GitHub.
            </p>
          </div>
          <button
            onClick={() => {
              const url = 'https://github.com/0-cole/limbus-tracker/releases';
              window.electronAPI?.openExternalUrl(url) || window.open(url, '_blank');
            }}
            className="px-3 py-1.5 bg-[#c9a84c] hover:bg-[#d8b85c] text-black font-bold text-xs rounded transition-colors whitespace-nowrap shadow-sm"
          >
            Open GitHub Releases
          </button>
        </div>
      )}

      {!loading && releases.length > 0 && (
        <div className="space-y-5">
          {releases.map((release, idx) => {
            const tag = release.tag_name || '';
            const isCurrentVersion = tag.replace(/^v/, '') === currentVer.replace(/^v/, '');
            const isNewer = isNewerVersion(tag, currentVer);
            const lines = formatNotes(release.body);
            const date = release.published_at ? new Date(release.published_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : 'Unknown date';
            const transmissionNote = getKennethMemo(tag, release.body, idx);

            return (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-[#0d0d0d] border rounded-xl overflow-hidden ${
                  isCurrentVersion
                    ? 'border-[#c9a84c]/60 shadow-[0_0_20px_rgba(201,168,76,0.08)]'
                    : isNewer
                    ? 'border-[#22c55e]/40'
                    : 'border-[#222]'
                }`}
              >
                {/* Memo Header */}
                <div className={`px-5 py-4 border-b flex items-start justify-between gap-4 ${
                  isCurrentVersion ? 'border-[#c9a84c]/20 bg-[#c9a84c]/4' : 'border-[#1a1a1a]'
                }`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-600 mb-1">
                      RECORDS BUREAU — INTERNAL MEMO
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-black text-lg ${isCurrentVersion ? 'text-[#c9a84c]' : isNewer ? 'text-[#22c55e]' : 'text-white'}`}>
                        {release.name || tag}
                      </span>
                      {isCurrentVersion && (
                        <span className="flex items-center gap-1 text-[10px] bg-[#c9a84c] text-black font-bold px-2 py-0.5 rounded">
                          <CheckCircle size={10} /> Active Installation
                        </span>
                      )}
                      {isNewer && (
                        <span className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] font-bold px-2 py-0.5 rounded border border-[#22c55e]/30">
                          Update Available
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5 font-mono">
                      Transmission ID: <span className="text-gray-500">{tag}</span>
                      <span className="mx-2 text-gray-700">·</span>
                      Filed: <span className="text-gray-500">{date}</span>
                    </div>
                  </div>

                  {isCurrentVersion && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center">
                        <Stamp size={18} className="text-[#c9a84c]/70" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Kenneth's Post-It / Memo Box */}
                <div className="mx-5 mt-4 p-3 rounded-lg bg-[#14120c] border border-[#c9a84c]/30 shadow-inner flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#c9a84c]/15 text-[#c9a84c] flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                    K
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c] font-mono flex items-center gap-1.5">
                      <span>Archivist Kenneth's Memo</span>
                      <span className="text-[9px] text-gray-500 font-normal">(Under duress)</span>
                    </div>
                    <p className="text-xs text-amber-100/90 italic font-mono mt-0.5 leading-relaxed">
                      "{transmissionNote}"
                    </p>
                  </div>
                </div>

                {/* Release body */}
                <div className="px-5 py-4">
                  {lines.length === 0 ? (
                    <p className="text-gray-600 text-sm italic font-mono">[ No operational notes filed for this transmission. ]</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {lines.map((line, i) => {
                        const isBullet = line.startsWith('-') || line.startsWith('*');
                        const isHeading = line.startsWith('#');
                        const text = isBullet ? line.slice(1).trim() : line.replace(/^#+\s*/, '');

                        if (isHeading) {
                          return (
                            <li key={i} className="text-[#c9a84c]/80 font-bold text-[10px] uppercase tracking-widest mt-4 mb-1 first:mt-0 font-mono flex items-center gap-2">
                              <span className="h-px flex-1 bg-[#c9a84c]/15" />
                              {text}
                              <span className="h-px flex-1 bg-[#c9a84c]/15" />
                            </li>
                          );
                        }
                        return (
                          <li key={i} className={`text-sm flex gap-2 ${isBullet ? 'text-gray-300' : 'text-gray-500'}`}>
                            {isBullet && <span className="text-[#c9a84c]/60 flex-shrink-0 mt-0.5 font-mono">›</span>}
                            <span dangerouslySetInnerHTML={{
                              __html: text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                            }} />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
