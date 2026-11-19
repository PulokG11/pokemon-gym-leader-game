import type { GymType } from '../types/game'

export type RegionId = 'kanto'

/** How a trainer's Pokémon are built: moves, held items and training grow with each tier. */
export type Tier = 'regular' | 'strong' | 'elite' | 'champion'

export interface RegionMon {
  species: string      // dex id, or RIVAL_STARTER for the Champion's counter to your starter
  level: number
  item?: string
}

export interface RegionTrainer {
  name: string
  title: 'Gym Leader' | 'Elite Four' | 'Champion'
  place: string
  badge?: string
  type: GymType           // specialty type, also the arena
  sprite: string          // Pokémon Showdown trainer sprite id
  tier: Tier
  team: RegionMon[]       // ace last
  quote: string
  defeat: string
}

export interface Region {
  id: RegionId
  name: string
  available: boolean
  playerSprite: string
  starters: string[]
  startLevel: number
  /** Mega Stones that can turn up as rewards here. */
  megaStones: string[]
  trainers: RegionTrainer[]
}

/** Stand-in for the Champion's starter: the final form that beats the player's starter. */
export const RIVAL_STARTER = 'rival-starter'

/** Which final-stage starter the rival picks against yours. */
export const RIVAL_COUNTER: Record<string, { species: string; item: string }> = {
  bulbasaur: { species: 'charizard', item: 'Charizardite Y' },
  charmander: { species: 'blastoise', item: 'Blastoisinite' },
  squirtle: { species: 'venusaur', item: 'Venusaurite' },
}

