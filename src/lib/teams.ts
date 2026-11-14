import type { GymType } from '../types/game'

// Builds a PS packed-team string from an array of set definitions.
// Format per slot: name|species|item|ability|moves|nature|evs|gender|ivs|shiny|level|misc
function pack(sets: { species: string; ability: string; moves: string[]; nature?: string }[]): string {
  return sets
    .map(s => `|${s.species}||${s.ability}|${s.moves.join(',')}|${s.nature ?? 'Hardy'}||M|||50|`)
    .join(']')
}

const GYM_TEAMS: Record<GymType, string> = {
  fire: pack([
    { species: 'Charizard',   ability: 'Blaze',      moves: ['Flamethrower','Air Slash','Focus Blast','Roost'],          nature: 'Modest' },
    { species: 'Arcanine',    ability: 'Intimidate',  moves: ['Flare Blitz','Extreme Speed','Wild Charge','Morning Sun'],  nature: 'Jolly' },
    { species: 'Houndoom',    ability: 'Flash Fire',  moves: ['Fire Blast','Dark Pulse','Nasty Plot','Will-O-Wisp'],      nature: 'Timid' },
  ]),
  water: pack([
    { species: 'Blastoise',   ability: 'Torrent',     moves: ['Surf','Ice Beam','Flash Cannon','Protect'],                nature: 'Modest' },
    { species: 'Vaporeon',    ability: 'Water Absorb',moves: ['Surf','Shadow Ball','Moonblast','Wish'],                   nature: 'Modest' },
    { species: 'Gyarados',    ability: 'Intimidate',  moves: ['Waterfall','Ice Fang','Earthquake','Dragon Dance'],        nature: 'Adamant' },
  ]),
  grass: pack([
    { species: 'Venusaur',    ability: 'Overgrow',    moves: ['Energy Ball','Sludge Bomb','Sleep Powder','Synthesis'],    nature: 'Modest' },
    { species: 'Leafeon',     ability: 'Chlorophyll', moves: ['Leaf Blade','X-Scissor','Knock Off','Swords Dance'],       nature: 'Jolly' },
    { species: 'Roserade',    ability: 'Natural Cure',moves: ['Leaf Storm','Sludge Bomb','Shadow Ball','Dazzling Gleam'], nature: 'Timid' },
  ]),
  electric: pack([
    { species: 'Jolteon',     ability: 'Volt Absorb', moves: ['Thunderbolt','Shadow Ball','Signal Beam','Pin Missile'],  nature: 'Timid' },
    { species: 'Ampharos',    ability: 'Static',      moves: ['Thunderbolt','Power Gem','Dragon Pulse','Volt Switch'],   nature: 'Modest' },
    { species: 'Raichu',      ability: 'Static',      moves: ['Thunderbolt','Focus Blast','Surf','Nasty Plot'],          nature: 'Timid' },
  ]),
  ghost: pack([
    { species: 'Gengar',      ability: 'Cursed Body', moves: ['Shadow Ball','Sludge Bomb','Focus Blast','Destiny Bond'],  nature: 'Timid' },
    { species: 'Chandelure',  ability: 'Flash Fire',  moves: ['Shadow Ball','Flamethrower','Energy Ball','Trick'],        nature: 'Timid' },
    { species: 'Mismagius',   ability: 'Levitate',    moves: ['Shadow Ball','Dazzling Gleam','Thunderbolt','Nasty Plot'],  nature: 'Timid' },
  ]),
  dragon: pack([
    { species: 'Dragonite',   ability: 'Multiscale',  moves: ['Outrage','Dragon Dance','Earthquake','Extreme Speed'],    nature: 'Adamant' },
    { species: 'Salamence',   ability: 'Intimidate',  moves: ['Dragon Claw','Flamethrower','Earthquake','Dragon Dance'],  nature: 'Jolly' },
    { species: 'Flygon',      ability: 'Levitate',    moves: ['Outrage','Earthquake','U-turn','Dragon Claw'],             nature: 'Jolly' },
  ]),
  normal: pack([
    { species: 'Snorlax',     ability: 'Thick Fat',   moves: ['Body Slam','Crunch','Earthquake','Rest'],                 nature: 'Careful' },
    { species: 'Tauros',      ability: 'Intimidate',  moves: ['Body Slam','Iron Head','Earthquake','Zen Headbutt'],      nature: 'Jolly' },
    { species: 'Chansey',     ability: 'Natural Cure',moves: ['Soft-Boiled','Seismic Toss','Stealth Rock','Heal Bell'],  nature: 'Bold' },
  ]),
  ice: pack([
    { species: 'Lapras',      ability: 'Water Absorb',moves: ['Ice Beam','Surf','Thunderbolt','Freeze-Dry'],            nature: 'Modest' },
    { species: 'Glaceon',     ability: 'Snow Cloak',  moves: ['Blizzard','Shadow Ball','Signal Beam','Hail'],           nature: 'Modest' },
    { species: 'Cloyster',    ability: 'Skill Link',  moves: ['Icicle Spear','Shell Smash','Rock Blast','Hydro Pump'],  nature: 'Naughty' },
  ]),
  fighting: pack([
    { species: 'Machamp',     ability: 'No Guard',    moves: ['Dynamic Punch','Bullet Punch','Stone Edge','Ice Punch'],  nature: 'Adamant' },
    { species: 'Heracross',   ability: 'Moxie',       moves: ['Close Combat','Megahorn','Stone Edge','Rock Blast'],      nature: 'Jolly' },
    { species: 'Lucario',     ability: 'Steadfast',   moves: ['Close Combat','Flash Cannon','Bullet Punch','Nasty Plot'],nature: 'Timid' },
  ]),
  poison: pack([
    { species: 'Nidoking',    ability: 'Sheer Force', moves: ['Earth Power','Poison Jab','Ice Beam','Flamethrower'],    nature: 'Timid' },
    { species: 'Toxicroak',   ability: 'Dry Skin',    moves: ['Cross Chop','Sucker Punch','Stone Edge','Poison Jab'],   nature: 'Jolly' },
    { species: 'Vileplume',   ability: 'Chlorophyll', moves: ['Sludge Bomb','Energy Ball','Sleep Powder','Moonblast'],  nature: 'Modest' },
  ]),
  ground: pack([
    { species: 'Garchomp',    ability: 'Rough Skin',  moves: ['Earthquake','Dragon Claw','Swords Dance','Stone Edge'],  nature: 'Jolly' },
    { species: 'Hippowdon',   ability: 'Sand Stream', moves: ['Earthquake','Stealth Rock','Slack Off','Ice Fang'],      nature: 'Impish' },
    { species: 'Donphan',     ability: 'Sturdy',      moves: ['Earthquake','Ice Shard','Stone Edge','Knock Off'],       nature: 'Adamant' },
  ]),
  flying: pack([
    { species: 'Staraptor',   ability: 'Reckless',    moves: ['Brave Bird','Close Combat','Double-Edge','Final Gambit'],nature: 'Jolly' },
    { species: 'Togekiss',    ability: 'Serene Grace', moves: ['Air Slash','Dazzling Gleam','Nasty Plot','Roost'],       nature: 'Timid' },
    { species: 'Skarmory',    ability: 'Sturdy',      moves: ['Brave Bird','Stealth Rock','Roost','Whirlwind'],         nature: 'Impish' },
  ]),
  psychic: pack([
    { species: 'Alakazam',    ability: 'Magic Guard',  moves: ['Psychic','Focus Blast','Shadow Ball','Dazzling Gleam'], nature: 'Timid' },
    { species: 'Espeon',      ability: 'Magic Bounce', moves: ['Psychic','Shadow Ball','Dazzling Gleam','Calm Mind'],    nature: 'Timid' },
    { species: 'Gardevoir',   ability: 'Trace',        moves: ['Psychic','Moonblast','Shadow Ball','Calm Mind'],         nature: 'Timid' },
  ]),
  bug: pack([
    { species: 'Heracross',   ability: 'Moxie',       moves: ['Megahorn','Close Combat','Stone Edge','Rock Blast'],     nature: 'Jolly' },
    { species: 'Volcarona',   ability: 'Flame Body',  moves: ['Bug Buzz','Flamethrower','Quiver Dance','Giga Drain'],   nature: 'Timid' },
    { species: 'Butterfree',  ability: 'Compound Eyes',moves: ['Bug Buzz','Sleep Powder','Quiver Dance','Psychic'],     nature: 'Timid' },
  ]),
  rock: pack([
    { species: 'Tyranitar',   ability: 'Sand Stream', moves: ['Stone Edge','Crunch','Ice Punch','Stealth Rock'],        nature: 'Jolly' },
    { species: 'Golem',       ability: 'Sturdy',      moves: ['Stone Edge','Earthquake','Sucker Punch','Explosion'],    nature: 'Adamant' },
    { species: 'Rampardos',   ability: 'Mold Breaker',moves: ['Head Smash','Zen Headbutt','Earthquake','Iron Head'],    nature: 'Jolly' },
  ]),
  dark: pack([
    { species: 'Umbreon',     ability: 'Synchronize', moves: ['Foul Play','Moonlight','Toxic','Wish'],                  nature: 'Careful' },
    { species: 'Hydreigon',   ability: 'Levitate',    moves: ['Dark Pulse','Dragon Pulse','Fire Blast','Roost'],        nature: 'Timid' },
    { species: 'Absol',       ability: 'Super Luck',  moves: ['Night Slash','Psycho Cut','Superpower','Swords Dance'],  nature: 'Jolly' },
  ]),
  steel: pack([
    { species: 'Scizor',      ability: 'Technician',  moves: ['Bullet Punch','U-turn','Superpower','Swords Dance'],     nature: 'Adamant' },
    { species: 'Magnezone',   ability: 'Magnet Pull', moves: ['Thunderbolt','Flash Cannon','Volt Switch','Tri Attack'],  nature: 'Modest' },
    { species: 'Metagross',   ability: 'Clear Body',  moves: ['Meteor Mash','Earthquake','Ice Punch','Bullet Punch'],    nature: 'Adamant' },
  ]),
  fairy: pack([
    { species: 'Clefable',    ability: 'Magic Guard',  moves: ['Moonblast','Flamethrower','Soft-Boiled','Calm Mind'],   nature: 'Modest' },
    { species: 'Togekiss',    ability: 'Serene Grace', moves: ['Moonblast','Air Slash','Nasty Plot','Roost'],            nature: 'Timid' },
    { species: 'Sylveon',     ability: 'Pixilate',     moves: ['Moonblast','Shadow Ball','Calm Mind','Wish'],            nature: 'Modest' },
  ]),
}

