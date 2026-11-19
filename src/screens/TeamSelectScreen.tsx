import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { battleSpriteUrl, species } from '../lib/dex'
import { gymName } from '../lib/trainers'
import { GYM_STRENGTH, gymWeakness } from '../lib/gymInfo'
import { teamSizeFor } from '../lib/progression'
import { TypeBadge } from '../components/TypeBadge'
import { PokemonCard, PokemonDetails } from '../components/PokemonCard'
import type { BattleFormat } from '../types/game'

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.35)]'

export function TeamSelectScreen() {
  const run = useRunStore(s => s.run)!
  const { confirmTeam, clearRun, setFormat } = useRunStore()
  const go = useUiStore(s => s.go)
  const [picked, setPicked] = useState<string[]>([])
  const [info, setInfo] = useState<string | null>(null)
  const format: BattleFormat = run.format ?? 'singles'
  const size = teamSizeFor(format)
  const daily = run.mode === 'daily'

  function toggle(uid: string) {
    setPicked(p => (p.includes(uid) ? p.filter(u => u !== uid) : p.length < size ? [...p, uid] : p))
  }

  function changeFormat(f: BattleFormat) {
    setFormat(f)
    setPicked(p => p.slice(0, teamSizeFor(f)))
  }

  const infoMon = run.candidates.find(c => c.uid === info)

  return (
    <div className="home-bg min-h-screen text-white pb-28">
      <header className="bg-ink-900 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => (daily ? go('home') : (clearRun(), go('type_select')))}
            className="rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black px-3 py-1.5 text-sm font-ui font-bold"
          >
            ◀ {daily ? 'Home' : 'Gyms'}
          </button>
          <h1 className="font-ui font-bold text-2xl sm:text-3xl flex-1">Pick {size} starters</h1>
          <span className="text-xs text-white/60">Step 2/2</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3">
        <section className={`${panel} px-4 py-3`}>
          <p className="flex items-center gap-2">
            <TypeBadge type={run.gymType} />
            <span className="font-ui font-bold text-lg">{gymName(run.gymType)}</span>
            {daily && <span className="text-xs text-gold-300">Today’s Daily Challenge</span>}
          </p>
          <p className="text-sm mt-1.5"><span className="text-emerald-400" aria-label="Strength">▲</span> {GYM_STRENGTH[run.gymType]}</p>
          <p className="text-sm"><span className="text-red-400" aria-label="Weakness">▼</span> {gymWeakness(run.gymType)}</p>
        </section>

        {!daily && (
          <section className={`${panel} px-4 py-3 flex flex-wrap items-center justify-between gap-3`}>
            <div>
              <p className="font-ui font-bold">Battle format</p>
              <p className="text-xs text-white/65 mt-0.5">
                {format === 'doubles'
                  ? 'Doubles: two Pokémon out on each side. You pick 4 starters.'
                  : 'Singles: one Pokémon out on each side. You pick 3 starters.'}
              </p>
            </div>
            <div role="radiogroup" aria-label="Battle format" className="flex gap-1.5">
              {(['singles', 'doubles'] as BattleFormat[]).map(f => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={format === f}
                  onClick={() => changeFormat(f)}
                  className={`rounded-lg border-2 px-3 py-1.5 text-sm font-ui font-bold capitalize ${format === f ? 'bg-gold-400 text-ink-900 border-black' : 'border-white/20 hover:bg-white/10'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>
        )}

        <p className="text-sm text-white/90">
          Choose {size} of these {run.candidates.length}. They gain XP after every win, learn new moves and can evolve.
          {daily && ' Every player gets the same starters today. Leaving or reloading the page during a battle counts as a loss.'}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {run.candidates.map(mon => {
            const order = picked.indexOf(mon.uid)
            const selected = order >= 0
            const full = !selected && picked.length >= size
            return (
              <PokemonCard
                key={mon.uid}
                mon={mon}
                order={order + 1}
                full={full}
                onToggle={() => toggle(mon.uid)}
                onDetails={() => setInfo(mon.uid)}
              />
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-ink-900 border-t-4 border-black px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => confirmTeam(picked)}
            disabled={picked.length !== size}
            className="flex-1 rounded-xl bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black py-3 font-ui font-bold text-lg shadow-[0_4px_0_#b8431a] disabled:opacity-50 disabled:shadow-none"
          >
            {picked.length === size ? 'Open the Gym ▶' : `Pick ${size - picked.length} more`}
          </button>
          <div className="flex gap-1.5" aria-label="Your team">
            {Array.from({ length: size }, (_, i) => {
              const m = run.candidates.find(c => c.uid === picked[i])
              return (
                <span key={i} className={`w-12 h-12 rounded-lg grid place-items-center ${m ? 'bg-white/10 border-2 border-gold-400/60' : 'border-2 border-dashed border-white/25'}`}>
                  {m && <img src={battleSpriteUrl(m.species, false)} alt={species(m.species).name} className="w-10 h-10 object-contain [image-rendering:pixelated]" />}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {infoMon && (
        <PokemonDetails
          mon={infoMon}
          picked={picked.includes(infoMon.uid)}
          canAdd={picked.length < size}
          onToggle={() => toggle(infoMon.uid)}
          onClose={() => setInfo(null)}
        />
      )}
    </div>
  )
}
