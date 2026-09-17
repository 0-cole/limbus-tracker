// Tactical Intelligence & Combat Overview Engine for Limbus Company Identities
// Translates complex legalistic skill descriptions into digestible, actionable tactical dossiers for ALL 187 Identities.

export const KEYWORDS = ['Burn', 'Bleed', 'Tremor', 'Rupture', 'Sinking', 'Poise', 'Charge'];

export const KEYWORD_THEMES = {
  Burn: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '🔥', desc: 'End-of-turn fixed Wrath/Pride damage. Scales with potency and burns down durable targets.' },
  Bleed: { color: '#dc2626', bg: 'bg-red-600/10', border: 'border-red-600/30', text: 'text-red-500', icon: '🩸', desc: 'Damages enemies whenever they toss combat coins. Critical against multi-coin boss skills.' },
  Tremor: { color: '#eab308', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: '🔔', desc: 'Raises enemy Stagger Threshold. Tremor-Burst triggers immediate stagger acceleration.' },
  Rupture: { color: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: '🌿', desc: 'Deals direct true Gluttony damage on every hit. Requires positive Count to sustain.' },
  Sinking: { color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: '💧', desc: 'Drains SP from humans (forcing panic) or deals direct Gloom HP damage to Abnormalities.' },
  Poise: { color: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: '💨', desc: 'Boosts critical hit chance (Potency) and duration (Count) for +20% to +100% damage spikes.' },
  Charge: { color: '#a855f7', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: '⚡', desc: 'Internal energy battery. Accumulated to unleash devastating multi-coin S3 finishers.' },
};

export const SIN_COLORS = {
  Wrath: '#dc2626',
  Lust: '#ea580c',
  Sloth: '#ca8a04',
  Gluttony: '#16a34a',
  Gloom: '#0ea5e9',
  Pride: '#4f46e5',
  Envy: '#9333ea',
};

// Comprehensive dictionary of special mechanics across all Limbus Company factions
export const MECHANICS_DICTIONARY = [
  {
    key: 'pulsation',
    title: 'Pulsation & Pulsation Count',
    badge: 'Rouge Battery',
    trigger: 'Consuming HP through skills or landing hits at 80%+ HP',
    explanation: 'Blood-charge currency used by Haute Couture units. Spent to activate coin power buffs, inflict Bleed Count, and unlock the Changing Room state.'
  },
  {
    key: 'changing room',
    title: 'Changing Room (State)',
    badge: 'Survival Cocoon',
    trigger: 'Activating Counter at <=10% HP, or upon taking lethal damage',
    explanation: 'Nullifies lethal damage, grants a 100% max HP shield, and provides a 100% full heal skill next turn before exiting into Full Makeover.'
  },
  {
    key: 'full makeover',
    title: 'Full Makeover',
    badge: 'Empowered State',
    trigger: 'Exiting Changing Room state after duration expires',
    explanation: 'Permanent combat state granting lifesteal on hit (+8% to +10% HP heal), bonus clash power, and removes self-damage penalties.'
  },
  {
    key: 'grace of the prescript',
    title: 'Grace of the Prescript',
    badge: 'Prescript Engine',
    trigger: 'Hitting the designated prescript target with Skill 1/2',
    explanation: 'Executing prescripts on designated enemies heals SP and grants Grace. At 3/6/9 Grace, unlocks higher combat stages, converts coins into Unbreakable Coins, and protects against Karmic Consequence.'
  },
  {
    key: 'the prescript',
    title: 'The Prescript\'s Target',
    badge: 'Target Designation',
    trigger: 'Assigned randomly to an enemy at combat start each turn',
    explanation: 'Designates which enemy part to attack. Striking this target with marked skills fulfills the Prescript, healing Sanity and building Grace.'
  },
  {
    key: 'furioso',
    title: 'Furioso-Replica (9-Coin Finisher)',
    badge: 'Apocalyptic Burst',
    trigger: 'Reaching 9 stacks of Procuration -Hermes-',
    explanation: 'Transforms Skill 3 into a devastating 9-coin execution skill with +90% Critical Damage, erasing enemy health bars.'
  },
  {
    key: 'pointillism',
    title: 'Pointillism & Debuff Roulette',
    badge: 'Multi-Status Burst',
    trigger: 'Attacking targets with negative status effects',
    explanation: 'Inflicts random ailments (Bleed, Tremor, Burn, Sinking, Rupture). When the target has 3+ distinct negative status types, reuses coins for massive burst damage.'
  },
  {
    key: 'dullahan',
    title: 'Dullahan Spectral Steed',
    badge: 'Mount State',
    trigger: 'Skill 3 or counter activation',
    explanation: 'Mounting Dullahan boosts Speed, Clash Power, and turns standard skills into sweeping multi-target cleaves with Gloom damage.'
  },
  {
    key: 'coffin',
    title: 'Coffin Stacks',
    badge: 'Soul Stockpile',
    trigger: 'Winning clashes and defeating enemies',
    explanation: 'Stockpiles souls in his coffin. Skill 3 expends Coffin to deal massive Gloom damage scaling with target Sinking.'
  },
  {
    key: 'swordplay of the homeland',
    title: 'Swordplay of the Homeland',
    badge: 'Team Slash Aura',
    trigger: 'Combat start / having Poise on self',
    explanation: 'Buffs all Blade Lineage allies with Poise Potency/Count and Slash Power Up on Critical Hits, turning the squad into critical strike monsters.'
  },
  {
    key: 'to claim their bones',
    title: 'Yield My Flesh ➔ To Claim Their Bones',
    badge: 'Clash Lose Counter',
    trigger: 'Deliberately losing a clash with Skill 3',
    explanation: 'Skill 3 has 20 Base Power and cannot be staggered. Intentionally losing a clash unleashes "To Claim Their Bones"—an unstoppable 4-coin retaliatory nuke.'
  },
  {
    key: 'courier trunk',
    title: 'Courier Trunk & Velocity',
    badge: 'Distance Delivery',
    trigger: 'Accumulating speed and delivery distance each turn',
    explanation: 'Accumulates delivery distance from speed each turn. Empowers skills with positive Rupture Count, preserving Rupture stacks on the target.'
  },
  {
    key: 'time moratorium',
    title: 'Time Moratorium (T Corp)',
    badge: 'Delayed Damage Nuke',
    trigger: 'Applying Skill 3 on target',
    explanation: 'Pauses all damage dealt to the target during the turn, storing 100% of it in temporal stasis. At moratorium end, detonates all stored damage at once plus a huge bonus percentage!'
  },
  {
    key: 'tremor - decay',
    title: 'Tremor - Decay (T Corp)',
    badge: 'Defense Shredder',
    trigger: 'Converting Tremor into Decay via T Corp skills',
    explanation: 'Lowers target Defense Level by 1 for every 4 Tremor Potency, amplifying all incoming damage significantly.'
  },
  {
    key: 'tremor - reverb',
    title: 'Tremor - Reverb (Yurodivy)',
    badge: 'Sloth HP Nuker',
    trigger: 'Converting Tremor into Reverb via Yurodivy skills',
    explanation: 'Causes every Tremor-Burst to deal direct Sloth HP damage equal to the target\'s Tremor Potency, turning Tremor into a lethal direct-damage keyword!'
  },
  {
    key: 'dark flame',
    title: 'Dark Flame (Der Freischütz)',
    badge: 'True Fire Damage',
    trigger: 'Inflicted by Outis skills and passives',
    explanation: 'Deals Pride true damage equal to Dark Flame x Burn potency on the target at turn end, bypassing enemy defense levels completely.'
  },
  {
    key: 'magic bullet',
    title: 'Magic Bullet Munitions',
    badge: 'Firearms Sniper',
    trigger: 'Using skills to load bullets (1 to 7)',
    explanation: 'Bullets increase clash power and damage; at 7 Magic Bullets, fires a lethal shot that pierces all enemies (and allies if SP is negative)!'
  },
  {
    key: 'assist attack',
    title: 'Assist Attack Order',
    badge: 'Bonus Action',
    trigger: 'Captain Ishmael ordering allies with S2/S3',
    explanation: 'Commands the highest-damage ally to immediately strike the same target following her attack, doubling your team\'s offensive output.'
  },
  {
    key: 'morale boost',
    title: 'Morale Boost',
    badge: 'Captain Aura',
    trigger: 'Defeating enemies or landing critical hits',
    explanation: 'Inspires allies with offensive power and heals team SP upon defeating targets or landing critical hits.'
  },
  {
    key: 'butterfly',
    title: 'Living & Departed Butterflies',
    badge: 'Sinking / Poise Synergy',
    trigger: 'Alternating Skill 1 and Skill 2 shots',
    explanation: 'White shots build Poise and Sinking count; black shots spend butterflies on Skill 3 to deal explosive critical hit damage.'
  },
  {
    key: 'discard',
    title: 'Discard Mechanics (Dieci / Molar)',
    badge: 'Deck Cycling',
    trigger: 'Using skills that discard adjacent dashboard slots',
    explanation: 'Discards lower-tier skills from your dashboard to immediately draw high-tier skills, generate shields, and build Insight.'
  },
  {
    key: 'insight',
    title: 'Insight Level',
    badge: 'Knowledge Shield',
    trigger: 'Discarding skills via Dieci combat passives',
    explanation: 'Gained by discarding skills. Converts discarded skill rank into raw shield, Clash Power, and Sinking potency.'
  },
  {
    key: 'nails',
    title: 'Nails (N Corp Inquisitors)',
    badge: 'Bleed Catalyst',
    trigger: 'Hammering Nails into enemies with N Corp skills',
    explanation: 'Hammered into enemies. At turn end, converts each Nail into Bleed count and potency, accelerating catastrophic blood loss.'
  },
  {
    key: 'fanatic',
    title: 'Fanatic Zeal',
    badge: 'Offensive Buff',
    trigger: 'Facing enemies afflicted with Nails',
    explanation: 'Grants bonus Clash Power and damage against enemies afflicted with Nails.'
  },
  {
    key: 'gaze',
    title: 'Gaze (Vulnerability)',
    badge: 'Damage Amplifier',
    trigger: 'Inflicted by The One Who Grips Faust Skill 2',
    explanation: 'Causes the target to take +20% more Pierce and Blunt damage from all attacks for the remainder of the turn.'
  },
  {
    key: 'whistles',
    title: 'Whistles (SP Battery)',
    badge: 'Passive SP Heal',
    trigger: 'Combat turn end with 4+ Lust Absolute Resonance',
    explanation: 'Faust\'s core engine passive: heals 15 SP to the ally with the lowest Sanity, keeping Negative Sanity allies under control or reviving panicked allies.'
  },
  {
    key: 'bloodfeast',
    title: 'Bloodfeast (Bloodfiends)',
    badge: 'Vampiric Stockpile',
    trigger: 'Any unit on the field taking Bleed damage',
    explanation: 'Accumulated when any unit bleeds. Consumed to empower high-tier Bloodfiend skills, increase coin power, and heal HP.'
  },
  {
    key: 'bloodfiend thirst',
    title: 'Bloodfiend Thirst',
    badge: 'Feral State',
    trigger: 'Consuming accumulated Bloodfeast or low HP',
    explanation: 'Unleashes feral vampiric instincts: boosts coin power, restores HP on hit, and enhances bleed application.'
  },
  {
    key: 'ammo',
    title: 'Ammo Management (R Corp / Full-Stop / Thumb / LCCB)',
    badge: 'Limited Munitions',
    trigger: 'Using firearms that consume 1-4 bullets per skill',
    explanation: 'Enters battle with fixed bullets. Skills spend ammo for overwhelming coin power; once ammo is exhausted, attacks deal minimal damage.'
  },
  {
    key: 'overcharge',
    title: 'Overcharge / Self-Paralyze',
    badge: 'High Risk / Reward',
    trigger: 'Activating heavy charge batteries without count conservation',
    explanation: 'Generates massive Charge count instantly, but inflicts Paralyze or fragile on self next turn if not carefully managed.'
  },
  {
    key: 'tremor-burst',
    title: 'Tremor-Burst & Stagger Shift',
    badge: 'Stagger Shifter',
    trigger: 'Triggering burst effects on targets with Tremor',
    explanation: 'Immediately raises the enemy Stagger Threshold by their current Tremor Potency, pushing targets into immediate Stagger.'
  },
  {
    key: 'sinking deluge',
    title: 'Sinking Deluge',
    badge: 'Catastrophic Nuke',
    trigger: 'Spicebush Yi Sang Skill 3 hit',
    explanation: 'Multiplies target\'s Sinking Potency by Sinking Count and detonates it all instantly as pure Gloom damage, dealing up to 1,000+ burst!'
  },
  {
    key: 'volatile wax',
    title: 'E.G.O Manifestation: Volatile Wax',
    badge: 'Transformation',
    trigger: 'Reaching 40+ Sanity (SP)',
    explanation: 'Transforms Sinclair into his E.G.O state, turning his skills into 4-coin flaming cleaves with overwhelming clash power.'
  },
  {
    key: 'unbreakable',
    title: 'Unbreakable Coins',
    badge: 'Coin Invariant',
    trigger: 'Empowered high-tier stance or 9 Grace',
    explanation: 'Coins that never break upon losing clashes, guaranteeing the subsequent coins still hit the target.'
  },
  {
    key: 'k corp ampule',
    title: 'K Corp Ampules & Overdose Hazard',
    badge: 'Regen & Lethal Risk',
    trigger: 'Gained upon being hit or using K Corp skills',
    explanation: 'Heals 10% max HP at turn start and grants full-HP revives on fatal damage. BUT at 5 stacks, triggers fatal Ampule Overdose and INSTANTLY DIES!'
  },
  {
    key: 'crisis',
    title: 'Crisis State (Shi Association)',
    badge: 'Crisis Power Boost',
    trigger: 'Dropping to or below 50% max HP',
    explanation: 'Unlocks the true power of Shi Association fixers: doubles coin power, unlocks additional coins, and grants guaranteed critical strikes!'
  },
  {
    key: 'declared duel',
    title: 'Declared Duelist (Cinq Association)',
    badge: '1v1 Lockout',
    trigger: 'Landing designated dueling skills',
    explanation: 'Locks a single target into a 1v1 duel, granting massive Haste, clash power, and lowering the enemy\'s defense level.'
  }
];

