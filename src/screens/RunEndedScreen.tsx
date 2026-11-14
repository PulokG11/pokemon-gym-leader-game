import { useRunStore } from '../store/runStore'
import { useBattleStore } from '../store/battleStore'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'

export function RunEndedScreen() {
  const run = useRunStore(s => s.run)!
  const clearRun = useRunStore(s => s.clearRun)
  const clearBattle = useBattleStore(s => s.clearBattle)
  const color = TYPE_COLORS[run.gymType]

  const won = run.challengerIndex >= run.totalChallengers
  const beaten = won ? run.totalChallengers : run.challengerIndex

  function restart() {
    clearBattle()
    clearRun()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="text-6xl">{won ? '🏆' : '💀'}</div>
      <h2 className="text-3xl font-bold">{won ? 'Gym Defended!' : 'Gym Fallen…'}</h2>
      <p className="text-slate-400">
        {won
          ? `You defeated all ${run.totalChallengers} challengers as the ${run.gymType.toUpperCase()} Gym Leader!`
          : `You defeated ${beaten} out of ${run.totalChallengers} challengers before falling.`}
      </p>
      <p className={`text-sm font-semibold uppercase tracking-widest ${color.text}`}>
        {TYPE_EMOJI[run.gymType]} {run.gymType} Gym
      </p>

      <button
        onClick={restart}
        className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}
