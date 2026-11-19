import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { useUiStore } from '../store/uiStore'
import { artworkUrl, battleSpriteUrl, move as moveData, species } from '../lib/dex'
import { gymName } from '../lib/trainers'
import { GYM_STRENGTH, gymWeakness } from '../lib/gymInfo'
import { teamSizeFor } from '../lib/progression'
import { TYPE_COLORS } from '../lib/typeColors'
import { TypeBadge } from '../components/TypeBadge'
import { Modal } from '../components/Modal'
import type { BattleFormat, GymType, RosterMember } from '../types/game'

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.35)]'

/** "Ivysaur (Lv 16) → Venusaur (Lv 32)" — follows the first evolution at each stage. */
function evolutionChain(id: string): string {
  const steps: string[] = []
  let cur = species(id)
  while (cur.evos[0]) {
    const e = cur.evos[0]
    steps.push(`${species(e.to).name} (Lv ${e.level})`)
    cur = species(e.to)
  }
  return steps.join(' → ')
}

function StarterInfo({ mon, picked, canAdd, onToggle, onClose }: {
  mon: RosterMember; picked: boolean; canAdd: boolean; onToggle: () => void; onClose: () => void
}) {
  const s = species(mon.species)
  const bst = Object.values(s.baseStats).reduce((a, b) => a + b, 0)
  const chain = evolutionChain(mon.species)
  return (
    <Modal title={s.name} onClose={onClose}>
      <div className="flex gap-4 items-start">
        <div className="flex flex-col items-center shrink-0">
          <img src={artworkUrl(mon.species)} alt="" className="w-24 h-24 object-contain" />
          <span className="text-xs text-white/65">Lv {mon.level}</span>
        </div>
        <div className="text-sm flex flex-col gap-1">
          <div className="flex gap-1">{s.types.map(t => <TypeBadge key={t} type={t} />)}</div>
          <p>{s.ability} · BST {bst}</p>
          <p className="text-white/70">{chain ? chain : 'Does not evolve.'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-4">
        {mon.moves.map(id => {
          const d = moveData(id)
          const t = (d?.type ?? 'Normal').toLowerCase() as GymType
          return (
            <div key={id} className="flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5" title={d?.desc}>
              <span className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[t]?.bg ?? 'bg-stone-500'}`} aria-hidden="true" />
              <span className="text-sm font-bold">{d?.name ?? id}</span>
              <span className="ml-auto text-[11px] text-white/55">{d?.category === 'Status' ? 'Status' : `${d?.power} ${d?.category === 'Physical' ? 'Phy' : 'Spe'}`}</span>
            </div>
          )
        })}
      </div>
      <button
        onClick={() => { onToggle(); onClose() }}
        disabled={!picked && !canAdd}
        className={`w-full mt-4 rounded-xl border-2 border-black py-2.5 font-ui font-bold disabled:opacity-40 ${picked ? 'bg-white/10 hover:bg-white/15' : 'bg-gold-400 text-ink-900 hover:bg-gold-300'}`}
      >
        {picked ? 'Remove from team' : canAdd ? 'Add to team' : 'Team is full'}
      </button>
    </Modal>
  )
}

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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {run.candidates.map(mon => {
            const s = species(mon.species)
            const order = picked.indexOf(mon.uid)
            const selected = order >= 0
            const full = !selected && picked.length >= size
            return (
              <div key={mon.uid} className="relative">
                <button
                  onClick={() => toggle(mon.uid)}
                  aria-pressed={selected}
                  disabled={full}
                  className={`w-full rounded-xl bg-ink-900 border-2 px-2 pt-3 pb-2.5 flex flex-col items-center gap-1 shadow-[0_4px_0_rgba(0,0,0,0.35)] transition-transform ${
                    selected ? 'border-gold-400 -translate-y-0.5' : 'border-black hover:border-white/30'
                  } ${full ? 'opacity-45 cursor-not-allowed' : ''}`}
                >
                  <img src={battleSpriteUrl(mon.species, false)} alt="" className="h-20 object-contain [image-rendering:pixelated]" />
                  <span className="font-ui font-bold">{s.name}</span>
                  <span className="text-[11px] text-white/60">Lv {mon.level}</span>
                  <span className="flex gap-1">{s.types.map(t => <TypeBadge key={t} type={t} small />)}</span>
                </button>
                {selected && (
                  <span className="absolute top-1.5 left-1.5 bg-gold-400 text-ink-900 text-xs font-black rounded-full w-6 h-6 grid place-items-center border-2 border-black" aria-hidden="true">
                    {order + 1}
                  </span>
                )}
                <button
                  onClick={() => setInfo(mon.uid)}
                  aria-label={`About ${s.name}`}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 border-2 border-white/30 text-xs font-black hover:bg-black/80"
                >
                  i
                </button>
              </div>
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
        <StarterInfo
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
