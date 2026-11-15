// Generates src/data/dex.json from @pkmn/sim: species, Gen 9 level-up learnsets,
// evolutions and move details. Run with `npm run data`.
import { writeFileSync, mkdirSync } from 'node:fs'
import { Dex } from '@pkmn/sim'

// Item/trade/friendship evolutions have no level; they evolve at this level instead.
const FALLBACK_EVO_LEVEL = 30
const START_LEVEL_MIN = 12
// Keeps Paradox Pokémon and other untagged legendary-tier species out of starter/challenger pools.
const MAX_BASE_BST = 540

const available = s =>
  s.exists && !s.isNonstandard && !s.forme && s.tags.length === 0 && s.num > 0

function levelUpMoves(id) {
  const learnset = Dex.species.getLearnsetData(id)?.learnset ?? {}
  const entries = []
  for (const [move, sources] of Object.entries(learnset)) {
    for (const src of sources) {
      const m = /^9L(\d+)$/.exec(src)
      if (m && Dex.moves.get(move).exists) entries.push([Number(m[1]), move])
    }
  }
  return entries.sort((a, b) => a[0] - b[0])
}

function movesAt(learnset, level) {
  const known = []
  for (const [lvl, move] of learnset) {
    if (lvl > level) break
    const i = known.indexOf(move)
    if (i >= 0) known.splice(i, 1)
    known.push(move)
  }
  return known.slice(-4)
}

const hasDamagingMove = (learnset, level) =>
  movesAt(learnset, level).some(m => Dex.moves.get(m).category !== 'Status')

const candidates = Dex.species.all().filter(available)
const learnsets = new Map()
for (const s of candidates) {
  const ls = levelUpMoves(s.id)
  if (ls.length) learnsets.set(s.id, ls)
}

const out = { species: {}, moves: {}, starters: {}, challengers: [] }
const usedMoves = new Set()

for (const s of candidates) {
  const learnset = learnsets.get(s.id)
  if (!learnset) continue
  const ownLevel = s.prevo ? (s.evoLevel ?? FALLBACK_EVO_LEVEL) : 0
  const evos = s.evos
    .map(name => Dex.species.get(name))
    .filter(e => learnsets.has(e.id) && available(e))
    .map(e => ({
      to: e.id,
      level: e.evoLevel ?? Math.max(FALLBACK_EVO_LEVEL, ownLevel + 10),
    }))
  out.species[s.id] = {
    name: s.name,
    num: s.num,
    types: s.types,
    ability: s.abilities['0'],
    abilities: [...new Set(Object.values(s.abilities))],
    baseStats: s.baseStats,
    evos,
    learnset,
  }
  for (const [, m] of learnset) usedMoves.add(m)

  if (!s.prevo && s.bst <= MAX_BASE_BST && hasDamagingMove(learnset, START_LEVEL_MIN)) {
    out.challengers.push(s.id)
    for (const t of s.types) (out.starters[t.toLowerCase()] ??= []).push(s.id)
  }
}

for (const id of [...usedMoves].sort()) {
  const m = Dex.moves.get(id)
  out.moves[id] = {
    name: m.name,
    type: m.type,
    category: m.category,
    power: m.basePower,
    accuracy: m.accuracy,
    pp: m.pp,
    priority: m.priority,
    desc: m.shortDesc || m.desc,
  }
}

mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true })
writeFileSync(new URL('../src/data/dex.json', import.meta.url), JSON.stringify(out))

const sizes = Object.entries(out.starters).map(([t, l]) => `${t}:${l.length}`).join(' ')
console.log(`species ${Object.keys(out.species).length}, moves ${usedMoves.size}, challengers ${out.challengers.length}`)
console.log(`starter pools ${sizes}`)
