import { useRunStore } from './store/runStore'
import { SetupScreen } from './screens/SetupScreen'
import { TeamSelectScreen } from './screens/TeamSelectScreen'
import { BattleScreen } from './screens/BattleScreen'
import { RewardScreen } from './screens/RewardScreen'
import { RunEndedScreen } from './screens/RunEndedScreen'

function App() {
  const run = useRunStore(s => s.run)

  if (!run) return <SetupScreen />

  switch (run.phase) {
    case 'team_select':    return <TeamSelectScreen />
    case 'battle':        return <BattleScreen />
    case 'reward_pending': return <RewardScreen />
    case 'run_ended':      return <RunEndedScreen />
    default:               return <SetupScreen />
  }
}

export default App
