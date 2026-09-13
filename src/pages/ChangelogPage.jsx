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
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        setReleases(data);
      } catch (e) {
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

      {error && (
        <div className="text-center py-24">
          <div className="text-[#c9a84c] font-mono text-sm mb-2">[TRANSMISSION INTERRUPTED]</div>
          <p className="font-bold text-red-400 mb-2">Archive records could not be retrieved</p>
          <p className="text-sm text-gray-500">{error}</p>
          <p className="text-sm text-gray-600 mt-2 italic">Kenneth notes: "Terminal connection timed out. Check your network before Corporate writes me up."</p>
        </div>
      )}

      {!loading && !error && (
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
