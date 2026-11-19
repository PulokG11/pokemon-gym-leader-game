import { create } from 'zustand'
import type { ProgressReport } from '../types/game'

export type Screen = 'home' | 'type_select' | 'region_select' | 'run' | 'ranking' | 'how_to_play'

interface UiStore {
  screen: Screen
  /** Evolution being shown in the cutscene, if any. */
  evolution: ProgressReport | null
  go: (screen: Screen) => void
  showEvolution: (report: ProgressReport) => void
  closeEvolution: () => void
}

export const useUiStore = create<UiStore>()((set) => ({
  screen: 'home',
  evolution: null,
  go: (screen) => {
    set({ screen })
    window.scrollTo(0, 0)
  },
  showEvolution: (evolution) => set({ evolution }),
  closeEvolution: () => set({ evolution: null }),
}))
