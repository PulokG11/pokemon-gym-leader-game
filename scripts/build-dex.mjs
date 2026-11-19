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

/** Newest generation in which this learnset has a source matching `kinds` (e.g. 'L' or 'MTE'). */
function newestGen(learnset, kinds) {
  let gen = 0
  const re = new RegExp(`^(\\d)[${kinds}]`)
  for (const sources of Object.values(learnset)) {
    for (const src of sources) {
      const m = re.exec(src)
      if (m) gen = Math.max(gen, Number(m[1]))
    }
  }
  return gen
}

// Level-up moves from the newest game that has them: Gen 9 for Scarlet/Violet Pokémon,
// earlier games for Pokémon that aren't in Gen 9 (e.g. Onix, Kabuto in the Regional Quest).
function levelUpMoves(id) {
  const learnset = Dex.species.getLearnsetData(id)?.learnset ?? {}
  const gen = newestGen(learnset, 'L')
  const entries = []
  for (const [move, sources] of Object.entries(learnset)) {
    for (const src of sources) {
      const m = new RegExp(`^${gen}L(\\d+)$`).exec(src)
      if (m && Dex.moves.get(move).exists) entries.push([Number(m[1]), move])
    }
  }
  return entries.sort((a, b) => a[0] - b[0])
}

// Regional Quest: every Pokémon of the region's original Pokédex, legendaries included,
// plus anything they evolve into in later games.
const REGIONS = { kanto: { first: 1, last: 151 } }
const regional = new Set()
for (const { first, last } of Object.values(REGIONS)) {
  const queue = Dex.species.all().filter(s => s.exists && !s.forme && s.num >= first && s.num <= last)
  while (queue.length) {
    const s = queue.pop()
    if (regional.has(s.id)) continue
    regional.add(s.id)
    for (const e of s.evos) {
      const next = Dex.species.get(e)
      if (next.exists && !next.forme) queue.push(next)
    }
  }
}
const included = s => available(s) || regional.has(s.id)

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

// Move Tutor pool: Gen 9 TM, tutor and egg moves a species can't learn by level-up.
const TUTOR_LIMIT = 10
const TUTOR_STATUS = new Set(['swordsdance', 'nastyplot', 'calmmind', 'dragondance', 'bulkup', 'quiverdance', 'recover', 'roost', 'protect', 'willowisp', 'thunderwave', 'toxic', 'helpinghand', 'trickroom', 'tailwind'])
// Moves that only work in odd situations, or need Terastallizing.
const TUTOR_SKIP = new Set(['terablast', 'focuspunch', 'dreameater', 'synchronoise', 'lastresort', 'belch', 'steelroller', 'burnup', 'doubleshock'])
function tutorMoves(id, levelUp) {
  const own = new Set(levelUp.map(([, m]) => m))
  const pool = new Set()
  // Include what earlier stages could learn, as the games do.
  for (let s = Dex.species.get(id); s?.exists; s = s.prevo ? Dex.species.get(s.prevo) : null) {
    const learnset = Dex.species.getLearnsetData(s.id)?.learnset ?? {}
    const gen = newestGen(learnset, 'MTE')
    const re = new RegExp(`^${gen}[MTE]`)
    for (const [move, sources] of Object.entries(learnset)) {
      if (own.has(move) || !sources.some(src => re.test(src))) continue
      const m = Dex.moves.get(move)
      if (!m.exists || m.isNonstandard || m.isZ || m.isMax || m.priority < 0 || m.selfdestruct || TUTOR_SKIP.has(move)) continue
      if (m.category === 'Status' ? TUTOR_STATUS.has(move) : m.basePower >= 50 && !m.flags.charge && !m.flags.recharge) pool.add(move)
    }
  }
  const types = Dex.species.get(id).types
  const score = m => {
    const d = Dex.moves.get(m)
    return d.category === 'Status' ? 70 : d.basePower * (d.accuracy === true ? 1 : d.accuracy / 100) * (types.includes(d.type) ? 1.2 : 1)
  }
  return [...pool].sort((a, b) => score(b) - score(a) || a.localeCompare(b)).slice(0, TUTOR_LIMIT)
}

const hasDamagingMove = (learnset, level) =>
  movesAt(learnset, level).some(m => Dex.moves.get(m).category !== 'Status')

const candidates = Dex.species.all().filter(included)
const learnsets = new Map()
for (const s of candidates) {
  const ls = levelUpMoves(s.id)
  if (ls.length) learnsets.set(s.id, ls)
}

const out = { species: {}, moves: {}, starters: {}, challengers: [], typeChart: {}, regions: {}, megas: {} }

// typeChart[defending][attacking] = damage multiplier (Showdown damageTaken: 1 weak, 2 resist, 3 immune)
const TYPE_MULT = { 0: 1, 1: 2, 2: 0.5, 3: 0 }
for (const t of Dex.types.all()) {
  if (t.isNonstandard) continue
  out.typeChart[t.name] = Object.fromEntries(
    Dex.types.all().filter(a => !a.isNonstandard).map(a => [a.name, TYPE_MULT[t.damageTaken[a.name] ?? 0]]),
  )
}
const usedMoves = new Set()

for (const s of candidates) {
  const learnset = learnsets.get(s.id)
  if (!learnset) continue
  const ownLevel = s.prevo ? (s.evoLevel ?? FALLBACK_EVO_LEVEL) : 0
  const evos = s.evos
    .map(name => Dex.species.get(name))
    .filter(e => learnsets.has(e.id) && included(e))
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
    tutor: tutorMoves(s.id, learnset),
  }
  for (const [, m] of learnset) usedMoves.add(m)
  for (const m of out.species[s.id].tutor) usedMoves.add(m)

  // Gym Quest and Daily pools stay Scarlet/Violet-only so Daily seeds don't change.
  if (available(s) && !s.prevo && s.bst <= MAX_BASE_BST && hasDamagingMove(learnset, START_LEVEL_MIN)) {
    out.challengers.push(s.id)
    for (const t of s.types) (out.starters[t.toLowerCase()] ??= []).push(s.id)
  }
}

// Regional pools: the region's unevolved, non-legendary Pokémon (a baby from a later
// generation doesn't count, so Pikachu and Jynx are unevolved in Kanto).
for (const [id, { first, last }] of Object.entries(REGIONS)) {
  const inRegion = s => s.num >= first && s.num <= last
  out.regions[id] = {
    pool: candidates
      .filter(s => inRegion(s) && out.species[s.id] && s.tags.length === 0 && s.id !== 'ditto')
      .filter(s => !s.prevo || !inRegion(Dex.species.get(s.prevo)))
      .map(s => s.id),
  }
}

// Mega Evolutions that can appear in battle: names and types for the battle screen.
for (const item of Dex.items.all()) {
  if (!item.megaStone) continue
  for (const [base, forme] of Object.entries(item.megaStone)) {
    if (!out.species[Dex.species.get(base).id]) continue
    const f = Dex.species.get(forme)
    out.megas[f.id] = { name: f.name, types: f.types, base: Dex.species.get(base).id, stone: item.name }
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
