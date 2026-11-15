import { useRunStore } from '../store/runStore'
import { useBattleStore } from '../store/battleStore'
import { useUiStore } from '../store/uiStore'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'
import { artworkUrl, species } from '../lib/dex'
import { modeName } from '../lib/runLabels'
import { ProgressCard } from '../components/ProgressCard'

export function RunEndedScreen() {
  const run = useRunStore(s => s.run)!
  const clearRun = useRunStore(s => s.clearRun)
  const clearBattle = useBattleStore(s => s.clearBattle)
  const go = useUiStore(s => s.go)
  const color = TYPE_COLORS[run.gymType]
  const { won } = run
  const wins = run.challengerIndex
  const isDaily = run.mode === 'daily'

  function leave(to: 'home' | 'type_select' | 'ranking') {
    clearBattle()
    clearRun()
    go(to)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-4">
        <div className="text-6xl">{won ? '🏆' : isDaily ? '🏅' : '💀'}</div>
        <h2 className="text-3xl font-bold">
          {won ? 'Quest complete!' : isDaily ? `${wins} ${wins === 1 ? 'win' : 'wins'} today` : 'Gym fallen…'}
        </h2>
        <p className="text-slate-400">
          {won
            ? `You defended your Gym against all ${run.totalChallengers} challengers, Champion included.`
            : isDaily
              ? `Your Gym held for ${wins} ${wins === 1 ? 'battle' : 'battles'}. Today's try is used; a new Daily Gym opens at midnight UTC.`
              : `You defeated ${wins} of ${run.totalChallengers} challengers before falling.`}
        </p>
        <p className={`text-sm font-semibold uppercase tracking-widest ${color.text}`}>
          {modeName(run)} · {TYPE_EMOJI[run.gymType]} {run.gymType} Gym
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

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {isDaily ? (
            <button onClick={() => leave('ranking')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold">
              See ranking
            </button>
          ) : (
            <button onClick={() => leave('type_select')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold">
              New Gym Quest
            </button>
          )}
          <button onClick={() => leave('home')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold">
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
