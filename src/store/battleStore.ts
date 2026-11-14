import { create } from 'zustand'

export type BattlePhase =
  | 'idle'
  | 'awaiting_choice'
  | 'processing'
  | 'terminal_win'
  | 'terminal_loss'

interface BattleStore {
  phase: BattlePhase
  log: string[]
  turnNumber: number
  setPhase: (phase: BattlePhase) => void
  appendLog: (line: string) => void
  incrementTurn: () => void
  reset: () => void
}

export const useBattleStore = create<BattleStore>()((set) => ({
  phase: 'idle',
  log: [],
  turnNumber: 0,
  setPhase: (phase) => set({ phase }),
  appendLog: (line) => set((s) => ({ log: [...s.log, line] })),
  incrementTurn: () => set((s) => ({ turnNumber: s.turnNumber + 1 })),
  reset: () => set({ phase: 'idle', log: [], turnNumber: 0 }),
}))
