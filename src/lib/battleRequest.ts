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

/** 1-based slot of `name` in this request, or 0 if absent. */
export function slotOf(req: any, name: string): number {
  if (!req?.side?.pokemon) return 0
  return (req.side.pokemon as any[]).findIndex(p => nameOf(p.ident) === name) + 1
}
