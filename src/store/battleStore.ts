import { create } from 'zustand'
import type { BattleState } from '../types/game'

interface BattleStore {
  battle: BattleState | null
  setBattleState: (state: BattleState) => void
  clearBattle: () => void
}

export const useBattleStore = create<BattleStore>()((set) => ({
  battle: null,
  setBattleState: (battle) => set({ battle }),
  clearBattle: () => set({ battle: null }),
}))
