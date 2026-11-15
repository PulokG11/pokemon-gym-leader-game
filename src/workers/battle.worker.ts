import { BattleStreams, Dex } from '@pkmn/sim'
import type {
  BattleEvent, BattleMonState, BattleState, MoveChoice, WorkerInbound, WorkerOutbound,
} from '../types/game'
import { nameOf, parseRequest, slotOf, switchTargets } from '../lib/battleRequest'
import type { BattleExtras } from '../lib/upgrades'

const { BattleStream, getPlayerStreams } = BattleStreams

// ─── State ────────────────────────────────────────────────────────────────────

const EMPTY_MON: BattleMonState = {
  name: '', species: '', level: 0, speed: 0, hp: 0, maxHp: 0, fainted: false, status: '',
}

let stream: InstanceType<typeof BattleStream> | null = null
let state: BattleState = makeInitialState()
let firstMoveThisTurn = true
let lastP1Request: any = null

function makeInitialState(): BattleState {
  return {
    turn: 0, p1Active: EMPTY_MON, p2Active: EMPTY_MON,
    p1Team: [], p2Team: [],
    log: [], winner: null,
    phase: 'processing',
    availableMoves: [], forcedSwitch: false, availableSwitches: [],
    seq: 0, event: null,
  }
}

function emit(event: BattleEvent | null) {
  state.seq++
  const msg: WorkerOutbound = {
    type: 'STATE',
    state: {
      ...state,
      event,
      p1Team: state.p1Team.map(m => ({ ...m })),
      p2Team: state.p2Team.map(m => ({ ...m })),
      log: [...state.log],
    },
  }
  self.postMessage(msg)
}

function addLog(text: string) {
  state.log = [...state.log, text].slice(-30)
}

// ─── Protocol helpers ─────────────────────────────────────────────────────────

function parseHp(s: string | undefined): [number, number] {
  if (!s || s.startsWith('0')) return [0, 0]
  const [hp, max] = s.split(' ')[0].split('/').map(Number)
  return [hp || 0, max || 0]
}

const sideOf = (ident: string): 'p1' | 'p2' => (ident.startsWith('p1') ? 'p1' : 'p2')
const speciesOf = (details: string) => details.split(',')[0]
const levelOf = (details: string) => Number(/, L(\d+)/.exec(details)?.[1] ?? 100)
const label = (ident: string) => `${sideOf(ident) === 'p2' ? 'The foe\'s ' : ''}${nameOf(ident)}`

function teamOf(side: 'p1' | 'p2') { return side === 'p1' ? state.p1Team : state.p2Team }

