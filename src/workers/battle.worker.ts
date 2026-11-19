import { BattleStreams, Dex } from '@pkmn/sim'
import type {
  BattleAction, BattleEvent, BattleFormat, BattleMonState, BattleState, WorkerInbound, WorkerOutbound,
} from '../types/game'
import { buildChoice, nameOf, needsTarget, parseRequest, slotOf, slotRequests, switchTargets } from '../lib/battleRequest'
import type { BattleExtras } from '../lib/upgrades'

const { BattleStream, getPlayerStreams } = BattleStreams

// ─── State ────────────────────────────────────────────────────────────────────

const EMPTY_MON: BattleMonState = {
  name: '', species: '', level: 0, speed: 0, hp: 0, maxHp: 0, fainted: false, status: '',
}

const slotsFor = (f: BattleFormat) => (f === 'doubles' ? 2 : 1)

let stream: InstanceType<typeof BattleStream> | null = null
let format: BattleFormat = 'singles'
let state: BattleState = makeInitialState()
let firstMoveThisTurn = true
let lastP1Request: any = null

function makeInitialState(): BattleState {
  const n = slotsFor(format)
  return {
    turn: 0, format,
    p1Active: EMPTY_MON, p2Active: EMPTY_MON,
    p1Actives: Array(n).fill(EMPTY_MON), p2Actives: Array(n).fill(EMPTY_MON),
    p1Team: [], p2Team: [],
    log: [], winner: null,
    phase: 'processing',
    availableMoves: [], forcedSwitch: false, availableSwitches: [], slots: [], requestId: 0,
    seq: 0, event: null,
  }
}

function emit(event: BattleEvent | null) {
  state.seq++
  state.p1Active = state.p1Actives[0]
  state.p2Active = state.p2Actives[0]
  const msg: WorkerOutbound = {
    type: 'STATE',
    state: {
      ...state,
      event,
      p1Actives: state.p1Actives.map(m => ({ ...m })),
      p2Actives: state.p2Actives.map(m => ({ ...m })),
      p1Team: state.p1Team.map(m => ({ ...m })),
      p2Team: state.p2Team.map(m => ({ ...m })),
      log: [...state.log],
    },
  }
  self.postMessage(msg)
}

function addLog(text: string) {
  state.log = [...state.log, text].slice(-40)
}

// ─── Protocol helpers ─────────────────────────────────────────────────────────

function parseHp(s: string | undefined): [number, number] {
  if (!s || s.startsWith('0')) return [0, 0]
  const [hp, max] = s.split(' ')[0].split('/').map(Number)
  return [hp || 0, max || 0]
}

const sideOf = (ident: string): 'p1' | 'p2' => (ident.startsWith('p1') ? 'p1' : 'p2')
/** "p1b: Oddish" → 1 */
const posOf = (ident: string) => (ident[2] === 'b' ? 1 : 0)
const speciesOf = (details: string) => details.split(',')[0]
const levelOf = (details: string) => Number(/, L(\d+)/.exec(details)?.[1] ?? 100)
const label = (ident: string) => `${sideOf(ident) === 'p2' ? 'The foe\'s ' : ''}${nameOf(ident)}`

const teamOf = (side: 'p1' | 'p2') => (side === 'p1' ? state.p1Team : state.p2Team)
const activesOf = (side: 'p1' | 'p2') => (side === 'p1' ? state.p1Actives : state.p2Actives)

function updateMon(side: 'p1' | 'p2', name: string, patch: Partial<BattleMonState>) {
  const team = teamOf(side)
  const i = team.findIndex(m => m.name === name)
  if (i >= 0) team[i] = { ...team[i], ...patch }
  const actives = activesOf(side)
  actives.forEach((m, p) => { if (m.name === name) actives[p] = { ...m, ...patch } })
}