// Five challenger archetypes cycling by challengerIndex
const CHALLENGER_TEAMS: string[] = [
  pack([
    { species: 'Starmie',     ability: 'Natural Cure',moves: ['Surf','Psychic','Thunderbolt','Ice Beam'],              nature: 'Timid' },
    { species: 'Garchomp',    ability: 'Rough Skin',  moves: ['Earthquake','Dragon Claw','Stone Edge','Fire Fang'],    nature: 'Jolly' },
    { species: 'Gengar',      ability: 'Cursed Body', moves: ['Shadow Ball','Sludge Bomb','Focus Blast','Destiny Bond'],nature: 'Timid' },
  ]),
  pack([
    { species: 'Alakazam',    ability: 'Magic Guard',  moves: ['Psychic','Focus Blast','Shadow Ball','Dazzling Gleam'], nature: 'Timid' },
    { species: 'Gyarados',    ability: 'Intimidate',   moves: ['Waterfall','Ice Fang','Earthquake','Dragon Dance'],     nature: 'Adamant' },
    { species: 'Tyranitar',   ability: 'Sand Stream',  moves: ['Stone Edge','Crunch','Ice Punch','Earthquake'],         nature: 'Jolly' },
  ]),
  pack([
    { species: 'Charizard',   ability: 'Blaze',       moves: ['Flamethrower','Air Slash','Focus Blast','Roost'],       nature: 'Modest' },
    { species: 'Blastoise',   ability: 'Torrent',     moves: ['Surf','Ice Beam','Flash Cannon','Protect'],             nature: 'Modest' },
    { species: 'Raichu',      ability: 'Static',      moves: ['Thunderbolt','Focus Blast','Surf','Nasty Plot'],        nature: 'Timid' },
  ]),
  pack([
    { species: 'Dragonite',   ability: 'Multiscale',  moves: ['Outrage','Dragon Dance','Earthquake','Extreme Speed'],  nature: 'Adamant' },
    { species: 'Gengar',      ability: 'Cursed Body', moves: ['Shadow Ball','Focus Blast','Dazzling Gleam','Trick'],   nature: 'Timid' },
    { species: 'Lucario',     ability: 'Steadfast',   moves: ['Close Combat','Flash Cannon','Bullet Punch','Nasty Plot'],nature: 'Timid' },
  ]),
  pack([
    { species: 'Metagross',   ability: 'Clear Body',  moves: ['Meteor Mash','Earthquake','Ice Punch','Bullet Punch'],  nature: 'Adamant' },
    { species: 'Salamence',   ability: 'Intimidate',  moves: ['Dragon Claw','Flamethrower','Earthquake','Dragon Dance'],nature: 'Jolly' },
    { species: 'Starmie',     ability: 'Analytic',    moves: ['Hydro Pump','Psychic','Thunderbolt','Ice Beam'],        nature: 'Timid' },
  ]),
]

export function getGymLeaderTeam(type: GymType): string {
  return GYM_TEAMS[type]
}

export function getChallengerTeam(index: number): string {
  return CHALLENGER_TEAMS[index % CHALLENGER_TEAMS.length]
}
