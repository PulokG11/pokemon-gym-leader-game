import { BattleStreams } from '@pkmn/sim'
const { BattleStream, getPlayerStreams } = BattleStreams
import type { BattleMonState, BattleState, MoveChoice, WorkerInbound, WorkerOutbound } from '../types/game'

// ─── State ────────────────────────────────────────────────────────────────────

let stream: InstanceType<typeof BattleStream> | null = null
let state: BattleState = makeInitialState()
let logBuffer: string[] = []

function makeInitialState(): BattleState {
  const empty: BattleMonState = { name: '', hp: 0, maxHp: 0, fainted: false, status: '' }
  return {
    turn: 0, p1Active: empty, p2Active: empty,
    p1Team: [], p2Team: [],
    log: [], winner: null,
    phase: 'processing',
    availableMoves: [], forcedSwitch: false, availableSwitches: [],
  }
}

function post(msg: WorkerOutbound) { self.postMessage(msg) }

function addLog(text: string) {
  logBuffer.push(text)
  if (logBuffer.length > 20) logBuffer.shift()
  state.log = [...logBuffer]
}

// ─── Protocol parser ──────────────────────────────────────────────────────────

function parseHp(s: string): [number, number] {
  if (!s || s.startsWith('0 fnt')) return [0, 0]
  const [hp, max] = s.split('/').map(Number)
  return [hp ?? 0, max ?? 0]
}

function sideOf(ident: string): 'p1' | 'p2' {
  return ident.startsWith('p1') ? 'p1' : 'p2'
}

function nameOf(ident: string): string {
  return ident.includes(': ') ? ident.split(': ').slice(1).join(': ') : ident
}

function processLine(line: string) {
  if (!line.startsWith('|')) return
  const parts = line.slice(1).split('|')
  const cmd = parts[0]

  switch (cmd) {
    case 'turn':
      state.turn = parseInt(parts[1]) || state.turn
      break

    case 'switch':
    case 'drag': {
      const side = sideOf(parts[1])
      const name = nameOf(parts[1])
      const [hp, maxHp] = parseHp(parts[3])
      const mon: BattleMonState = { name, hp, maxHp, fainted: false, status: '' }
      if (side === 'p1') {
        state.p1Active = mon
        const i = state.p1Team.findIndex(m => m.name === name)
        if (i >= 0) state.p1Team[i] = { ...state.p1Team[i], hp, maxHp, fainted: false }
      } else {
        state.p2Active = mon
        const i = state.p2Team.findIndex(m => m.name === name)
        if (i >= 0) state.p2Team[i] = { ...state.p2Team[i], hp, maxHp, fainted: false }
      }
      addLog(`${name} entered the battle!`)
      break
    }

    case 'move':
      addLog(`${nameOf(parts[1])} used ${parts[2]}!`)
      break

    case '-damage':
    case '-heal': {
      const side = sideOf(parts[1])
      const name = nameOf(parts[1])
      const [hp, maxHp] = parseHp(parts[2])
      if (side === 'p1') {
        state.p1Active = { ...state.p1Active, hp, maxHp }
        const i = state.p1Team.findIndex(m => m.name === name)
        if (i >= 0) state.p1Team[i] = { ...state.p1Team[i], hp, maxHp }
      } else {
        state.p2Active = { ...state.p2Active, hp, maxHp }
        const i = state.p2Team.findIndex(m => m.name === name)
        if (i >= 0) state.p2Team[i] = { ...state.p2Team[i], hp, maxHp }
      }
      break
    }

    case 'faint': {
      const side = sideOf(parts[1])
      const name = nameOf(parts[1])
      if (side === 'p1') {
        state.p1Active = { ...state.p1Active, hp: 0, fainted: true }
        const i = state.p1Team.findIndex(m => m.name === name)
        if (i >= 0) state.p1Team[i] = { ...state.p1Team[i], hp: 0, fainted: true }
      } else {
        state.p2Active = { ...state.p2Active, hp: 0, fainted: true }
        const i = state.p2Team.findIndex(m => m.name === name)
        if (i >= 0) state.p2Team[i] = { ...state.p2Team[i], hp: 0, fainted: true }
      }
      addLog(`${name} fainted!`)
      break
    }

    case '-status': {
      const side = sideOf(parts[1])
      if (side === 'p1') state.p1Active = { ...state.p1Active, status: parts[2] }
      else state.p2Active = { ...state.p2Active, status: parts[2] }
      break
    }

    case '-curestatus': {
      const side = sideOf(parts[1])
      if (side === 'p1') state.p1Active = { ...state.p1Active, status: '' }
      else state.p2Active = { ...state.p2Active, status: '' }
      break
    }

    case 'win':
      state.winner = parts[1].toLowerCase().includes('gym') ? 'p1' : 'p2'
      state.phase = 'ended'
      addLog(state.winner === 'p1' ? 'You win!' : 'You lose...')
      break
  }
}

function processChunk(chunk: string) {
  for (const line of chunk.split('\n')) processLine(line.trim())
}

