import { useEffect, useRef, useState } from 'react'
import { useLegendStore } from '../store/legendStore'
import { useSettingsStore } from '../store/settingsStore'
import { useUiStore } from '../store/uiStore'
import { artworkUrl, species } from '../lib/dex'
import { LEGEND_SKIPS, ROLL_POOL, STAT_KEYS, STAT_NAMES, builtTotal, bst, isDone, isWin } from '../lib/legendary'
import { TypeBadge } from '../components/TypeBadge'

const panel = 'rounded-xl bg-ink-900 border-2 border-black shadow-[0_5px_0_rgba(0,0,0,0.35)]'
const barColor = (v: number) => (v >= 110 ? 'bg-emerald-400' : v >= 80 ? 'bg-sky-400' : v >= 55 ? 'bg-amber-400' : 'bg-red-400')

function Bar({ value }: { value: number }) {
  return (
    <span className="block h-1.5 rounded-full bg-black/60 overflow-hidden">
      <span className={`block h-full rounded-full ${barColor(value)}`} style={{ width: `${Math.min(100, (value / 180) * 100)}%` }} />
    </span>
  )
}

function Total({ label, value, tone = 'text-gold-300' }: { label: string; value: number; tone?: string }) {
  return (
    <div className="mt-auto pt-2 border-t-2 border-black/60 flex items-baseline justify-between gap-2">
      <span className="text-xs uppercase tracking-wider text-white/55">{label}</span>
      <span className={`font-ui font-bold text-2xl sm:text-3xl tabular-nums ${tone}`}>{value}</span>
    </div>
  )
}

/** Cycles random artwork for a moment before the rolled Pokémon lands. */
function useRolling(target: string | null, animate: boolean) {
  const [shown, setShown] = useState(target)
  const [rolling, setRolling] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (!target) return
    if (!animate || first.current) { first.current = false; setShown(target); return }
    setRolling(true)
    const t = setInterval(() => setShown(ROLL_POOL[Math.floor(Math.random() * ROLL_POOL.length)]), 70)
    const done = setTimeout(() => { clearInterval(t); setShown(target); setRolling(false) }, 800)
    return () => { clearInterval(t); clearTimeout(done) }
  }, [target, animate])
  return { shown: shown ?? target, rolling }
}

