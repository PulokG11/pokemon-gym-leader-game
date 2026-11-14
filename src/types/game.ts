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
