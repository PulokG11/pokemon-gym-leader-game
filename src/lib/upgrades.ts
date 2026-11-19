import type { GymType, RosterMember } from '../types/game'
import { typeItemFor } from './economy'
import { effectiveness, move, species } from './dex'

export type UpgradeId =
  | 'center' | 'training' | 'workshop' | 'office' | 'reputation'
  | 'crowd' | 'analysis' | 'scouting' | 'infirmary' | 'arena' | 'forge'

export interface Upgrade { id: UpgradeId; name: string; category: string; desc: string; price: number; icon: string; typed?: boolean }

const cap = (t: string) => t[0].toUpperCase() + t.slice(1)

/** Start-of-battle field effect for the type's Arena (2 turns), or a stat boost if the type has none. */
const ARENAS: Partial<Record<GymType, { name: string; field: string; kind: 'weather' | 'terrain'; text: string }>> = {
  fire: { name: 'Burning Arena', field: 'sunnyday', kind: 'weather', text: 'Battles start under harsh sunlight for 2 turns.' },
  water: { name: 'Tidal Arena', field: 'raindance', kind: 'weather', text: 'Battles start in heavy rain for 2 turns.' },
  rock: { name: 'Sandstorm Arena', field: 'sandstorm', kind: 'weather', text: 'Battles start in a sandstorm for 2 turns.' },
  ground: { name: 'Dust Bowl Arena', field: 'sandstorm', kind: 'weather', text: 'Battles start in a sandstorm for 2 turns.' },
  ice: { name: 'Blizzard Arena', field: 'snowscape', kind: 'weather', text: 'Battles start in snow for 2 turns.' },
  electric: { name: 'Charged Arena', field: 'electricterrain', kind: 'terrain', text: 'Battles start on Electric Terrain for 2 turns.' },
  grass: { name: 'Overgrown Arena', field: 'grassyterrain', kind: 'terrain', text: 'Battles start on Grassy Terrain for 2 turns.' },
  psychic: { name: 'Mind Arena', field: 'psychicterrain', kind: 'terrain', text: 'Battles start on Psychic Terrain for 2 turns.' },
  fairy: { name: 'Mist Arena', field: 'mistyterrain', kind: 'terrain', text: 'Battles start on Misty Terrain for 2 turns.' },
}

/** Status the Forge inflicts on the challenger's lead; types without one lower its Speed instead. */
const FORGE_STATUS: Partial<Record<GymType, { status: 'brn' | 'par' | 'psn'; name: string; verb: string }>> = {
  fire: { status: 'brn', name: 'Volcanic Forge', verb: 'burn' },
  electric: { status: 'par', name: 'Tesla Forge', verb: 'paralyze' },
  poison: { status: 'psn', name: 'Toxic Forge', verb: 'poison' },
}

export function arenaEffect(type: GymType) {
  return ARENAS[type] ?? null
}
export function forgeEffect(type: GymType) {
  return FORGE_STATUS[type] ?? null
}

export function upgradesFor(type: GymType): Upgrade[] {
  const arena = ARENAS[type]
  const forge = FORGE_STATUS[type]
  return [
    { id: 'center', name: 'Pokémon Center', category: 'Recovery', icon: '✚', price: 300, desc: 'After each victory, every conscious Pokémon recovers 20% HP (instead of 10%).' },
    { id: 'training', name: 'Training Room', category: 'Training', icon: '▲', price: 300, desc: 'Training rewards appear more often and grant +1 extra level.' },
    { id: 'workshop', name: 'Item Workshop', category: 'Economy', icon: '⚙', price: 250, desc: 'Held item rewards appear more often and come with a second, spare item.' },
    { id: 'office', name: 'Recruitment Office', category: 'Recruitment', icon: '✦', price: 300, desc: 'Recruit rewards offer 4 Pokémon instead of 3.' },
    { id: 'reputation', name: 'Gym Reputation', category: 'Economy', icon: '★', price: 250, desc: '+25% Gym Funds from challengers.' },
    { id: 'crowd', name: 'Home Crowd', category: 'Arena', icon: '♪', price: 300, desc: 'The crowd is behind you: your lead starts every battle with +1 Speed.' },
    { id: 'analysis', name: 'Analysis Desk', category: 'Intel', icon: '◎', price: 250, desc: 'Every second victory gives you an extra reward reroll.' },
    { id: 'scouting', name: 'Scouting Room', category: 'Intel', icon: '⌕', price: 200, desc: 'Scout team reveals each challenger’s exact moves, ability and held item, and flags moves that hit your type super-effectively.' },
    { id: 'infirmary', name: 'Infirmary', category: 'Recovery', icon: '♥', price: 250, desc: 'Every second victory leaves a Hyper Potion in your bag.' },
    {
      id: 'arena', typed: true, price: 350, icon: '☀', category: `Arena · ${cap(type)} only`,
      name: arena?.name ?? `${cap(type)} Arena`,
      desc: arena?.text ?? 'Your lead starts every battle with +1 to its stronger attacking stat.',
    },
    {
      id: 'forge', typed: true, price: 400, icon: '♨', category: `Arena · ${cap(type)} only`,
      name: forge?.name ?? `${cap(type)} Forge`,
      desc: `Gain a ${typeItemFor(type)} now; ${forge ? `sparks from the forge ${forge.verb} the challenger’s lead when the battle starts.` : 'the challenger’s lead starts every battle with −1 Speed.'}`,
    },
  ]
}

/** Effects the battle worker applies at the start of turn 1. */
export interface BattleExtras {
  aiLevel: 0 | 1 | 2
  /** Regional Quest: the player is the challenger, and the opponent has a name. */
  foeName?: string
  crowd?: boolean
  arena?: { kind: 'weather' | 'terrain'; field: string } | { kind: 'boost' }
  forge?: { kind: 'status'; status: 'brn' | 'par' | 'psn' } | { kind: 'slow' }
}

export function battleExtras(type: GymType, owned: UpgradeId[], aiLevel: 0 | 1 | 2): BattleExtras {
  const a = ARENAS[type]
  const f = FORGE_STATUS[type]
  return {
    aiLevel,
    crowd: owned.includes('crowd'),
    arena: owned.includes('arena') ? (a ? { kind: a.kind, field: a.field } : { kind: 'boost' }) : undefined,
    forge: owned.includes('forge') ? (f ? { kind: 'status', status: f.status } : { kind: 'slow' }) : undefined,
  }
}

export interface ScoutMove { id: string; name: string; type: string; power: number; superEffective: boolean }
export interface ScoutReport { ability: string; item: string | null; moves: ScoutMove[] }

/** What the Scouting Room reveals about one challenger Pokémon. A move is flagged when it is an attack that
 * hits the Gym's type super-effectively. */
export function scoutReport(mon: RosterMember, gymType: GymType): ScoutReport {
  const gym = gymType[0].toUpperCase() + gymType.slice(1)
  return {
    ability: species(mon.species).ability,
    item: mon.item ?? null,
    moves: mon.moves.map(id => {
      const d = move(id)
      const attack = !!d && d.category !== 'Status'
      return { id, name: d?.name ?? id, type: d?.type ?? 'Normal', power: d?.power ?? 0, superEffective: attack && effectiveness(d!.type, [gym]) >= 2 }
    }),
  }
}