function updateMon(side: 'p1' | 'p2', name: string, patch: Partial<BattleMonState>) {
  const team = teamOf(side)
  const i = team.findIndex(m => m.name === name)
  if (i >= 0) team[i] = { ...team[i], ...patch }
  const activeKey = side === 'p1' ? 'p1Active' : 'p2Active'
  if (state[activeKey].name === name) state[activeKey] = { ...state[activeKey], ...patch }
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
      if (side === 'p1') state.p1Active = mon
      else state.p2Active = mon
      updateMon(side, name, { hp, maxHp, fainted: false })
      addLog(side === 'p1' ? `Go! ${name}!` : `The challenger sent out ${name}!`)
      emit({ kind: 'switch', side })
      break
    }

    case 'move': {
      const side = sideOf(a)
      const m = Dex.moves.get(b)
      addLog(`${label(a)} used ${b}!`)
      if (firstMoveThisTurn && m.priority > 0) {
        const me = side === 'p1' ? state.p1Active : state.p2Active
        const foe = side === 'p1' ? state.p2Active : state.p1Active
        if (me.speed && foe.speed && me.speed < foe.speed) {
          addLog(`${b} has +${m.priority} priority, so it struck first despite lower Speed!`)
        }
      }
      firstMoveThisTurn = false
      emit({ kind: 'move', side })
      break
    }

    case '-damage':
    case '-heal': {
      const side = sideOf(a)
      const [hp, maxHp] = parseHp(b)
      updateMon(side, nameOf(a), maxHp ? { hp, maxHp } : { hp: 0 })
      const from = /\[from\] (?:item: |ability: )?(.+)/.exec(parts.slice(3).join('|'))?.[1]
      if (from) addLog(`${label(a)} ${cmd === '-damage' ? 'was hurt by' : 'restored HP with'} ${from}.`)
      emit({ kind: cmd === '-damage' ? 'damage' : 'heal', side })
      break
    }

    case 'faint':
      updateMon(sideOf(a), nameOf(a), { hp: 0, fainted: true })
      addLog(`${label(a)} fainted!`)
      emit({ kind: 'faint', side: sideOf(a) })
      break

    case '-status':
      updateMon(sideOf(a), nameOf(a), { status: b })
      addLog(`${label(a)} ${STATUS_TEXT[b] ?? `got ${b}`}!`)
      emit({ kind: 'status', side: sideOf(a) })
      break

    case '-curestatus':
      updateMon(sideOf(a), nameOf(a), { status: '' })
      addLog(`${label(a)} recovered.`)
      emit({ kind: 'info', side: sideOf(a) })
      break

    case '-supereffective': addLog("It's super effective!"); emit({ kind: 'info', side: sideOf(a) }); break
    case '-resisted': addLog("It's not very effective..."); emit({ kind: 'info', side: sideOf(a) }); break
    case '-crit': addLog('A critical hit!'); emit({ kind: 'info', side: sideOf(a) }); break
    case '-immune': addLog(`It doesn't affect ${label(a)}...`); emit({ kind: 'info', side: sideOf(a) }); break
    case '-fail': addLog('But it failed!'); emit({ kind: 'info', side: sideOf(a) }); break
    case '-miss': addLog(`${label(a)}'s attack missed!`); emit({ kind: 'miss', side: sideOf(a) }); break
    case 'cant': addLog(`${label(a)} can't move${b ? ` (${b.replace(/^.*: /, '')})` : ''}!`); emit({ kind: 'info', side: sideOf(a) }); break

    case '-boost':
    case '-unboost': {
      const n = Number(c) || 1
      const dir = cmd === '-boost' ? 'rose' : 'fell'
      addLog(`${label(a)}'s ${STAT_NAMES[b] ?? b} ${n > 1 ? `sharply ${dir}` : dir}!`)
      emit({ kind: 'info', side: sideOf(a) })
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
  const activeKey = side === 'p1' ? 'p1Active' : 'p2Active'
  const t = team.find(m => m.name === state[activeKey].name)
  if (t) state[activeKey] = { ...state[activeKey], speed: t.speed }
}

function extractMoves(req: any): MoveChoice[] {
  if (!req?.active?.[0]?.moves) return []
  return (req.active[0].moves as any[]).map((m, i) => ({
    slot: i + 1, id: m.id, name: m.move, pp: m.pp, maxPp: m.maxpp, disabled: !!m.disabled,
  }))
}

const teamOrder = (req: any) => (req.side.pokemon as any[]).map((_, i) => i + 1).join('')

// ─── Challenger AI ───────────────────────────────────────────────────────────
// 0 Rookie: random moves. 1 Trainer: favours its strongest attacks.
// 2 Tactician: type matchups, opening status moves, switches out of bad matchups.

let aiLevel: 0 | 1 | 2 = 0

const typeMult = (atk: string, def: string[]) => (Dex.getImmunity(atk, def) ? 2 ** Dex.getEffectiveness(atk, def) : 0)
const speciesTypes = (name: string) => Dex.species.get(name).types

function bestStab(attackerTypes: string[], foeTypes: string[]) {
  return Math.max(...attackerTypes.map(t => typeMult(t, foeTypes)))
}