const STATUS_TEXT: Record<string, string> = {
  brn: 'was burned', par: 'is paralyzed', psn: 'was poisoned', tox: 'was badly poisoned',
  slp: 'fell asleep', frz: 'was frozen solid',
}
const STAT_NAMES: Record<string, string> = {
  atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed', accuracy: 'accuracy', evasion: 'evasiveness',
}

function processLine(line: string) {
  if (!line.startsWith('|')) return
  const parts = line.slice(1).split('|')
  const [cmd, a = '', b = '', c = ''] = parts
  const ev = (kind: BattleEvent['kind'], ident = a): BattleEvent => ({ kind, side: sideOf(ident), pos: posOf(ident) })

  switch (cmd) {
    case 'turn':
      state.turn = Number(a) || state.turn
      firstMoveThisTurn = true
      addLog(`— Turn ${state.turn} —`)
      emit({ kind: 'info', side: 'p1' })
      if (state.turn === 1) applyStartEffects()
      break

    case 'switch':
    case 'drag': {
      const side = sideOf(a)
      const name = nameOf(a)
      const [hp, maxHp] = parseHp(c)
      const known = teamOf(side).find(m => m.name === name)
      const mon: BattleMonState = {
        ...EMPTY_MON, ...known, name, species: speciesOf(b), level: levelOf(b), hp, maxHp, fainted: false,
      }
      activesOf(side)[posOf(a)] = mon
      updateMon(side, name, { hp, maxHp, fainted: false })
      addLog(side === 'p1' ? `Go! ${name}!` : `The challenger sent out ${name}!`)
      emit(ev('switch'))
      break
    }

    case 'move': {
      const side = sideOf(a)
      const m = Dex.moves.get(b)
      const target = c && format === 'doubles' && c !== a ? ` on ${label(c).replace("The foe's", "the foe's")}` : ''
      addLog(`${label(a)} used ${b}${target}!`)
      if (format === 'singles' && firstMoveThisTurn && m.priority > 0) {
        const me = side === 'p1' ? state.p1Actives[0] : state.p2Actives[0]
        const foe = side === 'p1' ? state.p2Actives[0] : state.p1Actives[0]
        if (me.speed && foe.speed && me.speed < foe.speed) {
          addLog(`${b} has +${m.priority} priority, so it struck first despite lower Speed!`)
        }
      }
      firstMoveThisTurn = false
      emit(ev('move'))
      break
    }

    case '-damage':
    case '-heal': {
      const [hp, maxHp] = parseHp(b)
      updateMon(sideOf(a), nameOf(a), maxHp ? { hp, maxHp } : { hp: 0 })
      const from = /\[from\] (?:item: |ability: )?(.+)/.exec(parts.slice(3).join('|'))?.[1]
      if (from) addLog(`${label(a)} ${cmd === '-damage' ? 'was hurt by' : 'restored HP with'} ${from}.`)
      emit(ev(cmd === '-damage' ? 'damage' : 'heal'))
      break
    }

    case 'faint':
      updateMon(sideOf(a), nameOf(a), { hp: 0, fainted: true })
      addLog(`${label(a)} fainted!`)
      emit(ev('faint'))
      break

    case '-status':
      updateMon(sideOf(a), nameOf(a), { status: b })
      addLog(`${label(a)} ${STATUS_TEXT[b] ?? `got ${b}`}!`)
      emit(ev('status'))
      break

    case '-curestatus':
      updateMon(sideOf(a), nameOf(a), { status: '' })
      addLog(`${label(a)} recovered.`)
      emit(ev('info'))
      break

    case '-supereffective': addLog("It's super effective!"); emit(ev('info')); break
    case '-resisted': addLog("It's not very effective..."); emit(ev('info')); break
    case '-crit': addLog('A critical hit!'); emit(ev('info')); break
    case '-immune': addLog(`It doesn't affect ${label(a)}...`); emit(ev('info')); break
    case '-fail': addLog('But it failed!'); emit(ev('info')); break
    case '-miss': addLog(`${label(a)}'s attack missed!`); emit(ev('miss')); break
    case 'cant': addLog(`${label(a)} can't move${b ? ` (${b.replace(/^.*: /, '')})` : ''}!`); emit(ev('info')); break

    case '-boost':
    case '-unboost': {
      const n = Number(c) || 1
      const dir = cmd === '-boost' ? 'rose' : 'fell'
      addLog(`${label(a)}'s ${STAT_NAMES[b] ?? b} ${n > 1 ? `sharply ${dir}` : dir}!`)
      emit(ev('info'))
      break
    }

    case 'win':
      state.winner = a === 'Gym Leader' ? 'p1' : 'p2'
      state.phase = 'ended'
      addLog(state.winner === 'p1' ? 'The challenger was defeated! 🏅' : 'Your gym has fallen...')
      emit({ kind: 'info', side: state.winner })
      break
  }
}