export function LegendaryScreen() {
  const { round, record, start, newGame, keep, next, skip } = useLegendStore()
  const go = useUiStore(s => s.go)
  const effects = useSettingsStore(s => s.effects)
  useEffect(() => { start() }, [start])
  const { shown, rolling } = useRolling(round?.roll ?? null, effects === 'full')
  if (!round) return null

  const legend = species(round.legend)
  const target = bst(round.legend)
  const total = builtTotal(round)
  const done = isDone(round) && !round.roll
  const won = isWin(round)
  const roll = round.roll ? species(round.roll) : null
  const filled = STAT_KEYS.filter(k => round.picks[k]).length

  function restart() {
    if (!done && !confirm('Give up this legendary? An unfinished round counts as a loss.')) return
    newGame()
  }

  return (
    <div className="home-bg min-h-screen text-white font-sans px-3 sm:px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-3">
        <header className={`${panel} px-3 sm:px-4 py-3 flex items-center gap-3`}>
          <button onClick={() => go('home')} aria-label="Home" className="w-10 h-10 shrink-0 rounded-lg bg-white/10 hover:bg-white/15 text-lg">☰</button>
          <div className="flex-1 min-w-0">
            <h1 className="font-ui font-bold text-lg sm:text-2xl truncate">Legendary Conquerer</h1>
            <p className="text-[11px] sm:text-xs text-white/60">
              Beat the legendary’s base stat total · {record.wins}/{record.plays} won · streak {record.streak} (best {record.bestStreak})
            </p>
          </div>
          <button onClick={restart} className="shrink-0 rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black px-2.5 py-1.5 text-xs font-bold">New legendary</button>
        </header>

        {done && (
          <section role="status" className={`${panel} px-4 py-3 text-center ${won ? 'border-t-8 border-t-gold-400' : 'border-t-8 border-t-red-500'}`}>
            <h2 className={`pixel-title text-2xl ${won ? 'text-gold-400' : 'text-red-400'}`}>{won ? `${legend.name} conquered!` : `${legend.name} stands firm`}</h2>
            <p className="text-sm text-white/75 mt-1">
              Your Pokémon’s total is <b className="text-white">{total}</b> against {legend.name}’s <b className="text-white">{target}</b>
              {won ? ` (+${total - target}).` : total === target ? ': a tie isn’t enough.' : ` (${total - target}).`}
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <button onClick={() => go('home')} className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 font-bold text-sm">Home</button>
              <button onClick={newGame} className="rounded-lg bg-gold-400 text-ink-900 hover:bg-gold-300 border-2 border-black px-4 py-2 font-black text-sm">Next legendary ▶</button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-2 sm:gap-4 items-stretch">
          {/* Left: the legendary */}
          <section className={`${panel} p-2.5 sm:p-4 flex flex-col gap-2`} aria-label={`${legend.name}, the legendary to beat`}>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-red-300 font-black">To beat</p>
            <img src={artworkUrl(round.legend)} alt="" className="w-full max-w-[13rem] aspect-square object-contain mx-auto drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]" />
            <div>
              <h2 className="font-ui font-bold text-base sm:text-xl leading-tight">{legend.name}</h2>
              <div className="flex flex-wrap gap-1 mt-1">{legend.types.map(t => <TypeBadge key={t} type={t} small />)}</div>
            </div>
            <ul className="flex flex-col gap-1.5 text-xs sm:text-sm">
              {STAT_KEYS.map(k => (
                <li key={k} className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-0.5 items-center">
                  <span className="text-white/70">{STAT_NAMES[k]}</span>
                  <span className="font-bold tabular-nums">{legend.baseStats[k]}</span>
                  <span className="col-span-2"><Bar value={legend.baseStats[k]} /></span>
                </li>
              ))}
            </ul>
            <Total label="Base stat total" value={target} tone="text-red-300" />
          </section>

          {/* Right: the roll and the Pokémon being built */}
          <section className={`${panel} p-2.5 sm:p-4 flex flex-col gap-2`} aria-label="Your Pokémon">
            {roll && shown ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gold-300 font-black">Roll {filled + (round.kept ? 0 : 1)} of 6</p>
                  {!round.kept && (
                    <button
                      onClick={skip}
                      disabled={round.skips <= 0 || rolling}
                      className="rounded-md bg-white/10 hover:bg-white/15 border border-black px-2 py-0.5 text-[11px] font-bold disabled:opacity-40"
                    >
                      Skip ({round.skips}/{LEGEND_SKIPS})
                    </button>
                  )}
                </div>
                <img src={artworkUrl(shown)} alt="" className={`w-full max-w-[13rem] aspect-square object-contain mx-auto ${rolling ? 'blur-[1px] opacity-80' : ''}`} />
                <h2 className="font-ui font-bold text-base sm:text-xl leading-tight" aria-live="polite">{rolling ? 'Rolling…' : roll.name}</h2>
                <p className="text-[11px] text-white/60 -mt-1">
                  {rolling ? ' ' : round.kept ? `You kept its ${STAT_NAMES[round.kept]}.` : 'Its stats are hidden. Pick one to keep.'}
                </p>
                <ul className="flex flex-col gap-1.5 text-xs sm:text-sm">
                  {STAT_KEYS.map(k => {
                    const taken = round.picks[k]
                    const isKept = round.kept === k
                    const revealed = !!round.kept
                    const value = roll.baseStats[k]
                    if (taken && !isKept) {
                      return (
                        <li key={k} className="rounded-md border border-white/10 bg-black/25 px-2 py-1 flex items-center gap-2 text-white/45">
                          <span className="flex-1">{STAT_NAMES[k]}</span>
                          {revealed && <span className="tabular-nums line-through decoration-white/30">{value}</span>}
                          <span className="text-[10px]">filled</span>
                        </li>
                      )
                    }
                    return (
                      <li key={k}>
                        <button
                          onClick={() => keep(k)}
                          disabled={revealed || rolling}
                          className={`w-full rounded-md border-2 px-2 py-1 flex items-center gap-2 text-left ${
                            isKept ? 'border-gold-400 bg-gold-400/15' : revealed ? 'border-black bg-black/25' : 'border-black bg-white/10 hover:bg-white/15'
                          }`}
                        >
                          <span className="flex-1 font-bold">{STAT_NAMES[k]}</span>
                          <span className={`tabular-nums font-black ${isKept ? 'text-gold-300' : ''}`}>{revealed ? value : '?'}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {round.kept && (
                  <button onClick={next} className="rounded-lg bg-gold-400 text-ink-900 hover:bg-gold-300 border-2 border-black py-2 font-black text-sm">
                    {isDone(round) ? 'See the result' : 'Next roll ▶'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gold-300 font-black">Your Pokémon is complete</p>
            )}

            <div className="mt-1 rounded-lg bg-black/25 border border-white/10 p-2">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/55 font-black mb-1">Your Pokémon</p>
              <ul className="flex flex-col gap-1 text-xs sm:text-sm">
                {STAT_KEYS.map(k => {
                  const p = round.picks[k]
                  return (
                    <li key={k} className="flex items-center gap-1.5">
                      <span className="flex-1 text-white/70 truncate">{STAT_NAMES[k]}</span>
                      {p && <img src={artworkUrl(p.species)} alt={species(p.species).name} title={species(p.species).name} className="w-5 h-5 object-contain" />}
                      <span className="w-8 text-right font-bold tabular-nums">{p ? p.value : '–'}</span>
                    </li>
                  )
                })}
              </ul>
              <Total label={done ? 'Final total' : `Total so far (${filled}/6)`} value={total} tone={total > target ? 'text-emerald-300' : 'text-gold-300'} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

