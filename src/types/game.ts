export type GymType =
  | 'fire' | 'water' | 'grass' | 'electric' | 'ghost' | 'dragon'
  | 'normal' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'dark' | 'steel' | 'fairy'

export type RunMode = 'standard' | 'daily'

export type RunPhase =
  | 'setup'
  | 'pregym'
  | 'battle'
  | 'reward_pending'
  | 'run_ended'

export interface RosterMember {
  species: string
  level: number
  types: string[]
  hp: number
  maxHp: number
  moves: string[]
  ability: string
  heldItem: string | null
  fainted: boolean
}

export interface RunState {
  id: string
  mode: RunMode
  gymType: GymType
  challengerIndex: number
  totalChallengers: number
  roster: RosterMember[]
  funds: number
  phase: RunPhase
  rank: number
  rulesVersion: string
  schemaVersion: number
}

export interface ProfileProgress {
  reputation: number
  legacyRanks: Record<string, number>
  unlockedTypes: GymType[]
  highestRank: number
}

export interface DailyAttempt {
  utcDate: string
  challengeVersion: string
  gymType: GymType
  score: number | null
  accepted: boolean
}

export interface RewardChoice {
  id: string
  kind: 'recruit' | 'item' | 'training' | 'move_tutor'
  label: string
}

// --- Battle engine types (shared between worker and main thread) ---

export interface BattleMonState {
  name: string
  hp: number
  maxHp: number
  fainted: boolean
  status: string
}

export interface MoveChoice {
  slot: number      // 1-4
  id: string
  name: string
  pp: number
  maxPp: number
  disabled: boolean
}

export interface BattleState {
  turn: number
  p1Active: BattleMonState
  p2Active: BattleMonState
  p1Team: BattleMonState[]
  p2Team: BattleMonState[]
  log: string[]
  winner: 'p1' | 'p2' | null
  phase: 'processing' | 'waiting' | 'ended'
  availableMoves: MoveChoice[]
  forcedSwitch: boolean
  availableSwitches: number[]  // 1-based slot indices
}

export type WorkerInbound =
  | { type: 'INIT'; payload: { format: string; p1Team: string; p2Team: string; seed?: number[] } }
  | { type: 'MOVE'; payload: { choice: string } }
  | { type: 'SWITCH'; payload: { slot: number } }

export type WorkerOutbound =
  | { type: 'STATE'; state: BattleState }
  | { type: 'ERROR'; message: string }
