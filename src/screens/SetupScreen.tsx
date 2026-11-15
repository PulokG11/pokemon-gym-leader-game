import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'
import { GYM_TYPES } from '../lib/daily'
import { ScreenHeader } from '../components/ScreenHeader'

export function SetupScreen() {
  const startQuest = useRunStore(s => s.startQuest)
  const go = useUiStore(s => s.go)

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <ScreenHeader title="Gym Quest" sub="Choose your Gym’s type. You’ll defend it against 15 challengers, from rookies to the Champion." />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {GYM_TYPES.map(type => {
            const c = TYPE_COLORS[type]
            return (
              <button
                key={type}
                onClick={() => { startQuest(type); go('run') }}
                className={`flex flex-col items-center gap-1 py-4 rounded-xl border-2 ${c.border} bg-ink-900 hover:bg-ink-800 hover:-translate-y-0.5 transition-all`}
              >
                <span className="text-2xl" aria-hidden="true">{TYPE_EMOJI[type]}</span>
                <span className={`text-xs font-extrabold uppercase tracking-widest ${c.text}`}>{type}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
