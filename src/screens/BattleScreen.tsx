import { useEffect, useMemo, useState } from 'react'
import { useBattleStore } from '../store/battleStore'
import { useRunStore } from '../store/runStore'
import { useSettingsStore } from '../store/settingsStore'
import { useUiStore } from '../store/uiStore'
import { useBattle } from '../hooks/useBattle'
import { packTeam } from '../lib/progression'
import { battleSpriteUrl, effectiveness, move as moveData, species as speciesData, toID } from '../lib/dex'
import { ARENA } from '../lib/arena'
import { LEADER_SPRITE, challengerTrainer, gymName, trainerSprite } from '../lib/trainers'
import { openBattle } from '../lib/battleGuard'
import { battleExtras } from '../lib/upgrades'
import { TYPE_COLORS } from '../lib/typeColors'
import { Sprite } from '../components/Sprite'
import { Modal } from '../components/Modal'
import { MoveInfo } from '../components/MoveInfo'
import { TypeBadge } from '../components/TypeBadge'
import { BattleEndModal } from '../components/BattleEndModal'
import type { BattleMonState, GymType } from '../types/game'

const STATUS_STYLE: Record<string, string> = {
  brn: 'bg-orange-600', par: 'bg-yellow-500 text-black', psn: 'bg-fuchsia-600', tox: 'bg-fuchsia-800',
  slp: 'bg-slate-500', frz: 'bg-cyan-500 text-black',
}

const typesOf = (name: string) => {
  try { return speciesData(toID(name)).types } catch { return [] }
}

