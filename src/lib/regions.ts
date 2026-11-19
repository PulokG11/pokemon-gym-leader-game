import type { GymType } from '../types/game'

export type RegionId = 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova' | 'kalos' | 'alola' | 'galar' | 'paldea'

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
  /** Shown instead of "Leader X" / "Elite Four X", e.g. "Captain Ilima" in Alola. */
  display?: string
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
  /** Z-Crystals as rewards, and Z-Moves in battle (Alola). */
  zCrystals?: boolean
  /** What the 8 early wins are called: badges, or trials in Alola. */
  badgeNoun?: string
  /** The Champion's starter that beats yours, if the Champion uses one. */
  rivalCounter?: Record<string, { species: string; item: string }>
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
  rivalCounter: RIVAL_COUNTER,
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

// ─── Johto to Paldea ─────────────────────────────────────────────────────────
// Teams are listed ace last. Levels follow one curve for every region, so each
// region plays like Kanto: Gym 1 tops out at Lv 14, the Champion at Lv 65.

const ACE_LEVEL = [14, 21, 24, 30, 43, 43, 47, 50, 56, 58, 60, 62, 65]
const TIERS: Tier[] = ['regular', 'regular', 'regular', 'regular', 'strong', 'strong', 'strong', 'strong', 'elite', 'elite', 'elite', 'elite', 'champion']
const CHAMPION_ITEMS = ['Life Orb', 'Leftovers', 'Focus Sash', 'Lum Berry', 'Sitrus Berry']

type Row = [
  name: string, type: GymType, sprite: string, place: string, badge: string | undefined,
  team: string, quote: string, defeat: string, display?: string,
]

/** Builds 13 trainers (8 Gyms, 4 Elite Four or equivalents, Champion) from compact rows. */
function league(rows: Row[], aceItem?: string): RegionTrainer[] {
  return rows.map(([name, type, sprite, place, badge, team, quote, defeat, display], i) => {
    const species = team.split(' ')
    const ace = ACE_LEVEL[i]
    const title: RegionTrainer['title'] = i < 8 ? 'Gym Leader' : i < 12 ? 'Elite Four' : 'Champion'
    return {
      name, title, place, badge, type, sprite, tier: TIERS[i], quote, defeat, display,
      team: species.map((id, k) => {
        const level = Math.max(ace - 4, ace - (species.length - 1 - k))
        const last = k === species.length - 1
        const item = i === 12 ? (last ? aceItem : CHAMPION_ITEMS[k % CHAMPION_ITEMS.length]) : undefined
        return { species: id, level, ...(item ? { item } : {}) }
      }),
    }
  })
}

