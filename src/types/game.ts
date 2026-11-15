export type GymType =
  | 'fire' | 'water' | 'grass' | 'electric' | 'ghost' | 'dragon'
  | 'normal' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'dark' | 'steel' | 'fairy'

export type RunMode = 'standard' | 'daily'

export type RunPhase =
  | 'team_select'
  | 'battle'
  | 'reward_pending'
  | 'run_ended'

export interface RosterMember {
  uid: string
  species: string   // dex id, e.g. 'charmander'
  level: number
  xp: number        // total XP; level n needs n^3
  moves: string[]   // move ids, max 4
}

export type ProgressEvent =
  | { kind: 'levelup'; level: number }
  | { kind: 'learn'; move: string; forgot?: string }
  | { kind: 'evolve'; from: string; to: string }

export interface ProgressReport {
  uid: string
  before: RosterMember
  after: RosterMember
  xpGained: number
  events: ProgressEvent[]
}

export interface RunState {
  id: string
  mode: RunMode
  gymType: GymType
  challengerIndex: number
  totalChallengers: number
  candidates: RosterMember[]
  roster: RosterMember[]
  challenger: RosterMember[]
  lastProgress: ProgressReport[]
  won: boolean
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
  species: string   // display name from the battle protocol, e.g. 'Charizard'
  level: number
  speed: number     // actual Speed stat, 0 if unknown
  hp: number
  maxHp: number
  fainted: boolean
  status: string
}

export interface BattleEvent {
  kind: 'move' | 'damage' | 'heal' | 'faint' | 'switch' | 'status' | 'miss' | 'info'
  side: 'p1' | 'p2'
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
  seq: number                  // increments on every snapshot
  event: BattleEvent | null    // what changed in this snapshot, for animation
}

export type WorkerInbound =
  | { type: 'INIT'; payload: { format: string; p1Team: string; p2Team: string; seed?: number[] } }
  | { type: 'MOVE'; payload: { choice: string } }
  | { type: 'SWITCH'; payload: { slot: number } }

export type WorkerOutbound =
  | { type: 'STATE'; state: BattleState }
  | { type: 'ERROR'; message: string }
