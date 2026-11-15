import { DEX, species } from './dex'
import { createMon, stageForLevel, type Rng } from './progression'
import type { GymType, RosterMember } from '../types/game'

export const MAX_TEAM = 6
export const START_FUNDS = 150
export const START_REROLLS = 1
export const POST_WIN_RECOVERY = 0.1 // conscious members heal 10% of max HP after a win
export const POTION_HEAL = 0.5
export const REVIVE_HP = 0.5

export const fundsForWin = (index: number) => 100 + 20 * index
export const skipBonus = (index: number) => 50 + 10 * index

// ─── Items ───────────────────────────────────────────────────────────────────

export type BagItem = 'potion' | 'revive' | 'candy' | 'stone'

export const BAG_INFO: Record<BagItem, { name: string; icon: string; desc: string; price: number }> = {
  potion: { name: 'Hyper Potion', icon: '🧪', desc: 'Restores 50% HP to one conscious Pokémon.', price: 80 },
  revive: { name: 'Revive', icon: '💛', desc: 'Revives a fainted Pokémon at 50% HP.', price: 150 },
  candy: { name: 'Rare Candy', icon: '🍬', desc: 'Raises one Pokémon by 1 level.', price: 200 },
  stone: { name: 'Evolution Stone', icon: '💎', desc: 'Evolves a Pokémon now, at any level.', price: 300 },
}

const TYPE_ITEMS: Record<GymType, string> = {
  fire: 'Charcoal', water: 'Mystic Water', grass: 'Miracle Seed', electric: 'Magnet', ghost: 'Spell Tag',
  dragon: 'Dragon Fang', normal: 'Silk Scarf', ice: 'Never-Melt Ice', fighting: 'Black Belt',
  poison: 'Poison Barb', ground: 'Soft Sand', flying: 'Sharp Beak', psychic: 'Twisted Spoon',
  bug: 'Silver Powder', rock: 'Hard Stone', dark: 'Black Glasses', steel: 'Metal Coat', fairy: 'Fairy Feather',
}

export const HELD_ITEM_DESC: Record<string, string> = {
  Leftovers: 'Restores 1/16 of max HP every turn.',
  'Sitrus Berry': 'Restores 1/4 of max HP once when HP drops below half.',
  'Quick Claw': 'Each turn, 20% chance to move first in its priority bracket.',
  'Focus Sash': 'Survives one hit that would KO it from full HP.',
  'Expert Belt': 'Super-effective moves deal 20% more damage.',
  'Shell Bell': 'Heals 1/8 of the damage it deals.',
  'Muscle Band': 'Physical moves deal 10% more damage.',
  'Wise Glasses': 'Special moves deal 10% more damage.',
}
const GENERIC_ITEMS = Object.keys(HELD_ITEM_DESC)