const JOHTO: Region = {
  id: 'johto', name: 'Johto', available: true, playerSprite: 'ethan',
  starters: ['chikorita', 'cyndaquil', 'totodile'], startLevel: 11, megaStones: [],
  trainers: league([
    ['Falkner', 'flying', 'falkner', 'Violet City Gym', 'Zephyr Badge', 'pidgey hoothoot pidgeotto', 'Bird Pokémon rule the skies. Let me show you.', 'Grounded… The Zephyr Badge is yours.'],
    ['Bugsy', 'bug', 'bugsy', 'Azalea Town Gym', 'Hive Badge', 'metapod kakuna scyther', 'I’ve studied Bug Pokémon more than anyone. Watch this.', 'Research isn’t everything, huh? Take the Hive Badge.'],
    ['Whitney', 'normal', 'whitney', 'Goldenrod City Gym', 'Plain Badge', 'clefairy aipom teddiursa miltank', 'Everyone was into Pokémon, so I got into them too!', 'Waaah… okay, okay, here’s the Plain Badge.'],
    ['Morty', 'ghost', 'morty', 'Ecruteak City Gym', 'Fog Badge', 'gastly misdreavus haunter gengar', 'I’ve trained here my whole life to see what others can’t.', 'You saw through the fog. The Fog Badge is yours.'],
    ['Chuck', 'fighting', 'chuck', 'Cianwood City Gym', 'Storm Badge', 'primeape hitmontop machoke heracross poliwrath', 'WAHAHAH! Training under a waterfall made us tough!', 'Wahah… You’re strong! Take the Storm Badge!'],
    ['Jasmine', 'steel', 'jasmine', 'Olivine City Gym', 'Mineral Badge', 'magnemite skarmory magneton forretress steelix', 'Steel Pokémon are hard, but kind. Please, battle me.', 'Well done… Here is the Mineral Badge.'],
    ['Pryce', 'ice', 'pryce', 'Mahogany Town Gym', 'Glacier Badge', 'seel swinub jynx dewgong lapras piloswine', 'Fifty years with Ice Pokémon. Let’s see your warmth.', 'You’ve thawed an old man. The Glacier Badge.'],
    ['Clair', 'dragon', 'clair', 'Blackthorn City Gym', 'Rising Badge', 'seadra gyarados dragonair charizard aerodactyl kingdra', 'I’m the world’s best Dragon master. Prove otherwise.', 'Fine… The Rising Badge is yours.'],
    ['Will', 'psychic', 'will', 'Indigo Plateau', undefined, 'girafarig jynx exeggutor slowbro espeon xatu', 'I trained all over the world to make my Psychic Pokémon powerful.', 'I can’t believe it… Go on ahead.'],
    ['Koga', 'poison', 'koga', 'Indigo Plateau', undefined, 'ariados forretress venomoth muk weezing crobat', 'I now serve the Elite Four. Fall to my poison.', 'My ninja techniques failed me. Move on.'],
    ['Bruno', 'fighting', 'bruno', 'Indigo Plateau', undefined, 'onix hitmontop hitmonlee hitmonchan steelix machamp', 'Our power is unmatched. Hoo hah!', 'Defeated by your power. Go!'],
    ['Karen', 'dark', 'karen', 'Indigo Plateau', undefined, 'sneasel vileplume murkrow gengar umbreon houndoom', 'Strong Pokémon, weak Pokémon… a trainer should play their favourites.', 'You’re strong. The Champion awaits.'],
    ['Lance', 'dragon', 'lance', 'Indigo Plateau', undefined, 'gyarados aerodactyl charizard tyranitar hooh dragonite', 'I’ve been waiting for you. Let’s settle who’s strongest.', 'You’re the new Johto Champion.'],
  ]),
}

const HOENN: Region = {
  id: 'hoenn', name: 'Hoenn', available: true, playerSprite: 'brendan',
  starters: ['treecko', 'torchic', 'mudkip'], startLevel: 11,
  megaStones: [
    'Sceptilite', 'Blazikenite', 'Swampertite', 'Gardevoirite', 'Galladite', 'Sablenite', 'Mawilite', 'Aggronite',
    'Medichamite', 'Manectite', 'Sharpedonite', 'Cameruptite', 'Altarianite', 'Banettite', 'Absolite', 'Glalitite',
    'Salamencite', 'Metagrossite',
  ],
  trainers: league([
    ['Roxanne', 'rock', 'roxanne', 'Rustboro City Gym', 'Stone Badge', 'geodude aron nosepass', 'I study Pokémon battles as a science. Let’s test my notes.', 'Back to my studies. The Stone Badge is yours.'],
    ['Brawly', 'fighting', 'brawly', 'Dewford Town Gym', 'Knuckle Badge', 'machop meditite makuhita', 'Ride the big wave with me!', 'Wiped out! The Knuckle Badge, dude.'],
    ['Wattson', 'electric', 'wattson', 'Mauville City Gym', 'Dynamo Badge', 'voltorb electrike magnemite magneton', 'Wahahahah! I’ll electrify you!', 'Shocking! The Dynamo Badge is yours.'],
    ['Flannery', 'fire', 'flannery', 'Lavaridge Town Gym', 'Heat Badge', 'numel slugma camerupt torkoal', 'My Fire Pokémon will scorch you! Or… I hope so!', 'Whew, I’m all burned out. Take the Heat Badge.'],
    ['Norman', 'normal', 'norman', 'Petalburg City Gym', 'Balance Badge', 'spinda linoone kecleon vigoroth slaking', 'I won’t hold back, even against a promising trainer.', 'You’ve grown strong. The Balance Badge is yours.'],
    ['Winona', 'flying', 'winona', 'Fortree City Gym', 'Feather Badge', 'swablu tropius pelipper skarmory altaria', 'My Bird Pokémon and I dance together in the sky.', 'Grace isn’t enough today. The Feather Badge.'],
    ['Tate & Liza', 'psychic', 'tate', 'Mossdeep City Gym', 'Mind Badge', 'grumpig xatu chimecho claydol lunatone solrock', 'We read each other’s minds. Can you read ours?', 'We didn’t see that coming. The Mind Badge.', 'Leaders Tate & Liza'],
    ['Juan', 'water', 'juan', 'Sootopolis City Gym', 'Rain Badge', 'luvdisc whiscash sealeo crawdaunt walrein kingdra', 'Allow me to show you the art of Water Pokémon.', 'Exquisite. The Rain Badge is yours.'],
    ['Sidney', 'dark', 'sidney', 'Ever Grande City', undefined, 'mightyena shiftry cacturne sharpedo crawdaunt absol', 'Let’s have a battle we can both enjoy. No holding back!', 'Nice moves. Keep going.'],
    ['Phoebe', 'ghost', 'phoebe-gen6', 'Ever Grande City', undefined, 'sableye banette gengar mismagius dusclops dusknoir', 'I trained on Mt. Pyre, where I bonded with Ghost Pokémon.', 'My bond wasn’t enough. Go on.'],
    ['Glacia', 'ice', 'glacia', 'Ever Grande City', undefined, 'glalie froslass abomasnow mamoswine lapras walrein', 'Show me a battle hot enough to melt my ice.', 'You melted it. Well done.'],
    ['Drake', 'dragon', 'drake-gen3', 'Ever Grande City', undefined, 'shelgon altaria kingdra flygon dragonite salamence', 'Do you know what Dragon Pokémon need from their trainer?', 'You have the virtues of a true trainer.'],
    ['Steven', 'steel', 'steven', 'Ever Grande City', undefined, 'skarmory aggron armaldo cradily latios metagross', 'I want to see the bond you’ve built with your team.', 'You are the new Hoenn Champion.'],
  ], 'Metagrossite'),
}