function pickAiMove(req: any): string {
  const foeTypes = state.p1Active.species ? speciesTypes(state.p1Active.species) : []
  const team = (req.side?.pokemon ?? []) as any[]

  if (req.forceSwitch?.[0]) {
    const targets = switchTargets(req)
    if (aiLevel === 2 && foeTypes.length && targets.length) {
      const best = [...targets].sort((a, b) =>
        bestStab(speciesTypes(speciesOf(team.find(p => nameOf(p.ident) === b).details)), foeTypes) -
        bestStab(speciesTypes(speciesOf(team.find(p => nameOf(p.ident) === a).details)), foeTypes))[0]
      return `switch ${slotOf(req, best)}`
    }
    return `switch ${targets[0] ? slotOf(req, targets[0]) : 1}`
  }

  const moves = (req?.active?.[0]?.moves ?? []) as any[]
  const avail = moves.map((m, i) => ({ m, slot: i + 1 })).filter(({ m }) => !m.disabled && m.pp > 0)
  if (!avail.length) return 'move 1'
  if (aiLevel === 0 || !foeTypes.length) return `move ${avail[Math.floor(Math.random() * avail.length)].slot}`

  const me = team.find(p => p.active)
  const myTypes = me ? speciesTypes(speciesOf(me.details)) : []
  const scored = avail.map(({ m, slot }) => {
    const d = Dex.moves.get(m.id)
    if (d.category === 'Status') {
      const statusUseful = !state.p1Active.status && (d.status || d.volatileStatus === 'confusion')
      const score = aiLevel === 2 && state.turn <= 3 && statusUseful ? 70 : d.boosts && state.turn <= 2 ? 40 : 5
      return { slot, score, eff: 1, damaging: false }
    }
    const eff = typeMult(d.type, foeTypes)
    const stab = myTypes.includes(d.type) ? 1.5 : 1
    const acc = d.accuracy === true ? 1 : d.accuracy / 100
    const power = d.basePower || 40
    const score = power * stab * acc * (aiLevel === 2 ? eff : 1)
    return { slot, score, eff, damaging: true }
  })

  if (aiLevel === 2) {
    const bestEff = Math.max(0, ...scored.filter(s => s.damaging).map(s => s.eff))
    const targets = switchTargets(req)
    if (bestEff <= 0.5 && targets.length && Math.random() < 0.35) {
      const better = targets
        .map(n => ({ n, e: bestStab(speciesTypes(speciesOf(team.find(p => nameOf(p.ident) === n).details)), foeTypes) }))
        .sort((a, b) => b.e - a.e)[0]
      if (better && better.e >= 2) return `switch ${slotOf(req, better.n)}`
    }
  }

  const noisy = scored.map(s => ({ ...s, score: s.score * (0.85 + Math.random() * 0.3) }))
  noisy.sort((a, b) => b.score - a.score)
  if (aiLevel === 1 && Math.random() < 0.3) return `move ${avail[Math.floor(Math.random() * avail.length)].slot}`
  return `move ${noisy[0].slot}`
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
  if (extras.crowd) {
    cmds.push(`p1.active[0].boostBy({spe: 1}); battle.add('-boost', p1.active[0], 'spe', 1)`)
    addLog(`The home crowd cheers for ${state.p1Active.name}!`)
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
    addLog(`The arena powers up ${state.p1Active.name}!`)
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

self.onmessage = (e: MessageEvent<WorkerInbound>) => {
  const msg = e.data
  if (msg.type === 'INIT') {
    initBattle(msg.payload)
  } else if (msg.type === 'MOVE' && stream && state.phase === 'waiting') {
    state.phase = 'processing'
    stream.write(`>p1 ${msg.payload.choice}`)
  } else if (msg.type === 'SWITCH' && stream && state.phase === 'waiting') {
    const slot = slotOf(lastP1Request, msg.payload.name)
    if (!slot || !switchTargets(lastP1Request).includes(msg.payload.name)) return
    state.phase = 'processing'
    stream.write(`>p1 switch ${slot}`)
  }
}

function initBattle(payload: { format: string; p1Team: string; p2Team: string; p1Hp?: number[]; extras?: BattleExtras; seed?: number[] }) {
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
      const req = parseRequest(chunk)
      if (!req || req.wait) continue
      syncTeamFromRequest(req, 'p1')
      if (req.teamPreview) { stream!.write(`>p1 team ${teamOrder(req)}`); continue }
      state.forcedSwitch = !!req.forceSwitch?.[0]
      state.availableMoves = state.forcedSwitch ? [] : extractMoves(req)
      lastP1Request = req
      state.availableSwitches = switchTargets(req)
      state.phase = 'waiting'
      emit(null)
    }
  })().catch(fail)

  ;(async () => {
    for await (const chunk of p2s) {
      const req = parseRequest(chunk)
      if (!req || req.wait) continue
      syncTeamFromRequest(req, 'p2')
      if (req.teamPreview) { stream!.write(`>p2 team ${teamOrder(req)}`); continue }
      stream!.write(`>p2 ${pickAiMove(req)}`)
    }
  })().catch(fail)

  stream.write(`>start ${JSON.stringify({ formatid: payload.format, ...(payload.seed ? { seed: payload.seed } : {}) })}`)
  stream.write(`>player p1 ${JSON.stringify({ name: 'Gym Leader', team: payload.p1Team })}`)
  stream.write(`>player p2 ${JSON.stringify({ name: 'Challenger', team: payload.p2Team })}`)
  // HP carried over from earlier battles. Values are numbers we computed, never user text.
  ;(payload.p1Hp ?? []).forEach((f, i) => {
    const frac = Math.min(1, Math.max(0.01, Number(f) || 1))
    if (frac < 1) stream!.write(`>eval p1.pokemon[${i}].sethp(Math.max(1, Math.round(p1.pokemon[${i}].maxhp * ${frac})))`)
  })
}