function InfoCard({ mon, mine }: { mon: BattleMonState; mine: boolean }) {
  const pct = mon.maxHp ? mon.hp / mon.maxHp : 0
  return (
    <div className="bg-[#fdf6e6] text-ink-900 rounded-xl rounded-br-3xl px-3 py-2 w-48 sm:w-60 border-2 border-ink-900 shadow-[0_4px_0_rgba(0,0,0,0.35)]">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-black truncate">{mon.name}</span>
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
          {mon.status && <span className={`uppercase rounded px-1 text-white ${STATUS_STYLE[mon.status] ?? 'bg-slate-600'}`}>{mon.status}</span>}
          {mon.speed > 0 && <span className="ml-1 text-ink-900/50">Spe {mon.speed}</span>}
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

  const trainer = useMemo(() => challengerTrainer(run), [run.id, run.challengerIndex])
  // Fainted Pokémon sit out until revived; the rest start with the HP they ended on.
  const fighters = useMemo(() => run.roster.filter(m => (m.hp ?? 1) > 0), [run.roster])
  const p1Team = useMemo(() => packTeam(fighters), [fighters])
  const p2Team = useMemo(() => packTeam(run.challenger), [run.challenger])
  const extras = useMemo(() => {
    const aiLevel = trainer.title === 'Promising Trainer' ? 0 : trainer.title === 'Trainer' ? 1 : 2
    return battleExtras(run.gymType, run.mode === 'daily' ? [] : run.upgrades ?? [], aiLevel)
  }, [trainer, run.gymType, run.mode, run.upgrades])
  const { sendMove, sendSwitch } = useBattle(p1Team, p2Team, fighters.map(m => m.hp ?? 1), extras)

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

  useEffect(() => {
    if (!canAct) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || modal) return
      const n = Number(e.key)
      if (n >= 1 && n <= 4 && !battle!.forcedSwitch) {
        const m = battle!.availableMoves[n - 1]
        if (m && !m.disabled && m.pp > 0) sendMove(`move ${m.slot}`)
      }
      if (e.key.toLowerCase() === 's') setView(v => (v === 'party' ? 'moves' : 'party'))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canAct, battle, modal, sendMove])

  function finish() {
    if (!battle) return
    const finalHp = Object.fromEntries(battle.p1Team.map(m => [m.species, m.fainted || !m.maxHp ? 0 : m.hp / m.maxHp]))
    useBattleStore.getState().clearBattle()
    if (battle.winner === 'p1') winBattle(finalHp)
    else loseBattle()
  }

  const leaderSprite = trainerSprite(LEADER_SPRITE[run.gymType])

  const toolbar = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <img src={leaderSprite} alt="" className="w-9 h-9 rounded-md bg-ink-900 border-2 border-black object-cover object-top [image-rendering:pixelated]" />
        <div className="min-w-0">
          <p className="text-[11px] font-black truncate">{gymName(run.gymType)}</p>
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
              <span className="pixel-title text-white text-base sm:text-xl [text-shadow:2px_2px_0_#1c1613]">{gymName(run.gymType)}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-r from-red-950 to-red-700 flex items-center justify-end gap-6 px-[8%]">
              <span className="pixel-title text-white text-base sm:text-xl [text-shadow:2px_2px_0_#1c1613]">{trainer.name}</span>
              <img src={trainerSprite(trainer.sprite)} alt="" className="h-28 sm:h-36 [image-rendering:pixelated] -scale-x-100" />
            </div>
            <div className="absolute inset-x-0 top-1/2 h-1.5 -mt-0.5 bg-ink-900" />
            <span className="pixel-title absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-400 text-4xl sm:text-5xl">VS</span>
          </div>
          <div className="rounded-xl bg-[#fdf6e6] text-ink-900 border-2 border-ink-900 px-4 py-3 font-bold">
            {ready ? `${trainer.name} wants to battle!` : `${trainer.name} is getting ready…`}
          </div>
        </div>
      </div>
    )
  }

  const b = battle!
  const { p1Active, p2Active, availableMoves, forcedSwitch, availableSwitches, event, seq } = b
  const eventFor = (side: 'p1' | 'p2') => (event && event.side === side ? event.kind : null)
  const foeTypes = typesOf(p2Active.species)
  const lastLine = b.log.filter(l => !l.startsWith('—')).at(-1) ?? ''
  const prompt = canAct ? (forcedSwitch ? `${p1Active.name} fainted! Choose your next Pokémon.` : `What will ${p1Active.name} do?`) : lastLine
  const showParty = forcedSwitch || view === 'party'

  return (
    <div className="home-bg min-h-screen text-white font-sans px-3 py-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {toolbar}

        {/* Arena */}
        <div className={`relative h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-black bg-gradient-to-b ${ARENA[run.gymType]}`}>
          <span className="absolute top-2 right-3 rounded bg-ink-900/80 px-2 py-0.5 text-[10px] font-black">TURN {b.turn}</span>
          <div className="absolute top-3 left-3 z-10"><InfoCard mon={p2Active} mine={false} /></div>
          <div className="absolute right-[8%] top-[22%] flex flex-col items-center">
            <Sprite species={p2Active.species} back={false} fainted={p2Active.fainted} event={eventFor('p2')} seq={seq} className="h-24 sm:h-32 relative z-[1]" />
            <div className="w-36 sm:w-48 h-8 sm:h-10 -mt-6 rounded-[50%] bg-ink-900/40 border-4 border-ink-900/60" />
          </div>
          <div className="absolute left-[4%] sm:left-[8%] bottom-[2%] flex flex-col items-center">
            <Sprite species={p1Active.species} back fainted={p1Active.fainted} event={eventFor('p1')} seq={seq} className="h-32 sm:h-44 relative z-[1]" />
            <div className="w-44 sm:w-60 h-9 sm:h-12 -mt-8 rounded-[50%] bg-ink-900/40 border-4 border-ink-900/60" />
          </div>
          <div className="absolute bottom-3 right-3 z-10"><InfoCard mon={p1Active} mine /></div>
        </div>

        {/* Text box */}
        <div className="flex items-center gap-3 rounded-xl bg-[#fdf6e6] text-ink-900 border-2 border-ink-900 px-4 py-3 min-h-14" aria-live="polite">
          <p className="flex-1 font-bold">{prompt}</p>
          <button onClick={() => setModal('history')} aria-label="Battle history" className="w-8 h-8 rounded-full bg-ink-900 text-white text-xs shrink-0">▼</button>
        </div>

        {/* Controls */}
        <div className="rounded-xl bg-ink-900 border-2 border-black p-3 grid grid-cols-[6.5rem_1fr] sm:grid-cols-[8rem_1fr] gap-2 min-h-36">
          <div className="flex flex-col gap-2">
            <button
              disabled={!canAct || forcedSwitch}
              onClick={() => setView(v => (v === 'party' ? 'moves' : 'party'))}
              className={`flex-1 rounded-lg border-2 border-black font-black text-sm flex flex-col items-center justify-center gap-0.5 ${showParty ? 'bg-emerald-800' : 'bg-emerald-700 hover:bg-emerald-600'} disabled:opacity-60`}
            >
              <span aria-hidden="true">●</span>{showParty ? 'Moves' : 'Pokémon'}<span className="text-[10px] font-bold text-white/60">(S)</span>
            </button>
            <button onClick={() => setModal('details')} className="rounded-lg bg-white/10 hover:bg-white/15 border-2 border-black py-1.5 text-xs font-black">Details</button>
          </div>

          {!canAct && !ended ? (
            <p className="self-center text-center text-white/50 text-sm">The turn plays out: faster Pokémon first…</p>
          ) : showParty ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {b.p1Team.map(m => {
                const ok = canAct && availableSwitches.includes(m.name)
                const pct = m.maxHp ? m.hp / m.maxHp : 0
                return (
                  <button key={m.name} disabled={!ok} onClick={() => { sendSwitch(m.name); setView('moves') }}
                    className={`flex items-center gap-2 rounded-lg border-2 border-black bg-white/5 p-1.5 text-left ${ok ? 'hover:bg-white/10' : 'opacity-50'}`}>
                    <img src={battleSpriteUrl(m.species, false)} alt="" className="w-10 h-10 object-contain [image-rendering:pixelated]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold truncate">{m.name} <span className="text-white/50">Lv{m.level}</span></span>
                      <span className="block h-1.5 rounded-full bg-black/60 overflow-hidden"><span className={`block h-full ${pct > 0.5 ? 'bg-emerald-400' : pct > 0.25 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${pct * 100}%` }} /></span>
                      <span className="block text-[10px] text-white/50">{m.name === p1Active.name ? 'In battle' : m.fainted ? 'Fainted' : ''}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableMoves.map((m, i) => {
                const d = moveData(m.id)
                const type = (d?.type ?? 'Normal').toLowerCase() as GymType
                const mult = d && d.category !== 'Status' ? effectiveness(d.type, foeTypes) : 1
                const badge = mult === 0 ? '×0' : mult >= 2 ? `×${mult}` : mult < 1 ? (mult === 0.25 ? '×¼' : '×½') : null
                return (
                  <button
                    key={m.slot}
                    disabled={!canAct || m.disabled || m.pp === 0}
                    onClick={() => sendMove(`move ${m.slot}`)}
                    title={d ? `${d.category} · Pow ${d.power || '—'} · Acc ${d.accuracy === true ? '—' : d.accuracy} · ${d.desc}` : undefined}
                    className={`relative overflow-hidden rounded-lg border-2 border-black ${TYPE_COLORS[type]?.bg ?? 'bg-slate-500'} px-3 py-2 text-left disabled:opacity-40 hover:brightness-110 shadow-[0_3px_0_rgba(0,0,0,0.4)]`}
                  >
                    <span className="absolute inset-y-0 right-0 w-1/2 bg-white/10 skew-x-[-20deg] translate-x-6" aria-hidden="true" />
                    <span className="relative flex items-center justify-between gap-1">
                      <span className="font-black text-sm sm:text-base [text-shadow:1px_1px_0_rgba(0,0,0,0.35)]">
                        <span className="text-white/60 text-[10px] mr-1">{i + 1}</span>{m.name}
                      </span>
                      {badge && (
                        <span className={`text-[10px] font-black rounded px-1 ${mult >= 2 ? 'bg-emerald-600' : 'bg-ink-900/70'}`}>{badge}</span>
                      )}
                    </span>
                    <span className="relative block mt-2 h-1.5 rounded-full bg-black/30 overflow-hidden" title={`${m.pp}/${m.maxPp} PP`}>
                      <span className="block h-full bg-white/90" style={{ width: `${(m.pp / Math.max(1, m.maxPp)) * 100}%` }} />
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
            <div>
              <p className="font-black">{p1Active.name} <span className="text-white/60 text-sm">Lv{p1Active.level}</span></p>
              <div className="flex gap-1 my-1">{typesOf(p1Active.species).map(t => <TypeBadge key={t} type={t} small />)}</div>
              <div className="flex flex-col gap-1.5 mt-2">{availableMoves.map(m => <MoveInfo key={m.slot} id={m.id} />)}</div>
            </div>
            <div>
              <p className="font-black">Foe: {p2Active.name} <span className="text-white/60 text-sm">Lv{p2Active.level}</span></p>
              <div className="flex gap-1 my-1">{foeTypes.map(t => <TypeBadge key={t} type={t} small />)}</div>
              <p className="text-sm text-white/70 mt-2">Speed {p2Active.speed || '?'} vs your {p1Active.speed || '?'}: the faster Pokémon moves first unless a move has priority.</p>
              <p className="text-sm text-white/70 mt-2">Badges on moves show type effectiveness against the foe: ×2 super effective, ×½ not very effective, ×0 no effect.</p>
            </div>
          </div>
        </Modal>
      )}

      {ended && <BattleEndModal won={b.winner === 'p1'} trainer={trainer} onContinue={finish} />}
    </div>
  )
}