const SINNOH: Region = {
  id: 'sinnoh', name: 'Sinnoh', available: true, playerSprite: 'lucas',
  starters: ['turtwig', 'chimchar', 'piplup'], startLevel: 11, megaStones: [],
  trainers: league([
    ['Roark', 'rock', 'roark', 'Oreburgh City Gym', 'Coal Badge', 'geodude onix cranidos', 'My Rock Pokémon were dug out of the mine. They’re tough!', 'Back to the coal mine… Take the Coal Badge.'],
    ['Gardenia', 'grass', 'gardenia', 'Eterna City Gym', 'Forest Badge', 'cherubi turtwig roserade', 'My Grass Pokémon have grown strong. Let’s see yours!', 'You’re good! The Forest Badge is yours.'],
    ['Maylene', 'fighting', 'maylene', 'Veilstone City Gym', 'Cobble Badge', 'meditite machoke toxicroak lucario', 'I train barefoot to toughen up. Let’s go!', 'I need more training. The Cobble Badge.'],
    ['Crasher Wake', 'water', 'crasherwake', 'Pastoria City Gym', 'Fen Badge', 'quagsire gastrodon gyarados floatzel', 'Wahahah! Feel the force of my waves!', 'Washed out! The Fen Badge is yours.'],
    ['Fantina', 'ghost', 'fantina', 'Hearthome City Gym', 'Relic Badge', 'duskull drifblim haunter dusclops mismagius', 'You will be amazed by my Ghost Pokémon!', 'Magnifique… The Relic Badge.'],
    ['Byron', 'steel', 'byron', 'Canalave City Gym', 'Mine Badge', 'bronzor magneton bronzong steelix bastiodon', 'My Steel Pokémon are as hard as they come!', 'Gwahaha! Take the Mine Badge.'],
    ['Candice', 'ice', 'candice', 'Snowpoint City Gym', 'Icicle Badge', 'sneasel piloswine froslass weavile glaceon abomasnow', 'Focus! My Ice Pokémon and I are diamond-focused today!', 'Wow, your focus beat mine. The Icicle Badge.'],
    ['Volkner', 'electric', 'volkner', 'Sunyshore City Gym', 'Beacon Badge', 'jolteon raichu rotom ampharos luxray electivire', 'Finally, a challenger worth getting excited for.', 'That was electric. The Beacon Badge is yours.'],
    ['Aaron', 'bug', 'aaron', 'Pokémon League', undefined, 'dustox beautifly yanmega vespiquen heracross drapion', 'Bug Pokémon are beautiful and strong. Let me show you.', 'My Bug Pokémon… Go on.'],
    ['Bertha', 'ground', 'bertha', 'Pokémon League', undefined, 'whiscash sudowoodo gliscor golem rhyperior hippowdon', 'Well, well. Let’s see how my Ground Pokémon do against you.', 'Ahaha, you’re quite something.'],
    ['Flint', 'fire', 'flint', 'Pokémon League', undefined, 'ninetales rapidash houndoom flareon magmortar infernape', 'Is your spirit burning? Mine is!', 'Burned out… Keep that fire going.'],
    ['Lucian', 'psychic', 'lucian', 'Pokémon League', undefined, 'mrmime girafarig medicham alakazam gallade bronzong', 'Ah, I was just at a good part of my book. Let’s battle.', 'A fine ending. The Champion is next.'],
    ['Cynthia', 'dragon', 'cynthia', 'Pokémon League', undefined, 'spiritomb togekiss lucario milotic giratina garchomp', 'There’s no need for words. Let’s just battle.', 'You are the new Sinnoh Champion.'],
  ]),
}