// ─── Requests ─────────────────────────────────────────────────────────────────

function syncTeamFromRequest(req: any, side: 'p1' | 'p2') {
  if (!req?.side?.pokemon) return
  const fresh: BattleMonState[] = (req.side.pokemon as any[]).map(p => {
    const [hp, maxHp] = parseHp(p.condition)
    return {
      name: nameOf(p.ident), species: speciesOf(p.details), level: levelOf(p.details),
      speed: p.stats?.spe ?? 0, hp, maxHp, fainted: p.condition.startsWith('0'), status: '',
    }
  })
  const team = teamOf(side)
  if (team.length === 0) {
    team.push(...fresh)
  } else {
    // Keep animated HP from the event stream; only refresh stats.
    for (const f of fresh) {
      const m = team.find(t => t.name === f.name)
      if (m) m.speed = f.speed
    }
  }
  const actives = activesOf(side)
  actives.forEach((a, p) => {
    const t = team.find(m => m.name === a.name)
    if (t) actives[p] = { ...a, speed: t.speed }
  })
}

const moveTarget = (id: string) => Dex.moves.get(id).target
const teamOrder = (req: any) => (req.side.pokemon as any[]).map((_, i) => i + 1).join('')

// ─── Challenger AI ───────────────────────────────────────────────────────────
// 0 Rookie: random moves. 1 Trainer: favours its strongest attacks.
// 2 Tactician: type matchups, opening status moves, switches out of bad matchups.

let aiLevel: 0 | 1 | 2 = 0

const typeMult = (atk: string, def: string[]) => (Dex.getImmunity(atk, def) ? 2 ** Dex.getEffectiveness(atk, def) : 0)
const speciesTypes = (name: string) => Dex.species.get(name).types
const bestStab = (attackerTypes: string[], foeTypes: string[]) => Math.max(...attackerTypes.map(t => typeMult(t, foeTypes)))

/** The player's Pokémon still standing, with their Doubles target number (1 or 2). */
function liveFoes(): { mon: BattleMonState; target: number }[] {
  return state.p1Actives
    .map((mon, i) => ({ mon, target: i + 1 }))
    .filter(f => f.mon.name && !f.mon.fainted)
}

function pickSwitch(req: any, taken: Set<string>): string | null {
  const team = (req.side?.pokemon ?? []) as any[]
  const options = switchTargets(req).filter(n => !taken.has(n))
  if (!options.length) return null
  if (aiLevel === 2) {
    const foeTypes = liveFoes().flatMap(f => speciesTypes(f.mon.species))
    if (foeTypes.length) {
      options.sort((a, b) =>
        bestStab(speciesTypes(speciesOf(team.find(p => nameOf(p.ident) === b).details)), foeTypes) -
        bestStab(speciesTypes(speciesOf(team.find(p => nameOf(p.ident) === a).details)), foeTypes))
    }
  }
  return options[0]
}