function parseRequest(chunk: string): any | null {
  for (const line of chunk.split('\n')) {
    if (line.startsWith('|request|') && line.length > 9) {
      try { return JSON.parse(line.slice(9)) } catch { return null }
    }
  }
  return null
}

function extractMoves(req: any): MoveChoice[] {
  if (!req?.active?.[0]?.moves) return []
  return (req.active[0].moves as any[]).map((m, i) => ({
    slot: i + 1,
    id: m.id,
    name: m.move,
    pp: m.pp,
    maxPp: m.maxpp,
    disabled: !!m.disabled,
  }))
}

function extractSwitches(req: any): number[] {
  if (!req?.side?.pokemon) return []
  return (req.side.pokemon as any[])
    .map((p, i) => ({ p, slot: i + 1 }))
    .filter(({ p }) => !p.active && p.condition !== '0 fnt')
    .map(({ slot }) => slot)
}

function initTeamFromRequest(req: any, side: 'p1' | 'p2') {
  const arr = side === 'p1' ? state.p1Team : state.p2Team
  if (arr.length > 0) return
  if (!req?.side?.pokemon) return
  const mons: BattleMonState[] = (req.side.pokemon as any[]).map(p => {
    const [hp, maxHp] = parseHp(p.condition)
    return { name: nameOf(p.ident), hp, maxHp, fainted: p.condition === '0 fnt', status: '' }
  })
  if (side === 'p1') state.p1Team = mons
  else state.p2Team = mons
}

function teamOrder(req: any): string {
  return (req.side.pokemon as any[]).map((_, i) => i + 1).join('')
}

function pickAiMove(req: any): string {
  if (req.forceSwitch?.[0]) {
    const slots = extractSwitches(req)
    return `switch ${slots.length ? slots[0] : 1}`
  }
  const moves = (req?.active?.[0]?.moves ?? []) as any[]
  const avail = moves.filter(m => !m.disabled && m.pp > 0)
  if (!avail.length) return 'move 1'
  const pick = avail[Math.floor(Math.random() * avail.length)]
  return `move ${pick.slot ?? moves.indexOf(pick) + 1}`
}

// ─── Message handler ──────────────────────────────────────────────────────────

self.onmessage = (e: MessageEvent<WorkerInbound>) => {
  const { type, payload } = e.data
  if (type === 'INIT') {
    initBattle(payload as { format: string; p1Team: string; p2Team: string; seed?: number[] })
  } else if (type === 'MOVE' && stream && state.phase === 'waiting') {
    state.phase = 'processing'
    stream.write(`>p1 ${(payload as { choice: string }).choice}`)
  } else if (type === 'SWITCH' && stream) {
    state.phase = 'processing'
    stream.write(`>p1 switch ${(payload as { slot: number }).slot}`)
  }
}

async function initBattle(payload: { format: string; p1Team: string; p2Team: string; seed?: number[] }) {
  state = makeInitialState()
  logBuffer = []
  stream = new BattleStream()
  const { p1: p1s, p2: p2s, omniscient: obs } = getPlayerStreams(stream)

  // Omniscient: parse display state
  ;(async () => {
    for await (const chunk of obs!) {
      processChunk(chunk)
      post({ type: 'STATE', state: { ...state, p1Team: [...state.p1Team], p2Team: [...state.p2Team], log: [...state.log] } })
    }
  })().catch(() => {})

  // p1 stream: get move requests → surface to main thread
  ;(async () => {
    for await (const chunk of p1s!) {
      const req = parseRequest(chunk)
      if (!req || req.wait) continue
      initTeamFromRequest(req, 'p1')
      if (req.teamPreview) { stream!.write(`>p1 team ${teamOrder(req)}`); continue }
      state.forcedSwitch = !!req.forceSwitch?.[0]
      state.availableMoves = req.forceSwitch ? [] : extractMoves(req)
      state.availableSwitches = extractSwitches(req)
      state.phase = 'waiting'
      post({ type: 'STATE', state: { ...state, p1Team: [...state.p1Team], p2Team: [...state.p2Team], log: [...state.log] } })
    }
  })().catch(() => {})

  // p2 stream: AI responds automatically
  ;(async () => {
    for await (const chunk of p2s!) {
      const req = parseRequest(chunk)
      if (!req || req.wait) continue
      initTeamFromRequest(req, 'p2')
      if (req.teamPreview) { stream!.write(`>p2 team ${teamOrder(req)}`); continue }
      stream!.write(`>p2 ${pickAiMove(req)}`)
    }
  })().catch(() => {})

  stream.write(`>start ${JSON.stringify({ formatid: payload.format, ...(payload.seed ? { seed: payload.seed } : {}) })}`)
  stream.write(`>player p1 ${JSON.stringify({ name: 'Gym Leader', team: payload.p1Team })}`)
  stream.write(`>player p2 ${JSON.stringify({ name: 'Challenger', team: payload.p2Team })}`)
}
