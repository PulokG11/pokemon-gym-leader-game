import { useRunStore } from '../store/runStore'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'
import type { GymType } from '../types/game'

const GYM_TYPES: GymType[] = [
  'fire', 'water', 'grass', 'electric', 'ghost', 'dragon',
  'normal', 'ice', 'fighting', 'poison', 'ground', 'flying',
  'psychic', 'bug', 'rock', 'dark', 'steel', 'fairy',
]

export function SetupScreen() {
  const startRun = useRunStore(s => s.startRun)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">Pokémon Gym Leader</h1>
      <p className="text-slate-400 mb-10 text-center">
        Choose your type specialty. Defend your gym against 5 challengers.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full max-w-2xl">
        {GYM_TYPES.map(type => {
          const c = TYPE_COLORS[type]
          return (
            <button
              key={type}
              onClick={() => startRun(type)}
              className={`flex flex-col items-center gap-1 py-4 rounded-xl border ${c.border} bg-slate-900 hover:bg-slate-800 transition-colors`}
            >
              <span className="text-2xl">{TYPE_EMOJI[type]}</span>
              <span className={`text-xs font-semibold uppercase tracking-widest ${c.text}`}>
                {type}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
