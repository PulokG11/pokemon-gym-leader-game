import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { artworkUrl, species } from '../lib/dex'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'
import { TypeBadge } from '../components/TypeBadge'
import { MoveInfo } from '../components/MoveInfo'
import { StatBars } from '../components/StatBars'

const TEAM_SIZE = 3

export function TeamSelectScreen() {
  const run = useRunStore(s => s.run)!
  const confirmTeam = useRunStore(s => s.confirmTeam)
  const clearRun = useRunStore(s => s.clearRun)
  const go = useUiStore(s => s.go)
  const [picked, setPicked] = useState<string[]>([])
  const color = TYPE_COLORS[run.gymType]

  function toggle(uid: string) {
    setPicked(p =>
      p.includes(uid) ? p.filter(u => u !== uid) : p.length < TEAM_SIZE ? [...p, uid] : p,
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-6xl mx-auto">
        {run.mode === 'daily' ? (
          <button onClick={() => go('home')} className="text-sm text-slate-400 hover:text-white mb-4">
            ← Home (your Daily is saved)
          </button>
        ) : (
          <button onClick={() => { clearRun(); go('type_select') }} className="text-sm text-slate-400 hover:text-white mb-4">
            ← Change gym type
          </button>
        )}
        <h1 className="text-3xl font-bold">
          {run.mode === 'daily' && <span className="block text-sm font-black uppercase tracking-[0.2em] text-gold-300 mb-1">Daily Challenge</span>}
          <span className={color.text}>{TYPE_EMOJI[run.gymType]} {run.gymType}</span> Gym: pick your team
        </h1>
        <p className="text-slate-400 mt-1 mb-6">
          Choose {TEAM_SIZE} of these 5 Pokémon. They gain XP after every win, learn new moves and evolve.
          {run.mode === 'daily' && ' Every player gets the same five today.'}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {run.candidates.map(mon => {
            const s = species(mon.species)
            const order = picked.indexOf(mon.uid)
            const selected = order >= 0
            const full = !selected && picked.length >= TEAM_SIZE
            return (
              <button
                key={mon.uid}
                onClick={() => toggle(mon.uid)}
                aria-pressed={selected}
                disabled={full}
                className={`relative text-left rounded-2xl border-2 p-3 bg-slate-900 transition-all flex flex-col gap-3 ${
                  selected ? `${color.border} ring-2 ring-white/20 -translate-y-1` : 'border-slate-800 hover:border-slate-600'
                } ${full ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selected && (
                  <span className={`absolute top-2 right-2 ${color.bg} text-white text-xs font-bold rounded-full w-6 h-6 grid place-items-center`}>
                    {order + 1}
                  </span>
                )}
                <img
                  src={artworkUrl(mon.species)}
                  alt={s.name}
                  loading="lazy"
                  className="w-28 h-28 mx-auto object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
                />
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-lg">{s.name}</span>
                    <span className="text-sm text-slate-300 tabular-nums">Lv {mon.level}</span>
                  </div>
                  <div className="flex gap-1 mt-1">{s.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Ability: {s.ability}</p>
                  {s.evos[0] && (
                    <p className="text-[11px] text-slate-400">
                      Evolves into {species(s.evos[0].to).name} at Lv {s.evos[0].level}
                    </p>
                  )}
                </div>
                <StatBars stats={s.baseStats} />
                <div className="flex flex-col gap-1">
                  {mon.moves.map(m => <MoveInfo key={m} id={m} />)}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <span className="text-sm text-slate-300">
            {picked.length} / {TEAM_SIZE} selected
            {picked.length > 0 && (
              <span className="text-slate-500"> · {picked.map(u => species(run.candidates.find(c => c.uid === u)!.species).name).join(', ')}</span>
            )}
          </span>
          <button
            onClick={() => confirmTeam(picked)}
            disabled={picked.length !== TEAM_SIZE}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 rounded-xl font-semibold transition-colors"
          >
            Open the gym
          </button>
        </div>
      </div>
    </div>
  )
}
