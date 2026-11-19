import type { BattleAction, SlotRequest } from '../types/game'

// Helpers for Showdown `|request|` payloads. The engine reorders `side.pokemon`
// on every switch (the active Pokémon is always first), so slots must be looked
// up from the latest request — never cached.

export const nameOf = (ident: string) =>
  ident.includes(': ') ? ident.split(': ').slice(1).join(': ') : ident

export function parseRequest(chunk: string): any | null {
  for (const line of chunk.split('\n')) {
    if (line.startsWith('|request|') && line.length > 9) {
      try { return JSON.parse(line.slice(9)) } catch { return null }
    }
  }
  return null
}

const isFainted = (p: any) => String(p.condition).startsWith('0')

/** Names of benched, healthy Pokémon that can be switched in. */
export function switchTargets(req: any): string[] {
  if (!req?.side?.pokemon) return []
  return (req.side.pokemon as any[]).filter(p => !p.active && !isFainted(p)).map(p => nameOf(p.ident))
}

/** Move targets that need the player to pick a Pokémon in Doubles. */
const PICK_TARGET = new Set(['normal', 'any', 'adjacentFoe', 'adjacentAlly', 'adjacentAllyOrSelf'])
export const needsTarget = (target: string) => PICK_TARGET.has(target)

/** Per active slot: what must be decided. Active Pokémon are listed first in side.pokemon. */
export function slotRequests(req: any, moveTargets: (id: string) => string): SlotRequest[] {
  const team = (req?.side?.pokemon ?? []) as any[]
  const forced = (req?.forceSwitch ?? []) as boolean[]
  const count = Math.max(req?.active?.length ?? 0, forced.length)
  const benched = switchTargets(req).length
  let forcedLeft = benched
  return Array.from({ length: count }, (_, pos) => {
    const p = team[pos]
    const name = p ? nameOf(p.ident) : ''
    if (forced.length) {
      const must = !!forced[pos] && forcedLeft > 0
      if (must) forcedLeft--
      return { pos, name, moves: [], forced: must, pass: !must, canMega: false, zMoves: [] }
    }
    const fainted = !p || isFainted(p)
    const moves = ((req.active?.[pos]?.moves ?? []) as any[]).map((m, i) => ({
      slot: i + 1, id: m.id, name: m.move, pp: m.pp, maxPp: m.maxpp, disabled: !!m.disabled, target: m.target ?? moveTargets(m.id),
    }))
    const z = (req.active?.[pos]?.canZMove ?? []) as ({ move: string } | null)[]
    const zMoves = moves.map((_, i) => (fainted ? null : z[i]?.move ?? null))
    return { pos, name, moves, forced: false, pass: fainted, canMega: !fainted && !!req.active?.[pos]?.canMegaEvo, zMoves }
  })
}

/** Showdown choice string, e.g. "move 1 2, switch 3" — switches resolved by name to the current slot. */
export function buildChoice(req: any, actions: BattleAction[]): string {
  return actions
    .map(a => {
      if (a.kind === 'pass') return 'pass'
      if (a.kind === 'switch') return `switch ${slotOf(req, a.name)}`
      const mega = a.mega ? ' mega' : a.zmove ? ' zmove' : ''
      return a.target === undefined ? `move ${a.move}${mega}` : `move ${a.move} ${a.target}${mega}`
    })
    .join(', ')
}

/** 1-based slot of `name` in this request, or 0 if absent. */
export function slotOf(req: any, name: string): number {
  if (!req?.side?.pokemon) return 0
  return (req.side.pokemon as any[]).findIndex(p => nameOf(p.ident) === name) + 1
}
