import { useRunStore } from './store/runStore'
import { useUiStore } from './store/uiStore'
import { HomeScreen } from './screens/HomeScreen'
import { SetupScreen } from './screens/SetupScreen'
import { RankingScreen } from './screens/RankingScreen'
import { HowToPlayScreen } from './screens/HowToPlayScreen'
import { TeamSelectScreen } from './screens/TeamSelectScreen'
import { BattleScreen } from './screens/BattleScreen'
import { RewardScreen } from './screens/RewardScreen'
import { RunEndedScreen } from './screens/RunEndedScreen'

function App() {
  const run = useRunStore(s => s.run)
  const screen = useUiStore(s => s.screen)

  switch (screen) {
    case 'type_select': return <SetupScreen />
    case 'ranking':     return <RankingScreen />
    case 'how_to_play': return <HowToPlayScreen />
    case 'run':
      if (!run) return <HomeScreen />
      switch (run.phase) {
        case 'team_select':    return <TeamSelectScreen />
        case 'battle':         return <BattleScreen />
        case 'reward_pending': return <RewardScreen />
        case 'run_ended':      return <RunEndedScreen />
      }
      return <HomeScreen />
    default:
      return <HomeScreen />
  }
}

export default App
