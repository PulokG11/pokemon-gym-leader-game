import { BattleStreams, Dex } from '@pkmn/sim'
import type {
  BattleEvent, BattleMonState, BattleState, MoveChoice, WorkerInbound, WorkerOutbound,
} from '../types/game'
import { nameOf, parseRequest, slotOf, switchTargets } from '../lib/battleRequest'

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

function pickAiMove(req: any): string {
  if (req.forceSwitch?.[0]) {
    const target = switchTargets(req)[0]
    return `switch ${target ? slotOf(req, target) : 1}`
  }
  const moves = (req?.active?.[0]?.moves ?? []) as any[]
  const avail = moves.map((m, i) => ({ m, slot: i + 1 })).filter(({ m }) => !m.disabled && m.pp > 0)
  if (!avail.length) return 'move 1'
  return `move ${avail[Math.floor(Math.random() * avail.length)].slot}`
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

function initBattle(payload: { format: string; p1Team: string; p2Team: string; p1Hp?: number[]; seed?: number[] }) {
  state = makeInitialState()
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