function pickSlot(req: any, pos: number): BattleAction {
  const team = (req.side?.pokemon ?? []) as any[]
  const me = team[pos]
  const moves = (req.active?.[pos]?.moves ?? []) as any[]
  // Partner-only moves (e.g. Helping Hand) can't be aimed at foes, so the AI leaves them out.
  const usable = moves.map((m, i) => ({ m, slot: i + 1 })).filter(({ m }) => !m.disabled && m.pp > 0)
  const avail = usable.filter(({ m }) => !String(m.target ?? moveTarget(m.id)).startsWith('adjacentAlly'))
  if (!avail.length) return usable.length ? { kind: 'move', move: usable[0].slot } : { kind: 'move', move: 1 }
  const foes = liveFoes()
  const doubles = format === 'doubles'
  const targetFor = (id: string, foe?: { target: number }) =>
    doubles && needsTarget(moveTarget(id)) && foe ? foe.target : undefined

  if (aiLevel === 0 || !foes.length) {
    const pick = avail[Math.floor(Math.random() * avail.length)]
    const foe = foes[Math.floor(Math.random() * foes.length)]
    return { kind: 'move', move: pick.slot, target: targetFor(pick.m.id, foe) }
  }

  const myTypes = me ? speciesTypes(speciesOf(me.details)) : []
  let best = { score: -1, slot: avail[0].slot, id: avail[0].m.id, foe: foes[0], eff: 1, damaging: false }
  for (const { m, slot } of avail) {
    const d = Dex.moves.get(m.id)
    for (const foe of foes) {
      const foeTypes = speciesTypes(foe.mon.species)
      let score: number
      let eff = 1
      if (d.category === 'Status') {
        const statusUseful = !foe.mon.status && (d.status || d.volatileStatus === 'confusion')
        score = aiLevel === 2 && state.turn <= 3 && statusUseful ? 70 : d.boosts && state.turn <= 2 ? 40 : 5
      } else {
        eff = typeMult(d.type, foeTypes)
        const stab = myTypes.includes(d.type) ? 1.5 : 1
        const acc = d.accuracy === true ? 1 : d.accuracy / 100
        // Finishing off a weakened foe is worth more.
        const finish = foe.mon.maxHp ? 1 + (1 - foe.mon.hp / foe.mon.maxHp) * 0.5 : 1
        score = (d.basePower || 40) * stab * acc * (aiLevel === 2 ? eff * finish : 1)
      }
      score *= 0.85 + Math.random() * 0.3
      if (score > best.score) best = { score, slot, id: m.id, foe, eff, damaging: d.category !== 'Status' }
    }
  }

  if (aiLevel === 2 && !doubles && best.damaging && best.eff <= 0.5 && Math.random() < 0.35) {
    const sw = pickSwitch(req, new Set())
    if (sw) {
      const swTypes = speciesTypes(speciesOf(team.find(p => nameOf(p.ident) === sw).details))
      if (bestStab(swTypes, speciesTypes(foes[0].mon.species)) >= 2) return { kind: 'switch', name: sw }
    }
  }
  if (aiLevel === 1 && Math.random() < 0.3) {
    const pick = avail[Math.floor(Math.random() * avail.length)]
    return { kind: 'move', move: pick.slot, target: targetFor(pick.m.id, foes[Math.floor(Math.random() * foes.length)]) }
  }
  return { kind: 'move', move: best.slot, target: targetFor(best.id, best.foe) }
}

/** The challenger's full choice for this request, one action per active slot. */
function aiChoice(req: any): string {
  const slots = slotRequests(req, moveTarget)
  const taken = new Set<string>()
  const actions: BattleAction[] = slots.map(s => {
    if (s.pass) return { kind: 'pass' }
    if (s.forced) {
      const name = pickSwitch(req, taken)
      if (!name) return { kind: 'pass' }
      taken.add(name)
      return { kind: 'switch', name }
    }
    return pickSlot(req, s.pos)
  })
  return buildChoice(req, actions)
}

// ─── Gym upgrade effects at the start of turn 1 ──────────────────────────────

