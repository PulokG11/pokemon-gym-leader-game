import { useRunStore } from '../store/runStore'
import { useBattleStore } from '../store/battleStore'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'
import { artworkUrl, species } from '../lib/dex'
import { ProgressCard } from '../components/ProgressCard'

export function RunEndedScreen() {
  const run = useRunStore(s => s.run)!
  const clearRun = useRunStore(s => s.clearRun)
  const clearBattle = useBattleStore(s => s.clearBattle)
  const color = TYPE_COLORS[run.gymType]
  const { won } = run
  const beaten = won ? run.totalChallengers : run.challengerIndex

  function restart() {
    clearBattle()
    clearRun()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-4">
        <div className="text-6xl">{won ? '🏆' : '💀'}</div>
        <h2 className="text-3xl font-bold">{won ? 'Gym defended!' : 'Gym fallen…'}</h2>
        <p className="text-slate-400">
          {won
            ? `You defeated all ${run.totalChallengers} challengers!`
            : `You defeated ${beaten} of ${run.totalChallengers} challengers before falling.`}
        </p>
        <p className={`text-sm font-semibold uppercase tracking-widest ${color.text}`}>
          {TYPE_EMOJI[run.gymType]} {run.gymType} Gym
        </p>

        {won && run.lastProgress.length > 0 ? (
          <div className="w-full flex flex-col gap-3 text-left">
            {run.lastProgress.map((r, i) => <ProgressCard key={r.uid} report={r} delay={i * 250} />)}
          </div>
        ) : (
          <div className="flex gap-4">
            {run.roster.map(m => (
              <div key={m.uid} className="flex flex-col items-center">
                <img src={artworkUrl(m.species)} alt="" className="w-20 h-20 object-contain" />
                <span className="text-sm font-semibold">{species(m.species).name}</span>
                <span className="text-xs text-slate-400">Lv {m.level}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={restart}
          className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-colors"
        >
          Play again
        </button>
      </div>
    </div>
  )
}
