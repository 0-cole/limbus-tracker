import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';

export const SPECIAL_EASTER_EGGS = [
  // ==========================================
  // 1. THE PATRON LIBRARIANS (LIBRARY OF RUINA)
  // ==========================================
  {
    id: 'binah',
    name: 'An Arbiter — Binah',
    subtitle: 'Patron Librarian of Floor of Philosophy • Former Extraction Team',
    categoryBadge: 'ARBITER OF THE HEAD',
    code: 'SEPHIRAH-BINAH-08',
    image: EASTER_EGG_IMAGES.binah,
    role: 'Floor of Philosophy',
    threat: 'Threat: Absolute Arbiter',
    keywords: ['Fairy', 'Degraded Chain', 'Degraded Lock', 'Pierce / Blunt', 'Floor of Philosophy'],
    quote: 'A moment of tea brings clarity to all things. Do you seek truth, or merely an escape from your loop, clockhead?',
    description: 'Formerly known as Garion, an Arbiter dispatched by the Head to raid the Outskirts laboratory. After being defeated by the Red Mist, her consciousness was extracted and repurposed into the Sephirah of the Extraction Team, and later the Patron Librarian of Philosophy. Wields the degraded Singularities of the Head with terrifying poise.',
    abilities: [
      { name: 'Degraded Chain', type: 'Pierce', desc: 'Conjures shimmering golden rings around the target, sealing their speed dice and slowing time.', coins: '3 Coins', effect: 'Inflicts Bind & Fragile' },
      { name: 'Degraded Lock', type: 'Blunt', desc: 'A pillar of dark mass crashes down, shattering enemy stagger thresholds.', coins: '2 Coins', effect: 'Mass Stagger Damage' },
      { name: 'Degraded Fairy', type: 'Status', desc: 'Infuses target with Fairy; every time they move or take action, they suffer piercing damage.', coins: 'Passive', effect: 'Fairy Damage on Clash' },
      { name: 'Degraded Pillar', type: 'Special', desc: 'Manifests a monolithic block of ancient Head Singularity matter to crush incoming attacks.', coins: '1 Heavy Coin', effect: 'Clash Power +10' }
    ],
    kennethNote: "An Arbiter of the Head?! Why is she filed under general identities?! If A or C Corp detects this dossier in our cloud cache, they won't just fire me—they will disintegrate the entire bus into subatomic dust. Do NOT click on her floor.",
    themeColors: {
      border: 'border-amber-500',
      shadow: 'shadow-[0_0_40px_rgba(245,158,11,0.4)]',
      bg: 'from-[#1a1406] via-[#100d04] to-black',
      accent: 'text-amber-400',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-600/50'
    },
    triggers: ['binah', 'arbiter', 'garion', 'floor of philosophy', 'fairy', 'extraction team']
  },
  {
    id: 'malkuth',
    name: 'Malkuth — Floor of History',
    subtitle: 'Former Head of Control Team • Elijah',
    categoryBadge: 'PATRON LIBRARIAN',
    code: 'SEPHIRAH-MALKUTH-01',
    image: EASTER_EGG_IMAGES.malkuth,
    role: 'Floor of History',
    threat: 'Threat: High Morale',
    keywords: ['Burn', 'Slash', 'Matchstick', 'Control Protocol', 'Floor of History'],
    quote: "I will do my best today! Even if I stumble, I'll stand right back up and keep running with my clipboard!",
    description: "The ever-enthusiastic Patron Librarian of the Floor of History. Originally Elijah, the earnest researcher who pushed herself to the limit for Ayin's recognition. Though self-conscious about her clumsy moments, her unyielding perseverance inspires everyone around her.",
    abilities: [
      { name: 'Frontal Assault', type: 'Slash', desc: 'Swings forward with renewed vigor, granting all allies haste next turn.', coins: '2 Coins', effect: 'Team Haste +2' },
      { name: 'Matchstick Sparks', type: 'Burn', desc: 'Ignites target with fiery determination, building stacking burn intensity.', coins: '3 Coins', effect: 'Inflicts 4 Burn' },
      { name: 'Wingbeat Flurry', type: 'Pierce', desc: 'Strikes repeatedly with the relentless wings of historical record.', coins: '4 Coins', effect: 'Heal SP on Hit' }
    ],
    kennethNote: "She keeps submitting daily progress logs three minutes early. I don't know whether to applaud her work ethic or cry because her paperwork creates five extra audit trails for my desk.",
    themeColors: {
      border: 'border-amber-600',
      shadow: 'shadow-[0_0_35px_rgba(217,119,6,0.35)]',
      bg: 'from-[#1f1205] via-[#140b03] to-black',
      accent: 'text-amber-500',
      badgeBg: 'bg-amber-950',
      badgeBorder: 'border-amber-700/60'
    },
    triggers: ['malkuth', 'malkouth', 'elijah', 'floor of history', 'control team']
  },
  {
    id: 'yesod',
    name: 'Yesod — Floor of Technological Convergence',
    subtitle: 'Former Head of Information Team • The Viper',
    categoryBadge: 'PATRON LIBRARIAN',
    code: 'SEPHIRAH-YESOD-02',
    image: EASTER_EGG_IMAGES.yesod,
    role: 'Floor of Technology',
    threat: 'Threat: Ironclad Order',
    keywords: ['Blunt', 'Paralyze', 'Dark Regret', 'Information Audit', 'Floor of Technology'],
    quote: 'Keep your uniform and your data immaculate. A single loose thread is an invitation to catastrophe.',
    description: "The stern, perfectionist Patron Librarian of the Floor of Technological Convergence. Formerly Gabriel, head of the Information Team, he bears a deep psychological trauma regarding filth and disorder. In combat, his calculated blunt strikes shatter defenses with surgical efficiency.",
    abilities: [
      { name: 'Cleanse and Sanitize', type: 'Blunt', desc: 'Heavy hammer blow that strips all buffs from the opponent.', coins: '2 Coins', effect: 'Dispel Target Buffs' },
      { name: 'Dark Regret Surge', type: 'Blunt', desc: 'Unleashes stored kinetic discharge with blinding velocity.', coins: '3 Coins', effect: 'Inflicts 3 Paralyze' },
      { name: 'Methodical Audit', type: 'Passive', desc: 'Calculates enemy attack frames to ensure flawless parry opportunities.', coins: 'Passive', effect: 'Parry Power +3' }
    ],
    kennethNote: "Yesod rejected my quarterly report because my coffee stain was 0.4 millimeters outside the margin. I respect the dedication, but I also want to throw my stapler into the sun.",
    themeColors: {
      border: 'border-purple-600',
      shadow: 'shadow-[0_0_35px_rgba(147,51,234,0.35)]',
      bg: 'from-[#160624] via-[#0d0317] to-black',
      accent: 'text-purple-400',
      badgeBg: 'bg-purple-950',
      badgeBorder: 'border-purple-700/60'
    },
    triggers: ['yesod', 'the viper', 'viper', 'gabriel', 'floor of technology', 'information team']
  },
  {
    id: 'tiphereth',
    name: 'Tiphereth — Floor of Natural Sciences',
    subtitle: 'Former Head of Central Command • Lisa',
    categoryBadge: 'PATRON LIBRARIAN',
    code: 'SEPHIRAH-TIPHERETH-05',
    image: EASTER_EGG_IMAGES.tiphereth,
    role: 'Floor of Natural Sciences',
    threat: 'Threat: Resolute Hope',
    keywords: ['Blunt / Pierce', 'The Nihil', 'Central Command', 'Courage', 'Floor of Natural Sciences'],
    quote: "Don't you dare treat me like a helpless child! We bear Enoch's dream forward, no matter how cruel the City is!",
    description: "The sharp-tongued yet deeply compassionate Patron Librarian of Natural Sciences. Having endured the repeated death and rebirth of her counterpart Enoch, she matured far beyond her years to become a pillar of emotional strength for the entire Library.",
    abilities: [
      { name: 'Gold Rush Blast', type: 'Blunt', desc: 'Summons golden drill power to break through hardened defenses.', coins: '2 Coins', effect: 'Penetrates Guard' },
      { name: 'Wrathful Temper', type: 'Pierce', desc: 'Fierce flurry of strikes fueled by stubborn determination.', coins: '3 Coins', effect: 'Damage +25% on low HP' },
      { name: 'In The Name of Love', type: 'Special', desc: 'Channeled magical light that cleanses negative status effects from the squad.', coins: '1 Coin', effect: 'Cleanse 2 Sinking / Tremor' }
    ],
    kennethNote: "She caught me crying under my desk during the server migration and handed me a juice box. She called me a slacker, but she didn't file a complaint. 10/10 librarian.",
    themeColors: {
      border: 'border-yellow-500',
      shadow: 'shadow-[0_0_35px_rgba(234,179,8,0.35)]',
      bg: 'from-[#1f1906] via-[#120e03] to-black',
      accent: 'text-yellow-400',
      badgeBg: 'bg-yellow-950',
      badgeBorder: 'border-yellow-600/50'
    },
    triggers: ['tiphereth', 'lisa', 'enoch', 'floor of natural sciences', 'central command']
  },
  {
    id: 'hokma',
    name: 'Hokma — Floor of Religion',
    subtitle: 'Former Head of Records Team • Benjamin',
    categoryBadge: 'PATRON LIBRARIAN',
    code: 'SEPHIRAH-HOKMA-09',
    image: EASTER_EGG_IMAGES.hokma,
    role: 'Floor of Religion',
    threat: 'Threat: Temporal Stasis',
    keywords: ['Blunt', 'Silence', 'Time Freeze', 'Apostles', 'Floor of Religion'],
    quote: "Time flows unceasingly, yet in faith, all moments are eternal. Let us wait upon Ayin's light.",
    description: "The solemn, reverent Patron Librarian of the Floor of Religion. Originally Benjamin, Ayin's closest companion and co-founder of the research lab. Deeply devoted to Ayin's mission, he wields temporal manipulation and liturgical clockwork.",
    abilities: [
      { name: 'Baptismal Clock', type: 'Blunt', desc: 'Suspends the opponent in a temporal stasis field.', coins: '2 Coins', effect: 'Target Cannot Act This Turn' },
      { name: 'Confession of Faith', type: 'Status', desc: 'Restores allies while increasing their devotion and clash defense.', coins: 'Passive', effect: 'Defense Power Up +3' },
      { name: 'Twelfth Apostle Bell', type: 'Special', desc: 'Rings the deep bell of judgment, dealing damage proportional to enemy sins.', coins: '1 Heavy Coin', effect: 'Pale Damage Burst' }
    ],
    kennethNote: "His floor literally controls time. Can he please rewind my work day so I can sleep for twelve hours? I asked him and he just stared at his pocket watch and prayed for me.",
    themeColors: {
      border: 'border-blue-400',
      shadow: 'shadow-[0_0_35px_rgba(96,165,250,0.35)]',
      bg: 'from-[#071326] via-[#040c17] to-black',
      accent: 'text-blue-300',
      badgeBg: 'bg-blue-950',
      badgeBorder: 'border-blue-700/60'
    },
    triggers: ['hokma', 'benjamin', 'floor of religion', 'records team', 'temporal']
  },

  // ==========================================
  // 2. THE HEAD & CITY LEGENDS
  // ==========================================
  {
    id: 'claw',
    name: 'The Claw of the Head — Baral',
    subtitle: 'Executor of the City • Serum W / K / R Administration',
    categoryBadge: 'THE HEAD • EXECUTIONER',
    code: 'HEAD-CLAW-BARAL',
    image: EASTER_EGG_IMAGES.claw,
    role: 'Enforcer of the Head',
    threat: 'Threat: Impuritas Civitatis',
    keywords: ['Serum W', 'Serum K', 'Serum R', 'Slash / Pierce', 'Absolute Speed'],
    quote: 'By decree of the City, your irregular existence is terminated. Injecting Serum W.',
    description: "Baral, a Claw of the Head. Claws are the direct martial executioners of the City's governing rulers, outfitted with heavy combat claws capable of injecting experimental Wing Singularities directly into their veins—Serum W for spatial warping, Serum K for instant regeneration, and Serum R for hyper-accelerated slaughter.",
    abilities: [
      { name: 'Serum W: Warp Strike', type: 'Pierce', desc: 'Instantly teleports across the combat grid, striking through physical space.', coins: '3 Coins', effect: 'Undodgeable Strike' },
      { name: 'Serum K: Instant Regeneration', type: 'Heal', desc: 'Injects K Corp nano-ampules to restore all lost vitality in milliseconds.', coins: 'Passive', effect: 'Heals 50% Max HP' },
      { name: 'Serum R: Acceleration Claws', type: 'Slash', desc: 'Rips through flesh and steel at relativistic speeds.', coins: '4 Coins', effect: 'Massive Bleed & Rupture' }
    ],
    kennethNote: "A CLAW?! WHY IS THERE A CLAW IN THE BUS SEARCH BAR?! If Charon sees him outside the window she's going to hit the accelerator and ram him at 120 MPH and I will have to explain vehicular manslaughter of a Head agent to Corporate.",
    themeColors: {
      border: 'border-red-600',
      shadow: 'shadow-[0_0_45px_rgba(220,38,38,0.5)]',
      bg: 'from-[#240608] via-[#140305] to-black',
      accent: 'text-red-400',
      badgeBg: 'bg-red-950',
      badgeBorder: 'border-red-700/70'
    },
    triggers: ['the claw', 'claw', 'baral', 'serum', 'serum w', 'serum k', 'the head']
  },
  {
    id: 'zena',
    name: 'An Arbiter — Zena',
    subtitle: 'The Eye of the Head • Enforcer of City Taboos',
    categoryBadge: 'THE HEAD • ARBITER',
    code: 'HEAD-ARBITER-ZENA',
    image: EASTER_EGG_IMAGES.zena,
    role: 'Arbiter of the Head',
    threat: 'Threat: Impuritas Civitatis',
    keywords: ['Lines of Force', 'Shockwave', 'Golden Shock', 'Blunt / Strike'],
    quote: 'You cannot build an Eden in this City. Every outlier must be pruned, and every seed stamped out.',
    description: "An Arbiter of the Head who arrived at the Library alongside Baral in the Impuritas Civitatis finale. Wields the unimpeded, un-degraded authority and Singularities of the Head, bending the physical laws of the City to crush anyone attempting to alter human nature.",
    abilities: [
      { name: 'Lines of Retribution', type: 'Blunt', desc: 'Paints indelible lines across reality that collapse into crushing shockwaves.', coins: '3 Coins', effect: 'All-Target Strike' },
      { name: 'Singularity Command', type: 'Special', desc: 'Deactivates enemy E.G.O and passive traits by executive order.', coins: 'Passive', effect: 'Suppresses Passives' },
      { name: 'Execution Decree', type: 'Pierce', desc: 'A point-blank kinetic blast that dismantles defensive stances.', coins: '2 Heavy Coins', effect: 'Stagger Burst' }
    ],
    kennethNote: "Zena gave me a headache just looking at her telemetry readings. If an Arbiter enters the bus, I'm hiding inside Dante's clock compartment and refusing to come out.",
    themeColors: {
      border: 'border-amber-400',
      shadow: 'shadow-[0_0_45px_rgba(251,191,36,0.45)]',
      bg: 'from-[#1c1505] via-[#0f0b02] to-black',
      accent: 'text-amber-300',
      badgeBg: 'bg-amber-950',
      badgeBorder: 'border-amber-600/70'
    },
    triggers: ['zena', 'arbiter zena', 'impuritas']
  },
  {
    id: 'purple_tear',
    name: 'The Purple Tear — Iori',
    subtitle: 'Color Fixer • Dimensional Wanderer',
    categoryBadge: 'COLOR FIXER',
    code: 'FIXER-COLOR-PURPLE-TEAR',
    image: EASTER_EGG_IMAGES.purple_tear,
    role: 'Dimensional Fixer',
    threat: 'Threat: Star of the City (4 Stances)',
    keywords: ['Slash / Pierce / Blunt / Guard', 'Mirage Step', 'Dimensional Stride', 'Violet Flash'],
    quote: "Looking for a different possibility, dear? I've seen countless worlds... this one is quite curious.",
    description: "The legendary Color Fixer known as the Purple Tear. Possessing the extraordinary ability to step between dimensional spaces, she wanders alternate timelines searching for her lost son, acting as an enigmatic mentor to Roland, Vergilius, and countless figures across the City.",
    abilities: [
      { name: 'Slash Stance: Violet Flash', type: 'Slash', desc: 'Switches to twin kodachi, dealing lethal lacerations with staggering bleed.', coins: '3 Coins', effect: 'Inflicts 6 Bleed' },
      { name: 'Pierce Stance: Viper Thrust', type: 'Pierce', desc: 'Switches to spear, punching through heavy armors.', coins: '2 Coins', effect: 'Defense Down +4' },
      { name: 'Blunt Stance: Great Earth', type: 'Blunt', desc: 'Switches to heavy gauntlets, staggering targets instantly.', coins: '2 Coins', effect: 'Stagger Damage +15' },
      { name: 'Guard Stance: Mirage Defense', type: 'Defense', desc: 'Phases out of linear reality to deflect all incoming strikes.', coins: 'Passive', effect: 'Complete Immunity to Status' }
    ],
    kennethNote: "She just teleported through my office wall, stole my lukewarm mug of tea, whispered something about 'a timeline where Dante bought the good biscuits', and vanished into thin air. I hate Color Fixers.",
    themeColors: {
      border: 'border-violet-500',
      shadow: 'shadow-[0_0_40px_rgba(139,92,246,0.4)]',
      bg: 'from-[#170929] via-[#0d0417] to-black',
      accent: 'text-violet-400',
      badgeBg: 'bg-violet-950',
      badgeBorder: 'border-violet-700/60'
    },
    triggers: ['purple tear', 'the purple tear', 'iori', 'dimensional']
  },
  {
    id: 'argalia',
    name: 'The Blue Reverie — Argalia',
    subtitle: 'Leader of the Reverberation Ensemble • Angelica\'s Brother',
    categoryBadge: 'COLOR FIXER',
    code: 'FIXER-COLOR-BLUE-REVERIE',
    image: EASTER_EGG_IMAGES.argalia,
    role: 'Ensemble Maestro',
    threat: 'Threat: Star of the City (Distorted)',
    keywords: ['Vibration', 'Slash', 'Resonance', 'Scythe', 'Reverberation'],
    quote: "Listen to the symphony of the City! Carmen's voice is the melody we were born to play!",
    description: "The Color Fixer known as the Blue Reverie, armed with a vibration scythe that resonates with the emotional chords of the City. Following the death of his sister Angelica, he succumbed to Carmen's whispers and assembled the Reverberation Ensemble to orchestrate the grand finale of the City.",
    abilities: [
      { name: 'Vibrato Scythe', type: 'Slash', desc: 'Resonates the air itself, tearing through flesh without physical contact.', coins: '3 Coins', effect: 'Inflicts Tremor & Slash' },
      { name: 'Allegro Tempo', type: 'Buff', desc: 'Speeds up the Ensemble’s movement to hyper-sonic rhythm.', coins: '2 Coins', effect: 'Team Speed +3' },
      { name: 'Grand Finale Crescendo', type: 'Special', desc: 'Conducts a catastrophic vibration blast across all targets.', coins: '1 Heavy Coin', effect: 'Mass Tremor Burst' }
    ],
    kennethNote: "Roland started vibrating with homicidal fury the moment someone typed 'Argalia' into the search bar. Heathcliff had to physically tackle Roland back onto the bus sofa.",
    themeColors: {
      border: 'border-cyan-500',
      shadow: 'shadow-[0_0_40px_rgba(6,182,212,0.4)]',
      bg: 'from-[#061824] via-[#030d14] to-black',
      accent: 'text-cyan-400',
      badgeBg: 'bg-cyan-950',
      badgeBorder: 'border-cyan-700/60'
    },
    triggers: ['argalia', 'blue reverie', 'the blue reverie', 'ensemble', 'reverberation ensemble']
  },
  {
    id: 'xiao',
    name: 'Director Xiao — Iron Lotus',
    subtitle: 'Liu Association Section 1 Director • Complete Effloresced E.G.O',
    categoryBadge: 'SECTION 1 DIRECTOR',
    code: 'LIU-DIR-XIAO-01',
    image: EASTER_EGG_IMAGES.xiao,
    role: 'Liu Association Commander',
    threat: 'Threat: Star of the City (Dragon E.G.O)',
    keywords: ['Burn', 'Slash', 'Nine Children of the Dragon', 'Iron Lotus', 'Complete E.G.O'],
    quote: 'I will not succumb to sorrow! I will burn through the heavens until the ashes settle and my resolve remains intact!',
    description: "The resolute Director of Liu Association Section 1. Facing the tragic loss of her subordinates and husband Lowell in the Library, she rejected Carmen's distorting whispers through sheer, uncompromising willpower, achieving a magnificent Complete Effloresced E.G.O in the form of an infernal dragon.",
    abilities: [
      { name: 'Nine Children: Pulao', type: 'Burn', desc: 'Summons draconic bells that ring with intense incinerating heat.', coins: '3 Coins', effect: 'Inflicts 8 Burn' },
      { name: 'Raging Dragon Claw', type: 'Slash', desc: 'Sweeps across the field with halberds wrapped in roaring flame.', coins: '4 Coins', effect: 'Burn Potency +5' },
      { name: 'Unshakable Will', type: 'Passive', desc: 'Immune to emotional dissolution, stagger, or panic.', coins: 'Passive', effect: 'Cannot Panic / Burn Boost' }
    ],
    kennethNote: "Director Xiao is terrifying. She looked at our fire extinguisher and said it was an insult to combat combustion. I am keeping three buckets of sand near my terminal at all times.",
    themeColors: {
      border: 'border-orange-500',
      shadow: 'shadow-[0_0_40px_rgba(249,115,22,0.45)]',
      bg: 'from-[#240f04] via-[#140802] to-black',
      accent: 'text-orange-400',
      badgeBg: 'bg-orange-950',
      badgeBorder: 'border-orange-700/60'
    },
    triggers: ['xiao', 'iron lotus', 'liu association', 'nine children', 'lowell']
  },
  {
    id: 'ayin',
    name: 'Ayin — The Architect',
    subtitle: 'Founder of Lobotomy Corporation • The One Who Began It All',
    categoryBadge: 'THE ARCHITECT',
    code: 'LOBOTOMY-FOUNDER-A',
    image: EASTER_EGG_IMAGES.ayin,
    role: 'The Manager',
    threat: 'Threat: Origin of the Light',
    keywords: ['Seed of Light', 'Cogito', '50-Day Cycle', 'The Founder', 'Day 50'],
    quote: 'Cast off the guilt. The seed must take root, even if a million deaths nourish its soil.',
    description: "Ayin, also known as 'A' or the Manager. Co-founder of the original research laboratory alongside Carmen. Following Carmen's death, Ayin endured millenia of temporal loop torture and psychological disintegration to construct the 50-day script of Lobotomy Corporation, ultimately dispersing his consciousness into the Light.",
    abilities: [
      { name: 'Seed of Light Protocol', type: 'Special', desc: 'Awakens suppressed humanity and E.G.O resonance across the City.', coins: 'Passive', effect: 'Max SP +45 to Allies' },
      { name: 'Cogito Extraction', type: 'Status', desc: 'Pours pure subconscious fluid to materialize latent Abnormalities.', coins: '2 Coins', effect: 'Resonance Awakening' },
      { name: 'The Final Script', type: 'Special', desc: 'Day 50 ascension: absorbs all grief to complete the light.', coins: '1 Heavy Coin', effect: 'Supreme Catharsis' }
    ],
    kennethNote: "Every time someone mentions Ayin, the Mephistopheles engine hums in a lower frequency. Please, I don't want to think about Lobotomy Corp headquarters. Just let the dead rest.",
    themeColors: {
      border: 'border-emerald-500',
      shadow: 'shadow-[0_0_40px_rgba(16,185,129,0.4)]',
      bg: 'from-[#051a11] via-[#020d09] to-black',
      accent: 'text-emerald-400',
      badgeBg: 'bg-emerald-950',
      badgeBorder: 'border-emerald-700/60'
    },
    triggers: ['ayin', 'architect', 'seed of light', 'manager a', 'lobotomy corp']
  },

  // ==========================================
  // 3. ABNORMALITIES (LOBOTOMY CORP / RUINA)
  // ==========================================
  {
    id: 'whitenight',
    name: 'WhiteNight — ALEPH Abnormality',
    subtitle: 'Classification: T-03-46 • The Plague Doctor Ascended',
    categoryBadge: 'ALEPH ABNORMALITY',
    code: 'T-03-46',
    image: EASTER_EGG_IMAGES.whitenight,
    role: 'Pale God',
    threat: 'Threat: ALEPH (Extinction)',
    keywords: ['Pale', '12 Apostles', 'Confession Clock', 'Paradise Lost', 'ALEPH'],
    quote: 'Rise, my servants. Rise and serve me. The time has come, and the clock tolls twelve.',
    description: "WhiteNight is one of the most perilous ALEPH-class Abnormalities in existence. Once disguised as the benevolent Plague Doctor, it marks twelve employees as its Apostles. When the clock strikes twelve, the Twelfth Apostle betrays the facility and WhiteNight ascends in blinding pale majesty, radiating lethal pale pulses across the entire facility.",
    abilities: [
      { name: 'Apostles\' March', type: 'Pale', desc: 'Summons transformed Scythe and Spear Apostles to eradicate opposition.', coins: '4 Coins', effect: 'Pale Damage Strike' },
      { name: 'Bell of Confession', type: 'Pulse', desc: 'Tolls a deep bell that cleanses all non-believers, dealing facility-wide damage.', coins: 'Passive', effect: 'Facility-Wide Pale Burst' },
      { name: 'Paradise Lost', type: 'Ultimate', desc: 'The ultimate manifestation of false grace. Instant ego collapse on contact.', coins: '1 Heavy Coin', effect: 'Fatal to Mind & Soul' }
    ],
    kennethNote: "WHO TYPED WHITENIGHT INTO THE SYSTEM?! The emergency klaxon just started flashing pale white! If the 12th Apostle shows up on this bus I am locking myself in the snack pantry.",
    themeColors: {
      border: 'border-white',
      shadow: 'shadow-[0_0_50px_rgba(255,255,255,0.6)]',
      bg: 'from-[#1c1c22] via-[#0e0e12] to-black',
      accent: 'text-white',
      badgeBg: 'bg-white/20',
      badgeBorder: 'border-white/50'
    },
    triggers: ['whitenight', 'white night', 'plague doctor', 'apostle', 'paradise lost', 'aleph']
  },
  {
    id: 'apocalypse_bird',
    name: 'Apocalypse Bird — ALEPH Abnormality',
    subtitle: 'Classification: O-02-40 • The Beast of the Black Forest',
    categoryBadge: 'ALEPH ABNORMALITY',
    code: 'O-02-40',
    image: EASTER_EGG_IMAGES.apocalypse_bird,
    role: 'Black Forest Amalgam',
    threat: 'Threat: ALEPH (Disaster)',
    keywords: ['Big Eyes', 'Small Beak', 'Long Arms', 'Black Forest', 'ALEPH'],
    quote: 'Once there were three birds that loved the forest. Then peace became paranoia, and the forest burned.',
    description: "The nightmarish fusion of Big Bird, Punishing Bird, and Judgement Bird. Believing they were protecting the creatures of the Black Forest from an unseen monster, the three birds merged into a colossal, multi-eyed behemoth wielding the Lamp, the Scales, and the Beak, plunging the world into eternal twilight.",
    abilities: [
      { name: 'Eternally Lit Lamp', type: 'Black', desc: 'Hypnotizes targets into walking blindly toward the beast’s gaping mouth.', coins: '3 Coins', effect: 'Inflicts Severe Charm' },
      { name: 'Scales of Judgement', type: 'Pale', desc: 'Weighs the sins of the target; if found heavy, inflicts instant execution.', coins: '2 Coins', effect: 'Instant Stagger on Heavy Sin' },
      { name: 'Punishing Beak', type: 'Red', desc: 'Retaliates against attackers with a vicious, jaw-splitting counterbite.', coins: 'Passive', effect: 'Extreme Counter Damage' }
    ],
    kennethNote: "Three birds merged into one giant egg of doom. Every single containment protocol we had for this thing involved running as fast as your legs could carry you.",
    themeColors: {
      border: 'border-purple-800',
      shadow: 'shadow-[0_0_45px_rgba(107,33,168,0.5)]',
      bg: 'from-[#19052b] via-[#0c0214] to-black',
      accent: 'text-purple-300',
      badgeBg: 'bg-purple-950',
      badgeBorder: 'border-purple-700/70'
    },
    triggers: ['apocalypse bird', 'black forest', 'big bird', 'judgement bird', 'punishing bird']
  },
  {
    id: 'nothing_there',
    name: 'Nothing There — ALEPH Abnormality',
    subtitle: 'Classification: O-06-20 • The Mimicry Shell',
    categoryBadge: 'ALEPH ABNORMALITY',
    code: 'O-06-20',
    image: EASTER_EGG_IMAGES.nothing_there,
    role: 'Flesh Mimic',
    threat: 'Threat: ALEPH (Mimicry)',
    keywords: ['Mimicry', 'Hello', 'I Love You', 'Goodbye', 'Red Damage', 'ALEPH'],
    quote: 'Hello? I love you. ...GOODBYE.',
    description: "An amorphous, flesh-eating mass that obsessively seeks to imitate humans. It steals the skins and voices of agents it butchers, parroting distorted greetings like 'Hello?' and 'I love you' before mutating into a hulking, scythe-armed monstrosity that cleaves entire hallways with a deafening cry of 'GOODBYE.'",
    abilities: [
      { name: 'Hello?', type: 'Red', desc: 'Infiltrates squad in stolen human guise before shedding disguise.', coins: '2 Coins', effect: 'Surprise Red Cleave' },
      { name: 'I Love You', type: 'Buff', desc: 'Parrots distorted warmth to lower enemy guard before striking.', coins: 'Passive', effect: 'Lowers Enemy Defense' },
      { name: 'GOODBYE', type: 'Slash', desc: 'Swings its gigantic scythe-arm with catastrophic red devastation.', coins: '3 Heavy Coins', effect: 'Massive Lethal Cleave' }
    ],
    kennethNote: "If anyone on the bus walks in and says 'Hello?' in a metallic, gargling tone, nobody say 'I love you' back. Just throw Dante's lunch at it and run.",
    themeColors: {
      border: 'border-rose-700',
      shadow: 'shadow-[0_0_45px_rgba(190,18,60,0.5)]',
      bg: 'from-[#24040a] via-[#120205] to-black',
      accent: 'text-rose-400',
      badgeBg: 'bg-rose-950',
      badgeBorder: 'border-rose-800/70'
    },
    triggers: ['nothing there', 'mimicry', 'goodbye', 'hello i love you']
  },
  {
    id: 'mountain_of_smiling_bodies',
    name: 'The Mountain of Smiling Bodies',
    subtitle: 'Classification: T-01-75 • The Corpse Amalgam',
    categoryBadge: 'ALEPH ABNORMALITY',
    code: 'T-01-75',
    image: EASTER_EGG_IMAGES.mountain_of_smiling_bodies,
    role: 'Corpse Devourer',
    threat: 'Threat: ALEPH (Cannibalistic)',
    keywords: ['Black Damage', 'Corpse Eater', 'Bile Spray', 'Smiling Bodies', 'ALEPH'],
    quote: 'A towering heap of melt-faced cadavers, smiling wider with every body it assimilates into its bulk.',
    description: "A horrifying amalgamation of decomposing corpses that smiles wider the more flesh it consumes. Whenever personnel fall in combat, the Mountain rolls toward their remains, devouring them to grow into a three-tiered colossus that spews corrosive black bile across entire departments.",
    abilities: [
      { name: 'Corpse Assimilation', type: 'Passive', desc: 'Absorbs fallen fighters to grow larger and gain bonus attack coins.', coins: 'Passive', effect: 'Size & Power Up on Death' },
      { name: 'Acidic Vomit', type: 'Black', desc: 'Spews decaying biological bile, corroding physical armor and mental sanity.', coins: '3 Coins', effect: 'Inflicts Acid & Black Damage' },
      { name: 'Crushing Roll', type: 'Blunt', desc: 'Rolls its colossal weight forward, trampling everything in its corridor.', coins: '2 Coins', effect: 'Stagger Burst' }
    ],
    kennethNote: "Gregor saw this thing and had to lie down on the bus floor for an hour. Don't let Mephistopheles run over this pile under ANY circumstances.",
    themeColors: {
      border: 'border-emerald-800',
      shadow: 'shadow-[0_0_40px_rgba(6,95,70,0.5)]',
      bg: 'from-[#051c14] via-[#020e0a] to-black',
      accent: 'text-emerald-400',
      badgeBg: 'bg-emerald-950',
      badgeBorder: 'border-emerald-800/70'
    },
    triggers: ['mountain of smiling bodies', 'smiling bodies', 'corpse mountain']
  },
  {
    id: 'one_sin',
    name: 'One Sin and Hundreds of Good Deeds',
    subtitle: 'Classification: O-03-03 • The Confessor\'s Skull',
    categoryBadge: 'ZAYIN ABNORMALITY',
    code: 'O-03-03',
    image: EASTER_EGG_IMAGES.one_sin,
    role: 'The Confessor',
    threat: 'Threat: ZAYIN (Sanctuary)',
    keywords: ['White Light', 'Confession', 'Absolution', 'Crown of Thorns', 'ZAYIN'],
    quote: 'It feeds on the evil within humanity, forgiving each confession with gentle, sorrowful light.',
    description: "The very first Abnormality managed by Lobotomy Corporation. A floating skull crowned with barbed thorns, bound to a wooden cross. Despite its macabre appearance, it is deeply gentle, feeding on the spoken confessions of human sin and purifying darkness with soothing white light.",
    abilities: [
      { name: 'Confession of Sins', type: 'White', desc: 'Listens to the burdened soul, restoring mental clarity and dispelling panic.', coins: 'Passive', effect: 'Restores 25 SP' },
      { name: 'Gentle Absolution', type: 'Heal', desc: 'Bathes the squad in calming light that heals psychological wounds.', coins: '2 Coins', effect: 'Heals SP & Cleanse Sinking' },
      { name: 'Crown of Thorns', type: 'Defense', desc: 'Wards off malevolent pale influence, protecting allies from WhiteNight.', coins: 'Passive', effect: 'Pale Resistance Up' }
    ],
    kennethNote: "The only Abnormality in the entire company directory that doesn't make me want to resign on the spot. I confess to One Sin every Friday that I secretly eat Charon's candy.",
    themeColors: {
      border: 'border-amber-300',
      shadow: 'shadow-[0_0_35px_rgba(252,211,77,0.4)]',
      bg: 'from-[#1c1808] via-[#0f0d04] to-black',
      accent: 'text-amber-200',
      badgeBg: 'bg-amber-950',
      badgeBorder: 'border-amber-600/50'
    },
    triggers: ['one sin', 'one sin and hundreds of good deeds', 'skull', 'zayin']
  },
  {
    id: 'censored',
    name: '[CENSORED] — ALEPH Abnormality',
    subtitle: 'Classification: O-03-89 • Cognition Smokescreen',
    categoryBadge: 'ALEPH ABNORMALITY',
    code: 'O-03-89',
    image: EASTER_EGG_IMAGES.censored,
    role: 'Cognition Hazard',
    threat: 'Threat: ALEPH (Unspeakable)',
    keywords: ['Censored', 'Cognition Hazard', 'Black Damage', 'Panic Induction', 'ALEPH'],
    quote: 'Its true form cannot be perceived by the human mind without immediate, irreversible ego dissolution.',
    description: "An Abnormality so profoundly grotesque and psychologically hazardous that Lobotomy Corporation's cognitive filters must actively replace its visual feed with pixelated censor bars. Merely witnessing it causes instant psychological breakdown, spawning smaller censored offspring from the bodies of those who collapse before it.",
    abilities: [
      { name: 'Cognitive Shatter', type: 'Black', desc: 'Forces target to perceive unshielded reality, inflicting devastating SP damage.', coins: '3 Coins', effect: 'Target SP -30' },
      { name: 'Censored Offspring', type: 'Spawn', desc: 'Birthes miniature pixelated horrors from fallen combatants.', coins: 'Passive', effect: 'Spawns Swarm on Kill' },
      { name: 'Mind-Numbing Glitch', type: 'Special', desc: 'Scrambles the battlefield with black-box pixelation bars.', coins: '2 Coins', effect: 'Inflicts Blindness & Bind' }
    ],
    kennethNote: "I tried looking at the raw diagnostic telemetry of this file once. I had to stare at a photo of a toaster for three days just to remember my own name. Keep the censor bars on.",
    themeColors: {
      border: 'border-gray-500',
      shadow: 'shadow-[0_0_40px_rgba(107,114,128,0.5)]',
      bg: 'from-[#141416] via-[#08080a] to-black',
      accent: 'text-gray-300',
      badgeBg: 'bg-black',
      badgeBorder: 'border-gray-600'
    },
    triggers: ['censored', '[censored]', 'cognition hazard']
  },
  {
    id: 'silent_orchestra',
    name: 'The Silent Orchestra — ALEPH Abnormality',
    subtitle: 'Classification: T-01-31 • Da Capo Maestro',
    categoryBadge: 'ALEPH ABNORMALITY',
    code: 'T-01-31',
    image: EASTER_EGG_IMAGES.silent_orchestra,
    role: 'The Conductor',
    threat: 'Threat: ALEPH (Theatrical)',
    keywords: ['Da Capo', '4 Movements', 'White Damage', 'Energy Erasure', 'ALEPH'],
    quote: 'The conductor raises the baton. From silence comes madness, and all energy returns to null.',
    description: "A theatrical Abnormality appearing as an orchestra conductor in an elegant tuxedo. When it breaches, it performs a 4-movement symphony. Each movement deals white damage to everyone who listens, culminating in a deafening final movement that drains all collected facility Enkephalin to zero.",
    abilities: [
      { name: 'First Movement', type: 'White', desc: 'A soft, melancholy allegro that chips away at mental stability.', coins: '2 Coins', effect: 'White Damage to All' },
      { name: 'Third Movement: Scherzo', type: 'White', desc: 'Frenzied tempo that drives listeners into erratic panic.', coins: '3 Coins', effect: 'Inflicts Panic / Frenzy' },
      { name: 'Fourth Movement: Da Capo', type: 'Ultimate', desc: 'The deafening climax. Drains all current energy and resets the battle.', coins: '1 Heavy Coin', effect: 'Drains All Enkephalin' }
    ],
    kennethNote: "Every time this thing played its 4th movement in the old facility, our electric bill went into the red and my spreadsheet deleted itself. Please do not give it a baton.",
    themeColors: {
      border: 'border-slate-300',
      shadow: 'shadow-[0_0_40px_rgba(203,213,225,0.4)]',
      bg: 'from-[#15171c] via-[#0b0c0f] to-black',
      accent: 'text-slate-200',
      badgeBg: 'bg-slate-900',
      badgeBorder: 'border-slate-600'
    },
    triggers: ['silent orchestra', 'the silent orchestra', 'da capo', 'conductor']
  },
  {
    id: 'blue_star',
    name: 'Blue Star — ALEPH Abnormality',
    subtitle: 'Classification: O-03-93 • Gravitational Singularity',
    categoryBadge: 'ALEPH ABNORMALITY',
    code: 'O-03-93',
    image: EASTER_EGG_IMAGES.blue_star,
    role: 'Singularity Star',
    threat: 'Threat: ALEPH (Vacuum)',
    keywords: ['White Damage', 'Sound of a Star', 'Gravitational Pull', 'Suction', 'ALEPH'],
    quote: 'Let us meet in the place where the light shines brightest... beyond the edge of despair.',
    description: "A colossal, cerulean star encircled by floating severed limbs and celestial debris. Emits a hypnotic humming known as 'Sound of a Star.' Low-mental-fortitude agents are magnetically drawn toward its core, willingly hurling themselves into the singularity where they vanish forever.",
    abilities: [
      { name: 'Gravitational Suction', type: 'Pull', desc: 'Pulls all low-SP combatants toward the core of the star.', coins: 'Passive', effect: 'Pulls Low SP Targets' },
      { name: 'Sound of a Star', type: 'White', desc: 'Harmonic celestial hum that vibrates through cognitive pathways.', coins: '3 Coins', effect: 'Massive White Damage' },
      { name: 'Celestial Absorption', type: 'Special', desc: 'Consumes souls entering the event horizon to gain infinite mass.', coins: '1 Coin', effect: 'Instant Death on 0 SP' }
    ],
    kennethNote: "A giant floating blue star that vacuums people into space dust. I asked Faust if we could use it to vacuum the bus carpet and she stared at me until I apologized.",
    themeColors: {
      border: 'border-sky-400',
      shadow: 'shadow-[0_0_45px_rgba(56,189,248,0.45)]',
      bg: 'from-[#081a2e] via-[#040d17] to-black',
      accent: 'text-sky-300',
      badgeBg: 'bg-sky-950',
      badgeBorder: 'border-sky-700/60'
    },
    triggers: ['blue star', 'sound of a star', 'celestial']
  },

  // ==========================================
  // 4. DIE OF DEATH KILLERS (ROBLOX)
  // ==========================================
  {
    id: 'badware',
    name: 'Badware — Die of Death Killer',
    subtitle: 'Malicious Script • 600 Points (600P)',
    categoryBadge: 'DIE OF DEATH KILLER',
    code: 'DOD-KILLER-BADWARE',
    image: EASTER_EGG_IMAGES.badware,
    role: 'Cybernetic Malware',
    threat: 'Threat: System Corruption',
    keywords: ['Glitch', 'Error Screen', 'Malware', 'Pierce', 'Die of Death'],
    quote: 'SYSTEM COMPROMISED. ACCESS GRANTED TO ALL HOSTILE SCRIPTS.',
    description: "A corrupted, glitch-ridden entity from the Roblox horror survival game 'Die of Death'. Emanating error popups and pixel artifacts, Badware glides across the map infecting systems, corrupting camera feeds, and ambushing survivors through wall glitches.",
    abilities: [
      { name: 'Buffer Overflow', type: 'Pierce', desc: 'Overloads target cognitive registers with raw junk packets.', coins: '3 Coins', effect: 'Inflicts Glitch & Paralyze' },
      { name: 'Malware Transmission', type: 'Status', desc: 'Infects nearby survivors, revealing their exact locations through walls.', coins: 'Passive', effect: 'Wallhack on Infected' },
      { name: 'Fatal Exception Error', type: 'Special', desc: 'Forces client crash on contact, dealing critical strike damage.', coins: '1 Heavy Coin', effect: 'Critical Pierce Strike' }
    ],
    kennethNote: "Great. Now the terminal is downloading Roblox malware. Next thing I know, our Enkephalin balances will be converted into Robux.",
    themeColors: {
      border: 'border-cyan-400',
      shadow: 'shadow-[0_0_35px_rgba(34,211,238,0.4)]',
      bg: 'from-[#051c24] via-[#020e14] to-black',
      accent: 'text-cyan-300',
      badgeBg: 'bg-cyan-950',
      badgeBorder: 'border-cyan-700/60'
    },
    triggers: ['badware', 'bad ware', 'die of death badware']
  },
  {
    id: 'killdroid',
    name: 'Killdroid — Die of Death Killer',
    subtitle: 'Military Automaton • 400 Points (400P)',
    categoryBadge: 'DIE OF DEATH KILLER',
    code: 'DOD-KILLER-KILLDROID',
    image: EASTER_EGG_IMAGES.killdroid,
    role: 'Heavy Automaton',
    threat: 'Threat: Relentless Pursuit',
    keywords: ['Steel Crush', 'Rocket Boost', 'Target Lock', 'Die of Death'],
    quote: 'TARGET ACQUIRED. INITIATING PROTOCOL: TERMINATE SURVIVOR.',
    description: "An armored, ruthless hunter-killer robot designed for relentless pursuit. With heavy metal footsteps and rocket thrusters, Killdroid barrels through doors and obstacles, never tiring and never giving up chase.",
    abilities: [
      { name: 'Rocket Thruster Dash', type: 'Rush', desc: 'Accelerates across open ground to close distance in an instant.', coins: '2 Coins', effect: 'Speed +5' },
      { name: 'Hydraulic Piston Smash', type: 'Blunt', desc: 'Brings down dual steel pistons to pulverize barricades and survivors.', coins: '3 Coins', effect: 'Heavy Stagger Damage' },
      { name: 'Infrared Scanner', type: 'Passive', desc: 'Tracks survivor footsteps even through dense fog and smoke.', coins: 'Passive', effect: 'Immune to Blindness' }
    ],
    kennethNote: "A military killbot from another dimension. At least it doesn't leave coffee rings on my desk like Heathcliff does.",
    themeColors: {
      border: 'border-red-500',
      shadow: 'shadow-[0_0_35px_rgba(239,68,68,0.4)]',
      bg: 'from-[#210606] via-[#120303] to-black',
      accent: 'text-red-400',
      badgeBg: 'bg-red-950',
      badgeBorder: 'border-red-700/60'
    },
    triggers: ['killdroid', 'kill droid', 'die of death killdroid']
  },
  {
    id: 'pursuer',
    name: 'Pursuer — Die of Death Killer',
    subtitle: 'Shadow Stalker • 450 Points (450P)',
    categoryBadge: 'DIE OF DEATH KILLER',
    code: 'DOD-KILLER-PURSUER',
    image: EASTER_EGG_IMAGES.pursuer,
    role: 'Stalker',
    threat: 'Threat: Silent Hunter',
    keywords: ['Shadow Stride', 'Stalker', 'Claw Slash', 'Die of Death'],
    quote: 'You can run, but your stamina is finite. I do not get tired.',
    description: "A terrifying shadow stalker in Die of Death that operates in absolute silence. Unlike other killers who alert survivors with loud audio cues, Pursuer closes distance in darkness, striking from behind with zero warning.",
    abilities: [
      { name: 'Silent Stride', type: 'Stealth', desc: 'Silences all footsteps and heartbeat music during approach.', coins: 'Passive', effect: 'Stealth Approach' },
      { name: 'Pounce Ambush', type: 'Slash', desc: 'Leaps from shadows to pin fleeing prey to the floor.', coins: '3 Coins', effect: 'Inflicts Immobilize' },
      { name: 'Shadow Claw', type: 'Slash', desc: 'Deep lacerating strike aimed at vital tendons.', coins: '2 Coins', effect: 'Inflicts Bleed' }
    ],
    kennethNote: "A killer with zero audio cues. That is literally my worst nightmare. If you don't hear footsteps, how are you supposed to know when to dive under your desk?!",
    themeColors: {
      border: 'border-zinc-500',
      shadow: 'shadow-[0_0_35px_rgba(113,113,122,0.4)]',
      bg: 'from-[#141417] via-[#0a0a0c] to-black',
      accent: 'text-zinc-300',
      badgeBg: 'bg-zinc-900',
      badgeBorder: 'border-zinc-700/60'
    },
    triggers: ['pursuer', 'the pursuer', 'die of death pursuer']
  },
  {
    id: 'harken',
    name: 'Harken — Die of Death Killer',
    subtitle: 'Chain Grappler • 550 Points (550P)',
    categoryBadge: 'DIE OF DEATH KILLER',
    code: 'DOD-KILLER-HARKEN',
    image: EASTER_EGG_IMAGES.harken,
    role: 'Brute Grappler',
    threat: 'Threat: Hook Pull',
    keywords: ['Iron Chain', 'Meat Hook', 'Heavy Strike', 'Die of Death'],
    quote: 'Hear the chains rattle across the tile? That\'s your cue to pray.',
    description: "A hulking brute armed with rusted chains and a heavy industrial hook. Harken snatches distant survivors with precision hook throws, dragging them kicking and screaming back to his blade.",
    abilities: [
      { name: 'Chain Harpoon', type: 'Pierce', desc: 'Hurls an iron chain to hook distant targets and drag them to melee range.', coins: '2 Coins', effect: 'Pull Target Forward' },
      { name: 'Rusted Cleaver', type: 'Slash', desc: 'Brutal downward cleave on staggered or hooked survivors.', coins: '3 Coins', effect: 'Damage +40% on Hooked' },
      { name: 'Iron Shackle', type: 'Status', desc: 'Binds victim’s ankles with heavy iron links to prevent sprinting.', coins: 'Passive', effect: 'Inflicts Heavy Bind' }
    ],
    kennethNote: "Chain hooks. Why is it always meat hooks? Can someone please requisition some normal door locks for this office?",
    themeColors: {
      border: 'border-yellow-700',
      shadow: 'shadow-[0_0_35px_rgba(161,98,7,0.4)]',
      bg: 'from-[#1f1604] via-[#120d02] to-black',
      accent: 'text-yellow-600',
      badgeBg: 'bg-yellow-950',
      badgeBorder: 'border-yellow-800/60'
    },
    triggers: ['harken', 'die of death harken']
  },
  {
    id: 'pretence',
    name: 'Pretence — Die of Death Killer',
    subtitle: 'False Civilian • 650 Points (650P)',
    categoryBadge: 'DIE OF DEATH KILLER',
    code: 'DOD-KILLER-PRETENCE',
    image: EASTER_EGG_IMAGES.pretence,
    role: 'Deceiver Mimic',
    threat: 'Threat: False Ally',
    keywords: ['Disguise', 'False Civilian', 'Ambush', 'Die of Death'],
    quote: 'I looked just like your teammate, didn\'t I? A shame you hesitated.',
    description: "The insidious deceiver of Die of Death. Pretence takes on the exact appearance, nametag, and animations of an innocent civilian survivor, mingling among teams until the moment of betrayal.",
    abilities: [
      { name: 'Civilian Disguise', type: 'Stealth', desc: 'Appears identical to a friendly survivor on teammates\' screens.', coins: 'Passive', effect: 'Friendly Nametag' },
      { name: 'Backstab Betrayal', type: 'Pierce', desc: 'Stabs victim in the back while in disguise for massive lethal damage.', coins: '3 Heavy Coins', effect: 'Instant Critical on Back' },
      { name: 'Feigned Panic', type: 'Deceit', desc: 'Fakes running from an imaginary killer to lure helpers into secluded rooms.', coins: 'Special', effect: 'Lures Survivors' }
    ],
    kennethNote: "A killer disguised as an employee. If any 'new records assistant' walks in here claiming to be my intern, I'm verifying their employee badge with biometric DNA.",
    themeColors: {
      border: 'border-teal-500',
      shadow: 'shadow-[0_0_35px_rgba(20,184,166,0.4)]',
      bg: 'from-[#041a17] via-[#020e0c] to-black',
      accent: 'text-teal-400',
      badgeBg: 'bg-teal-950',
      badgeBorder: 'border-teal-700/60'
    },
    triggers: ['pretence', 'pretense', 'die of death pretence']
  },
  {
    id: 'paranoy',
    name: 'Paranoy — Die of Death Killer',
    subtitle: 'Psychological Frenzy • 700 Points (700P)',
    categoryBadge: 'DIE OF DEATH KILLER',
    code: 'DOD-KILLER-PARANOY',
    image: EASTER_EGG_IMAGES.paranoy,
    role: 'Hysteria Inflictor',
    threat: 'Threat: Mind Hallucination',
    keywords: ['Hallucination', 'Paranoia', 'Sanity Drain', 'Die of Death'],
    quote: 'Is that sound behind you real, or is your head playing tricks on you again?',
    description: "An eldritch nightmare that attacks the survivor's mind. Paranoy causes fake footsteps, false chase music, and visual phantom copies to plague survivors until they can no longer tell reality from hallucination.",
    abilities: [
      { name: 'Phantom Echoes', type: 'Hysteria', desc: 'Plays false killer chase music to disorient survivors and trigger panic.', coins: 'Passive', effect: 'Disorients Radar' },
      { name: 'Hallucinatory Clones', type: 'Deceit', desc: 'Spawns decoy shadows that run at players to trigger false evasions.', coins: '2 Coins', effect: 'Spawns False Clones' },
      { name: 'Hysteria Bite', type: 'Pierce', desc: 'Lethal strike against targets suffering from maximum paranoia.', coins: '3 Coins', effect: 'Damage +50% on Panicked' }
    ],
    kennethNote: "False audio cues and hallucinations? That's not a killer, that's just a normal Tuesday working the night shift in Records.",
    themeColors: {
      border: 'border-indigo-500',
      shadow: 'shadow-[0_0_35px_rgba(99,102,241,0.4)]',
      bg: 'from-[#0b0c24] via-[#060714] to-black',
      accent: 'text-indigo-400',
      badgeBg: 'bg-indigo-950',
      badgeBorder: 'border-indigo-700/60'
    },
    triggers: ['paranoy', 'paranoia', 'die of death paranoy']
  }
];

export default SPECIAL_EASTER_EGGS;