const FIELDS = new Set(['sunnyday', 'raindance', 'sandstorm', 'snowscape', 'electricterrain', 'grassyterrain', 'psychicterrain', 'mistyterrain'])
const STATUSES = new Set(['brn', 'par', 'psn'])
const FIELD_TEXT: Record<string, string> = {
  sunnyday: 'The sunlight turned harsh!', raindance: 'It started to rain!', sandstorm: 'A sandstorm kicked up!',
  snowscape: 'It started to snow!', electricterrain: 'An electric current ran across the arena!',
  grassyterrain: 'Grass grew to cover the arena!', psychicterrain: 'The arena got weird!', mistyterrain: 'Mist swirled around the arena!',
}

let extras: BattleExtras = { aiLevel: 0 }
let startEffectsDone = false

function applyStartEffects() {
  if (!stream || startEffectsDone) return
  startEffectsDone = true
  const cmds: string[] = []
  const lead = state.p1Actives[0].name
  if (extras.crowd) {
    cmds.push(`p1.active[0].boostBy({spe: 1}); battle.add('-boost', p1.active[0], 'spe', 1)`)
    addLog(`The home crowd cheers for ${lead}!`)
  }
  const arena = extras.arena
  if (arena?.kind === 'weather' && FIELDS.has(arena.field)) {
    cmds.push(`battle.field.setWeather('${arena.field}', p1.active[0]); battle.field.weatherState.duration = 2`)
    addLog(FIELD_TEXT[arena.field])
  } else if (arena?.kind === 'terrain' && FIELDS.has(arena.field)) {
    cmds.push(`battle.field.setTerrain('${arena.field}', p1.active[0]); battle.field.terrainState.duration = 2`)
    addLog(FIELD_TEXT[arena.field])
  } else if (arena?.kind === 'boost') {
    cmds.push(`{ const p = p1.active[0]; const s = p.storedStats.atk >= p.storedStats.spa ? 'atk' : 'spa'; p.boostBy({[s]: 1}); battle.add('-boost', p, s, 1) }`)
    addLog(`The arena powers up ${lead}!`)
  }
  const forge = extras.forge
  if (forge?.kind === 'status' && STATUSES.has(forge.status)) {
    cmds.push(`p2.active[0].trySetStatus('${forge.status}', p1.active[0])`)
  } else if (forge?.kind === 'slow') {
    cmds.push(`p2.active[0].boostBy({spe: -1}); battle.add('-unboost', p2.active[0], 'spe', 1)`)
  }
  if (cmds.length) {
    stream.write(`>eval ${cmds.join('; ')}`)
    emit({ kind: 'info', side: 'p1' })
  }
}

// ─── Message handler ──────────────────────────────────────────────────────────

/** Why a set of actions can't be sent for the current request, or null if it can. */
function invalidReason(actions: BattleAction[]): string | null {
  if (!lastP1Request) return 'no request'
  if (!Array.isArray(actions) || actions.length !== state.slots.length) return `expected ${state.slots.length} actions, got ${actions?.length}`
  const benched = new Set(switchTargets(lastP1Request))
  const used = new Set<string>()
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i]
    const s = state.slots[i]
    if (a.kind === 'pass') { if (!s.pass) return `slot ${i} cannot pass`; continue }
    if (a.kind === 'switch') {
      if (!benched.has(a.name) || used.has(a.name) || !slotOf(lastP1Request, a.name)) return `cannot switch to ${a.name}`
      used.add(a.name)
      continue
    }
    const m = s.moves[a.move - 1]
    if (s.pass || s.forced || !m || m.disabled || m.pp <= 0) return `slot ${i} cannot use move ${a.move}`
    if (a.target !== undefined && ![1, 2, -1, -2].includes(a.target)) return `bad target ${a.target}`
  }
  return null
}

