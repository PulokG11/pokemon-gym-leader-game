import { useRunStore } from '../store/runStore'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'

const REWARD_OPTIONS = [
  { id: 'full-heal', label: 'Full Heal', desc: 'Restore all HP for your Pokémon before the next battle.' },
  { id: 'pp-restore', label: 'PP Restore', desc: 'Restore all PP for your moves.' },
  { id: 'bonus-funds', label: '+500 Pokéyen', desc: 'Extra prize money from the challenger.' },
]

export function RewardScreen() {
  const run = useRunStore(s => s.run)!
  const setPhase = useRunStore(s => s.setPhase)
  const color = TYPE_COLORS[run.gymType]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-4 py-10 max-w-lg mx-auto">
      <div className="text-5xl mb-4">🏅</div>
      <h2 className="text-2xl font-bold mb-1">Challenger Defeated!</h2>
      <p className="text-slate-400 mb-2">
        {run.challengerIndex} / {run.totalChallengers} challengers down
      </p>
      <p className={`text-sm uppercase tracking-widest font-semibold mb-8 ${color.text}`}>
        {TYPE_EMOJI[run.gymType]} {run.gymType} Gym
      </p>

      <p className="text-slate-300 mb-6">Choose your reward before the next battle:</p>

      <div className="flex flex-col gap-3 w-full">
        {REWARD_OPTIONS.map(r => (
          <button
            key={r.id}
            onClick={() => setPhase('battle')}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-left transition-colors"
          >
            <p className="font-semibold">{r.label}</p>
            <p className="text-sm text-slate-400 mt-0.5">{r.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
