import { useRunStore } from './store/runStore'
import { useUiStore } from './store/uiStore'
import { HomeScreen } from './screens/HomeScreen'
import { SetupScreen } from './screens/SetupScreen'
import { RankingScreen } from './screens/RankingScreen'
import { HowToPlayScreen } from './screens/HowToPlayScreen'
import { LegendaryScreen } from './screens/LegendaryScreen'
import { DreamTeamScreen } from './screens/DreamTeamScreen'
import { TeamSelectScreen } from './screens/TeamSelectScreen'
import { BattleScreen } from './screens/BattleScreen'
import { RewardScreen } from './screens/RewardScreen'
import { RunEndedScreen } from './screens/RunEndedScreen'
import { EventScreen } from './screens/EventScreen'
import { GymScreen } from './screens/GymScreen'
import { RegionSelectScreen } from './screens/RegionSelectScreen'
import { RegionalDraftScreen } from './screens/RegionalDraftScreen'
import { RegionalHubScreen } from './screens/RegionalHubScreen'
import { RegionalRewardScreen } from './screens/RegionalRewardScreen'
import { EvolutionCutscene } from './components/Evolution'

function Screen() {
  const run = useRunStore(s => s.run)
  const screen = useUiStore(s => s.screen)

  switch (screen) {
    case 'type_select': return <SetupScreen />
    case 'region_select': return <RegionSelectScreen />
    case 'ranking':     return <RankingScreen />
    case 'how_to_play': return <HowToPlayScreen />
    case 'legendary':   return <LegendaryScreen />
    case 'dream':       return <DreamTeamScreen />
    case 'run':
      if (!run) return <HomeScreen />
      if (run.mode === 'regional') {
        switch (run.phase) {
          case 'team_select':    return <RegionalDraftScreen />
          case 'battle':         return <BattleScreen />
          case 'reward_pending': return <RegionalRewardScreen />
          case 'run_ended':      return <RunEndedScreen />
          default:               return <RegionalHubScreen />
        }
      }
      switch (run.phase) {
        case 'team_select':    return <TeamSelectScreen />
        case 'battle':         return <BattleScreen />
        case 'reward_pending': return <RewardScreen />
        case 'event':          return <EventScreen />
        case 'gym':            return <GymScreen />
        case 'run_ended':      return <RunEndedScreen />
      }
      return <HomeScreen />
    default:
      return <HomeScreen />
  }
}

function App() {
  return (
    <>
      <Screen />
      <EvolutionCutscene />
    </>
  )
}

export default App