const UNOVA: Region = {
  id: 'unova', name: 'Unova', available: true, playerSprite: 'hilbert',
  starters: ['snivy', 'tepig', 'oshawott'], startLevel: 11, megaStones: [],
  trainers: league([
    ['Cilan', 'grass', 'cilan', 'Striaton City Gym', 'Trio Badge', 'patrat lillipup pansage', 'Allow me to serve you a battle of the finest quality.', 'Delicious. The Trio Badge is yours.'],
    ['Lenora', 'normal', 'lenora', 'Nacrene City Gym', 'Basic Badge', 'minccino herdier watchog', 'Let’s research what you and your Pokémon can do!', 'Fascinating. The Basic Badge.'],
    ['Burgh', 'bug', 'burgh', 'Castelia City Gym', 'Insect Badge', 'swadloon whirlipede dwebble leavanny', 'My Bug Pokémon inspire my art. Let’s create something.', 'Bravo! The Insect Badge is yours.'],
    ['Elesa', 'electric', 'elesa', 'Nimbasa City Gym', 'Bolt Badge', 'blitzle emolga joltik zebstrika', 'Ready to be dazzled by my Electric Pokémon?', 'You outshone me. The Bolt Badge.'],
    ['Clay', 'ground', 'clay', 'Driftveil City Gym', 'Quake Badge', 'sandile palpitoad golett krokorok excadrill', 'Let’s see if you can dig your way through my team!', 'Hah! The Quake Badge is yours.'],
    ['Skyla', 'flying', 'skyla', 'Mistralton City Gym', 'Jet Badge', 'woobat ducklett swoobat unfezant swanna', 'Time to take to the skies! Ready for takeoff?', 'You flew higher. The Jet Badge.'],
    ['Brycen', 'ice', 'brycen', 'Icirrus City Gym', 'Freeze Badge', 'cubchoo vanillite vanillish cryogonal vanilluxe beartic', 'Face the cold of my Ice Pokémon. Can you endure it?', 'Your warmth won out. The Freeze Badge.'],
    ['Drayden', 'dragon', 'drayden', 'Opelucid City Gym', 'Legend Badge', 'axew zweilous fraxure druddigon dragonair haxorus', 'My Dragon Pokémon carry the legends of Unova.', 'The Legend Badge is yours. The League awaits.'],
    ['Shauntal', 'ghost', 'shauntal', 'Pokémon League', undefined, 'lampent frillish golurk cofagrigus jellicent chandelure', 'I write about battles. This one will make a fine story.', 'What a chapter. Go on.'],
    ['Grimsley', 'dark', 'grimsley', 'Pokémon League', undefined, 'liepard scrafty krookodile zoroark mandibuzz bisharp', 'Life is a serious battle. So is this one.', 'You won the bet. Move on.'],
    ['Caitlin', 'psychic', 'caitlin', 'Pokémon League', undefined, 'musharna sigilyph beheeyem swoobat gothitelle reuniclus', 'You woke me from my nap. You’d better be worth it.', 'An elegant victory. Go ahead.'],
    ['Marshal', 'fighting', 'marshal', 'Pokémon League', undefined, 'throh sawk mienshao scrafty lucario conkeldurr', 'I am Marshal, of the Elite Four. Show me your strength!', 'You have the heart of a champion.'],
    ['Alder', 'bug', 'alder', 'Pokémon League', undefined, 'bouffalant escavalier druddigon hydreigon reshiram volcarona', 'Let’s enjoy a battle that leaves us both stronger.', 'Splendid! You are the new Unova Champion.'],
  ]),
}