// Curated high-complexity identities (normalized keys for exact matching)
export const CURATED_TACTICS = {
  // 1. Haute Couture Ishmael
  'Haute Couture::Boutique Du Rouge Ishmael': {
    archetype: 'Bleed & Self-HP Pulsation Tank / Rebirth Duelist',
    primaryKeywords: ['Bleed', 'Charge'],
    role: 'HP Consumption Tank & Changing Room Duelist',
    uniqueMechanics: [
      {
        title: 'Pulsation & HP Consumption',
        badge: 'Rouge Battery',
        trigger: 'Consuming HP through skills or landing hits at 80%+ HP',
        explanation: 'Haute Couture Ishmael expends HP to build Pulsation. High Pulsation empowers coin power, inflicts Bleed Count, and prevents her from staggering or dropping below 1 HP.'
      },
      {
        title: 'Changing Room (Ishmael)',
        badge: 'Cocoon State',
        trigger: 'Activating Defense counter at <=10% HP or taking lethal fatal damage',
        explanation: 'Nullifies lethal damage and gains an impenetrable Shield equal to 100% max HP. While in the changing room, uses a specialized guard skill that heals 100% HP and grants Power Up to teammates.'
      },
      {
        title: 'Full Makeover',
        badge: 'Empowered State',
        trigger: 'Exiting Changing Room state after duration expires',
        explanation: 'Re-emerges fully transformed with permanent lifesteal on hit (+8% to +10% HP heal) and free skill activations without HP loss penalties.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 and Skill 2 to build initial Pulsation count and stack Bleed on the enemy.',
      midGame: 'Spend HP on heavy clashes without fear—her passives prevent her from staggering from self-damage. At low HP, use her clashable counter defense skill.',
      finisher: 'Enter Changing Room to restore 100% HP, then exit into Full Makeover to cleave down remaining enemies with permanent lifesteal.'
    },
    teamSynergies: {
      keywords: ['Bleed', 'Charge', 'Lust Resonance'],
      bestPartners: ['Haute Couture::Le Noir Footwear Hall Ryōshū', 'The Ring Pointillist Student Yi Sang', 'The Pequod Captain Ishmael'],
      tip: 'Pairs excellently with other Rouge and Bleed identities that leverage Lust resonance and capitalize on high Bleed count.'
    }
  },

  // 2. The One Who Shall Grip Sinclair (N Sinclair)
  'The One Who Shall Grip Sinclair': {
    archetype: 'Negative Sanity Berserker / Minus Coin Executioner',
    primaryKeywords: ['Burn', 'Bleed'],
    role: 'Minus-Coin Boss Eraser',
    hazardAlert: {
      badge: 'Negative Sanity Invariant',
      message: 'CRITICAL: Sinclair gains maximum clash rolls (up to 30 on Skill 3!) when his coins roll TAILS at negative Sanity. DO NOT bring Sanity healers (like Faust Fluid Sac). Keep his SP between -15 and -35. If SP approaches -45, use his Guard skill immediately to prevent Turn-Start E.G.O Corrosion!'
    },
    uniqueMechanics: [
      {
        title: 'Minus Coin Scaling (Tails Roll King)',
        badge: 'Inverse Math',
        trigger: 'Tossing coins in clashes and attacks',
        explanation: 'His skills have enormous Base Power (30 on Skill 3, 16 on Skill 2), but NEGATIVE Coin Power (-12 on S3, -4 on S2). Rolling Heads lowers his power; rolling Tails preserves his catastrophic maximum clash!'
      },
      {
        title: 'Self-Sanity Depletion',
        badge: 'Berserk Fuel',
        trigger: 'Using Skill 2 and Skill 3',
        explanation: 'Each attack subtracts Sanity from Sinclair, naturally dropping him into the negative sweet spot where he dominates clashes.'
      },
      {
        title: 'E.G.O Corrosion Hazard (-45 SP)',
        badge: 'Corrosion Watch',
        trigger: 'Reaching -45 Sanity at turn end',
        explanation: 'If Sinclair reaches -45 SP, he automatically corrodes into a berserk E.G.O state at turn start, indiscriminately attacking allies with lethal force. Use Guard to cancel attacks when too low!'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 or Skill 2 to safely lose early Sanity and push his SP into the negative zone (-10 to -25).',
      midGame: 'Maintain his Sanity sweet spot (-15 to -35). His 4-coin Skill 2 rolls 16 max and deals devastating Blunt and Bleed damage.',
      finisher: 'Unleash "Self-Destructive Purge" (Skill 3) at negative SP. With 30 Base Power and 3 coins, rolling tails deals 300+ blunt damage and erases the boss!'
    },
    teamSynergies: {
      keywords: ['Burn', 'Bleed', 'Wrath / Lust Resonance'],
      bestPartners: ['The One Who Grips Faust', 'Liu Assoc. South Section 4 Director Rodion', 'Kurokumo Clan Captain Ishmael', 'Dawn Office Fixer Sinclair'],
      tip: 'Never pair with SP-healing passives. Pair with The One Who Grips Faust for Fanatic buffs without healing him above 0 SP.'
    }
  },

  // 3. The One Who Grips Faust (N Faust)
  'The One Who Grips Faust': {
    archetype: 'Nails & Fanatic Commander / SP Battery',
    primaryKeywords: ['Bleed'],
    role: 'Team SP Catalyst & Damage Amplifier',
    uniqueMechanics: [
      {
        title: 'Whistles (Team Sanity Engine)',
        badge: 'SP Battery',
        trigger: 'Combat turn end with 4+ Lust Absolute Resonance',
        explanation: 'Heals 15 SP to the ally with the lowest Sanity. Revitalizes allies who suffered sanity drain and ensures consistent heads rolls for standard Sinners.'
      },
      {
        title: 'Gaze (Vulnerability Debuff)',
        badge: 'Damage Amplifier',
        trigger: 'Hitting with Skill 2 (The Gripping)',
        explanation: 'Applies Gaze to the target: they take +20% more Pierce and Blunt damage from all subsequent attacks that turn!'
      },
      {
        title: 'Nails & Fanatic Catalyst',
        badge: 'Bleed Catalyst',
        trigger: 'Striking enemies with N Corp skills',
        explanation: 'Hammers Nails into enemies, converting into heavy Bleed at turn end while granting Fanatic (+Attack Power) to all N Corp teammates.'
      }
    ],
    combatRotation: {
      opener: 'Lead with Skill 1 to establish Lust resonance and start planting Nails on the primary enemy.',
      midGame: 'Direct Skill 2 (The Gripping) at the boss to apply Gaze, then let blunt and pierce teammates follow up with amplified damage.',
      finisher: 'Use Skill 3 (Execution) to finish off low-HP enemies. If it lands a kill, buffs all N Corp allies with Fanatic and Attack Power Up.'
    },
    teamSynergies: {
      keywords: ['Bleed', 'Lust Resonance'],
      bestPartners: ['The One Who Shall Grip Sinclair', 'N Corp. Großhammer Meursault', 'The Ring Pointillist Student Yi Sang', 'Kurokumo Clan Wakashu Ryōshū'],
      tip: 'The cornerstone of Lust resonance squads and N Corp Bleed teams.'
    }
  },

  // 4. R Corp. 4th Pack Reindeer Ishmael
  'R Corp. 4th Pack Reindeer Ishmael': {
    archetype: 'Charge Stacker & Nuclear Mind Whip Finisher',
    primaryKeywords: ['Charge', 'Sinking'],
    role: 'Blunt Stagger Nuker',
    hazardAlert: {
      badge: 'Indiscriminate Friendly Fire',
      message: 'CRITICAL TEAM-WIPE HAZARD: Skill 3 (Mind Whip) targets INDISCRIMINATELY if used with less than 10 Charge Count! She will randomly target and one-shot your own Sinners. Never fire Mind Whip before reaching 10 Charge.'
    },
    uniqueMechanics: [
      {
        title: 'Mind Whip 10-Charge Prerequisite',
        badge: 'Nuclear Finisher',
        trigger: 'Having 10+ Charge Count before using Skill 3',
        explanation: 'At 10+ Charge, consumes 10 Charge to target the chosen enemy with an unstoppable 4-coin Blunt barrage. Below 10 Charge, she fires indiscriminately into allies!'
      },
      {
        title: 'Charge Battery & Self-Sinking',
        badge: 'Battery Engine',
        trigger: 'Using Skill 1 and Skill 2',
        explanation: 'Skill 1 and Skill 2 generate high Charge count while expending a tiny amount of SP to build internal power.'
      }
    ],
    combatRotation: {
      opener: 'Cycle Skill 1 and Skill 2 exclusively to build Charge count to 10+. Avoid touching Skill 3.',
      midGame: 'Use Skill 2 to win difficult clashes and push Charge to 12+. Guard if bad skills threaten to force an early Mind Whip.',
      finisher: 'Once at 10+ Charge, fire Mind Whip (Skill 3) directly at the boss. The 4-coin blunt assault will instantly stagger or delete them.'
    },
    teamSynergies: {
      keywords: ['Charge', 'Blunt', 'Envy Resonance'],
      bestPartners: ['MultiCrack Office Rep Faust', 'W Corp. L3 Cleanup Agent Don Quixote', 'W Corp. L3 Cleanup Agent Ryōshū'],
      tip: 'Pair with Charge batteries like MultiCrack Faust to reach the 10-Charge threshold turns earlier.'
    }
  },

  // 5. R Corp. 4th Pack Rabbit Heathcliff
  'R Corp. 4th Pack Rabbit Heathcliff': {
    archetype: 'High-Speed Ammo Assassin & Fragile Inflictor',
    primaryKeywords: ['Bleed', 'Rupture'],
    role: 'Turn 1-3 Burst Assassin',
    hazardAlert: {
      badge: 'Limited Munitions (13 Ammo)',
      message: 'Enters combat with 13 Ammo. Each skill consumes bullets (Quick Suppression spends 4-5 bullets). Once Ammo reaches 0, his skills deal almost 0 damage and lose their coin effects. Win the fight fast!'
    },
    uniqueMechanics: [
      {
        title: 'Quick Suppression (4 Fragile)',
        badge: 'Burst Finisher',
        trigger: 'Firing Skill 3 with sufficient Ammo',
        explanation: 'Unleashes a rapid 5-coin burst that inflicts up to 4 Fragile on the target, causing that enemy to take +40% more damage from all teammate attacks that turn!'
      },
      {
        title: 'Extreme Speed Range (3-7)',
        badge: 'Priority Intercept',
        trigger: 'Turn start speed roll',
        explanation: 'Naturally fast speed ensures he acts first, applying Fragile and Rupture to the boss before your slower nukers attack.'
      },
      {
        title: 'Ammo Depletion Penalty',
        badge: 'Munitions Limit',
        trigger: 'Exhausting all 13 bullets',
        explanation: 'When ammo runs dry, his skills fail to trigger coin effects and deal negligible blunt damage.'
      }
    ],
    combatRotation: {
      opener: 'Use high speed on Turn 1 to win clashes with Skill 1 or Skill 2, establishing early damage.',
      midGame: 'Fire Quick Suppression (Skill 3) into the boss on Turn 2 or 3. Apply 4 Fragile, then let your team hammer that target for multiplied damage.',
      finisher: 'Use remaining bullets to clean up before turn 5.'
    },
    teamSynergies: {
      keywords: ['Bleed', 'Rupture', 'Envy Resonance'],
      bestPartners: ['The Pequod Captain Ishmael', 'W Corp. L3 Cleanup Agent Don Quixote', 'W Corp. L3 Cleanup Agent Ryōshū', 'Dieci Assoc. South Section 4 Rodion'],
      tip: 'His 4 Fragile turns any teammate into a nuclear weapon. Position him to act before your primary nukers in speed order.'
    }
  },

  // 6. W Corp. L3 Cleanup Agent Don Quixote
  'W Corp. L3 Cleanup Agent Don Quixote': {
    archetype: 'Charge Hypercarry & Dimensional Pierce Finisher',
    primaryKeywords: ['Charge', 'Rupture'],
    role: 'Single-Target Pierce Obliterator',
    hazardAlert: {
      badge: 'Rip Space Recoil',
      message: 'Skill 3 (Rip Space) requires 10 Charge Count! If used with less than 10 Charge, Don loses 20% of her max HP, loses massive coin power, and rolls poorly. Always bank 10 Charge before firing.'
    },
    uniqueMechanics: [
      {
        title: 'Rip Space (5-Coin Nuke)',
        badge: 'Dimensional Shred',
        trigger: 'Having 10+ Charge Count before using Skill 3',
        explanation: 'Consumes 10 Charge count to roll up to 31+ clash power and unleash 5 consecutive Pierce hits, dealing massive burst damage.'
      },
      {
        title: 'Telepole E.G.O Synergy',
        badge: 'Instant Battery',
        trigger: 'Activating Telepole E.G.O',
        explanation: 'Her Telepole E.G.O grants 10+ Charge count to herself and teammates in a single turn, instantly priming Rip Space for turn 2.'
      }
    ],
    combatRotation: {
      opener: 'Cycle Skill 1 and Skill 2 (or fire Telepole E.G.O) to build Charge count to 10+.',
      midGame: 'Hold Skill 3 until Charge count is >= 10. Win intermediate clashes with Skill 2 (Leap).',
      finisher: 'Unleash Rip Space at 10+ Charge into a staggered enemy to deal catastrophic 5-coin pierce damage.'
    },
    teamSynergies: {
      keywords: ['Charge', 'Pierce', 'Envy Resonance'],
      bestPartners: ['MultiCrack Office Rep Faust', 'W Corp. L3 Cleanup Agent Ryōshū', 'W Corp. L3 Cleanup Agent Yi Sang', 'R Corp. 4th Pack Reindeer Ishmael'],
      tip: 'Equip Don\'s Telepole E.G.O for instant turn-2 Rip Space activation.'
    }
  },

  // 7. K Corp. Class 3 Excision Staff Hong Lu
  'K Corp. Class 3 Excision Staff Hong Lu': {
    archetype: 'Immortal Regeneration Tank / Ampule Overdose Risk',
    primaryKeywords: ['Rupture'],
    role: 'Unkillable Frontline Anchor',
    hazardAlert: {
      badge: 'Ampule Overdose (Instant Death)',
      message: 'K Corp Ampules heal 10% HP each turn and provide revives, BUT reaching 5 Ampules triggers lethal Ampule Overdose and INSTANTLY KILLS Hong Lu! Track his stacks carefully.'
    },
    uniqueMechanics: [
      {
        title: 'K Corp Ampules & 3 Full-HP Revives',
        badge: 'Immortal Anchor',
        trigger: 'Taking lethal damage while holding Ampules',
        explanation: 'If reduced to 0 HP while holding Ampules, he revives immediately with 100% max HP (up to 3 times per combat encounter)!'
      },
      {
        title: 'Lethal Overdose (5 Stacks)',
        badge: 'Instant Death',
        trigger: 'Reaching 5 K Corp Ampules',
        explanation: 'At 5 Ampules, Hong Lu suffers catastrophic cell rupture and dies instantly without triggering revives.'
      },
      {
        title: 'Rupture Potency Support',
        badge: 'Rupture Stacker',
        trigger: 'Striking enemies with skills',
        explanation: 'Applies heavy Rupture potency with blunt attacks while drawing aggro away from squishy teammates.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 and Skill 2 to establish clash control and begin gaining 1-2 Ampules.',
      midGame: 'Direct all dangerous boss attacks into Hong Lu. His regeneration and revives will soak infinite damage while your DPS Sinners attack freely.',
      finisher: 'Use Skill 3 to burst down staggered targets. Make sure Ampule stacks stay below 5.'
    },
    teamSynergies: {
      keywords: ['Rupture', 'Gluttony Resonance'],
      bestPartners: ['Devyat\' Assoc. North Section 3 Rodion', 'Seven Assoc. South Section 4 Faust', 'W Corp. L3 Cleanup Agent Yi Sang'],
      tip: 'The ultimate tank for difficult Refraction Railway and boss stages.'
    }
  },

  // 8. Effloresced E.G.O::Spicebush Yi Sang
  'Effloresced E.G.O::Spicebush Yi Sang': {
    archetype: 'Sinking Deluge Detonator & AoE Pierce Striker',
    primaryKeywords: ['Sinking', 'Tremor'],
    role: 'Sinking Catastrophe Nuker',
    uniqueMechanics: [
      {
        title: 'Sinking Deluge (Gloom Detonation)',
        badge: 'Catastrophic Nuke',
        trigger: 'Landing Skill 3 (Fragrant Deluge) on an enemy with Sinking',
        explanation: 'Detonates the target\'s entire Sinking stack: deals (Sinking Potency × Sinking Count) as pure Gloom damage in one catastrophic hit! A target with 20 Potency and 10 Count instantly takes 200+ Gloom damage.'
      },
      {
        title: 'Multi-Target AoE S2',
        badge: 'Cleave Strike',
        trigger: 'Meeting Gloom resonance conditions',
        explanation: 'Skill 2 strikes multiple dashboard slots simultaneously, spreading Sinking across the entire enemy squad.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 and Skill 2 to apply Sinking Potency and build team Gloom resonance.',
      midGame: 'Have teammates (Wild Hunt Heathcliff, Dieci Rodion, Molar Ishmael) stack high Sinking Potency AND Count on the boss.',
      finisher: 'Fire Skill 3 to trigger Sinking Deluge, detonating the entire stack into an instantaneous 400–1000+ damage explosion!'
    },
    teamSynergies: {
      keywords: ['Sinking', 'Gloom Resonance'],
      bestPartners: ['Wild Hunt Heathcliff', 'Dieci Assoc. South Section 4 Rodion', 'Lobotomy E.G.O::Solemn Lament Yi Sang', 'Molar Boatworks Fixer Ishmael'],
      tip: 'Only fire S3 after the team has built up substantial Sinking count, because Deluge wipes all Sinking from the enemy upon detonation.'
    }
  },

  // 9. Lobotomy E.G.O::Magic Bullet Outis
  'Lobotomy E.G.O::Magic Bullet Outis': {
    archetype: 'Magic Bullet Sniper & Dark Flame Burn Specialist',
    primaryKeywords: ['Burn', 'Poise'],
    role: 'Dark Flame True Damage & Full-Screen Piercer',
    hazardAlert: {
      badge: '7th Bullet Friendly Fire',
      message: 'At 7 Magic Bullets, Skill 3 transforms into an apocalyptic piercing shot that targets all enemies. However, if her Sanity is negative, she fires indiscriminately through your own Sinners! Keep her SP positive.'
    },
    uniqueMechanics: [
      {
        title: 'Magic Bullet Stacks (1 to 7)',
        badge: 'Munitions Count',
        trigger: 'Using skills to load bullets',
        explanation: 'Skills load Magic Bullets. Each bullet grants +1 Coin Power and increases target count.'
      },
      {
        title: 'Dark Flame (True Pride Fire)',
        badge: 'True Damage',
        trigger: 'Inflicted by Outis skills and passives',
        explanation: 'At turn end, the enemy takes (Dark Flame × Burn Potency) as direct Pride true damage, bypassing enemy defense levels completely!'
      },
      {
        title: '7th Bullet Armageddon',
        badge: 'Screen Cleave',
        trigger: 'Firing Skill 3 with 7 loaded Magic Bullets',
        explanation: 'At 7 bullets, Skill 3 pierces up to 7 enemy slots simultaneously.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 and Skill 2 to load Magic Bullets and apply Burn and Dark Flame.',
      midGame: 'Keep SP high (+45) to ensure high heads rolls and prevent friendly-fire panic.',
      finisher: 'Discharge Skill 3 with 7 Magic Bullets to incinerate all enemy slots in a single glorious blast.'
    },
    teamSynergies: {
      keywords: ['Burn', 'Wrath / Pride Resonance'],
      bestPartners: ['Dawn Office Fixer Sinclair', 'Liu Assoc. South Section 4 Director Rodion', 'Liu Assoc. South Section 4 Ishmael'],
      tip: 'The undisputed queen of Burn teams. Her Dark Flame scales multiplicatively with teammate Burn stacks.'
    }
  },

  // 10. Dieci Assoc. South Section 4 Rodion
  'Dieci Assoc. South Section 4 Rodion': {
    archetype: 'Discard Knowledge Monk & Sinking Fortress',
    primaryKeywords: ['Sinking'],
    role: 'Shield Generation & High-Power Clash Tank',
    uniqueMechanics: [
      {
        title: 'Discard Engine & Hand Cycling',
        badge: 'Deck Cycling',
        trigger: 'Using skills that discard adjacent dashboard slots',
        explanation: 'Discards lower-tier skills from the dashboard, cycling cards rapidly and generating massive Knowledge Shields based on discarded skill rank.'
      },
      {
        title: 'Insight Level (1 to 3)',
        badge: 'Knowledge Shield',
        trigger: 'Discarding skills via passives',
        explanation: 'Gained by discarding skills. Converts discarded skill rank into raw shield, Clash Power, and Sinking potency.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 or Skill 2 to discard adjacent Skill 1s, building Insight and generating free shields.',
      midGame: 'With Insight at level 2-3, win every clash cleanly with boosted coin power while soaking enemy hits with your thick shield.',
      finisher: 'Discard into Skill 3 (Rime Shank synergy) to inflict heavy Sinking and crush staggered enemies with Blunt force.'
    },
    teamSynergies: {
      keywords: ['Sinking', 'Gloom Resonance'],
      bestPartners: ['Effloresced E.G.O::Spicebush Yi Sang', 'Wild Hunt Heathcliff', 'Dieci Assoc. South Section 4 Hong Lu', 'Dieci Assoc. South Section 4 Director Meursault'],
      tip: 'Equip her with Rime Shank E.G.O (Gloom/Sinking) to turn her into the most devastating Sinking enabler in the game.'
    }
  },

  // 11. T Corp. Class 3 Collection Staff Don Quixote
  'T Corp. Class 3 Collection Staff Don Quixote': {
    archetype: 'Time Moratorium Damage Stasis & Tremor Buffer',
    primaryKeywords: ['Tremor'],
    role: 'Burst Damage Multiplier',
    uniqueMechanics: [
      {
        title: 'Time Moratorium (Damage Detonation)',
        badge: 'Delayed Nuke',
        trigger: 'Applying Skill 3 on target',
        explanation: 'Inflicts Time Moratorium on an enemy. While active, 100% of damage dealt to that enemy is frozen in temporal stasis. When Moratorium expires, detonates all stored damage at once plus a +30% to +50% bonus multiplier!'
      },
      {
        title: 'Tremor - Decay (Defense Shredder)',
        badge: 'Defense Down',
        trigger: 'Converting Tremor into Decay via T Corp skills',
        explanation: 'Lowers target Defense Level by 1 for every 4 Tremor Potency, amplifying all incoming damage significantly.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 and Skill 2 to build Tremor and convert it to Tremor - Decay.',
      midGame: 'Coordinate with your highest-damage teammates before applying Time Moratorium.',
      finisher: 'Apply Time Moratorium with Skill 3. Have all 6 Sinners pour their highest-damaging attacks into that target during the moratorium turn, then watch the delayed damage detonate for catastrophic boss wipes!'
    },
    teamSynergies: {
      keywords: ['Tremor', 'Sloth Resonance'],
      bestPartners: ['Öufi Assoc. South Section 3 Heathcliff', 'District 20 Yurodivy Hong Lu', 'T Corp. Class 3 VDCU Staff Outis'],
      tip: 'Time Moratorium allows you to bypass boss HP threshold phases by storing overkill damage in stasis.'
    }
  },

  // 12. The Manager of La Manchaland Don Quixote
  'The Manager of La Manchaland Don Quixote': {
    archetype: 'Bloodfiend Monarch & Bloodfeast Devourer',
    primaryKeywords: ['Bleed'],
    role: 'Bleed Resonance Hypercarry',
    uniqueMechanics: [
      {
        title: 'Bloodfeast Stockpile',
        badge: 'Vampiric Pool',
        trigger: 'Whenever any ally or enemy takes Bleed damage',
        explanation: 'Bleed damage fuels a shared Bloodfeast reservoir. Spent to empower high-tier Bloodfiend skills, enhance coin power, and grant lifesteal.'
      },
      {
        title: 'Bloodfiend Thirst & HP Conversion',
        badge: 'Feral Empower',
        trigger: 'Consuming accumulated Bloodfeast or low HP',
        explanation: 'Consumes HP or Bloodfeast to enter an empowered bloodthirsty state, unlocking devastating multi-coin execution skills.'
      }
    ],
    combatRotation: {
      opener: 'Stack Bleed on enemies using S1 and team Bleed skills to rapidly fill the Bloodfeast pool.',
      midGame: 'Consume Bloodfeast to empower Skill 2 and heal back any spent HP through vampiric lifesteal.',
      finisher: 'Unleash empowered Skill 3 to drain enemy health and trigger catastrophic Bleed bursts.'
    },
    teamSynergies: {
      keywords: ['Bleed', 'Lust Resonance'],
      bestPartners: ['The Barber of La Manchaland Outis', 'The Priest of La Manchaland Gregor', 'The Princess of La Manchaland Rodion', 'The Ring Pointillist Student Yi Sang'],
      tip: 'The linchpin of Bloodfiend squads. Always ensure multiple bleeding enemies are on field to feed her Bloodfeast.'
    }
  },

  // 13. District 20 Yurodivy Hong Lu
  'District 20 Yurodivy Hong Lu': {
    archetype: 'Tremor - Reverb Sloth Conversion Striker',
    primaryKeywords: ['Tremor'],
    role: 'Tremor Direct Damage Nuker',
    uniqueMechanics: [
      {
        title: 'Tremor - Reverb (Direct Sloth Damage)',
        badge: 'Tremor Reverb',
        trigger: 'Converting Tremor into Reverb via Yurodivy skills',
        explanation: 'Causes every Tremor-Burst to deal direct Sloth HP damage equal to the target\'s Tremor Potency, turning Tremor into a lethal direct-damage keyword!'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 to apply Tremor Potency and build Sloth resonance.',
      midGame: 'Use Skill 2 to convert enemy Tremor into Tremor - Reverb.',
      finisher: 'Trigger Tremor-Bursts with Skill 3 and teammate skills to turn every burst into hundreds of direct Sloth damage.'
    },
    teamSynergies: {
      keywords: ['Tremor', 'Sloth Resonance'],
      bestPartners: ['T Corp. Class 3 Collection Staff Don Quixote', 'Öufi Assoc. South Section 3 Heathcliff', 'Molar Boatworks Fixer Ishmael'],
      tip: 'Transforms Tremor teams from pure stagger stall into high-velocity kill squads.'
    }
  },

  // 14. The House of Spiders: The Index Nursefather Yi Sang
  'The House of Spiders: The Index Nursefather Yi Sang': {
    archetype: 'Prescript Duelist & 9-Coin Finisher',
    primaryKeywords: ['Poise', 'Sinking'],
    role: 'Scaling Boss Duelist / Stagger Wall',
    uniqueMechanics: [
      {
        title: 'Grace of the Prescript & The Prescript Target',
        badge: 'Core Engine',
        trigger: 'Assigned randomly to an enemy at combat start each turn',
        explanation: 'Every turn, a random enemy receives "The Prescript\'s Target". Using a prescript-marked skill on that exact target executes the prescript, healing 8 SP and granting 3 Grace of the Prescript (at 3/6/9 Grace, Yi Sang unlocks higher power stages).'
      },
      {
        title: 'Unlock Stages & Unbreakable Coins',
        badge: 'Scaling',
        trigger: 'Accumulating 3, 6, and 9 Grace',
        explanation: 'At Unlock I, II, and III, your skills turn regular coins into Unbreakable Coins (they cannot break in clashes and always deal damage), while permanently nullifying Karmic Consequence penalties.'
      },
      {
        title: 'Furioso-Replica (9-Coin Finisher)',
        badge: 'Win Condition',
        trigger: 'Reaching 9 stacks of Procuration -Hermes-',
        explanation: 'Using prescript skills builds Procuration -Hermes- stacks. Upon reaching 9 stacks, his Skill 3 transforms into the devastating 9-coin "Furioso-Replica", gaining +90% Critical Damage and erasing boss health bars!'
      }
    ],
    combatRotation: {
      opener: 'Check the battlefield for whichever enemy has "The Prescript\'s Target". Aim your prescript-marked Skill 1 or Skill 2 at that specific enemy to bank 3 Grace of the Prescript immediately.',
      midGame: 'Continue attacking prescript targets to hit Unlock II and III. If you need to rush Unlock II, use your Evade defense skill once per encounter to instantly boost Grace to 6.',
      finisher: 'Once Procuration -Hermes- reaches 9, Skill 3 transforms into Furioso-Replica. Direct this 9-coin monstrosity at a staggered target or high-threat boss.'
    },
    teamSynergies: {
      keywords: ['Poise', 'Sinking', 'Pride Resonance'],
      bestPartners: ['The Index Proxy - Effloresced E.G.O::Procuration Don Quixote', 'Blade Lineage Mentor Meursault', 'Lobotomy E.G.O::Solemn Lament Yi Sang'],
      tip: 'Pairs best with Pride and Gluttony resonance teams to trigger his passives and empower his Unbreakable Coins.'
    }
  },

  // 15. The Ring Pointillist Student Yi Sang
  'The Ring Pointillist Student Yi Sang': {
    archetype: 'Debuff Roulette & Coin-Reuse Assassin',
    primaryKeywords: ['Bleed', 'Tremor'],
    role: 'Multi-Debuff Hypercarry',
    uniqueMechanics: [
      {
        title: 'Random Debuff Roulette',
        badge: 'Setup',
        trigger: 'Attacking targets with negative status effects',
        explanation: 'Every attack inflicts random status ailments (Bleed, Tremor, Burn, Sinking, or Rupture) on the target in addition to baseline Bleed.'
      },
      {
        title: 'Skill 2 Coin Re-Use (The Meat Grinder)',
        badge: 'Win Condition',
        trigger: 'Attacking a target with 3+ distinct negative status types',
        explanation: 'When attacking an enemy with 3 or more distinct negative status effect types, Skill 2 rolls extra Coin Power and re-uses its coins, dealing absurd multi-hit burst damage!'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 and teammate debuffs to plant at least 3 distinct status effects (e.g. Bleed + Tremor + Sinking) on the primary target.',
      midGame: 'Maintain status variety. As long as the enemy has 3+ status icons, every hit rolls with bonus power.',
      finisher: 'Fire Skill 2 into the debuffed target to trigger the coin re-use chain and melt their HP.'
    },
    teamSynergies: {
      keywords: ['Bleed', 'Tremor', 'Multi-Status'],
      bestPartners: ['The Ring Fauvist Docent Rodion', 'The Pequod Captain Ishmael', 'The Pequod Harpooneer Heathcliff', 'Kurokumo Clan Wakashu Ryōshū'],
      tip: 'Combine with teammates that inflict different status types to keep the 3+ distinct debuff threshold active permanently.'
    }
  },

  // 16. Blade Lineage Mentor Meursault
  'Blade Lineage Mentor Meursault': {
    archetype: 'Slash & Pride Commander / Counter God',
    primaryKeywords: ['Poise'],
    role: 'Team Poise Buffer & Retaliation Nuke',
    uniqueMechanics: [
      {
        title: 'Swordplay of the Homeland',
        badge: 'Team Aura',
        trigger: 'Combat start / having Poise on self',
        explanation: 'Grants massive Poise Potency/Count and Slash Power Up to all Blade Lineage allies, turning an entire BL squad into critical-hit monsters.'
      },
      {
        title: 'Yield My Flesh ➔ To Claim Their Bones',
        badge: 'Clash Lose Counter',
        trigger: 'Deliberately losing a clash with Skill 3',
        explanation: 'Skill 3 has 20 Base Power and cannot be staggered. If he intentionally LOSES a clash, he absorbs the blow and unleashes "To Claim Their Bones"—an unstoppable 4-coin nuke dealing astronomical critical damage!'
      }
    ],
    combatRotation: {
      opener: 'Lead with Skill 1 and Skill 2 to build Poise count and distribute Swordplay buffs to your team.',
      midGame: 'Use Skill 2 to win clashes and gain Slash Power Up for subsequent turns.',
      finisher: 'When facing an overwhelming boss attack that nobody can clash with, aim Skill 3 at it to deliberately trigger "To Claim Their Bones" and retaliate with lethal force.'
    },
    teamSynergies: {
      keywords: ['Poise', 'Pride Resonance'],
      bestPartners: ['Blade Lineage Salsu Faust', 'Blade Lineage Salsu Yi Sang', 'Blade Lineage Salsu Sinclair', 'Cinq Assoc. South Section 4 Director Sinclair'],
      tip: 'Stack Pride skills across your team to maximize Sword of the Homeland buffs.'
    }
  },

  // 17. Wild Hunt Heathcliff
  'Wild Hunt Heathcliff': {
    archetype: 'Mounted Sinking Juggernaut',
    primaryKeywords: ['Sinking', 'Tremor'],
    role: 'Sinking Burst & Boss Obliteration',
    uniqueMechanics: [
      {
        title: 'Mounting Dullahan',
        badge: 'Mode Shift',
        trigger: 'Skill 3 or counter activation',
        explanation: 'Summoning his spectral steed Dullahan grants high Speed, Clash Power, and transforms his standard skills into sweeping multi-target cleaves.'
      },
      {
        title: 'Coffin & Sinking Conversion',
        badge: 'Scaling',
        trigger: 'Winning clashes and defeating enemies',
        explanation: 'Winning clashes and defeating enemies stocks Coffin. Skill 3 consumes Coffin to inflict massive Gloom damage scaling directly with target\'s Sinking count & potency.'
      }
    ],
    combatRotation: {
      opener: 'Mount Dullahan as early as possible. Use Skill 1 to lay down Sinking potency and maintain SP.',
      midGame: 'Win clashes to rapidly accumulate Coffin stacks while allies build high Sinking counts on the boss.',
      finisher: 'Unleash mounted Skill 3 on a target with high Sinking. The damage multiplier scales through the ceiling.'
    },
    teamSynergies: {
      keywords: ['Sinking', 'Gloom Resonance'],
      bestPartners: ['Effloresced E.G.O::Spicebush Yi Sang', 'Dieci Assoc. South Section 4 Rodion', 'Molar Boatworks Fixer Ishmael'],
      tip: 'Essential centerpiece for Sinking Deluge and high-tier Sinking dungeon comps.'
    }
  },

  // 18. Lobotomy E.G.O::Solemn Lament Yi Sang
  'Lobotomy E.G.O::Solemn Lament Yi Sang': {
    archetype: 'Dual-Wield Gunner / Sinking & Poise Duelist',
    primaryKeywords: ['Sinking', 'Poise'],
    role: 'Long-Range Sinking Stacker & Crit Finisher',
    uniqueMechanics: [
      {
        title: 'Living & Departed Butterflies',
        badge: 'Butterfly Engine',
        trigger: 'Alternating Skill 1 and Skill 2 shots',
        explanation: 'Fires twin pistols: white rounds accumulate Poise and inflict Sinking count, while black rounds expend butterflies to deal bonus damage on critical strikes.'
      },
      {
        title: 'Multi-Coin Ranged Salvos',
        badge: 'Rapid Fire',
        trigger: 'Using firearm skills',
        explanation: 'Boasts extremely high coin counts across all skills, applying Sinking rapidly without depleting enemy count excessively.'
      }
    ],
    combatRotation: {
      opener: 'Use white pistol skills to stack Poise count and begin laying Sinking on targets.',
      midGame: 'Balance butterfly generation while clashing with his strong base power skills.',
      finisher: 'Discharge black pistol salvos to trigger massive critical hits with butterfly execution bonuses.'
    },
    teamSynergies: {
      keywords: ['Sinking', 'Poise'],
      bestPartners: ['Wild Hunt Heathcliff', 'Effloresced E.G.O::Spicebush Yi Sang', 'Dieci Assoc. South Section 4 Hong Lu'],
      tip: 'Excels in hybrid Poise-Sinking compositions.'
    }
  },

  // 19. The Pequod Captain Ishmael
  'The Pequod Captain Ishmael': {
    archetype: 'Pride Commander & Assist Attack Facilitator',
    primaryKeywords: ['Bleed', 'Burn', 'Poise'],
    role: 'Offensive Buffer & Extra Actions',
    uniqueMechanics: [
      {
        title: 'Assist Attack Order',
        badge: 'Team Action',
        trigger: 'Landing Skill 2 (Harpoon of Obsession)',
        explanation: 'Skill 2 commands the ally with the highest damage or specific priority to immediately launch an Assist Attack on her target, doubling your action economy!'
      },
      {
        title: 'Obsessive Execution & SP Recovery',
        badge: 'Morale',
        trigger: 'Defeating enemies with Skill 3',
        explanation: 'Skill 3 deals immense execution damage against targets below 50% HP. If she lands a kill, she heals SP for the entire squad.'
      }
    ],
    combatRotation: {
      opener: 'Target the primary clash with Skill 1 to gain Poise and build Pride resonance.',
      midGame: 'Line up Skill 2 on high-threat targets so your strongest damage dealer hits twice in the same turn via Assist Attack.',
      finisher: 'Use Skill 3 to finish off wounded targets and restore team sanity to maximum.'
    },
    teamSynergies: {
      keywords: ['Bleed', 'Poise', 'Pride Resonance'],
      bestPartners: ['The Pequod Harpooneer Heathcliff', 'Blade Lineage Mentor Meursault', 'The Ring Pointillist Student Yi Sang'],
      tip: 'One of the best buffers in the game. Position your highest single-target DPS right next to her.'
    }
  },

  // 20. Dawn Office Fixer Sinclair
  'Dawn Office Fixer Sinclair': {
    archetype: 'SP-Fueled Fire Hypercarry',
    primaryKeywords: ['Burn'],
    role: 'Burn Burst & E.G.O Transformed Finisher',
    uniqueMechanics: [
      {
        title: 'E.G.O Manifestation: Volatile Wax',
        badge: 'Transformation',
        trigger: 'Reaching 40+ Sanity (SP)',
        explanation: 'Reaching 40+ SP transforms Sinclair into his E.G.O state, turning his skills into 4-coin flaming cleaves with overwhelming clash power.'
      },
      {
        title: 'Sanity Drain Management',
        badge: 'SP Drain',
        trigger: 'Every turn while transformed',
        explanation: 'E.G.O form drains SP every turn. You must win clashes and keep Burn stacked on enemies to avoid dropping out of transformation or suffering panic.'
      }
    ],
    combatRotation: {
      opener: 'Focus on winning safe clashes with S1 and S2 to build Sanity up to 40+ as fast as possible.',
      midGame: 'Once transformed into Volatile Wax, dominate every clash with his 4-coin skills while spreading Burn.',
      finisher: 'Unleash S3 for full-screen Burn detonation before your SP drops below the threshold.'
    },
    teamSynergies: {
      keywords: ['Burn', 'Wrath Resonance'],
      bestPartners: ['Liu Assoc. South Section 4 Director Rodion', 'Liu Assoc. South Section 4 Ishmael', 'Lobotomy E.G.O::Magic Bullet Outis'],
      tip: 'Needs SP support (e.g. Faust\'s Fluid Sac or Hong Lu\'s Land of Illusion) to sustain his fiery transformation.'
    }
  },

  // 21. Devyat' Assoc. North Section 3 Rodion
  'Devyat\' Assoc. North Section 3 Rodion': {
    archetype: 'High-Velocity Rupture Courier',
    primaryKeywords: ['Rupture'],
    role: 'Rupture Potency & Count Enabler',
    uniqueMechanics: [
      {
        title: 'Courier Trunk & Velocity Scaling',
        badge: 'Speed Engine',
        trigger: 'Accumulating speed and delivery distance each turn',
        explanation: 'Gains speed each turn to build "Delivery Distance". High delivery speed empowers her skills with positive Rupture Count, fixing Rupture\'s biggest weakness!'
      },
      {
        title: 'Package Delivery (S3 Burst)',
        badge: 'Finisher',
        trigger: 'Skill 3 hit with high delivery distance',
        explanation: 'Skill 3 expends accumulated courier distance to deliver massive Rupture damage without shedding Rupture Count.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 and Evade to ramp up Speed and start the delivery distance counter.',
      midGame: 'Use Skill 2 to apply heavy Rupture potency while maintaining positive Count.',
      finisher: 'Deliver the cargo with Skill 3 on an enemy with 15+ Rupture potency for an explosive chunk of true damage.'
    },
    teamSynergies: {
      keywords: ['Rupture', 'Gluttony Resonance'],
      bestPartners: ['K Corp. Class 3 Excision Staff Hong Lu', 'W Corp. L3 Cleanup Agent Yi Sang', 'Seven Assoc. South Section 4 Faust'],
      tip: 'The gold standard for Rupture teams because she preserves Count instead of consuming it.'
    }
  },

  // 22. MultiCrack Office Rep Faust
  'MultiCrack Office Rep Faust': {
    archetype: 'Charge Battery & Team Redistribution',
    primaryKeywords: ['Charge'],
    role: 'Charge Buffer & Clash Anchor',
    uniqueMechanics: [
      {
        title: 'Charge Transfer & Multi-Discharge',
        badge: 'Battery',
        trigger: 'Using Skill 2 and passives',
        explanation: 'Generates internal Charge and passes Charge potency to team allies who need it for their S3 finishers, eliminating the ramp-up delay for Charge teams.'
      }
    ],
    combatRotation: {
      opener: 'Cycle Skill 1 to power up internal capacitor.',
      midGame: 'Use Skill 2 to transfer Charge to your team\'s primary nukers (e.g. W Ryōshū or W Don).',
      finisher: 'Cash in remaining Charge with Skill 3 for high-power Slash damage.'
    },
    teamSynergies: {
      keywords: ['Charge', 'Envy Resonance'],
      bestPartners: ['W Corp. L3 Cleanup Agent Ryōshū', 'W Corp. L3 Cleanup Agent Don Quixote', 'R Corp. 4th Pack Reindeer Ishmael'],
      tip: 'Solves the clunky setup turns of traditional Charge teams.'
    }
  },

  // 23. W Corp. L3 Cleanup Agent Ryōshū
  'W Corp. L3 Cleanup Agent Ryōshū': {
    archetype: 'Charge Hypercarry & Dimensional Finisher',
    primaryKeywords: ['Charge'],
    role: 'Nuclear Slash Finisher',
    hazardAlert: {
      badge: 'D.D.E.D.R. Recoil Hazard',
      message: 'Skill 3 requires 15 Charge Count! If fired below 15 Charge, she takes massive self-HP damage and deals reduced damage. Build 15 Charge before unleashing.'
    },
    uniqueMechanics: [
      {
        title: 'D.D.E.D.R. (Dimension Shredder)',
        badge: 'Nuclear Finisher',
        trigger: 'Having 15+ Charge count before using Skill 3',
        explanation: 'Skill 3 requires 15 Charge count. If used at 15+ Charge, it unleashes 4 devastating Slash coins that hit for hundreds of damage. If used below 15 Charge, she suffers severe self-HP recoil!'
      }
    ],
    combatRotation: {
      opener: 'Never use S3 on Turn 1 or below 15 Charge! Use S1 and S2 to steadily stack Charge.',
      midGame: 'Use Defense or S2 to reach 15+ Charge count safely.',
      finisher: 'Once at 15+ Charge, fire D.D.E.D.R. at the boss or staggered target for an instant kill.'
    },
    teamSynergies: {
      keywords: ['Charge', 'Slash', 'Envy Resonance'],
      bestPartners: ['MultiCrack Office Rep Faust', 'W Corp. L3 Cleanup Agent Don Quixote', 'W Corp. L3 Cleanup Agent Yi Sang'],
      tip: 'Always pair with Charge batteries to unlock D.D.E.D.R. as fast as possible.'
    }
  },

  // 24. Shi Assoc. South Section 5 Ishmael
  'Shi Assoc. South Section 5 Ishmael': {
    archetype: 'Crisis State Duelist / Low-HP Critical Sweeper',
    primaryKeywords: ['Poise'],
    role: 'Crisis Burst DPS',
    uniqueMechanics: [
      {
        title: 'Crisis Threshold (<= 50% HP)',
        badge: 'Crisis Doubler',
        trigger: 'Dropping to or below 50% max HP',
        explanation: 'When her HP drops below 50%, her skills gain extra coins, doubled coin power, and guaranteed Poise critical hits!'
      },
      {
        title: 'Flashing Blade (S2)',
        badge: 'Clash Dominator',
        trigger: 'Active while below 50% HP',
        explanation: 'At low HP, Skill 2 becomes a 4-coin slaughtering slash that rolls astronomical clash power.'
      }
    ],
    combatRotation: {
      opener: 'Deliberately take minor uncontrolled hits or use defense skills to safely bring her HP under 50%.',
      midGame: 'Once below 50% HP, activate "Crisis" mode: her skills will dominate every clash and score continuous critical strikes.',
      finisher: 'Unleash Skill 2 and Skill 3 on bosses to shred their HP bars with double-coin criticals.'
    },
    teamSynergies: {
      keywords: ['Poise', 'Wrath Resonance'],
      bestPartners: ['Blade Lineage Mentor Meursault', 'Shi Assoc. South Section 5 Heathcliff', 'Cinq Assoc. South Section 4 Director Sinclair'],
      tip: 'Do NOT bring burst healers that put her above 50% HP, as that turns off her Crisis buffs.'
    }
  },

  // 25. Cinq Assoc. South Section 5 Director Don Quixote
  'Cinq Assoc. South Section 5 Director Don Quixote': {
    archetype: 'Speed Duelist & Declared Duelist Lockout',
    primaryKeywords: ['Poise'],
    role: 'Single-Target 1v1 Dominator',
    uniqueMechanics: [
      {
        title: 'Declared Duelist',
        badge: '1v1 Lockout',
        trigger: 'Landing designated dueling skills',
        explanation: 'Marks a target as her dueling partner. Gains massive Haste, Clash Power, and Defense Level debuffs against that specific opponent.'
      },
      {
        title: 'Speed Differential Scaling',
        badge: 'Velocity Power',
        trigger: 'Having higher speed than the target',
        explanation: 'The higher her Speed relative to the target, the higher her coin damage and critical hit chance.'
      }
    ],
    combatRotation: {
      opener: 'Use Skill 1 to gain Haste and establish speed advantage.',
      midGame: 'Mark the boss with Declared Duelist using Skill 2, locking them in an unwinnable clash.',
      finisher: 'Lunge with Skill 3 at maximum Speed differential for piercing critical devastation.'
    },
    teamSynergies: {
      keywords: ['Poise', 'Pierce'],
      bestPartners: ['Cinq Assoc. South Section 4 Director Sinclair', 'Blade Lineage Mentor Meursault'],
      tip: 'Outstanding against solo bosses and Abnormality focal points.'
    }
  }
};

// Universal analyzer that produces in-depth, specific tactical dossiers for ALL 187 identities
export function getIdentityTactics(identity) {
  if (!identity) return null;

  // Curated table lookup with fuzzy/normalized key matching
  const exactKey = identity.name;
  let curated = CURATED_TACTICS[exactKey];
  if (!curated) {
    const normName = exactKey.toLowerCase().replace(/['"`\-]/g, '').trim();
    for (const [k, v] of Object.entries(CURATED_TACTICS)) {
      if (k.toLowerCase().replace(/['"`\-]/g, '').trim() === normName) {
        curated = v;
        break;
      }
    }
  }

  const skillsTactical = extractSkillsTactical(identity);
  const detectedKeywords = detectKeywords(identity);

  if (curated) {
    return {
      ...curated,
      name: identity.name,
      sinner: identity.sinner,
      rarity: identity.rarity,
      isCurated: true,
      skillsTactical
    };
  }

  // Universal In-Depth Dynamic Extraction for all other identities
  const hasMinusCoins = (identity.skills || []).some(s => s.coinPower < 0);
  const jsonText = JSON.stringify([
    identity.skills || [],
    identity.passives || [],
    identity.defense || {},
    identity.alternateSkills || []
  ]).toLowerCase();

  const hasAmmo = jsonText.includes('ammo');
  const hasDiscard = jsonText.includes('discard') || jsonText.includes('insight');
  const hasSelfHp = jsonText.includes('consume') && jsonText.includes('hp');
  const hasFriendlyFire = jsonText.includes('indiscriminate') || jsonText.includes('friendly fire');

  const detectedMechanics = detectUniqueMechanics(identity, detectedKeywords, {
    hasMinusCoins,
    hasAmmo,
    hasDiscard,
    hasSelfHp,
    hasFriendlyFire
  });

  const primaryRole = determineRole(identity, detectedKeywords, skillsTactical, { hasMinusCoins, hasAmmo, hasDiscard });
  const archetype = determineArchetype(identity, detectedKeywords, { hasMinusCoins, hasAmmo, hasDiscard });
  const hazardAlert = generateHazardAlert(identity, { hasMinusCoins, hasAmmo, hasDiscard, hasSelfHp, hasFriendlyFire });
  const combatRotation = generateDynamicRotation(identity, skillsTactical, detectedKeywords, { hasMinusCoins, hasAmmo, hasDiscard, hasSelfHp });
  const teamSynergies = generateTeamSynergies(identity, detectedKeywords);

  return {
    name: identity.name,
    sinner: identity.sinner,
    rarity: identity.rarity,
    isCurated: false,
    archetype,
    primaryKeywords: detectedKeywords.length > 0 ? detectedKeywords : ['Direct Combat'],
    role: primaryRole,
    hazardAlert,
    uniqueMechanics: detectedMechanics,
    combatRotation,
    skillsTactical,
    teamSynergies
  };
}

export function detectKeywords(identity) {
  const text = JSON.stringify([
    identity.skills || [],
    identity.passives || [],
    identity.defense || {},
    identity.alternateSkills || []
  ]);
  const found = [];
  for (const kw of KEYWORDS) {
    const reg = new RegExp('\\b' + kw + '\\b', 'i');
    if (reg.test(text)) found.push(kw);
  }
  return found;
}

function detectUniqueMechanics(identity, keywords, flags = {}) {
  const text = JSON.stringify([
    identity.skills || [],
    identity.passives || [],
    identity.defense || {},
    identity.alternateSkills || []
  ]).toLowerCase();

  const matched = [];

  // Match recognized dictionary items
  for (const mech of MECHANICS_DICTIONARY) {
    if (text.includes(mech.key)) {
      matched.push(mech);
    }
  }

  // Kit flags fallback mechanics
  if (flags.hasMinusCoins && !matched.some(m => m.title.includes('Minus Coin'))) {
    matched.unshift({
      title: 'Minus Coin Scaling (Negative Sanity)',
      badge: 'Inverse Math',
      trigger: 'Tossing coins with negative coin power',
      explanation: 'Base Power is high, but Coin Power is negative. Rolling Tails preserves maximum clash power, meaning this unit is strongest at negative Sanity.'
    });
  }

  if (flags.hasAmmo && !matched.some(m => m.title.includes('Ammo'))) {
    matched.unshift({
      title: 'Limited Ammunition Pool',
      badge: 'Limited Munitions',
      trigger: 'Consuming bullets on firearm attacks',
      explanation: 'Enters combat with fixed ammo. Skills expend bullets for massive early clash power. Once depleted, attacks lose coin effects.'
    });
  }

  if (flags.hasDiscard && !matched.some(m => m.title.includes('Discard'))) {
    matched.unshift({
      title: 'Discard & Card Flow',
      badge: 'Deck Cycling',
      trigger: 'Using skills that discard adjacent dashboard slots',
      explanation: 'Discards lower-tier skills from the dashboard to cycle into high-tier skills quickly while generating shields.'
    });
  }

  if (flags.hasSelfHp && !matched.some(m => m.title.includes('HP'))) {
    matched.push({
      title: 'HP Consumption Stance',
      badge: 'Risk / Reward',
      trigger: 'Using skills that trade HP for power',
      explanation: 'Sacrifices a portion of current HP to boost coin power or gain status count. Pair with passive healing to sustain longevity.'
    });
  }

  // Baseline keyword cards if no specific faction mechanic matched
  if (matched.length === 0) {
    if (keywords.includes('Charge')) {
      matched.push({
        title: 'Charge Battery & Count Management',
        badge: 'Resource Management',
        trigger: 'Early turns using Skill 1 and Skill 2 generators',
        explanation: 'Accumulates Charge count to fuel coin power buffs, prevent self-damage or paralysis, and power up heavy S3 finishers.'
      });
    }
    if (keywords.includes('Poise')) {
      matched.push({
        title: 'Poise Critical Flow',
        badge: 'Critical Engine',
        trigger: 'Landing hits and winning clashes with Poise skills',
        explanation: 'Maintains Poise Count to prevent Potency decay, ensuring attacks reliably trigger +20% to +100% critical hit damage spikes.'
      });
    }
    if (keywords.includes('Bleed')) {
      matched.push({
        title: 'Bleed Stacking & Count Conservation',
        badge: 'Coin Punishment',
        trigger: 'Inflicting Bleed Potency & Count on targets',
        explanation: 'Damages enemies whenever they toss combat coins. Positive Bleed Count is essential so the debuff does not vanish between coin flips.'
      });
    }
    if (keywords.includes('Tremor')) {
      matched.push({
        title: 'Tremor Stagger Acceleration',
        badge: 'Stagger Shifter',
        trigger: 'Inflicting Tremor and detonating Tremor-Burst',
        explanation: 'Raises enemy stagger threshold with Tremor Potency, shifting the threshold to trigger early, turn-skipping enemy staggers.'
      });
    }
    if (keywords.includes('Rupture')) {
      matched.push({
        title: 'Rupture True Damage Chain',
        badge: 'Fixed Damage',
        trigger: 'Striking targets afflicted with Rupture',
        explanation: 'Deals direct true fixed damage on every single hit. Count management is critical because every hit consumes 1 Rupture Count.'
      });
    }
    if (keywords.includes('Sinking')) {
      matched.push({
        title: 'Sinking Sanity Drain & Gloom Nuke',
        badge: 'Mind Break & Nuke',
        trigger: 'Striking targets afflicted with Sinking',
        explanation: 'Drains human enemies\' Sanity to force tails flips, corrosion, and panic. Deals pure bonus Gloom HP damage on Abnormalities.'
      });
    }
    if (keywords.includes('Burn')) {
      matched.push({
        title: 'Burn Turn-End Crucible',
        badge: 'Turn-End Damage',
        trigger: 'End of each combat turn',
        explanation: 'Burns targets at the end of each turn based on accumulated Potency, whittling down durable targets with fixed damage.'
      });
    }
  }

  if (matched.length === 0) {
    matched.push({
      title: 'High-Impact Clash Engine',
      badge: 'Combat Fundamentals',
      trigger: 'Clashing against enemy skills',
      explanation: 'Relies on high natural Coin Power and Sanity (SP) to win clashes cleanly without complex setup requirements.'
    });
  }

  return matched;
}

function generateHazardAlert(identity, flags = {}) {
  if (flags.hasMinusCoins) {
    return {
      badge: 'Minus Coin Invariant',
      message: 'This identity gains power at NEGATIVE Sanity (SP) because coin power is negative. Avoid SP-healing teammates, maintain SP between -15 and -35, and use Guard if nearing -45 SP to avoid corrosion.'
    };
  }
  if (flags.hasFriendlyFire) {
    return {
      badge: 'Friendly Fire Hazard',
      message: 'Certain skills or conditions can cause this identity to target allies indiscriminately! Check Charge or Sanity prerequisites before firing.'
    };
  }
  if (flags.hasAmmo) {
    return {
      badge: 'Munitions Limit',
      message: 'Enters combat with fixed ammo. Bullet-consuming skills lose virtually all damage and coin effects once ammo is depleted. Prioritize high-threat targets early.'
    };
  }
  return null;
}

function extractSkillsTactical(identity) {
  const skills = identity.skills || [];
  return skills.map((s, idx) => {
    const base = s.basePower || 0;
    const coin = s.coinPower || 0;
    const count = s.coins || 1;
    
    // For minus-coin skills, max clash is basePower (when rolling tails)
    const maxPower = coin < 0 ? base : base + (coin * count);
    
    let roleTag = '🔄 Setup';
    if (coin < 0) {
      roleTag = '🎯 Minus Coin King';
    } else if (idx === 2) {
      roleTag = maxPower >= 18 ? '💥 Nuclear Finisher' : '💥 Burst Finisher';
    } else if (maxPower >= 15 || coin >= 4) {
      roleTag = '🎯 Clash Anchor';
    } else if (idx === 1) {
      roleTag = '⚡ Status Engine';
    }

    const effStr = Array.isArray(s.effects) ? s.effects.join(' ') : (s.effects || '');
    let tacticalSummary = 'Solid ' + (s.type || '') + ' attack with max clash of ' + maxPower + '.';
    if (coin < 0) {
      tacticalSummary = 'Minus Coin skill: Base ' + base + ', Coin ' + coin + '. Highest roll (' + base + ') at negative Sanity.';
    } else if (effStr.includes('Count')) {
      tacticalSummary = 'Applies key status Count to keep your team\'s debuffs active.';
    } else if (effStr.includes('Critical') || effStr.includes('Poise')) {
      tacticalSummary = 'Builds Poise or scores high critical hit damage.';
    } else if (effStr.includes('Tremor-Burst')) {
      tacticalSummary = 'Triggers Tremor-Burst to immediately advance enemy stagger.';
    } else if (effStr.includes('Damage') && effStr.includes('+')) {
      tacticalSummary = 'Conditional high-damage coin scaling with active battle status.';
    } else if (maxPower >= 16) {
      tacticalSummary = 'High-power clashing tool for winning difficult head-to-heads.';
    }

    return {
      name: s.name,
      slot: idx + 1,
      affinity: s.affinity,
      type: s.type,
      maxPower,
      basePower: base,
      coins: count,
      coinPower: coin,
      roleTag,
      tacticalSummary
    };
  });
}

function determineRole(identity, keywords, skillsTactical, flags = {}) {
  if (flags.hasMinusCoins) return 'Negative Sanity / Minus-Coin Berserker';
  if (flags.hasAmmo) return 'Limited Ammo Burst Specialist';
  if (flags.hasDiscard) return 'Discard & Insight Deck Cycler';

  const s3 = skillsTactical[2];
  if (s3 && s3.maxPower >= 18) return 'Clash Specialist / Finisher';
  if (keywords.includes('Tremor')) return 'Stagger Accelerator';
  if (keywords.includes('Rupture')) return 'True Damage Inflictor';
  if (keywords.includes('Sinking')) return 'Sanity Drainer / Gloom Nuker';
  if (keywords.includes('Bleed')) return 'Coin-Punishing Bleed Engine';
  if (keywords.includes('Burn')) return 'End-of-Turn Burn Stacker';
  if (keywords.includes('Charge')) return 'Charge Accumulator & Finisher';
  if (keywords.includes('Poise')) return 'Critical Strike Duelist';
  return 'Flexible Combatant';
}

function determineArchetype(identity, keywords, flags = {}) {
  const name = identity.name || '';
  if (flags.hasMinusCoins) return 'Negative Sanity Berserker';
  if (flags.hasAmmo) return 'Limited Munitions Specialist';
  if (flags.hasDiscard) return 'Dieci / Molar Discard Cycler';

  if (name.includes('Blade Lineage')) return 'Blade Lineage Poise Master';
  if (name.includes('Liu')) return 'Liu Association Burn Striker';
  if (name.includes('Dieci')) return 'Dieci Knowledge & Shield Monk';
  if (name.includes('W Corp')) return 'W Corp. Charge Dimensional Agent';
  if (name.includes('The Index')) return 'The Index Prescript Executor';
  if (name.includes('Seven')) return 'Seven Association Weakness Analyst';
  if (name.includes('Shi')) return 'Shi Association Crisis Striker';
  if (name.includes('Cinq')) return 'Cinq Association Speed Duelist';
  if (name.includes('N Corp')) return 'N Corp. Fanatic Inquisitor';
  if (name.includes('Kurokumo')) return 'Kurokumo Clan Bleed Slasher';
  if (name.includes('Pequod')) return 'Pequod Harpooner Veteran';
  if (name.includes('Devyat')) return 'Devyat Association Courier';
  if (name.includes('Heishou')) return 'Heishou Pack Martial Adept';
  if (name.includes('T Corp')) return 'T Corp. Time Moratorium Collector';
  if (name.includes('Lobotomy')) return 'Lobotomy E.G.O Synchronizer';
  
  if (keywords.length >= 2) return keywords[0] + ' & ' + keywords[1] + ' Hybrid';
  if (keywords.length === 1) return 'Dedicated ' + keywords[0] + ' Specialist';
  return 'General Combat Vanguard';
}

function generateDynamicRotation(identity, skillsTactical, keywords, flags = {}) {
  const s1 = skillsTactical[0];
  const s2 = skillsTactical[1];
  const s3 = skillsTactical[2];

  if (flags.hasMinusCoins) {
    return {
      opener: 'Use ' + (s1?.name || 'Skill 1') + ' to lose early Sanity safely and push SP into the negative zone (-10 to -25).',
      midGame: 'Maintain SP between -15 and -35. His ' + (s2?.name || 'Skill 2') + ' rolls high base power. Guard if SP approaches -45 to prevent corrosion.',
      finisher: 'Unleash ' + (s3?.name || 'Skill 3') + ' at negative Sanity. Rolling tails hits maximum base clash power (' + (s3?.maxPower || 30) + ') for massive damage!'
    };
  }

  if (flags.hasAmmo) {
    return {
      opener: 'Deploy high-speed ammo skills to clash and eliminate dangerous threats on Turn 1–2 while munitions are full.',
      midGame: 'Use ' + (s2?.name || 'Skill 2') + ' on priority enemies. Conserve remaining bullets for staggered targets.',
      finisher: 'Unload ' + (s3?.name || 'Skill 3') + ' before ammo runs out to deliver maximum burst before switching to support.'
    };
  }

  if (flags.hasDiscard) {
    return {
      opener: 'Use ' + (s1?.name || 'Skill 1') + ' or ' + (s2?.name || 'Skill 2') + ' to discard adjacent lower-tier skills, immediately drawing higher cards and generating shields.',
      midGame: 'Build Insight stacks by cycling cards continuously. Use Insight bonuses to dominate mid-fight clashes.',
      finisher: 'Unleash ' + (s3?.name || 'Skill 3') + ' with maximum Insight for enhanced coin damage and heavy status application.'
    };
  }

  if (keywords.includes('Charge')) {
    return {
      opener: 'Open with ' + (s1?.name || 'Skill 1') + ' to begin building internal Charge count. Do not waste heavy charge skills yet.',
      midGame: 'Use ' + (s2?.name || 'Skill 2') + ' to clash and push Charge count to the required threshold (8–10+).',
      finisher: 'Once fully charged, discharge ' + (s3?.name || 'Skill 3') + ' (' + (s3?.roleTag || 'Finisher') + ', Max roll ' + (s3?.maxPower || 18) + ') for massive multi-coin damage.'
    };
  }

  if (keywords.includes('Rupture')) {
    return {
      opener: 'Use ' + (s1?.name || 'Skill 1') + ' to plant initial Rupture potency while monitoring Rupture Count carefully.',
      midGame: 'Ensure positive Rupture Count skills hit before multi-coin skills so the Rupture stack does not expire.',
      finisher: 'Fire ' + (s3?.name || 'Skill 3') + ' on an enemy with 15+ Rupture potency for an avalanche of true Gluttony damage.'
    };
  }

  return {
    opener: 'Open with ' + (s1?.name || 'Skill 1') + ' (Max roll ' + (s1?.maxPower || 11) + ') to build early Sanity and establish ' + (keywords[0] || 'combat presence') + '.',
    midGame: 'Use ' + (s2?.name || 'Skill 2') + ' (Max roll ' + (s2?.maxPower || 15) + ') to win clashes and stack key ' + (keywords.join('/') || 'status') + ' conditions.',
    finisher: 'Unleash ' + (s3?.name || 'Skill 3') + ' (' + (s3?.roleTag || 'Finisher') + ', Max roll ' + (s3?.maxPower || 18) + ') once conditions are met to stagger or eliminate the target.'
  };
}

function generateTeamSynergies(identity, keywords) {
  const name = identity.name || '';
  const partners = [];

  // Faction partner synergies
  if (name.includes('Blade Lineage')) partners.push('Blade Lineage Mentor Meursault', 'Blade Lineage Salsu Faust', 'Blade Lineage Salsu Yi Sang');
  else if (name.includes('Liu')) partners.push('Liu Assoc. South Section 4 Director Rodion', 'Liu Assoc. South Section 4 Ishmael', 'Dawn Office Fixer Sinclair');
  else if (name.includes('Dieci')) partners.push('Dieci Assoc. South Section 4 Rodion', 'Dieci Assoc. South Section 4 Hong Lu', 'Dieci Assoc. South Section 4 Director Meursault');
  else if (name.includes('W Corp')) partners.push('W Corp. L3 Cleanup Agent Ryōshū', 'W Corp. L3 Cleanup Agent Don Quixote', 'MultiCrack Office Rep Faust');
  else if (name.includes('The Index')) partners.push('The House of Spiders: The Index Nursefather Yi Sang', 'The Index Proxy - Effloresced E.G.O::Procuration Don Quixote');
  else if (name.includes('Kurokumo')) partners.push('Kurokumo Clan Captain Ishmael', 'Kurokumo Clan Wakashu Ryōshū', 'Kurokumo Clan Wakashu Rodion');
  else if (name.includes('Pequod')) partners.push('The Pequod Captain Ishmael', 'The Pequod Harpooneer Heathcliff');
  else if (name.includes('Seven')) partners.push('Seven Assoc. South Section 4 Faust', 'Seven Assoc. South Section 6 Director Outis');
  else if (name.includes('Cinq')) partners.push('Cinq Assoc. South Section 4 Director Sinclair', 'Cinq Assoc. South Section 5 Director Don Quixote');
  else if (name.includes('Devyat')) partners.push('Devyat\' Assoc. North Section 3 Rodion', 'Devyat\' Assoc. North Section 3 Sinclair');

  // Keyword partner fallbacks
  if (partners.length === 0) {
    if (keywords.includes('Bleed')) partners.push('The Ring Pointillist Student Yi Sang', 'The Pequod Captain Ishmael', 'The One Who Grips Faust');
    else if (keywords.includes('Burn')) partners.push('Dawn Office Fixer Sinclair', 'Lobotomy E.G.O::Magic Bullet Outis', 'Liu Assoc. South Section 4 Director Rodion');
    else if (keywords.includes('Tremor')) partners.push('T Corp. Class 3 Collection Staff Don Quixote', 'District 20 Yurodivy Hong Lu', 'Öufi Assoc. South Section 3 Heathcliff');
    else if (keywords.includes('Rupture')) partners.push('Devyat\' Assoc. North Section 3 Rodion', 'K Corp. Class 3 Excision Staff Hong Lu', 'Seven Assoc. South Section 4 Faust');
    else if (keywords.includes('Sinking')) partners.push('Wild Hunt Heathcliff', 'Effloresced E.G.O::Spicebush Yi Sang', 'Dieci Assoc. South Section 4 Rodion');
    else if (keywords.includes('Poise')) partners.push('Blade Lineage Mentor Meursault', 'Cinq Assoc. South Section 4 Director Sinclair', 'The Pequod Captain Ishmael');
    else if (keywords.includes('Charge')) partners.push('W Corp. L3 Cleanup Agent Ryōshū', 'W Corp. L3 Cleanup Agent Don Quixote', 'MultiCrack Office Rep Faust');
    else partners.push('High-clash Sinner identities matching your Sin affinities');
  }

  let tip = 'Versatile identity that slots comfortably into any standard story or dungeon lineup.';
  if (keywords.length > 0) {
    tip = 'Synergizes heavily with ' + keywords.join('/') + ' compositions to maintain count and trigger maximum coin damage multipliers.';
  }

  return {
    keywords,
    bestPartners: partners.slice(0, 4),
    tip
  };
}

// Comprehensive Affiliations & Factions
export const AFFILIATION_RULES = [
  { key: 'The Thumb', match: /thumb/i, desc: 'East Thumb syndicate with specialized munitions and bayonet strikes.' },
  { key: 'The Middle', match: /middle/i, desc: 'Vengeful syndicate prioritizing counters and retribution.' },
  { key: 'The Ring', match: /the ring|ring /i, desc: 'Artistic syndicate specializing in multi-debuffs and coin reuse.' },
  { key: 'The Index', match: /the index|index /i, desc: 'Prescript-following syndicate with Unbreakable Coins and scaling power.' },
  { key: 'The Pinky', match: /the pinky|pinky /i, desc: 'Fingers syndicate with elusive combat arts.' },
  { key: 'Zwei Association', match: /zwei/i, desc: 'Protective peacekeeping fixers specializing in heavy shields and defense.' },
  { key: 'Blade Lineage', match: /blade lineage/i, desc: 'Slash swordsmen with team Poise generation and Retaliation nukes.' },
  { key: 'Kurokumo Clan', match: /kurokumo/i, desc: 'Bleed slashers inflicting crippling multi-coin bleed.' },
  { key: 'Shi Association', match: /shi assoc/i, desc: 'Crisis fixers whose power doubles when HP drops below 50%.' },
  { key: 'Cinq Association', match: /cinq assoc/i, desc: 'Speed duelists dominating 1v1 clashes with Haste and Declared Duelist.' },
  { key: 'Seven Association', match: /seven assoc/i, desc: 'Analytical fixers shredding defense levels with Weakness Analyzed and Rupture.' },
  { key: 'Liu Association', match: /liu assoc/i, desc: 'Fiery martial artists stacking Burn potency and count.' },
  { key: 'Dieci Association', match: /dieci assoc/i, desc: 'Knowledge monks discarding cards for massive shields and Sinking.' },
  { key: 'Devyat\' Association', match: /devyat/i, desc: 'High-speed couriers delivering Rupture without count consumption.' },
  { key: 'Öufi Association', match: /öufi|oufi/i, desc: 'Contract adjudicators converting and bursting Tremor.' },
  { key: 'W Corp.', match: /w corp/i, desc: 'Dimensional cleanup agents charging batteries for devastating S3 finishers.' },
  { key: 'R Corp.', match: /r corp/i, desc: 'Mercenary specialists utilizing high-speed ammo and heavy Charge weapons.' },
  { key: 'K Corp.', match: /k corp/i, desc: 'Excision security utilizing regenerative Ampules and revival protocols.' },
  { key: 'T Corp.', match: /t corp/i, desc: 'Time collectors using Time Moratorium damage stasis and Tremor - Decay.' },
  { key: 'N Corp.', match: /n corp|the one who grips|the one who shall grip/i, desc: 'Inquisitors hammering Nails, inflicting Gaze, and buffing Fanatic allies.' },
  { key: 'La Manchaland', match: /la manchaland/i, desc: 'Bloodfiends harvesting Bloodfeast to fuel feral vampiric skills.' },
  { key: 'Heishou Pack', match: /heishou/i, desc: 'Assassins adept in martial stances, poise, and charge.' },
  { key: 'Dawn Office', match: /dawn office/i, desc: 'Passionate fixers channeling volatile flames and SP-fueled E.G.O states.' },
  { key: 'Full-Stop Office', match: /full-stop/i, desc: 'Sniper fixers unleashing massive Turn 1 ammo and Fragile burst.' },
  { key: 'Molar Office', match: /molar/i, desc: 'Sinking and Tremor fixers utilizing card discard and high-clash tools.' },
  { key: 'MultiCrack Office', match: /multicrack/i, desc: 'Charge battery specialists transferring Charge across teammates.' },
  { key: 'The Pequod', match: /pequod/i, desc: 'Obsessive whaling crew using Assist Attacks and Pride resonance.' },
  { key: 'Edgar Family / Wuthering Heights', match: /edgar|wuthering heights|wild hunt/i, desc: 'Estate personnel and mourners wielding Sinking and Gloom.' },
  { key: 'Haute Couture', match: /haute couture/i, desc: 'High fashion combatants spending HP for Pulsation and Changing Room.' },
  { key: 'Lobotomy E.G.O', match: /lobotomy e\.g\.o/i, desc: 'Extractors synchronized with Abnormality E.G.O gear.' }
];

export function getIdentityAffiliation(name) {
  if (!name) return 'Independent Fixer';
  for (const rule of AFFILIATION_RULES) {
    if (rule.match.test(name)) return rule.key;
  }
  return 'Independent Fixer';
}

export function detectSynergyPairs(team = []) {
  const pairs = [];
  const names = team.map(t => t.name || '');

  const has = (query) => names.some(n => n.toLowerCase().includes(query.toLowerCase()));

  // N Sinclair + N Faust
  if (has('The One Who Shall Grip Sinclair') && has('The One Who Grips Faust')) {
    pairs.push({
      title: 'Inquisitor Vanguard',
      duo: ['The One Who Shall Grip Sinclair', 'The One Who Grips Faust'],
      tag: 'N Corp / Lust Reson',
      desc: 'Faust provides Gaze (+20% Blunt/Pierce taken) and Lust resonance without over-healing Sinclair out of his negative sanity sweet spot.'
    });
  }

  // Spicebush + Wild Hunt / Dieci Rodion
  if (has('Spicebush Yi Sang') && (has('Wild Hunt Heathcliff') || has('Dieci Assoc. South Section 4 Rodion'))) {
    pairs.push({
      title: 'Sinking Deluge Detonation',
      duo: ['Spicebush Yi Sang', has('Wild Hunt Heathcliff') ? 'Wild Hunt Heathcliff' : 'Dieci Rodion'],
      tag: 'Sinking Nuke',
      desc: 'Allies stack massive Sinking Potency and Count, which Spicebush detonates instantly with Skill 3 (Potency × Count = pure Gloom damage)!'
    });
  }

  // Blade Lineage Mentor Meursault + BL
  if (has('Blade Lineage Mentor Meursault')) {
    const blCount = team.filter(t => (t.name || '').includes('Blade Lineage')).length;
    if (blCount >= 2) {
      pairs.push({
        title: 'Swordplay of the Homeland',
        duo: ['Blade Lineage Mentor Meursault', `${blCount} Blade Lineage Allies`],
        tag: 'Poise & Slash Aura',
        desc: `Meursault provides team-wide Poise Potency/Count and Slash Power Up to ${blCount} Blade Lineage Sinners on critical hits.`
      });
    }
  }

  // Captain Ishmael + High DPS
  if (has('The Pequod Captain Ishmael') && team.length >= 2) {
    pairs.push({
      title: 'Captain\'s Assist Command',
      duo: ['The Pequod Captain Ishmael', 'Highest DPS Ally'],
      tag: 'Double Action Economy',
      desc: 'Captain Ishmael\'s Skill 2 commands your strongest damage dealer to immediately strike the same target for double damage.'
    });
  }

  // MultiCrack Faust + W Corp
  if (has('MultiCrack Office Rep Faust') && (has('W Corp. L3 Cleanup Agent Ryōshū') || has('W Corp. L3 Cleanup Agent Don Quixote'))) {
    pairs.push({
      title: 'Charge Battery Transfer',
      duo: ['MultiCrack Office Rep Faust', has('W Corp. L3 Cleanup Agent Ryōshū') ? 'W Corp. Ryōshū' : 'W Corp. Don Quixote'],
      tag: 'Instant S3 Priming',
      desc: 'Faust transfers Charge count directly to W Corp nukers, enabling Turn 2 Rip Space and D.D.E.D.R. without setup delays.'
    });
  }

  // T Corp Don + Tremor Allies
  if (has('T Corp. Class 3 Collection Staff Don Quixote') && team.length >= 2) {
    pairs.push({
      title: 'Time Moratorium Storage',
      duo: ['T Corp. Don Quixote', 'Fielded Team'],
      tag: 'Damage Stasis Detonation',
      desc: 'Don stores 100% of damage dealt during the moratorium turn, then detonates all stored damage at once with a +30% to +50% multiplier.'
    });
  }

  // La Manchaland Don + Bloodfiends
  if (has('The Manager of La Manchaland Don Quixote')) {
    const bfCount = team.filter(t => (t.name || '').includes('La Manchaland')).length;
    if (bfCount >= 2) {
      pairs.push({
        title: 'Shared Bloodfeast Reservoir',
        duo: ['The Manager of La Manchaland Don Quixote', `${bfCount} Bloodfiends`],
        tag: 'Vampiric Empower',
        desc: `All ${bfCount} Bloodfiends harvest battlefield Bleed damage into a shared Bloodfeast pool to fuel feral multi-coin skills.`
      });
    }
  }

  // The Ring Yi Sang + Multi-Debuffers
  if (has('The Ring Pointillist Student Yi Sang') && team.length >= 2) {
    pairs.push({
      title: 'Debuff Roulette & Coin Re-Use',
      duo: ['The Ring Pointillist Student Yi Sang', 'Multi-Status Squad'],
      tag: 'Coin Re-Use Grinder',
      desc: 'When attacking any target with 3+ distinct negative status effects, Yi Sang rolls bonus Coin Power and re-uses Skill 2 coins.'
    });
  }

  return pairs;
}

// Team Synergy Analysis Engine for Deck Builder
export function analyzeTeamSynergy(identitiesList = []) {
  const valid = (identitiesList || []).filter(Boolean);
  
  const sinCounts = { Wrath: 0, Lust: 0, Sloth: 0, Gluttony: 0, Gloom: 0, Pride: 0, Envy: 0 };
  const attackCounts = { Slash: 0, Pierce: 0, Blunt: 0 };
  const keywordCounts = { Burn: 0, Bleed: 0, Tremor: 0, Rupture: 0, Sinking: 0, Poise: 0, Charge: 0 };
  const affiliationMap = {};

  valid.forEach(id => {
    // Skills
    (id.skills || []).forEach(s => {
      if (s.affinity && sinCounts[s.affinity] !== undefined) sinCounts[s.affinity]++;
      if (s.type && attackCounts[s.type] !== undefined) attackCounts[s.type]++;
    });
    // Defense
    if (id.defense && id.defense.affinity && sinCounts[id.defense.affinity] !== undefined) {
      sinCounts[id.defense.affinity]++;
    }

    // Keywords
    const kws = detectKeywords(id);
    kws.forEach(k => {
      if (keywordCounts[k] !== undefined) keywordCounts[k]++;
    });

    // Affiliations
    const aff = getIdentityAffiliation(id.name);
    if (!affiliationMap[aff]) {
      const rule = AFFILIATION_RULES.find(r => r.key === aff);
      affiliationMap[aff] = {
        name: aff,
        count: 0,
        desc: rule?.desc || 'Independent operations.',
        members: []
      };
    }
    affiliationMap[aff].count++;
    affiliationMap[aff].members.push(id.name);
  });

  const highResonances = Object.entries(sinCounts)
    .filter(([_, count]) => count >= 4)
    .map(([sin, count]) => ({ sin, count }));

  const sortedKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]);
  const dominantKeyword = sortedKeywords[0] && sortedKeywords[0][1] >= 3 ? sortedKeywords[0] : null;

  const activeAffiliations = Object.values(affiliationMap)
    .filter(a => a.name !== 'Independent Fixer' && a.count >= 1)
    .sort((a, b) => b.count - a.count);

  const synergyPairs = detectSynergyPairs(valid);

  return {
    totalMembers: valid.length,
    sinCounts,
    attackCounts,
    keywordCounts,
    highResonances,
    dominantKeyword,
    activeAffiliations,
    synergyPairs
  };
}
