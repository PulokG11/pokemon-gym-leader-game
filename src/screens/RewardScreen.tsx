import { useRunStore } from '../store/runStore'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'
import { artworkUrl, species } from '../lib/dex'
import { ProgressCard } from '../components/ProgressCard'

export function RewardScreen() {
  const run = useRunStore(s => s.run)!
  const continueRun = useRunStore(s => s.continueRun)
  const color = TYPE_COLORS[run.gymType]
  const nextLevel = run.challenger[0]?.level

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="text-center">
          <div className="text-5xl mb-2">🏅</div>
          <h2 className="text-2xl font-bold">Challenger defeated!</h2>
          <p className="text-slate-400 mt-1">
            {run.challengerIndex} / {run.totalChallengers} challengers down ·{' '}
            <span className={`uppercase font-semibold ${color.text}`}>{TYPE_EMOJI[run.gymType]} {run.gymType} Gym</span>
          </p>
        </div>

        <h3 className="text-sm uppercase tracking-widest text-slate-500 mt-2">Your team</h3>
        {run.lastProgress.map((r, i) => <ProgressCard key={r.uid} report={r} delay={i * 250} />)}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center justify-between gap-4 mt-2">
          <div>
            <p className="text-sm text-slate-400">Next challenger · Lv {nextLevel}</p>
            <div className="flex -space-x-2 mt-1">
              {run.challenger.map(m => (
                <img key={m.uid} src={artworkUrl(m.species)} alt="?" title="???" className="w-12 h-12 object-contain brightness-0 opacity-60" />
              ))}
            </div>
          </div>
          <button
            onClick={continueRun}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-colors"
          >
            Next battle
          </button>
        </div>
        <p className="text-center text-xs text-slate-600">
          Team: {run.roster.map(m => `${species(m.species).name} Lv${m.level}`).join(' · ')}
        </p>
      </div>
    </div>
  )
}
