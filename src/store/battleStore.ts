import { create } from 'zustand'
import type { BattleState } from '../types/game'

interface BattleStore {
  battle: BattleState | null
  animating: boolean
  setBattleState: (state: BattleState) => void
  setAnimating: (animating: boolean) => void
  clearBattle: () => void
}

export const useBattleStore = create<BattleStore>()((set) => ({
  battle: null,
  animating: false,
  setBattleState: (battle) => set({ battle }),
  setAnimating: (animating) => set({ animating }),
  clearBattle: () => set({ battle: null, animating: false }),
}))