self.onmessage = (e: MessageEvent<WorkerInbound>) => {
  const msg = e.data
  if (msg.type === 'INIT') {
    initBattle(msg.payload)
  } else if (msg.type === 'CHOOSE' && stream) {
    const why = state.phase !== 'waiting' ? `not waiting (${state.phase})` : invalidReason(msg.payload.actions)
    if (why) {
      self.postMessage({ type: 'ERROR', message: `Choice ignored: ${why}` } satisfies WorkerOutbound)
      return
    }
    state.phase = 'processing'
    stream.write(`>p1 ${buildChoice(lastP1Request, msg.payload.actions)}`)
  }
}

function initBattle(payload: { format: string; p1Team: string; p2Team: string; p1Hp?: number[]; extras?: BattleExtras; seed?: number[] }) {
  format = payload.format.includes('doubles') ? 'doubles' : 'singles'
  state = makeInitialState()
  extras = payload.extras ?? { aiLevel: 0 }
  aiLevel = extras.aiLevel === 1 || extras.aiLevel === 2 ? extras.aiLevel : 0
  startEffectsDone = false
  firstMoveThisTurn = true
  lastP1Request = null
  stream = new BattleStream()
  const { p1: p1s, p2: p2s, omniscient: obs } = getPlayerStreams(stream)
  const fail = (err: unknown) => self.postMessage({ type: 'ERROR', message: String(err) } satisfies WorkerOutbound)

  ;(async () => {
    for await (const chunk of obs) for (const line of chunk.split('\n')) processLine(line.trim())
  })().catch(fail)

  ;(async () => {
    for await (const chunk of p1s) {
      const rejected = /^\|error\|(.*)$/m.exec(chunk)?.[1]
      if (rejected && lastP1Request) {
        // The engine refused the choice: report it and ask the player again.
        self.postMessage({ type: 'ERROR', message: rejected } satisfies WorkerOutbound)
        state.requestId++
        state.phase = 'waiting'
        emit(null)
        continue
      }
      const req = parseRequest(chunk)
      if (!req || req.wait) continue
      syncTeamFromRequest(req, 'p1')
      if (req.teamPreview) { stream!.write(`>p1 team ${teamOrder(req)}`); continue }
      lastP1Request = req
      state.requestId++
      state.slots = slotRequests(req, moveTarget)
      state.forcedSwitch = state.slots.some(s => s.forced)
      state.availableMoves = state.slots[0]?.moves ?? []
      state.availableSwitches = switchTargets(req)
      state.phase = 'waiting'
      emit(null)
    }
  })().catch(fail)

  ;(async () => {
    for await (const chunk of p2s) {
      if (/^\|error\|/m.test(chunk)) {
        // The engine refused the AI's choice: let it pick a valid default so the battle never stalls.
        stream!.write('>p2 default')
        continue
      }
      const req = parseRequest(chunk)
      if (!req || req.wait) continue
      syncTeamFromRequest(req, 'p2')
      if (req.teamPreview) { stream!.write(`>p2 team ${teamOrder(req)}`); continue }
      try {
        stream!.write(`>p2 ${aiChoice(req)}`)
      } catch (err) {
        fail(err)
        stream!.write('>p2 default')
      }
    }
  })().catch(fail)

  stream.write(`>start ${JSON.stringify({ formatid: payload.format === 'gen9doublescustomgame' ? 'gen9doublescustomgame' : 'gen9customgame', ...(payload.seed ? { seed: payload.seed } : {}) })}`)
  stream.write(`>player p1 ${JSON.stringify({ name: 'Gym Leader', team: payload.p1Team })}`)
  stream.write(`>player p2 ${JSON.stringify({ name: 'Challenger', team: payload.p2Team })}`)
  // HP carried over from earlier battles. Values are numbers we computed, never user text.
  ;(payload.p1Hp ?? []).forEach((f, i) => {
    const frac = Math.min(1, Math.max(0.01, Number(f) || 1))
    if (frac < 1) stream!.write(`>eval p1.pokemon[${i}].sethp(Math.max(1, Math.round(p1.pokemon[${i}].maxhp * ${frac})))`)
  })
}
