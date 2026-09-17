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
const MECHANICS_DICTIONARY = [
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
    key: 'bloodfeast',
    title: 'Bloodfeast (Bloodfiends)',
    badge: 'Vampiric Stockpile',
    trigger: 'Any unit on the field taking Bleed damage',
    explanation: 'Accumulated when any unit bleeds. Consumed to empower high-tier Bloodfiend skills, increase coin power, and heal HP.'
  },
  {
    key: 'ammo',
    title: 'Ammo Management (R Corp / LCCB)',
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
  }
];

// Curated high-complexity identities
const CURATED_TACTICS = {
  'Haute Couture::Boutique du Rouge Ishmael': {
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
      bestPartners: ['Haute Couture Le Noir Footwear Hall Ryōshū', 'The Ring Pointillist Student Yi Sang', 'The Pequod Captain Ishmael'],
      tip: 'Pairs excellently with other Rouge and Bleed identities that leverage Lust resonance and capitalize on high Bleed count.'
    }
  },
  'The House of Spiders: The Index Nursefather Yi Sang': {
    archetype: 'Prescript Duelist & 9-Coin Finisher',
    primaryKeywords: ['Poise', 'Sinking'],
    role: 'Scaling Boss Duelist / Stagger Wall',
    uniqueMechanics: [
      {
        title: 'Grace of the Prescript & The Prescript Target',
        badge: 'Core Engine',
        explanation: 'Every turn, a random enemy or part receives "The Prescript\'s Target". Using a prescript-marked skill on that exact target executes the prescript, healing 8 SP and granting 3 Grace of the Prescript (at 3/6/9 Grace, Yi Sang unlocks higher power stages).'
      },
      {
        title: 'Unlock Stages & Unbreakable Coins',
        badge: 'Scaling',
        explanation: 'At Unlock I, II, and III, your skills turn regular coins into Unbreakable Coins (they cannot break in clashes and always deal damage), while permanently nullifying Karmic Consequence penalties.'
      },
      {
        title: 'Wound-casing Mask (Free Stagger Reset)',
        badge: 'Survival',
        explanation: 'If Yi Sang is staggered for the first time in an encounter, he instantly breaks out of stagger at the end of the turn and fully recovers.'
      },
      {
        title: 'Furioso-Replica (9-Coin Apocalyptic Burst)',
        badge: 'Win Condition',
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
      bestPartners: ['The Index Proxy Don Quixote', 'Blade Lineage Mentor Meursault', 'Solemn Lament Yi Sang', 'Butler Outis'],
      tip: 'Pairs best with Pride and Gluttony resonance teams to trigger his passives and empower his Unbreakable Coins.'
    }
  },

  'The Ring Pointillist Student Yi Sang': {
    archetype: 'Debuff Roulette & Coin-Reuse Assassin',
    primaryKeywords: ['Bleed', 'Tremor'],
    role: 'Multi-Debuff Hypercarry',
    uniqueMechanics: [
      {
        title: 'Random Debuff Roulette',
        badge: 'Setup',
        explanation: 'Every attack inflicts random status ailments (Bleed, Tremor, Burn, Sinking, or Rupture) on the target in addition to baseline Bleed.'
      },
      {
        title: 'Skill 2 Coin Re-Use (The Meat Grinder)',
        badge: 'Win Condition',
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
      bestPartners: ['The Ring Pointillist Student Outis', 'The Pequod Captain Ishmael', 'Harpooner Heathcliff', 'Kurokumo Ryōshū'],
      tip: 'Combine with teammates that inflict different status types to keep the 3+ distinct debuff threshold active permanently.'
    }
  },

  'Blade Lineage Mentor Meursault': {
    archetype: 'Slash & Pride Commander / Counter God',
    primaryKeywords: ['Poise'],
    role: 'Team Poise Buffer & Retaliation Nuke',
    uniqueMechanics: [
      {
        title: 'Swordplay of the Homeland',
        badge: 'Team Aura',
        explanation: 'Grants massive Poise Potency/Count and Slash Power Up to all Blade Lineage allies, turning an entire BL squad into critical-hit monsters.'
      },
      {
        title: 'Yield My Flesh ➔ To Claim Their Bones',
        badge: 'Gimmick',
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
      bestPartners: ['Blade Lineage Salsu Faust', 'Blade Lineage Salsu Yi Sang', 'Blade Lineage Salsu Don Quixote', 'Cinq Sinclair'],
      tip: 'Stack Pride skills across your team to maximize Sword of the Homeland buffs.'
    }
  },

  'Wild Hunt Heathcliff': {
    archetype: 'Mounted Sinking Juggernaut',
    primaryKeywords: ['Sinking', 'Tremor'],
    role: 'Sinking Burst & Boss Obliteration',
    uniqueMechanics: [
      {
        title: 'Mounting Dullahan',
        badge: 'Mode Shift',
        explanation: 'Summoning his spectral steed Dullahan grants high Speed, Clash Power, and transforms his standard skills into sweeping multi-target cleaves.'
      },
      {
        title: 'Coffin & Sinking Conversion',
        badge: 'Scaling',
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
      bestPartners: ['Spicebush Yi Sang', 'Dieci Assoc. Rodion', 'Molar Boatworks Ishmael', 'Butler Faust'],
      tip: 'Essential centerpiece for Sinking Deluge and high-tier Sinking dungeon comps.'
    }
  },

  'Lobotomy E.G.O::Solemn Lament Yi Sang': {
    archetype: 'Dual-Wield Gunner / Sinking & Poise Duelist',
    primaryKeywords: ['Sinking', 'Poise'],
    role: 'Long-Range Sinking Stacker & Crit Finisher',
    uniqueMechanics: [
      {
        title: 'Living & Departed Butterflies',
        badge: 'Gimmick',
        explanation: 'Fires twin pistols: white rounds accumulate Poise and inflict Sinking count, while black rounds expend butterflies to deal bonus damage on critical strikes.'
      },
      {
        title: 'Multi-Coin Ranged Salvos',
        badge: 'DPS',
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
      bestPartners: ['Wild Hunt Heathcliff', 'Spicebush Yi Sang', 'Dieci Hong Lu', 'Edgar Chief Butler Ryōshū'],
      tip: 'Excels in hybrid Poise-Sinking compositions.'
    }
  },

  'The Pequod Captain Ishmael': {
    archetype: 'Pride Commander & Assist Attack Facilitator',
    primaryKeywords: ['Bleed', 'Burn', 'Poise'],
    role: 'Offensive Buffer & Extra Actions',
    uniqueMechanics: [
      {
        title: 'Assist Attack Order',
        badge: 'Team Action',
        explanation: 'Skill 2 commands the ally with the highest damage or specific priority to immediately launch an Assist Attack on her target, doubling your action economy!'
      },
      {
        title: 'Obsessive Execution & SP Recovery',
        badge: 'Morale',
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
      bestPartners: ['The Pequod First Mate Yi Sang', 'Harpooner Heathcliff', 'Blade Lineage Meursault', 'Ring Yi Sang'],
      tip: 'One of the best buffers in the game. Position your highest single-target DPS right next to her.'
    }
  },

  'Dawn Office Fixer Sinclair': {
    archetype: 'SP-Fueled Fire Hypercarry',
    primaryKeywords: ['Burn'],
    role: 'Burn Burst & E.G.O Transformed Finisher',
    uniqueMechanics: [
      {
        title: 'E.G.O Manifestation: Volatile Wax',
        badge: 'Transformation',
        explanation: 'Reaching 40+ SP transforms Sinclair into his E.G.O state, turning his skills into 4-coin flaming cleaves with overwhelming clash power.'
      },
      {
        title: 'Sanity Drain Management',
        badge: 'Caution',
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
      bestPartners: ['Liu Assoc. South Section 4 Rodion', 'Liu Assoc. South Section 4 Ryōshū', 'Liu Assoc. South Section 3 Meursault', 'Magic Bullet Outis'],
      tip: 'Needs SP support (e.g. Faust\'s Fluid Sac or Hong Lu\'s Land of Illusion) to sustain his fiery transformation.'
    }
  },

  'Devyat Assoc. North Section 3 Courier Rodion': {
    archetype: 'High-Velocity Rupture Courier',
    primaryKeywords: ['Rupture'],
    role: 'Rupture Potency & Count Enabler',
    uniqueMechanics: [
      {
        title: 'Courier Trunk & Velocity Scaling',
        badge: 'Speed Engine',
        explanation: 'Gains speed each turn to build "Delivery Distance". High delivery speed empowers her skills with positive Rupture Count, fixing Rupture\'s biggest weakness!'
      },
      {
        title: 'Package Delivery (S3 Burst)',
        badge: 'Finisher',
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
      bestPartners: ['W Corp. Yi Sang', 'Seven Assoc. South Section 6 Faust', 'K Corp. Class 3 Security Hong Lu', 'Rosespanner Gregor'],
      tip: 'The gold standard for Rupture teams because she preserves Count instead of consuming it.'
    }
  },

  'Multicrack Office Rep Faust': {
    archetype: 'Charge Battery & Team Redistribution',
    primaryKeywords: ['Charge'],
    role: 'Charge Buffer & Clash Anchor',
    uniqueMechanics: [
      {
        title: 'Charge Transfer & Multi-Discharge',
        badge: 'Battery',
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

  'W Corp. L3 Cleanup Agent Ryōshū': {
    archetype: 'Charge Hypercarry & Dimensional Finisher',
    primaryKeywords: ['Charge'],
    role: 'Nuclear Slash Finisher',
    uniqueMechanics: [
      {
        title: 'D.D.E.D.R. (Dimension Shredder)',
        badge: 'Nuclear Finisher',
        explanation: 'Skill 3 requires 15 Charge count. If used at 15+ Charge, it unleashes 4 devastating Slash coins that hit for hundreds of damage. If used below 15 Charge, she suffers severe self-HP recoil!'
      }
    ],
    combatRotation: {
      opener: 'Never use S3 on Turn 1 or below 15 Charge! Use S1 and S2 to steadily stack Charge.',
      midGame: 'Use Defense or S2 to reach 15+ Charge count safely.',
      finisher: 'Once at 15+ Charge, fire D.D.E.D.R. at the boss or staggered target for an instant kill.'
    },
    teamSynergies: {
      keywords: ['Charge', 'Slash'],
      bestPartners: ['Multicrack Faust', 'W Corp. Don Quixote', 'W Corp. Yi Sang', 'R Corp. Heathcliff'],
      tip: 'Always pair with Charge batteries to unlock D.D.E.D.R. as fast as possible.'
    }
  }
};

// Universal analyzer that produces in-depth, specific tactical dossiers for ALL identities
export function getIdentityTactics(identity) {
  if (!identity) return null;

  // Curated table priority
  if (CURATED_TACTICS[identity.name]) {
    return {
      ...CURATED_TACTICS[identity.name],
      name: identity.name,
      sinner: identity.sinner,
      rarity: identity.rarity,
      isCurated: true,
      skillsTactical: extractSkillsTactical(identity)
    };
  }

  // Universal In-Depth Extraction
  const detectedKeywords = detectKeywords(identity);
  const skillsTactical = extractSkillsTactical(identity);
  const detectedMechanics = detectUniqueMechanics(identity, detectedKeywords);
  const primaryRole = determineRole(identity, detectedKeywords, skillsTactical);
  const archetype = determineArchetype(identity, detectedKeywords);
  const combatRotation = generateDynamicRotation(identity, skillsTactical, detectedKeywords);
  const teamSynergies = generateTeamSynergies(identity, detectedKeywords);

  return {
    name: identity.name,
    sinner: identity.sinner,
    rarity: identity.rarity,
    isCurated: false,
    archetype,
    primaryKeywords: detectedKeywords.length > 0 ? detectedKeywords : ['Direct Combat'],
    role: primaryRole,
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
    const reg = new RegExp(`\\b${kw}\\b`, 'i');
    if (reg.test(text)) found.push(kw);
  }
  return found;
}

function detectUniqueMechanics(identity, keywords) {
  const text = JSON.stringify([
    identity.skills || [],
    identity.passives || [],
    identity.defense || {},
    identity.alternateSkills || []
  ]).toLowerCase();

  const matched = [];

  for (const mech of MECHANICS_DICTIONARY) {
    if (text.includes(mech.key)) {
      matched.push(mech);
    }
  }

  // Baseline fallbacks if no named faction mechanics matched
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

function extractSkillsTactical(identity) {
  const skills = identity.skills || [];
  return skills.map((s, idx) => {
    const base = s.basePower || 0;
    const coin = s.coinPower || 0;
    const count = s.coins || 1;
    const maxPower = base + (coin * count);
    
    let roleTag = '🔄 Setup';
    if (idx === 2) {
      roleTag = maxPower >= 18 ? '💥 Nuclear Finisher' : '💥 Burst Finisher';
    } else if (maxPower >= 15 || coin >= 4) {
      roleTag = '🎯 Clash Anchor';
    } else if (idx === 1) {
      roleTag = '⚡ Status Engine';
    }

    const effStr = Array.isArray(s.effects) ? s.effects.join(' ') : (s.effects || '');
    let tacticalSummary = `Solid ${s.type || ''} attack with max clash of ${maxPower}.`;
    if (effStr.includes('Count')) tacticalSummary = `Applies key status Count to keep your team's debuffs active.`;
    else if (effStr.includes('Critical') || effStr.includes('Poise')) tacticalSummary = 'Builds Poise or scores high critical hit damage.';
    else if (effStr.includes('Tremor-Burst')) tacticalSummary = 'Triggers Tremor-Burst to immediately advance enemy stagger.';
    else if (effStr.includes('Damage') && effStr.includes('+')) tacticalSummary = 'Conditional high-damage coin scaling with active battle status.';
    else if (maxPower >= 16) tacticalSummary = 'High-power clashing tool for winning difficult head-to-heads.';

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

function determineRole(identity, keywords, skillsTactical) {
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

function determineArchetype(identity, keywords) {
  const name = identity.name || '';
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
  
  if (keywords.length >= 2) return `${keywords[0]} & ${keywords[1]} Hybrid`;
  if (keywords.length === 1) return `Dedicated ${keywords[0]} Specialist`;
  return 'General Combat Vanguard';
}

function generateDynamicRotation(identity, skillsTactical, keywords) {
  const s1 = skillsTactical[0];
  const s2 = skillsTactical[1];
  const s3 = skillsTactical[2];

  return {
    opener: `Open with ${s1?.name || 'Skill 1'} (Max roll ${s1?.maxPower || 11}) to build early Sanity and establish ${keywords[0] || 'combat presence'}.`,
    midGame: `Use ${s2?.name || 'Skill 2'} (Max roll ${s2?.maxPower || 15}) to win clashes and stack key ${keywords.join('/') || 'status'} conditions.`,
    finisher: `Unleash ${s3?.name || 'Skill 3'} (${s3?.roleTag || 'Finisher'}, Max roll ${s3?.maxPower || 18}) once conditions are met to stagger or eliminate the target.`
  };
}

function generateTeamSynergies(identity, keywords) {
  const name = identity.name || '';
  const partners = [];

  // Faction partner synergies
  if (name.includes('Blade Lineage')) partners.push('Blade Lineage Mentor Meursault', 'Blade Lineage Faust', 'Blade Lineage Yi Sang');
  else if (name.includes('Liu')) partners.push('Liu Assoc. Ryōshū', 'Liu Assoc. Rodion', 'Dawn Office Sinclair');
  else if (name.includes('Dieci')) partners.push('Dieci Rodion', 'Dieci Yi Sang', 'Dieci Hong Lu');
  else if (name.includes('W Corp')) partners.push('W Corp. Ryōshū', 'W Corp. Don Quixote', 'Multicrack Faust');
  else if (name.includes('The Index')) partners.push('The Index Nursefather Yi Sang', 'The Index Proxy Don Quixote');
  else if (name.includes('Kurokumo')) partners.push('Kurokumo Ryōshū', 'Kurokumo Hong Lu', 'Kurokumo Rodion');
  else if (name.includes('Pequod')) partners.push('The Pequod Captain Ishmael', 'The Pequod First Mate Yi Sang', 'The Pequod Harpooner Heathcliff');
  else if (name.includes('Seven')) partners.push('Seven Assoc. Faust', 'Seven Assoc. Heathcliff', 'Seven Assoc. Outis');
  else if (name.includes('Cinq')) partners.push('Cinq Assoc. Sinclair', 'Cinq Assoc. Outis', 'Cinq Assoc. Don Quixote');
  else if (name.includes('Devyat')) partners.push('Devyat Assoc. Rodion', 'Devyat Assoc. Sinclair');

  // Keyword partner fallbacks
  if (partners.length === 0) {
    if (keywords.includes('Bleed')) partners.push('The Ring Pointillist Student Yi Sang', 'The Pequod Captain Ishmael', 'Kurokumo Ryōshū');
    else if (keywords.includes('Burn')) partners.push('Dawn Office Fixer Sinclair', 'Liu Assoc. Rodion', 'Liu Assoc. Ryōshū');
    else if (keywords.includes('Tremor')) partners.push('T Corp. Don Quixote', 'Oufi Assoc. Heathcliff', 'Yurodivy Hong Lu');
    else if (keywords.includes('Rupture')) partners.push('Devyat Assoc. Rodion', 'W Corp. Yi Sang', 'Seven Assoc. Faust');
    else if (keywords.includes('Sinking')) partners.push('Wild Hunt Heathcliff', 'Solemn Lament Yi Sang', 'Spicebush Yi Sang');
    else if (keywords.includes('Poise')) partners.push('Blade Lineage Mentor Meursault', 'Cinq Assoc. Sinclair', 'Pequod Yi Sang');
    else if (keywords.includes('Charge')) partners.push('W Corp. Ryōshū', 'W Corp. Don Quixote', 'Multicrack Faust');
    else partners.push('High-clash Sinner identities matching your Sin affinities');
  }

  let tip = 'Versatile identity that slots comfortably into any standard story or dungeon lineup.';
  if (keywords.length > 0) {
    tip = `Synergizes heavily with ${keywords.join('/')} compositions to maintain count and trigger maximum coin damage multipliers.`;
  }

  return {
    keywords,
    bestPartners: partners.slice(0, 4),
    tip
  };
}

// Team Synergy Analysis Engine for Deck Builder
export function analyzeTeamSynergy(identitiesList = []) {
  const valid = (identitiesList || []).filter(Boolean);
  
  const sinCounts = { Wrath: 0, Lust: 0, Sloth: 0, Gluttony: 0, Gloom: 0, Pride: 0, Envy: 0 };
  const attackCounts = { Slash: 0, Pierce: 0, Blunt: 0 };
  const keywordCounts = { Burn: 0, Bleed: 0, Tremor: 0, Rupture: 0, Sinking: 0, Poise: 0, Charge: 0 };
  const factionCounts = {};

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

    // Factions
    const name = id.name || '';
    const factions = ['Liu', 'Blade Lineage', 'Dieci', 'The Index', 'W Corp', 'Kurokumo', 'Seven', 'Shi', 'N Corp', 'Devyat', 'Heishou', 'Cinq', 'Pequod', 'T Corp', 'Rosespanner', 'Middle', 'Ring'];
    factions.forEach(f => {
      if (name.includes(f)) {
        factionCounts[f] = (factionCounts[f] || 0) + 1;
      }
    });
  });

  const highResonances = Object.entries(sinCounts)
    .filter(([_, count]) => count >= 4)
    .map(([sin, count]) => ({ sin, count }));

  const sortedKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]);
  const dominantKeyword = sortedKeywords[0] && sortedKeywords[0][1] >= 3 ? sortedKeywords[0] : null;

  const activeFactions = Object.entries(factionCounts)
    .filter(([_, c]) => c >= 2)
    .map(([faction, count]) => ({ faction, count }));

  return {
    totalMembers: valid.length,
    sinCounts,
    attackCounts,
    keywordCounts,
    highResonances,
    dominantKeyword,
    activeFactions
  };
}