const KALOS: Region = {
  id: 'kalos', name: 'Kalos', available: true, playerSprite: 'calem',
  starters: ['chespin', 'fennekin', 'froakie'], startLevel: 11,
  megaStones: [
    'Venusaurite', 'Charizardite X', 'Charizardite Y', 'Blastoisinite', 'Alakazite', 'Gengarite', 'Kangaskhanite',
    'Pinsirite', 'Gyaradosite', 'Aerodactylite', 'Ampharosite', 'Scizorite', 'Heracronite', 'Houndoominite',
    'Tyranitarite', 'Blazikenite', 'Gardevoirite', 'Mawilite', 'Aggronite', 'Medichamite', 'Manectite', 'Banettite',
    'Absolite', 'Garchompite', 'Lucarionite', 'Abomasite',
  ],
  trainers: league([
    ['Viola', 'bug', 'viola', 'Santalune City Gym', 'Bug Badge', 'surskit spewpa vivillon', 'Let me capture this battle in a perfect photo!', 'What a shot! The Bug Badge.'],
    ['Grant', 'rock', 'grant', 'Cyllage City Gym', 'Cliff Badge', 'onix amaura tyrunt', 'Climbing walls takes strength. So does beating me.', 'You scaled it. The Cliff Badge.'],
    ['Korrina', 'fighting', 'korrina', 'Shalour City Gym', 'Rumble Badge', 'mienfoo machoke pancham hawlucha', 'Let’s roll! My Fighting Pokémon are fired up!', 'You rocked it! The Rumble Badge.'],
    ['Ramos', 'grass', 'ramos', 'Coumarine City Gym', 'Plant Badge', 'jumpluff weepinbell ferroseed gogoat', 'Hohoho! My plants have deep roots, young one.', 'You’ve grown well. The Plant Badge.'],
    ['Clemont', 'electric', 'clemont', 'Lumiose City Gym', 'Voltage Badge', 'emolga dedenne magneton luxray heliolisk', 'The future is now, thanks to science! Battle!', 'My calculations… The Voltage Badge.'],
    ['Valerie', 'fairy', 'valerie', 'Laverre City Gym', 'Fairy Badge', 'mawile mrmime aromatisse slurpuff sylveon', 'Oh, a challenger. Let us dance as Fairy Pokémon do.', 'How lovely. The Fairy Badge.'],
    ['Olympia', 'psychic', 'olympia', 'Anistar City Gym', 'Psychic Badge', 'sigilyph slowking gothitelle espeon reuniclus meowstic', 'I have foreseen this battle. And its outcome.', 'The stars changed. The Psychic Badge.'],
    ['Wulfric', 'ice', 'wulfric', 'Snowbelle City Gym', 'Iceberg Badge', 'bergmite cryogonal abomasnow beartic aurorus avalugg', 'Bwahaha! Let’s have a battle as cool as can be!', 'That warmed me up. The Iceberg Badge.'],
    ['Malva', 'fire', 'malva', 'Pokémon League', undefined, 'houndoom torkoal chandelure delphox talonflame pyroar', 'I’ll burn you to a crisp. On air, of course.', 'A scorching upset. Proceed.'],
    ['Siebold', 'water', 'siebold', 'Pokémon League', undefined, 'starmie gastrodon clawitzer gyarados greninja barbaracle', 'A battle is like cooking: preparation is everything.', 'Exquisite. Go on.'],
    ['Wikstrom', 'steel', 'wikstrom', 'Pokémon League', undefined, 'klefki probopass bronzong scizor metagross aegislash', 'En garde! My Steel Pokémon stand ready!', 'A noble victory. Proceed.'],
    ['Drasna', 'dragon', 'drasna', 'Pokémon League', undefined, 'altaria druddigon dragalge kingdra haxorus noivern', 'Oh my, a strong one! My dragons are so excited.', 'Lovely. The Champion awaits.'],
    ['Diantha', 'fairy', 'diantha', 'Pokémon League', undefined, 'hawlucha tyrantrum aurorus goodra xerneas gardevoir', 'Show me the light of your bond with your Pokémon.', 'You are the new Kalos Champion.'],
  ], 'Gardevoirite'),
}

