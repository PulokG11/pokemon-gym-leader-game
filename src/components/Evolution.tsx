import { useEffect, useRef, useState } from 'react'
import { artworkUrl, move, species } from '../lib/dex'
import { readyEvolutions } from '../lib/progression'
import { useRunStore } from '../store/runStore'
import { useSettingsStore } from '../store/settingsStore'
import { useUiStore } from '../store/uiStore'
import type { ProgressReport, RosterMember } from '../types/game'

const EVOLVE_MS = 2600
const bst = (id: string) => Object.values(species(id).baseStats).reduce((a, b) => a + b, 0)

/** Evolves a team member and plays the cutscene. Returns an error message, if any. */
export function useEvolve() {
  const evolveMember = useRunStore(s => s.evolveMember)
  const showEvolution = useUiStore(s => s.showEvolution)
  return (uid: string, to: string): string | null => {
    const res = evolveMember(uid, to)
    if (res.ok && res.report) showEvolution(res.report)
    return res.ok ? null : res.message
  }
}

/** "Evolve into X" buttons for a Pokémon that has reached its evolution level. */
export function EvolveButtons({ mon, compact }: { mon: RosterMember; compact?: boolean }) {
  const evolve = useEvolve()
  const targets = readyEvolutions(mon)
  if (!targets.length) return null
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? '' : 'mt-1'}`}>
      {targets.map(to => (
        <button
          key={to}
          onClick={() => evolve(mon.uid, to)}
          className="rounded-lg bg-amber-400 text-ink-900 border-2 border-black px-2.5 py-1 text-xs font-black hover:bg-amber-300 shadow-[0_2px_0_#000]"
        >
          ✦ Evolve{targets.length > 1 || !compact ? ` into ${species(to).name}` : ''}
        </button>
      ))}
    </div>
  )
}

/** "What? X is evolving!" → "Evolution complete!" Shown above everything else. */
export function EvolutionCutscene() {
  const report = useUiStore(s => s.evolution)
  const close = useUiStore(s => s.closeEvolution)
  const simple = useSettingsStore(s => s.effects === 'simple')
  const ref = useRef<HTMLDialogElement>(null)
  const [doneFor, setDoneFor] = useState<ProgressReport | null>(null)
  const done = simple || (report !== null && doneFor === report)

  useEffect(() => {
    if (!report) return
    if (!ref.current?.open) ref.current?.showModal()
    const t = setTimeout(() => setDoneFor(report), EVOLVE_MS)
    return () => clearTimeout(t)
  }, [report])

  if (!report) return null
  const evo = report.events.find(e => e.kind === 'evolve')
  if (!evo || evo.kind !== 'evolve') return null
  const from = species(evo.from).name
  const to = species(evo.to).name
  const learned = report.events.filter(e => e.kind === 'learn')

  return (
    <dialog
      ref={ref}
      onCancel={e => { e.preventDefault(); if (done) close() }}
      aria-labelledby="evo-title"
      className="m-auto w-[min(94vw,28rem)] rounded-2xl bg-ink-950 text-white border-2 border-black p-0 backdrop:bg-black/80 shadow-[0_8px_0_rgba(0,0,0,0.4)] font-sans overflow-hidden"
    >
      <div className="relative h-56 bg-[radial-gradient(circle_at_50%_55%,#3b2a6b_0%,#120c24_70%)] grid place-items-center">
        {!done && <span className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.25),transparent_60%)]" aria-hidden="true" />}
        <div className="relative w-40 h-40">
          {!done && (
            <img src={artworkUrl(evo.from)} alt="" className="absolute inset-0 w-full h-full object-contain animate-[evo-out_2.2s_ease-in_both]" />
          )}
          <img
            src={artworkUrl(evo.to)}
            alt={done ? to : ''}
            className={`absolute inset-0 w-full h-full object-contain ${done ? '' : 'animate-[evo-in_2.2s_ease-out_both]'}`}
          />
        </div>
      </div>
      <div className="px-5 py-4 text-center" aria-live="polite">
        {done ? (
          <>
            <h2 id="evo-title" className="pixel-title text-2xl text-gold-400 [text-shadow:2px_2px_0_#000]">Evolution complete!</h2>
            <p className="mt-2 font-bold">Your {from} evolved into {to}!</p>
            <p className="text-xs text-white/65 mt-1">Base stat total {bst(evo.from)} → <span className="text-emerald-300 font-bold">{bst(evo.to)}</span></p>
            {learned.length > 0 && (
              <ul className="text-sm mt-2 space-y-0.5">
                {learned.map((e, i) => e.kind === 'learn' && (
                  <li key={i} className={e.offered ? 'text-gold-300' : 'text-sky-300'}>
                    {e.offered ? `★ Can learn ${move(e.move)?.name ?? e.move}: swap it in from Team` : `Learned ${move(e.move)?.name ?? e.move}`}
                  </li>
                ))}
              </ul>
            )}
            <button
              autoFocus
              onClick={close}
              className="w-full mt-4 rounded-lg bg-gold-400 text-ink-900 font-black py-2.5 border-2 border-black shadow-[0_4px_0_#b8431a] hover:bg-gold-300"
            >
              Continue
            </button>
          </>
        ) : (
          <h2 id="evo-title" className="font-ui font-bold text-xl py-6">What? {from} is evolving!</h2>
        )}
      </div>
    </dialog>
  )
}