export const typeItemFor = (gymType: GymType) => TYPE_ITEMS[gymType]
export function heldItemDesc(item: string): string {
  const t = Object.entries(TYPE_ITEMS).find(([, i]) => i === item)?.[0]
  return t ? `${t[0].toUpperCase()}${t.slice(1)}-type moves deal 20% more damage.` : HELD_ITEM_DESC[item] ?? ''
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

export type RewardKind =
  | 'recruit' | 'training' | 'team_training' | 'revive_pack' | 'potion_supply'
  | 'rare_candy' | 'evo_stone' | 'held_item' | 'league_favour'
export type Rarity = 'common' | 'rare' | 'epic'

export interface Reward { id: string; kind: RewardKind; rarity: Rarity; title: string; desc: string; icon: string; item?: string }

const CATALOG: Record<RewardKind, { rarity: Rarity; weight: number; title: string; desc: string; icon: string }> = {
  recruit:       { rarity: 'rare',   weight: 3, title: 'Recruit Pokémon',   icon: '🎒', desc: 'Choose 1 of 3 Pokémon of your Gym’s type to join the team.' },
  training:      { rarity: 'common', weight: 4, title: 'Pokémon Training',  icon: '🏋️', desc: 'One Pokémon gains 3 levels.' },
  team_training: { rarity: 'rare',   weight: 2, title: 'Team Training',     icon: '📣', desc: 'Every Pokémon on the team gains 1 level.' },
  revive_pack:   { rarity: 'rare',   weight: 3, title: 'Revive Pack',       icon: '💛', desc: 'Gain 2 Revives (revive a fainted Pokémon at 50% HP).' },
  potion_supply: { rarity: 'common', weight: 4, title: 'Potion Supply',     icon: '🧪', desc: 'Gain 2 Hyper Potions (restore 50% HP).' },
  rare_candy:    { rarity: 'rare',   weight: 2, title: 'Rare Candy Box',    icon: '🍬', desc: 'Gain 2 Rare Candies (+1 level each).' },
  evo_stone:     { rarity: 'epic',   weight: 1, title: 'Evolution Stone',   icon: '💎', desc: 'Evolve a Pokémon at any level, including stone and trade evolutions.' },
  held_item:     { rarity: 'common', weight: 3, title: 'Held item',         icon: '🎁', desc: '' },
  league_favour: { rarity: 'rare',   weight: 1, title: 'League Favour',     icon: '🥚', desc: 'Gain 2 reward rerolls.' },
}

function weightedPick<T>(items: T[], weight: (t: T) => number, rng: Rng): T {
  const total = items.reduce((s, t) => s + weight(t), 0)
  let r = rng() * total
  for (const t of items) if ((r -= weight(t)) < 0) return t
  return items[items.length - 1]
}

function makeReward(kind: RewardKind, gymType: GymType, rng: Rng, n: number): Reward {
  const c = CATALOG[kind]
  if (kind === 'held_item') {
    const item = rng() < 0.4 ? typeItemFor(gymType) : GENERIC_ITEMS[Math.floor(rng() * GENERIC_ITEMS.length)]
    return { id: `${kind}-${n}`, kind, rarity: c.rarity, title: item, icon: c.icon, desc: heldItemDesc(item), item }
  }
  return { id: `${kind}-${n}`, kind, rarity: c.rarity, title: c.title, icon: c.icon, desc: c.desc }
}

/** Three distinct rewards. A Recruit is always offered while the team has room, so it can grow to six. */
export function rewardOffer(gymType: GymType, rosterSize: number, rng: Rng): Reward[] {
  const kinds: RewardKind[] = rosterSize < MAX_TEAM ? ['recruit'] : []
  const pool = (Object.keys(CATALOG) as RewardKind[]).filter(k => k !== 'recruit' || rosterSize < MAX_TEAM)
  while (kinds.length < 3) {
    const k = weightedPick(pool.filter(p => !kinds.includes(p)), p => CATALOG[p].weight, rng)
    kinds.push(k)
  }
  // Shuffle so the recruit isn't always first.
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[kinds[i], kinds[j]] = [kinds[j], kinds[i]]
  }
  return kinds.map((k, i) => makeReward(k, gymType, rng, i))
}

// ─── Recruits ────────────────────────────────────────────────────────────────

let prevoMap: Map<string, string> | null = null
/** The unevolved form of a species' line, e.g. charizard → charmander. */
export function baseOf(id: string): string {
  if (!prevoMap) {
    prevoMap = new Map()
    for (const [from, s] of Object.entries(DEX.species)) for (const e of s.evos) prevoMap.set(e.to, from)
  }
  let cur = id
  while (prevoMap.has(cur)) cur = prevoMap.get(cur)!
  return cur
}

export const averageLevel = (roster: RosterMember[]) =>
  roster.length ? roster.reduce((s, m) => s + m.level, 0) / roster.length : 10

/** Three Pokémon of the Gym's type the team doesn't have, joining near the team's level. */
export function recruitOptions(gymType: GymType, roster: RosterMember[], rng: Rng): RosterMember[] {
  const owned = new Set(roster.map(m => baseOf(m.species)))
  const pool = [...DEX.starters[gymType].filter(id => !owned.has(id))]
  const level = Math.max(5, Math.round(averageLevel(roster)) - 1)
  const picks: RosterMember[] = []
  while (picks.length < 3 && pool.length) {
    const base = pool.splice(Math.floor(rng() * pool.length), 1)[0]
    const id = stageForLevel(base, level, rng)
    if (!species(id).types.some(t => t.toLowerCase() === gymType)) continue // evolution left the type
    picks.push(createMon(id, level))
  }
  return picks
}

// ─── Merchant ────────────────────────────────────────────────────────────────

export interface StockItem { id: string; kind: 'bag' | 'held'; item: string; price: number }

export function merchantStock(gymType: GymType, rng: Rng): StockItem[] {
  const bag: StockItem[] = (Object.keys(BAG_INFO) as BagItem[]).map(b => ({ id: b, kind: 'bag', item: b, price: BAG_INFO[b].price }))
  const held = [typeItemFor(gymType), GENERIC_ITEMS[Math.floor(rng() * GENERIC_ITEMS.length)]]
  return [...bag, ...[...new Set(held)].map(h => ({ id: `held-${h}`, kind: 'held' as const, item: h, price: 250 }))]
}