/** Type Z-Crystals: Alola's rewards, and its trial prizes. */
export const Z_CRYSTALS: Record<string, string> = {
  Normal: 'Normalium Z', Fire: 'Firium Z', Water: 'Waterium Z', Grass: 'Grassium Z', Electric: 'Electrium Z',
  Ice: 'Icium Z', Fighting: 'Fightinium Z', Poison: 'Poisonium Z', Ground: 'Groundium Z', Flying: 'Flyinium Z',
  Psychic: 'Psychium Z', Bug: 'Buginium Z', Rock: 'Rockium Z', Ghost: 'Ghostium Z', Dragon: 'Dragonium Z',
  Dark: 'Darkinium Z', Steel: 'Steelium Z', Fairy: 'Fairium Z',
}

const ALOLA: Region = {
  id: 'alola', name: 'Alola', available: true, playerSprite: 'elio',
  starters: ['rowlet', 'litten', 'popplio'], startLevel: 11, megaStones: [], zCrystals: true, badgeNoun: 'trial',
  rivalCounter: {
    rowlet: { species: 'incineroar', item: 'Firium Z' },
    litten: { species: 'primarina', item: 'Waterium Z' },
    popplio: { species: 'decidueye', item: 'Grassium Z' },
  },
  trainers: league([
    ['Ilima', 'normal', 'ilima', 'Verdant Cavern', 'Normalium Z', 'yungoos rattata gumshoos', 'Welcome to my trial! Let’s see what you’re made of.', 'Splendid! Take the Normalium Z.', 'Captain Ilima'],
    ['Lana', 'water', 'lana', 'Brooklet Hill', 'Waterium Z', 'wingull dewpider araquanid', 'I fished up a strong team for you.', 'You reeled me in. The Waterium Z.', 'Captain Lana'],
    ['Kiawe', 'fire', 'kiawe', 'Wela Volcano Park', 'Firium Z', 'growlithe fletchinder salandit salazzle', 'Feel the heat of my fire dance!', 'You burned brighter. The Firium Z.', 'Captain Kiawe'],
    ['Mallow', 'grass', 'mallow', 'Lush Jungle', 'Grassium Z', 'fomantis morelull steenee lurantis', 'I cooked up a tough trial for you!', 'You cleaned your plate! The Grassium Z.', 'Captain Mallow'],
    ['Sophocles', 'electric', 'sophocles', 'Hokulani Observatory', 'Electrium Z', 'togedemaru charjabug magneton electabuzz vikavolt', 'My calculations say I’ll win. Let’s test them.', 'Data updated… The Electrium Z.', 'Captain Sophocles'],
    ['Mina', 'fairy', 'mina', 'Poni Plains', 'Fairium Z', 'klefki granbull shiinotic wigglytuff ribombee', 'Let me paint this battle in fairy colours.', 'A masterpiece. Take the Fairium Z.', 'Captain Mina'],
    ['Nanu', 'dark', 'nanu', 'Malie City', 'Darkinium Z', 'sableye krokorok absol honchkrow weavile persian', 'Ugh, a grand trial. Fine, let’s get this over with.', 'Not bad, kid. The Darkinium Z.', 'Kahuna Nanu'],
    ['Hapu', 'ground', 'hapu', 'Exeggutor Island', 'Groundium Z', 'dugtrio gastrodon flygon golurk krookodile mudsdale', 'I am Poni’s kahuna. Show me your strength.', 'You have earned the Groundium Z.', 'Kahuna Hapu'],
    ['Hala', 'fighting', 'hala', 'Mount Lanakila', undefined, 'primeape poliwrath hariyama bewear hitmonchan crabominable', 'The Elite Four take you on with full force!', 'A fine battle. Go on.'],
    ['Olivia', 'rock', 'olivia', 'Mount Lanakila', undefined, 'relicanth carbink probopass golem rhyperior lycanroc', 'My Rock Pokémon are as solid as my resolve.', 'You cracked them. Proceed.'],
    ['Acerola', 'ghost', 'acerola', 'Mount Lanakila', undefined, 'sableye drifblim froslass dhelmise mimikyu palossand', 'My ghosts want to play with you!', 'Aww, they had fun. Go ahead.'],
    ['Kahili', 'flying', 'kahili', 'Mount Lanakila', undefined, 'skarmory crobat oricorio mandibuzz braviary toucannon', 'My Flying Pokémon aim for a hole in one.', 'Under par. The Champion is next.'],
    ['Kukui', 'normal', 'kukui', 'Mount Lanakila', undefined, 'lycanroc ninetales magnezone kommoo tapukoko rival-starter', 'Woo! I built this League to battle trainers like you!', 'You are Alola’s first Champion. Woo!', 'Professor Kukui'],
  ]),
}

