import { Battle, Dex } from '@pkmn/sim'
import { createMon, packTeam } from './progression'
import { bestMoves, buildTrainerTeam } from './regional'
import { REGIONS, type RegionId } from './regions'
import { baseOf, finalForm } from './dreamTeam'
import { seededRng } from './daily'
import type { RosterMember } from '../types/game'

/** Dream Team Builder: plays the drafted team through the region's 13 battles on the real battle engine. */

export const DT_BEST_OF = 3

export interface DreamBattle {
  index: number
  wins: number          // games won out of DT_BEST_OF
  losses: number
  won: boolean
  left: number          // the team's Pokémon still standing at the end of the deciding game
}

export interface DreamResult { battles: DreamBattle[]; beaten: number; champion: boolean }

/** The drafted team as it fights opponent `index`: final forms at that opponent's top level (no training), strong varied moves. */
export function dreamTeamFor(region: RegionId, picks: string[], index: number): RosterMember[] {
  const t = REGIONS[region].trainers[index]
  const level = Math.max(...t.team.map(m => m.level))
  return picks.map(p => {
    const id = finalForm(p)
    return { ...createMon(id, level), moves: bestMoves(id, level, true) }
  })
}

let aiRng: () => number = Math.random

const typeMult = (atk: string, def: readonly string[]) => (Dex.getImmunity(atk, def as string[]) ? 2 ** Dex.getEffectiveness(atk, def as string[]) : 0)

type Mon = Battle['sides'][number]['pokemon'][number]

/** Rough damage of `move` from `me` against `foe`, for choosing moves and switch-ins. */
function score(me: Mon, foe: Mon, moveId: string): number {
  const d = Dex.moves.get(moveId)
  if (d.category === 'Status') return 1
  const physical = d.category === 'Physical'
  const atk = physical ? me.storedStats.atk : me.storedStats.spa
  const def = physical ? foe.storedStats.def : foe.storedStats.spd
  const stab = me.getTypes().includes(d.type) ? 1.5 : 1
  const acc = d.accuracy === true ? 1 : d.accuracy / 100
  return (d.basePower || 40) * stab * acc * typeMult(d.type, foe.getTypes()) * (atk / Math.max(1, def))
}

/** Both sides play the same tactician AI: the most damaging move, Mega/Z when possible, best switch-in after a faint. */
function choose(side: Battle['sides'][number]): string {
  const req = side.activeRequest as any
  const foe = side.foe.active[0]
  if (req.forceSwitch) {
    const bench = side.pokemon.map((p, i) => ({ p, i })).filter(({ p }) => !p.fainted && !p.isActive)
    if (!bench.length) return 'pass'
    bench.sort((a, b) => best(b.p, foe) - best(a.p, foe))
    return `switch ${bench[0].i + 1}`
  }
  const me = side.active[0]
  const moves = (req.active?.[0]?.moves ?? []) as any[]
  let pick = 1, top = -1
  moves.forEach((m, i) => {
    if (m.disabled || m.pp <= 0) return
    const s = foe ? score(me, foe, m.id) * (0.9 + aiRng() * 0.2) : 1
    if (s > top) { top = s; pick = i + 1 }
  })
  const a = req.active?.[0] ?? {}
  if (a.canMegaEvo) return `move ${pick} mega`
  if (Array.isArray(a.canZMove) && a.canZMove[pick - 1]) return `move ${pick} zmove`
  return `move ${pick}`
}

const best = (me: Mon, foe: Mon | undefined) => (foe ? Math.max(1, ...me.moveSlots.map(s => score(me, foe, s.id))) : 1)

/** One game; true if the drafted team (p1) wins. */
function playGame(p1: string, p2: string, seed: number[]): { won: boolean; left: number } {
  aiRng = seededRng(`ai:${seed.join(',')}`)
  const battle = new Battle({ formatid: 'gen9customgame' as any, seed: seed as any })
  battle.setPlayer('p1', { name: 'Dream Team', team: p1 })
  battle.setPlayer('p2', { name: 'Opponent', team: p2 })
  for (let guard = 0; !battle.ended && guard < 2000; guard++) {
    let acted = false
    for (const side of battle.sides) {
      const req = side.activeRequest as any
      if (!req || req.wait || side.isChoiceDone()) continue
      acted = true
      if (!battle.choose(side.id, choose(side))) battle.choose(side.id, 'default')
    }
    if (!acted) break
  }
  const left = battle.sides[0].pokemon.filter(p => !p.fainted).length
  return { won: battle.winner === 'Dream Team', left }
}

/** Plays opponents in order until a best-of-3 is lost. The same team always gets the same result. */
export function simulateDreamTeam(region: RegionId, picks: string[]): DreamResult {
  const trainers = REGIONS[region].trainers
  const rng = seededRng(`dream:${region}:${picks.join(',')}`)
  const battles: DreamBattle[] = []
  for (let index = 0; index < trainers.length; index++) {
    const p1 = packTeam(dreamTeamFor(region, picks, index))
    // A Champion with a "rival starter" counters your first pick if it's one of the region's starters.
    const p2 = packTeam(buildTrainerTeam(REGIONS[region], index, baseOf(picks[0])))
    let wins = 0, losses = 0, left = 0
    while (wins < 2 && losses < 2) {
      const seed = [0, 0, 0, 0].map(() => Math.floor(rng() * 65536))
      const g = playGame(p1, p2, seed)
      if (g.won) wins++
      else losses++
      left = g.left
    }
    const won = wins >= 2
    battles.push({ index, wins, losses, won, left })
    if (!won) break
  }
  const beaten = battles.filter(b => b.won).length
  return { battles, beaten, champion: beaten === trainers.length }
}
