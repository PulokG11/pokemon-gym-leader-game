import { create } from 'zustand'

export type Screen = 'home' | 'type_select' | 'run' | 'ranking' | 'how_to_play'

interface UiStore {
  screen: Screen
  go: (screen: Screen) => void
}

export const useUiStore = create<UiStore>()((set) => ({
  screen: 'home',
  go: (screen) => {
    set({ screen })
    window.scrollTo(0, 0)
  },
}))