const GALAR: Region = {
  id: 'galar', name: 'Galar', available: true, playerSprite: 'victor',
  starters: ['grookey', 'scorbunny', 'sobble'], startLevel: 11, megaStones: [],
  trainers: league([
    ['Milo', 'grass', 'milo', 'Turffield Stadium', 'Grass Badge', 'gossifleur bounsweet eldegoss', 'My Grass Pokémon grow strong on the farm. Let’s go!', 'You’ve got a green thumb for battling. The Grass Badge.'],
    ['Nessa', 'water', 'nessa', 'Hulbury Stadium', 'Water Badge', 'goldeen arrokuda drednaw', 'I’ll sink you to the bottom of the sea!', 'You washed me out. The Water Badge.'],
    ['Kabu', 'fire', 'kabu', 'Motostoke Stadium', 'Fire Badge', 'sizzlipede ninetales arcanine centiskorch', 'I train every day so I never lose my fire.', 'Your fire burns hotter. The Fire Badge.'],
    ['Bea', 'fighting', 'bea', 'Stow-on-Side Stadium', 'Fighting Badge', 'hitmontop pangoro sirfetchd machamp', 'I have trained body and mind. Show me yours.', 'I must train harder. The Fighting Badge.'],
    ['Opal', 'fairy', 'opal', 'Ballonlea Stadium', 'Fairy Badge', 'mawile mrmime togekiss hatterene alcremie', 'Let’s see if you have the pink to pass my quiz.', 'Lovely! The Fairy Badge.'],
    ['Gordie', 'rock', 'gordie', 'Circhester Stadium', 'Rock Badge', 'barbaracle shuckle rhyperior stonjourner coalossal', 'Let’s rock! I won’t lose to anyone.', 'You rolled right over me. The Rock Badge.'],
    ['Piers', 'dark', 'piers', 'Spikemuth', 'Dark Badge', 'scrafty malamar skuntank thievul grimmsnarl obstagoon', 'Let me sing you a battle you won’t forget.', 'Encore… The Dark Badge.'],
    ['Raihan', 'dragon', 'raihan', 'Hammerlocke Stadium', 'Dragon Badge', 'gigalith flygon sandaconda goodra turtonator duraludon', 'I’m the one who’ll beat Leon. You’re just a warm-up.', 'Unreal… The Dragon Badge is yours.'],
    ['Marnie', 'dark', 'marnie', 'Wyndon Stadium', undefined, 'liepard toxicroak scrafty morpeko obstagoon grimmsnarl', 'The Champion Cup semifinal. Let’s make it count.', 'You’re really strong. Go win it.', 'Rival Marnie'],
    ['Hop', 'normal', 'hop', 'Wyndon Stadium', undefined, 'dubwool pincurchin trevenant corviknight snorlax cinderace', 'Mate, I’ve been waiting for this! I’ll beat you this time!', 'You’re amazing. Show my brother what you’ve got.', 'Rival Hop'],
    ['Bede', 'fairy', 'bede', 'Wyndon Stadium', undefined, 'gothitelle mawile rapidash sylveon gardevoir hatterene', 'I’ve been trained by Opal. I won’t lose again.', 'Hmph. Go and face the Champion.', 'Rival Bede'],
    ['Allister', 'ghost', 'allister', 'Wyndon Stadium', undefined, 'cursola runerigus mimikyu polteageist chandelure gengar', '…The ghosts and I came to battle.', '…Good luck in the final.', 'Leader Allister'],
    ['Leon', 'fire', 'leon', 'Wyndon Stadium', undefined, 'aegislash dragapult haxorus rhyperior zacian charizard', 'Let’s have a champion time!', 'You are the new Champion of Galar!'],
  ]),
}

