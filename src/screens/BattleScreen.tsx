import { useEffect, useMemo, useState } from 'react'
import { useBattleStore } from '../store/battleStore'
import { useRunStore } from '../store/runStore'
import { useSettingsStore } from '../store/settingsStore'
import { useUiStore } from '../store/uiStore'
import { useBattle } from '../hooks/useBattle'
import { packTeam } from '../lib/progression'
import { battleSpriteUrl, effectiveness, move as moveData, typesOf as dexTypesOf } from '../lib/dex'
import { ArenaBackdrop, Platform } from '../components/ArenaBackdrop'
import { LEADER_SPRITE, challengerTrainer, gymName, trainerSprite } from '../lib/trainers'
import { regionOf } from '../lib/regions'
import { openBattle } from '../lib/battleGuard'
import { needsTarget } from '../lib/battleRequest'
import { battleExtras } from '../lib/upgrades'
import { TYPE_COLORS, typeTextClass } from '../lib/typeColors'
import { Sprite } from '../components/Sprite'
import { Modal } from '../components/Modal'
import { MoveInfo } from '../components/MoveInfo'
import { TypeBadge } from '../components/TypeBadge'
import { BattleEndModal } from '../components/BattleEndModal'
import type { BattleAction, BattleMonState, GymType, MoveChoice } from '../types/game'

const STATUS_STYLE: Record<string, string> = {
  brn: 'bg-orange-600', par: 'bg-yellow-500 text-black', psn: 'bg-fuchsia-600', tox: 'bg-fuchsia-800',
  slp: 'bg-stone-500', frz: 'bg-cyan-500 text-black',
}

const typesOf = dexTypesOf

const fmtMult = (x: number) => (x === 0 ? '×0' : x === 0.5 ? '×½' : x === 0.25 ? '×¼' : `×${x}`)

