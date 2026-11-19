import type { GymType, RunState } from '../types/game'
import { questChallengerTitle } from './progression'
import { seededRng } from './daily'
import { regionOf, type Tier } from './regions'

export const trainerSprite = (name: string) => `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`

/** A famous Gym Leader of each type stands in for the player. */
export const LEADER_SPRITE: Record<GymType, string> = {
  fire: 'blaine', water: 'misty', grass: 'erika', electric: 'ltsurge', ghost: 'morty', dragon: 'clair',
  normal: 'whitney', ice: 'pryce', fighting: 'chuck', poison: 'koga', ground: 'clay', flying: 'falkner',
  psychic: 'sabrina', bug: 'bugsy', rock: 'brock', dark: 'grimsley', steel: 'jasmine', fairy: 'valerie',
}

const GYM_PLACES: Record<GymType, [string, string]> = {
  fire: ['Cinder', 'Crater'], water: ['Tidal', 'Cove'], grass: ['Verdant', 'Grove'], electric: ['Volt', 'Tower'],
  ghost: ['Hollow', 'Manor'], dragon: ['Wyrm', 'Peak'], normal: ['Plain', 'Hall'], ice: ['Frost', 'Glacier'],
  fighting: ['Iron', 'Dojo'], poison: ['Miasma', 'Marsh'], ground: ['Dune', 'Canyon'], flying: ['Gale', 'Spire'],
  psychic: ['Mirage', 'Temple'], bug: ['Hive', 'Thicket'], rock: ['Boulder', 'Quarry'], dark: ['Shade', 'Alley'],
  steel: ['Forge', 'Works'], fairy: ['Pixie', 'Garden'],
}

export const gymName = (type: GymType) => `${GYM_PLACES[type][0]} ${GYM_PLACES[type][1]} Gym`

interface ClassInfo { label: string; sprites: string[]; style: string; quotes: string[]; defeat: string[] }

const CLASSES: Record<string, ClassInfo> = {
  Rookie: {
    label: 'Promising Trainer', sprites: ['youngster', 'lass', 'bugcatcher'], style: 'Rookie: picks moves at random',
    quotes: ['I just got my first badge case!', 'My Pokémon and I trained all week.', 'Is this the right Gym?'], defeat: ['Aww… I’ll train harder!', 'You’re really strong!'],
  },
  Trainer: {
    label: 'Trainer', sprites: ['picnicker', 'camper', 'hiker', 'birdkeeper'], style: 'Trainer: favours strong attacks',
    quotes: ['Wings beat walls.', 'I came a long way for this badge.', 'Let’s see what your Gym is made of!'], defeat: ['So this is a Gym Leader’s strength…', 'I’ll be back for that badge.'],
  },
  'Ace Trainer': {
    label: 'Ace Trainer', sprites: ['acetrainer', 'acetrainerf'], style: 'Tactician: knows type matchups',
    quotes: ['I’ve studied every Gym in the region.', 'Type advantage is everything.', 'Don’t expect an easy win.'], defeat: ['My research wasn’t enough.', 'Impressive. Truly.'],
  },
  Rival: {
    label: 'Rival', sprites: ['barry', 'hilbert'], style: 'Tactician: brings counters to your type',
    quotes: ['So you’re the new Gym Leader? I studied your type all week. This won’t take long.'], defeat: ['Fine, you win this time. Next time is mine!'],
  },
  'Rival Gym Leader': {
    label: 'Rival Gym Leader', sprites: [], style: 'Gym Leader: a full team with a plan',
    quotes: ['One Gym Leader to another: show me what you’ve got.'], defeat: ['Your Gym earned its reputation today.'],
  },
  'Elite Trainer': {
    label: 'Elite Trainer', sprites: ['veteran', 'veteranf'], style: 'Veteran: punishes mistakes',
    quotes: ['I’ve beaten Gyms tougher than this.', 'Experience wins battles.'], defeat: ['You’ve got the makings of a legend.'],
  },
  'Elite Four Member': {
    label: 'Elite Four', sprites: ['lucian'], style: 'Elite Four: strong, balanced team',
    quotes: ['The League sent me to test you personally.'], defeat: ['The League will hear of this.'],
  },
  Champion: {
    label: 'Champion', sprites: ['cynthia'], style: 'Champion: the strongest challenger of all',
    quotes: ['Let’s make this a battle worth remembering.'], defeat: ['A battle worth remembering. Your Gym stands!'],
  },
}