const PALDEA: Region = {
  id: 'paldea', name: 'Paldea', available: true, playerSprite: 'florian-s',
  starters: ['sprigatito', 'fuecoco', 'quaxly'], startLevel: 11, megaStones: [],
  trainers: league([
    ['Katy', 'bug', 'katy', 'Cortondo Gym', 'Bug Badge', 'nymble tarountula lokix', 'My Bug Pokémon are as sweet as my pastries, and just as strong!', 'You’re sweet as sugar. The Bug Badge.'],
    ['Brassius', 'grass', 'brassius', 'Artazon Gym', 'Grass Badge', 'smoliv petilil sudowoodo', 'Behold my art! Let us create a battle together.', 'A masterpiece! The Grass Badge.'],
    ['Iono', 'electric', 'iono', 'Levincia Gym', 'Electric Badge', 'wattrel bellibolt luxio mismagius', 'Hey hey, chat! Watch me zap this challenger!', 'Ugh, sad stream… The Electric Badge.'],
    ['Kofu', 'water', 'kofu', 'Cascarrafa Gym', 'Water Badge', 'wugtrio finizen veluza crabominable', 'Fresh catch of the day! My Water Pokémon are ready!', 'You cooked me! The Water Badge.'],
    ['Larry', 'normal', 'larry', 'Medali Gym', 'Normal Badge', 'komala dudunsparce oinkologne farigiraf staraptor', 'Let’s keep it simple. Normal battle, normal result.', 'Well, that’s that. The Normal Badge.'],
    ['Ryme', 'ghost', 'ryme', 'Montenevera Gym', 'Ghost Badge', 'banette mimikyu houndstone gengar sinistcha toxtricity', 'Let’s drop a battle with a beat that slaps!', 'You rocked the mic. The Ghost Badge.'],
    ['Tulip', 'psychic', 'tulip', 'Alfornada Gym', 'Psychic Badge', 'farigiraf gardevoir espathra gallade armarouge florges', 'Let me make your team look its very best… after I win.', 'Beautifully done. The Psychic Badge.'],
    ['Grusha', 'ice', 'grusha', 'Glaseado Gym', 'Ice Badge', 'frosmoth beartic cetitan weavile glalie altaria', 'Let’s keep this cool. I don’t lose on my mountain.', 'You warmed me up. The Ice Badge.'],
    ['Rika', 'ground', 'rika', 'Pokémon League', undefined, 'whiscash camerupt donphan dugtrio hippowdon clodsire', 'Let’s see if you can dig out a win.', 'You dug deep. Go on.'],
    ['Poppy', 'steel', 'poppy', 'Pokémon League', undefined, 'copperajah magnezone bronzong corviknight orthworm tinkaton', 'I’m gonna smash you with my hammer!', 'Aww… you’re really strong!'],
    ['Larry', 'flying', 'larry', 'Pokémon League', undefined, 'tropius oricorio altaria braviary staraptor flamigo', 'Overtime again. Flying types this round.', 'That’s enough for today. Go.'],
    ['Hassel', 'dragon', 'hassel', 'Pokémon League', undefined, 'noivern haxorus dragalge flapple dragonite baxcalibur', 'Let me see the art of your battling.', 'Your art moved me. Proceed.'],
    ['Geeta', 'rock', 'geeta', 'Pokémon League', undefined, 'espathra kingambit avalugg garchomp koraidon glimmora', 'I am the Top Champion. Show me your strength.', 'You are Paldea’s new Champion.'],
  ]),
}

export const REGIONS: Record<RegionId, Region> = {
  kanto: KANTO, johto: JOHTO, hoenn: HOENN, sinnoh: SINNOH, unova: UNOVA, kalos: KALOS, alola: ALOLA, galar: GALAR, paldea: PALDEA,
}

/** Regions in the order they're shown on the picker. */
export const REGION_LIST: { id: string; name: string; available: boolean }[] =
  Object.values(REGIONS).map(r => ({ id: r.id, name: r.name, available: r.available }))

export const regionOf = (id: RegionId | undefined) => REGIONS[id ?? 'kanto']

/** "Leader Brock", "Elite Four Lorelei", "Champion Blue", or a region's own name for them ("Captain Ilima"). */
export function trainerTitleName(t: RegionTrainer): string {
  if (t.display) return t.display
  const prefix = t.title === 'Gym Leader' ? 'Leader' : t.title === 'Elite Four' ? 'Elite Four' : 'Champion'
  return `${prefix} ${t.name}`
}

/** Highest level on the next trainer's team: the level cap for XP. */
export const levelCapFor = (region: Region, index: number) =>
  Math.max(...region.trainers[Math.min(index, region.trainers.length - 1)].team.map(m => m.level))
