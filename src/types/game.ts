export type GymType =
  | 'fire' | 'water' | 'grass' | 'electric' | 'ghost' | 'dragon'
  | 'normal' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'dark' | 'steel' | 'fairy'

export type RunMode = 'quest' | 'daily'

export type RunPhase =
  | 'team_select'
  | 'battle'
  | 'reward_pending'
  | 'event'
  | 'gym'
  | 'run_ended'

export interface RosterMember {
  uid: string
  species: string   // dex id, e.g. 'charmander'
  level: number
  xp: number        // total XP; level n needs n^3
  moves: string[]   // move ids, max 4
  hp?: number       // fraction of max HP carried between battles (missing = full); 0 = fainted
  item?: string | null
  taught?: string[] // moves taught by the Move Tutor; can be swapped back in later
}

export interface Bag { potion: number; revive: number; candy: number; stone: number }

export type EventKind = 'camp' | 'merchant'

export type ProgressEvent =
  | { kind: 'levelup'; level: number }
  | { kind: 'learn'; move: string; forgot?: string; offered?: boolean } // offered: moves were full, swap it in from Team
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
  format?: BattleFormat           // missing = singles (older saves)
  dailyDate: string | null        // UTC date for Daily Challenge runs
  challengerIndex: number         // challengers beaten so far
  totalChallengers: number | null // null = endless (Daily Challenge)
  candidates: RosterMember[]
  roster: RosterMember[]
  challenger: RosterMember[]
  lastProgress: ProgressReport[]
  won: boolean
  bag?: Bag
  upgrades?: import('../lib/upgrades').UpgradeId[]
  heldItems?: string[]       // spare held items not given to anyone
  rerolls?: number
  rewardOffer?: import('../lib/economy').Reward[]
  rewardTaken?: boolean      // reward chosen or skipped for the last win
  lastFunds?: number         // funds earned by the last win
  event?: EventKind | null   // event chosen on "What's next?"
  campUsed?: boolean
  stock?: import('../lib/economy').StockItem[]
  log?: string[]             // newest first
  battleKey?: string | null  // set while a battle is open; survives a reload
  forfeited?: boolean        // Daily battle abandoned by leaving or reloading the page
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
  pos?: number      // 0 = left/first active slot, 1 = second slot in Doubles
}

export interface MoveChoice {
  slot: number      // 1-4
  id: string
  name: string
  pp: number
  maxPp: number
  disabled: boolean
  target: string    // Showdown move target, e.g. 'normal', 'allAdjacentFoes', 'self'
}

/** What one of your active Pokémon must decide this turn. */
export interface SlotRequest {
  pos: number         // active position, 0 or 1
  name: string
  moves: MoveChoice[]
  forced: boolean     // must switch in a replacement
  pass: boolean       // nothing to decide (fainted with no replacement, or not forced)
}

export type BattleFormat = 'singles' | 'doubles'

/** One slot's choice, sent to the engine. Targets: 1/2 = foe slots, -1/-2 = your slots. */
export type BattleAction =
  | { kind: 'move'; move: number; target?: number }
  | { kind: 'switch'; name: string }
  | { kind: 'pass' }

export interface BattleState {
  turn: number
  format: BattleFormat
  p1Active: BattleMonState      // first slot, kept for Singles convenience
  p2Active: BattleMonState
  p1Actives: BattleMonState[]   // one per active slot
  p2Actives: BattleMonState[]
  p1Team: BattleMonState[]
  p2Team: BattleMonState[]
  log: string[]
  winner: 'p1' | 'p2' | null
  phase: 'processing' | 'waiting' | 'ended'
  availableMoves: MoveChoice[]  // first slot's moves
  forcedSwitch: boolean         // any slot must switch
  availableSwitches: string[]   // names of benched Pokémon that can come in
  slots: SlotRequest[]
  requestId: number             // changes with every new decision the player must make
  seq: number                   // increments on every snapshot
  event: BattleEvent | null     // what changed in this snapshot, for animation
}

export type WorkerInbound =
  | { type: 'INIT'; payload: { format: string; p1Team: string; p2Team: string; p1Hp?: number[]; extras?: import('../lib/upgrades').BattleExtras; seed?: number[] } }
  | { type: 'CHOOSE'; payload: { actions: BattleAction[] } }

export type WorkerOutbound =
  | { type: 'STATE'; state: BattleState }
  | { type: 'ERROR'; message: string }