const FIRST_NAMES = ['Perry', 'Gina', 'Wade', 'Rowan', 'Tess', 'Milo', 'Ivy', 'Jonah', 'Rhea', 'Owen', 'Lena', 'Cole', 'Nina', 'Theo', 'Mara']

export interface Trainer { name: string; title: string; sprite: string; quote: string; style: string; defeat: string }

/** The trainer behind challenger `index`: stable for a run, identical for everyone on a Daily. */
const TIER_STYLE: Record<Tier, string> = {
  regular: 'Gym Leader: favours strong attacks',
  strong: 'Gym Leader: knows type matchups and switches out of bad ones',
  elite: 'Elite Four: trained team with items and its best moves',
  champion: 'Champion: fully trained, items, a Mega Evolution and a legendary',
}

/** A Regional Quest opponent as a Trainer, e.g. "Leader Brock". */
export function regionalTrainer(run: RunState, index = run.challengerIndex): Trainer {
  const region = regionOf(run.region)
  const t = region.trainers[Math.min(index, region.trainers.length - 1)]
  const prefix = t.title === 'Gym Leader' ? 'Leader' : t.title === 'Elite Four' ? 'Elite Four' : 'Champion'
  return { name: `${prefix} ${t.name}`, title: t.title, sprite: t.sprite, quote: t.quote, style: TIER_STYLE[t.tier], defeat: t.defeat }
}

export function challengerTrainer(run: RunState, index = run.challengerIndex): Trainer {
  if (run.mode === 'regional') return regionalTrainer(run, index)
  const rng = seededRng(`trainer:${run.dailyDate ?? run.id}:${index}`)
  const pick = <T,>(xs: T[]) => xs[Math.floor(rng() * xs.length)]
  const cls = run.totalChallengers === null ? (index < 3 ? 'Rookie' : index < 8 ? 'Trainer' : index < 15 ? 'Ace Trainer' : 'Elite Trainer') : questChallengerTitle(index)
  const info = CLASSES[cls]
  const first = pick(FIRST_NAMES)
  if (cls === 'Rival Gym Leader') {
    const types = (Object.keys(LEADER_SPRITE) as GymType[]).filter(t => t !== run.gymType)
    const t = pick(types)
    const leader = LEADER_SPRITE[t]
    const name = leader === 'ltsurge' ? 'Lt. Surge' : leader[0].toUpperCase() + leader.slice(1)
    return { name: `Leader ${name}`, title: info.label, sprite: leader, quote: pick(info.quotes), style: info.style, defeat: pick(info.defeat) }
  }
  const sprite = pick(info.sprites)
  const prefix = cls === 'Rookie' || cls === 'Trainer' ? `${sprite === 'birdkeeper' ? 'Bird Keeper' : sprite === 'bugcatcher' ? 'Bug Catcher' : sprite[0].toUpperCase() + sprite.slice(1)} ` : cls === 'Rival' ? 'Rival ' : cls === 'Champion' ? 'Champion ' : ''
  return { name: `${prefix}${first}`, title: info.label, sprite, quote: pick(info.quotes), style: info.style, defeat: pick(info.defeat) }
}

/** Track nodes that are boss fights in a 15-battle Gym Quest. */
export const BOSS_NODES: Record<number, string> = { 4: '⚔', 9: '♛', 13: '♜', 14: '♚' }