const KANTO: Region = {
  id: 'kanto',
  name: 'Kanto',
  available: true,
  playerSprite: 'red',
  starters: ['bulbasaur', 'charmander', 'squirtle'],
  startLevel: 11,
  megaStones: [
    'Venusaurite', 'Charizardite X', 'Charizardite Y', 'Blastoisinite', 'Beedrillite', 'Pidgeotite', 'Alakazite',
    'Slowbronite', 'Gengarite', 'Kangaskhanite', 'Pinsirite', 'Gyaradosite', 'Aerodactylite',
  ],
  trainers: [
    {
      name: 'Brock', title: 'Gym Leader', place: 'Pewter City Gym', badge: 'Boulder Badge', type: 'rock', sprite: 'brock', tier: 'regular',
      team: [{ species: 'geodude', level: 12 }, { species: 'kabuto', level: 13 }, { species: 'onix', level: 14 }],
      quote: 'My Rock Pokémon don’t budge. Let’s see if you can.', defeat: 'Solid work. The Boulder Badge is yours.',
    },
    {
      name: 'Misty', title: 'Gym Leader', place: 'Cerulean City Gym', badge: 'Cascade Badge', type: 'water', sprite: 'misty', tier: 'regular',
      team: [{ species: 'staryu', level: 18 }, { species: 'psyduck', level: 19 }, { species: 'starmie', level: 21 }],
      quote: 'Ready to get soaked? My Water Pokémon go all out!', defeat: 'Wow, you’re tough. Take the Cascade Badge.',
    },
    {
      name: 'Lt. Surge', title: 'Gym Leader', place: 'Vermilion City Gym', badge: 'Thunder Badge', type: 'electric', sprite: 'ltsurge', tier: 'regular',
      team: [{ species: 'voltorb', level: 21 }, { species: 'pikachu', level: 22 }, { species: 'magnemite', level: 22 }, { species: 'raichu', level: 24 }],
      quote: 'Electric Pokémon won me every battle out there. You’re next!', defeat: 'You’ve got a real spark. The Thunder Badge is yours!',
    },
    {
      name: 'Erika', title: 'Gym Leader', place: 'Celadon City Gym', badge: 'Rainbow Badge', type: 'grass', sprite: 'erika', tier: 'regular',
      team: [{ species: 'weepinbell', level: 27 }, { species: 'tangela', level: 28 }, { species: 'gloom', level: 28 }, { species: 'vileplume', level: 30 }],
      quote: 'My Grass Pokémon bloom brightest in battle. Shall we begin?', defeat: 'A lovely battle. Please accept the Rainbow Badge.',
    },
    {
      name: 'Koga', title: 'Gym Leader', place: 'Fuchsia City Gym', badge: 'Soul Badge', type: 'poison', sprite: 'koga', tier: 'strong',
      team: [{ species: 'koffing', level: 37 }, { species: 'grimer', level: 38 }, { species: 'venomoth', level: 39 }, { species: 'muk', level: 40 }, { species: 'weezing', level: 43 }],
      quote: 'Poison wears down even the strongest. Watch closely.', defeat: 'You saw through my tricks. The Soul Badge is yours.',
    },
    {
      name: 'Sabrina', title: 'Gym Leader', place: 'Saffron City Gym', badge: 'Marsh Badge', type: 'psychic', sprite: 'sabrina', tier: 'strong',
      team: [{ species: 'kadabra', level: 38 }, { species: 'mrmime', level: 40 }, { species: 'hypno', level: 41 }, { species: 'slowbro', level: 42 }, { species: 'alakazam', level: 43 }],
      quote: 'I already know how this battle ends. Do you?', defeat: 'I didn’t foresee this. Take the Marsh Badge.',
    },
    {
      name: 'Blaine', title: 'Gym Leader', place: 'Cinnabar Island Gym', badge: 'Volcano Badge', type: 'fire', sprite: 'blaine', tier: 'strong',
      team: [{ species: 'growlithe', level: 42 }, { species: 'ponyta', level: 42 }, { species: 'ninetales', level: 44 }, { species: 'magmar', level: 45 }, { species: 'rapidash', level: 45 }, { species: 'arcanine', level: 47 }],
      quote: 'Hah! I hope you brought Burn Heal. My Fire Pokémon run hot!', defeat: 'You put out my fire! The Volcano Badge is yours.',
    },
    {
      name: 'Giovanni', title: 'Gym Leader', place: 'Viridian City Gym', badge: 'Earth Badge', type: 'ground', sprite: 'giovanni', tier: 'strong',
      team: [{ species: 'dugtrio', level: 45 }, { species: 'marowak', level: 46 }, { species: 'rhyhorn', level: 46 }, { species: 'nidoqueen', level: 47 }, { species: 'nidoking', level: 48 }, { species: 'rhydon', level: 50 }],
      quote: 'The last badge is mine to give. You’ll have to take it.', defeat: 'Hmph. You’ve earned the Earth Badge. The League awaits.',
    },
    {
      name: 'Lorelei', title: 'Elite Four', place: 'Indigo Plateau', type: 'ice', sprite: 'lorelei-lgpe', tier: 'elite',
      team: [{ species: 'dewgong', level: 52 }, { species: 'cloyster', level: 52 }, { species: 'slowbro', level: 53 }, { species: 'golduck', level: 53 }, { species: 'jynx', level: 54 }, { species: 'lapras', level: 56 }],
      quote: 'Welcome to the Pokémon League. My Ice Pokémon will freeze you in place.', defeat: 'You thawed every one of them. Go on.',
    },
    {
      name: 'Bruno', title: 'Elite Four', place: 'Indigo Plateau', type: 'fighting', sprite: 'bruno', tier: 'elite',
      team: [{ species: 'onix', level: 53 }, { species: 'hitmonchan', level: 55 }, { species: 'hitmonlee', level: 55 }, { species: 'primeape', level: 56 }, { species: 'poliwrath', level: 56 }, { species: 'machamp', level: 58 }],
      quote: 'We train our bodies to the limit. Hoo hah!', defeat: 'My muscles weren’t enough. Move on.',
    },
    {
      name: 'Agatha', title: 'Elite Four', place: 'Indigo Plateau', type: 'ghost', sprite: 'agatha-lgpe', tier: 'elite',
      team: [{ species: 'haunter', level: 56 }, { species: 'golbat', level: 56 }, { species: 'arbok', level: 57 }, { species: 'muk', level: 57 }, { species: 'weezing', level: 58 }, { species: 'gengar', level: 60 }],
      quote: 'I’ve battled for longer than you’ve been alive. Let me show you why.', defeat: 'Hmph, not bad, youngster. Not bad at all.',
    },
    {
      name: 'Lance', title: 'Elite Four', place: 'Indigo Plateau', type: 'dragon', sprite: 'lance', tier: 'elite',
      team: [{ species: 'seadra', level: 57 }, { species: 'dragonair', level: 58 }, { species: 'gyarados', level: 58 }, { species: 'aerodactyl', level: 60 }, { species: 'charizard', level: 60 }, { species: 'dragonite', level: 62 }],
      quote: 'Dragons are mighty and nearly unstoppable. Prove me wrong.', defeat: 'You’re stronger than my dragons. The Champion is waiting.',
    },
    {
      name: 'Blue', title: 'Champion', place: 'Indigo Plateau', type: 'normal', sprite: 'blue', tier: 'champion',
      team: [
        { species: 'pidgeot', level: 61, item: 'Life Orb' }, { species: 'alakazam', level: 62, item: 'Focus Sash' },
        { species: 'rhydon', level: 62, item: 'Leftovers' }, { species: 'dragonite', level: 63, item: 'Lum Berry' },
        { species: 'zapdos', level: 64, item: 'Leftovers' }, { species: RIVAL_STARTER, level: 65 },
      ],
      quote: 'I beat the League before you got here. Now I’m the Champion, and I picked my team to beat yours.', defeat: 'What? I lost? …Fine. You’re the Champion now.',
    },
  ],
}

const COMING_SOON = (id: string, name: string) => ({ id, name })

export const REGIONS: Record<RegionId, Region> = { kanto: KANTO }

/** Regions shown on the picker; only Kanto is playable so far. */
export const REGION_LIST: { id: string; name: string; available: boolean }[] = [
  { id: 'kanto', name: 'Kanto', available: true },
  ...[['johto', 'Johto'], ['hoenn', 'Hoenn'], ['sinnoh', 'Sinnoh'], ['unova', 'Unova'], ['kalos', 'Kalos'], ['alola', 'Alola'], ['galar', 'Galar'], ['paldea', 'Paldea']]
    .map(([id, name]) => ({ ...COMING_SOON(id, name), available: false })),
]

export const regionOf = (id: RegionId | undefined) => REGIONS[id ?? 'kanto']

/** Highest level on the next trainer's team: the level cap for XP. */
export const levelCapFor = (region: Region, index: number) =>
  Math.max(...region.trainers[Math.min(index, region.trainers.length - 1)].team.map(m => m.level))