function InfoCard({ mon, mine, active, compact }: { mon: BattleMonState; mine: boolean; active?: boolean; compact?: boolean }) {
  if (!mon.name) return null
  const pct = mon.maxHp ? mon.hp / mon.maxHp : 0
  return (
    <div className={`bg-parchment text-ink-900 rounded-xl rounded-br-3xl px-3 ${compact ? 'py-1 w-44 sm:w-56' : 'py-2 w-48 sm:w-60'} border-2 shadow-[0_4px_0_rgba(0,0,0,0.35)] ${active ? 'border-gold-400 ring-2 ring-gold-400' : 'border-ink-900'} ${mon.fainted ? 'opacity-60' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-black truncate">{active && <span className="text-gold-500 mr-1" aria-hidden="true">▶</span>}{mon.name}</span>
        <span className="text-xs font-bold tabular-nums">Lv{mon.level}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[10px] font-black text-amber-700">HP</span>
        <div className="flex-1 h-2.5 rounded-full bg-ink-900/80 overflow-hidden border border-ink-900">
          <div
            className={`h-full transition-[width,background-color] duration-700 ${pct > 0.5 ? 'bg-emerald-500' : pct > 0.25 ? 'bg-yellow-400' : 'bg-red-500'}`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-0.5 text-[11px] font-bold">
        <span>
          {mon.status && <span className={`uppercase rounded px-1 text-white ${STATUS_STYLE[mon.status] ?? 'bg-ink-800'}`}>{mon.status}</span>}
          {mon.speed > 0 && <span className="ml-1 text-ink-900/60">Spe {mon.speed}</span>}
        </span>
        <span className="tabular-nums text-ink-900/70">{mine ? `${mon.hp}/${mon.maxHp}` : `${Math.round(pct * 100)}%`}</span>
      </div>
    </div>
  )
}

function BallCount({ team }: { team: BattleMonState[] }) {
  const left = team.filter(m => !m.fainted).length
  return <span className="rounded-full bg-ink-900/80 px-2 py-0.5 text-[11px] font-black">● ×{left}</span>
}

function ToolButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="h-9 min-w-10 px-2 rounded-lg bg-ink-900 border-2 border-black text-sm font-black hover:bg-ink-800 shadow-[0_3px_0_rgba(0,0,0,0.35)]">
      {children}
    </button>
  )
}

function HpMini({ m }: { m: BattleMonState }) {
  const pct = m.maxHp ? m.hp / m.maxHp : 0
  return (
    <span className="block h-1.5 rounded-full bg-black/60 overflow-hidden">
      <span className={`block h-full ${pct > 0.5 ? 'bg-emerald-400' : pct > 0.25 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${pct * 100}%` }} />
    </span>
  )
}

export function BattleScreen() {
  const run = useRunStore(s => s.run)!
  const winBattle = useRunStore(s => s.winBattle)
  const loseBattle = useRunStore(s => s.loseBattle)
  const go = useUiStore(s => s.go)
  const { speed, effects, setSpeed, setEffects } = useSettingsStore()
  const battle = useBattleStore(s => s.battle)
  const animating = useBattleStore(s => s.animating)
  const [intro, setIntro] = useState(true)
  const [view, setView] = useState<'moves' | 'party'>('moves')
  const [modal, setModal] = useState<null | 'history' | 'details'>(null)
  // This turn's choices so far, one per active slot, and a move waiting for its target.
  const [picks, setPicks] = useState<(BattleAction | null)[]>([])
  const [targeting, setTargeting] = useState<MoveChoice | null>(null)
  const [megaOn, setMegaOn] = useState(false)
  const [zOn, setZOn] = useState(false)

  const format = run.format ?? 'singles'
  const doubles = format === 'doubles'
  const trainer = useMemo(() => challengerTrainer(run), [run.id, run.challengerIndex])
  // Fainted Pokémon sit out until revived; the rest start with the HP they ended on.
  const fighters = useMemo(() => run.roster.filter(m => (m.hp ?? 1) > 0), [run.roster])
  const p1Team = useMemo(() => packTeam(fighters), [fighters])
  const p2Team = useMemo(() => packTeam(run.challenger), [run.challenger])
  const extras = useMemo(() => {
    if (run.mode === 'regional') {
      const tier = regionOf(run.region).trainers[run.challengerIndex]?.tier
      return { ...battleExtras(run.gymType, [], tier === 'regular' ? 1 : 2), foeName: trainer.name }
    }
    const aiLevel = trainer.title === 'Promising Trainer' ? 0 : trainer.title === 'Trainer' ? 1 : 2
    return battleExtras(run.gymType, run.mode === 'daily' ? [] : run.upgrades ?? [], aiLevel)
  }, [trainer, run.gymType, run.mode, run.upgrades])
  const { choose } = useBattle(p1Team, p2Team, fighters.map(m => m.hp ?? 1), extras, format)

  useEffect(() => {
    if (openBattle(run, useRunStore.getState().markBattleOpen)) loseBattle(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id, run.challengerIndex])

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 2200 / speed)
    return () => clearTimeout(t)
  }, [speed])

  const ready = !!battle?.p1Active.name
  const canAct = ready && battle!.phase === 'waiting' && !animating && !intro
  const ended = ready && battle!.phase === 'ended' && !animating
  const slots = battle?.slots ?? []
  const requestKey = battle?.requestId ?? 0

  // A new request starts a fresh set of choices.
  useEffect(() => {
    setPicks(slots.map(s => (s.pass ? { kind: 'pass' } : null)))
    setTargeting(null)
    setMegaOn(false)
    setZOn(false)
    setView('moves')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const cursor = picks.findIndex(p => p === null)
  const slot = cursor >= 0 ? slots[cursor] : undefined
  const chooser = slot && battle ? battle.p1Actives[slot.pos] : undefined

  /** Foes still standing, with the target number the engine expects (1 = left slot, 2 = right slot). */
  const foeTargets = () =>
    (battle?.p2Actives ?? []).map((mon, i) => ({ mon, target: i + 1 })).filter(f => f.mon.name && !f.mon.fainted)

  function decide(action: BattleAction) {
    if (cursor < 0) return
    if (action.kind === 'move' && megaOn && slot?.canMega) action = { ...action, mega: true }
    else if (action.kind === 'move' && zOn && slot?.zMoves[action.move - 1]) action = { ...action, zmove: true }
    setMegaOn(false)
    setZOn(false)
    const next = [...picks]
    next[cursor] = action
    setPicks(next)
    setTargeting(null)
    setView('moves')
    if (next.every(p => p !== null)) choose(next as BattleAction[])
  }

  function back() {
    if (targeting) { setTargeting(null); return }
    const prev = picks.map((p, i) => ({ p, i })).filter(({ p, i }) => p && !slots[i]?.pass).at(-1)
    if (!prev) return
    const next = [...picks]
    next[prev.i] = null
    setPicks(next)
  }

  function pickMove(m: MoveChoice) {
    if (!slot) return
    if (!doubles || !needsTarget(m.target)) return decide({ kind: 'move', move: m.slot })
    if (m.target === 'adjacentAlly' || m.target === 'adjacentAllyOrSelf') {
      return decide({ kind: 'move', move: m.slot, target: -(slot.pos === 0 ? 2 : 1) })
    }
    const foes = foeTargets()
    if (foes.length <= 1) return decide({ kind: 'move', move: m.slot, target: foes[0]?.target ?? 1 })
    setTargeting(m)
  }

  useEffect(() => {
    if (!canAct || !slot) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || modal) return
      if (e.key === 'Escape') { back(); return }
      const n = Number(e.key)
      if (targeting) {
        const f = foeTargets().find(t => t.target === n)
        if (f) decide({ kind: 'move', move: targeting.slot, target: f.target })
        return
      }
      if (n >= 1 && n <= 4 && !slot.forced && view === 'moves') {
        const m = slot.moves[n - 1]
        if (m && !m.disabled && m.pp > 0) pickMove(m)
      }
      if (e.key.toLowerCase() === 's' && !slot.forced) setView(v => (v === 'party' ? 'moves' : 'party'))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function finish() {
    if (!battle) return
    const finalHp = Object.fromEntries(battle.p1Team.map(m => [m.species, m.fainted || !m.maxHp ? 0 : m.hp / m.maxHp]))
    useBattleStore.getState().clearBattle()
    if (battle.winner === 'p1') winBattle(finalHp)
    else loseBattle()
  }

  const regional = run.mode === 'regional'
  const leaderSprite = trainerSprite(regional ? regionOf(run.region).playerSprite : LEADER_SPRITE[run.gymType])
  const placeName = regional ? regionOf(run.region).trainers[run.challengerIndex]?.place ?? regionOf(run.region).name : gymName(run.gymType)

  const toolbar = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <img src={leaderSprite} alt="" className="w-9 h-9 rounded-md bg-ink-900 border-2 border-black object-cover object-top [image-rendering:pixelated]" />
        <div className="min-w-0">
          <p className="text-[11px] font-black truncate">{placeName}{doubles && <span className="ml-1 text-gold-300">· Doubles</span>}</p>
          {battle && <BallCount team={battle.p1Team} />}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <ToolButton label="Home (saves between battles)" onClick={() => go('home')}>☰</ToolButton>
        <ToolButton label="Battle speed" onClick={() => setSpeed(speed === 3 ? 1 : ((speed + 1) as 2 | 3))}>▶ {speed}×</ToolButton>
        <ToolButton label={`Effects: ${effects}`} onClick={() => setEffects(effects === 'full' ? 'simple' : 'full')}>{effects === 'full' ? '✨' : '▫️'}</ToolButton>
      </div>
      <div className="flex items-center gap-2 min-w-0 justify-end">
        <div className="min-w-0 text-right">
          <p className="text-[11px] font-black truncate">{trainer.name}</p>
          {battle && <BallCount team={battle.p2Team} />}
        </div>
        <img src={trainerSprite(trainer.sprite)} alt="" className="w-9 h-9 rounded-md bg-ink-900 border-2 border-black object-cover object-top [image-rendering:pixelated]" />
      </div>
    </div>
  )

  if (intro || !ready) {
    return (
      <div className="home-bg min-h-screen text-white font-sans px-3 py-4" onClick={() => ready && setIntro(false)}>
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {toolbar}
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-black">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-r from-ember-500 to-ember-700 flex items-center gap-6 px-[8%]">
              <img src={leaderSprite} alt="" className="h-28 sm:h-36 [image-rendering:pixelated]" />
              <span className="font-ui font-bold text-white text-xl sm:text-3xl [text-shadow:2px_2px_0_#1c1613]">{regional ? 'You' : placeName}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-r from-red-950 to-red-700 flex items-center justify-end gap-6 px-[8%]">
              <span className="font-ui font-bold text-white text-xl sm:text-3xl [text-shadow:2px_2px_0_#1c1613]">{trainer.name}</span>
              <img src={trainerSprite(trainer.sprite)} alt="" className="h-28 sm:h-36 [image-rendering:pixelated] -scale-x-100" />
            </div>
            <div className="absolute inset-x-0 top-1/2 h-1.5 -mt-0.5 bg-ink-900" />
            <span className="pixel-title absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-400 text-4xl sm:text-5xl">VS</span>
          </div>
          <div className="rounded-xl bg-parchment text-ink-900 border-2 border-ink-900 px-4 py-3 font-bold">
            {ready ? `${trainer.name} wants to ${doubles ? 'have a Double Battle' : 'battle'}!` : `${trainer.name} is getting ready…`}
          </div>
        </div>
      </div>
    )
  }

  const b = battle!
  const { event, seq } = b
  const eventFor = (side: 'p1' | 'p2', pos: number) => (event && event.side === side && (event.pos ?? 0) === pos ? event.kind : null)
  const liveFoes = foeTargets()
  const lastLine = b.log.filter(l => !l.startsWith('—')).at(-1) ?? ''
  const takenSwitches = new Set(picks.flatMap(p => (p && p.kind === 'switch' ? [p.name] : [])))
  const showParty = !!slot && (slot.forced || view === 'party')
  const prompt = !canAct || !slot || !chooser
    ? lastLine
    : targeting
      ? `Who should ${chooser.name} go for?`
      : slot.forced
        ? `${chooser.name} fainted! Choose who goes in.`
        : `What will ${chooser.name} do?`
  const canGoBack = canAct && (!!targeting || picks.some((p, i) => p && !slots[i]?.pass))

  // Arena positions: one spot per side in Singles, two in Doubles.
  const FOE_SPOTS = doubles ? ['right-[30%] top-[16%]', 'right-[4%] top-[26%]'] : ['right-[8%] top-[22%]']
  const MY_SPOTS = doubles ? ['left-[2%] bottom-[2%]', 'left-[34%] bottom-[10%]'] : ['left-[4%] sm:left-[8%] bottom-[2%]']
  const foeSize = doubles ? 'h-20 sm:h-28' : 'h-24 sm:h-32'
  const mySize = doubles ? 'h-28 sm:h-36' : 'h-32 sm:h-44'

  return (
    <div className="home-bg min-h-screen text-white font-sans px-3 py-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {toolbar}

        {/* Arena */}
        <ArenaBackdrop type={run.gymType} className="h-72 sm:h-96 rounded-2xl border-2 border-black">
          <span className="absolute top-2 right-3 rounded bg-ink-900/80 px-2 py-0.5 text-[10px] font-black">TURN {b.turn}</span>
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {b.p2Actives.map((m, i) => (
              <InfoCard key={i} mon={m} mine={false} compact={doubles} active={!!targeting && liveFoes.some(f => f.target === i + 1)} />
            ))}
          </div>
          {b.p2Actives.map((m, i) => {
            const aimable = !!targeting && liveFoes.some(f => f.target === i + 1)
            return (
              <div key={`f${i}`} className={`absolute ${FOE_SPOTS[i]} flex flex-col items-center`}>
                {aimable && (
                  <button
                    onClick={() => decide({ kind: 'move', move: targeting!.slot, target: i + 1 })}
                    className="relative z-[2] mb-1 rounded bg-gold-400 text-ink-900 border-2 border-black px-2 py-0.5 text-xs font-black"
                  >
                    {m.name}
                  </button>
                )}
                <div className={aimable ? 'rounded-full ring-4 ring-gold-400 bg-gold-300/20 px-2' : ''}>
                  {m.name && <Sprite species={m.species} back={false} fainted={m.fainted} event={eventFor('p2', i)} seq={seq} className={`${foeSize} relative z-[1]`} />}
                </div>
                <Platform className={`${doubles ? 'w-32 sm:w-40 h-7 sm:h-9' : 'w-36 sm:w-48 h-8 sm:h-11'} -mt-6`} />
              </div>
            )
          })}
          {b.p1Actives.map((m, i) => (
            <div key={`m${i}`} className={`absolute ${MY_SPOTS[i]} flex flex-col items-center`}>
              {canAct && slot?.pos === i && <span className="text-gold-400 text-xl leading-none [text-shadow:0_2px_0_#1c1613]" aria-hidden="true">▼</span>}
              {m.name && <Sprite species={m.species} back fainted={m.fainted} event={eventFor('p1', i)} seq={seq} className={`${mySize} relative z-[1]`} />}
              <Platform className={`${doubles ? 'w-36 sm:w-48 h-8 sm:h-11' : 'w-44 sm:w-64 h-10 sm:h-14'} -mt-8`} />
            </div>
          ))}
          <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
            {b.p1Actives.map((m, i) => <InfoCard key={i} mon={m} mine compact={doubles} active={canAct && slot?.pos === i && !targeting} />)}
          </div>
        </ArenaBackdrop>

        {/* Text box */}
        <div className="flex items-center gap-3 rounded-xl bg-parchment text-ink-900 border-2 border-ink-900 px-4 py-3 min-h-14" aria-live="polite">
          <p className="flex-1 font-bold">{prompt}</p>
          {canGoBack && <button onClick={back} className="rounded-lg bg-ink-900 text-white px-3 py-1 text-xs font-black">◀ Back</button>}
          <button onClick={() => setModal('history')} aria-label="Battle history" className="w-8 h-8 rounded-full bg-ink-900 text-white text-xs shrink-0">▼</button>
        </div>

        {/* Controls */}
        <div className="rounded-xl bg-ink-900 border-2 border-black p-3 grid grid-cols-[6.5rem_1fr] sm:grid-cols-[8rem_1fr] gap-2 min-h-36">
          <div className="flex flex-col gap-2">
            <button
              disabled={!canAct || !slot || slot.forced || !!targeting}
              onClick={() => setView(v => (v === 'party' ? 'moves' : 'party'))}
              className={`flex-1 rounded-lg border-2 border-black font-black text-sm flex flex-col items-center justify-center gap-0.5 ${showParty ? 'bg-emerald-800' : 'bg-emerald-700 hover:bg-emerald-600'} disabled:opacity-60`}
            >
              <span aria-hidden="true">●</span>{showParty ? 'Moves' : 'Pokémon'}<span className="text-[10px] font-bold text-white/60">(S)</span>
            </button>
            {canAct && slot?.canMega && !slot.forced && (
              <button
                onClick={() => setMegaOn(v => !v)}
                aria-pressed={megaOn}
                title="Mega Evolve before using the next move you pick"
                className={`rounded-lg border-2 py-1.5 text-xs font-black ${megaOn ? 'bg-fuchsia-500 border-white text-white shadow-[0_0_12px_rgba(217,70,239,0.8)]' : 'bg-fuchsia-900/70 border-black text-fuchsia-100 hover:bg-fuchsia-800'}`}
              >
                {megaOn ? '✦ Mega: on' : '✦ Mega Evolve'}
              </button>
            )}
            {canAct && slot && !slot.forced && slot.zMoves.some(Boolean) && (
              <button
                onClick={() => setZOn(v => !v)}
                aria-pressed={zOn}
                title="Turn the next move you pick into its Z-Move (once per battle)"
                className={`rounded-lg border-2 py-1.5 text-xs font-black ${zOn ? 'bg-amber-400 border-white text-ink-900 shadow-[0_0_12px_rgba(251,191,36,0.8)]' : 'bg-amber-900/70 border-black text-amber-100 hover:bg-amber-800'}`}
              >
                {zOn ? '◆ Z-Move: on' : '◆ Z-Move'}
              </button>
            )}
            <button onClick={() => setModal('details')} className="rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black py-1.5 text-xs font-black">Details</button>
          </div>

          {!canAct || !slot ? (
            ended ? <span /> : <p className="self-center text-center text-white/50 text-sm">The turn plays out: faster Pokémon first…</p>
          ) : targeting ? (
            <div className="grid grid-cols-2 gap-2">
              {liveFoes.map(f => {
                const d = moveData(targeting.id)
                const mult = d && d.category !== 'Status' ? effectiveness(d.type, typesOf(f.mon.species)) : 1
                return (
                  <button
                    key={f.target}
                    onClick={() => decide({ kind: 'move', move: targeting.slot, target: f.target })}
                    className="flex items-center gap-2 rounded-lg border-2 border-gold-400 bg-white/5 hover:bg-white/10 p-2 text-left"
                  >
                    <img src={battleSpriteUrl(f.mon.species, false)} alt="" className="w-12 h-12 object-contain [image-rendering:pixelated]" />
                    <span className="flex-1">
                      <span className="block font-ui font-bold"><span className="opacity-60 text-xs mr-1">{f.target}</span>{f.mon.name}</span>
                      <span className="block text-xs text-white/65">{targeting.name}{mult !== 1 && ` · ${fmtMult(mult)}`}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : showParty ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {b.p1Team.map(m => {
                const ok = b.availableSwitches.includes(m.name) && !takenSwitches.has(m.name)
                const inBattle = b.p1Actives.some(a => a.name === m.name && !a.fainted)
                return (
                  <button
                    key={m.name}
                    disabled={!ok}
                    onClick={() => decide({ kind: 'switch', name: m.name })}
                    className={`flex items-center gap-2 rounded-lg border-2 border-black bg-white/5 p-1.5 text-left ${ok ? 'hover:bg-white/10' : 'opacity-50'}`}
                  >
                    <img src={battleSpriteUrl(m.species, false)} alt="" className="w-10 h-10 object-contain [image-rendering:pixelated]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold truncate">{m.name} <span className="text-white/50">Lv{m.level}</span></span>
                      <HpMini m={m} />
                      <span className="block text-[10px] text-white/50">{inBattle ? 'In battle' : m.fainted ? 'Fainted' : takenSwitches.has(m.name) ? 'Going in' : ''}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {slot.moves.map((m, i) => {
                const d = moveData(m.id)
                const type = (d?.type ?? 'Normal').toLowerCase() as GymType
                // Effectiveness against each foe still standing; nothing shown when it's neutral everywhere.
                const mults = d && d.category !== 'Status' ? liveFoes.map(f => effectiveness(d.type, typesOf(f.mon.species))) : []
                const showMults = mults.some(x => x !== 1) ? (doubles ? mults : mults.slice(0, 1)) : []
                return (
                  <button
                    key={m.slot}
                    disabled={m.disabled || m.pp === 0 || (zOn && !slot.zMoves[i])}
                    onClick={() => pickMove(m)}
                    title={d ? `${d.category} · Pow ${d.power || '—'} · Acc ${d.accuracy === true ? '—' : d.accuracy} · ${d.desc}` : undefined}
                    className={`relative overflow-hidden rounded-lg border-2 border-black ${TYPE_COLORS[type]?.bg ?? 'bg-stone-500'} ${typeTextClass(type)} px-3 py-2 text-left disabled:opacity-40 hover:brightness-110 shadow-[0_3px_0_rgba(0,0,0,0.4)]`}
                  >
                    <span className="absolute inset-y-0 right-0 w-1/2 bg-white/10 skew-x-[-20deg] translate-x-6" aria-hidden="true" />
                    <span className="relative flex items-center justify-between gap-1">
                      <span className="font-ui font-bold text-base sm:text-lg leading-tight">
                        <span className="opacity-60 text-[11px] mr-1">{i + 1}</span>{zOn && slot.zMoves[i] ? slot.zMoves[i] : m.name}
                      </span>
                      <span className="flex gap-0.5">
                        {showMults.map((x, k) => (
                          <span key={k} className={`text-[11px] font-black text-white rounded px-1 ${x >= 2 ? 'bg-emerald-700' : 'bg-ink-900/80'}`}>{fmtMult(x)}</span>
                        ))}
                      </span>
                    </span>
                    <span className="relative block mt-2 h-1.5 rounded-full bg-black/30 overflow-hidden" title={`${m.pp}/${m.maxPp} PP`}>
                      <span className="block h-full bg-current opacity-80" style={{ width: `${(m.pp / Math.max(1, m.maxPp)) * 100}%` }} />
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {modal === 'history' && (
        <Modal title="Battle history" onClose={() => setModal(null)}>
          <ol className="max-h-[60vh] overflow-y-auto flex flex-col gap-1">
            {[...b.log].reverse().map((l, i) => (
              <li key={i} className={`rounded px-3 py-1.5 text-sm ${i === 0 ? 'bg-gold-400/20 font-bold' : l.startsWith('—') ? 'text-white/40 text-xs' : 'bg-white/5'}`}>{l}</li>
            ))}
          </ol>
        </Modal>
      )}

      {modal === 'details' && (
        <Modal title="Details" onClose={() => setModal(null)} wide>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              {b.p1Actives.map((m, i) => m.name && (
                <div key={`d${i}`}>
                  <p className="font-black">{m.name} <span className="text-white/60 text-sm">Lv{m.level} · Spe {m.speed || '?'}</span></p>
                  <div className="flex gap-1 my-1">{typesOf(m.species).map(t => <TypeBadge key={t} type={t} small />)}</div>
                  <div className="flex flex-col gap-1.5 mt-2">{(slots.find(s => s.pos === i)?.moves ?? []).map(mv => <MoveInfo key={mv.slot} id={mv.id} />)}</div>
                </div>
              ))}
            </div>
            <div>
              {b.p2Actives.map((m, i) => m.name && (
                <div key={`f${i}`} className="mb-3">
                  <p className="font-black">Foe: {m.name} <span className="text-white/60 text-sm">Lv{m.level} · Spe {m.speed || '?'}</span></p>
                  <div className="flex gap-1 my-1">{typesOf(m.species).map(t => <TypeBadge key={t} type={t} small />)}</div>
                </div>
              ))}
              <p className="text-sm text-white/70 mt-2">
                The faster Pokémon moves first unless a move has priority. Badges on moves show type effectiveness against
                {doubles ? ' each foe (left, then right)' : ' the foe'}: ×2 super effective, ×½ not very effective, ×0 no effect.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {ended && <BattleEndModal won={b.winner === 'p1'} trainer={trainer} onContinue={finish} regional={regional} retries={run.retries ?? 0} endless={run.endless} />}
    </div>
  )
}
