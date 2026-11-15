import { useEffect, useMemo } from 'react'
import { useBattleStore } from '../store/battleStore'
import { useRunStore } from '../store/runStore'
import { useBattle } from '../hooks/useBattle'
import { packTeam } from '../lib/progression'
import { move as moveData, battleSpriteUrl } from '../lib/dex'
import { HPBar } from '../components/HPBar'
import { BattleLog } from '../components/BattleLog'
import { Sprite } from '../components/Sprite'
import { TypeBadge } from '../components/TypeBadge'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'
import type { BattleMonState, GymType } from '../types/game'

const STATUS_STYLE: Record<string, string> = {
  brn: 'bg-orange-600', par: 'bg-yellow-500 text-black', psn: 'bg-fuchsia-600', tox: 'bg-fuchsia-800',
  slp: 'bg-slate-500', frz: 'bg-cyan-500 text-black',
}

function InfoCard({ mon, label }: { mon: BattleMonState; label: string }) {
  return (
    <div className="bg-slate-950/85 backdrop-blur rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 w-40 sm:w-60 border border-white/10 shadow-lg">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold truncate">{mon.name}</span>
        <span className="text-xs text-slate-300 tabular-nums">Lv {mon.level}</span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
        <span>{label}</span>
        <span className="flex items-center gap-1">
          {mon.status && (
            <span className={`uppercase font-bold rounded px-1 ${STATUS_STYLE[mon.status] ?? 'bg-slate-600'}`}>{mon.status}</span>
          )}
          {mon.speed > 0 && <span className="tabular-nums">Spe {mon.speed}</span>}
        </span>
      </div>
      <HPBar hp={mon.hp} maxHp={mon.maxHp} />
    </div>
  )
}

function TeamDots({ team }: { team: BattleMonState[] }) {
  return (
    <div className="flex gap-1">
      {team.map((m, i) => (
        <span key={i} title={m.name} className={`w-2.5 h-2.5 rounded-full border border-white/40 ${m.fainted ? 'bg-slate-700' : 'bg-red-500'}`} />
      ))}
    </div>
  )
}

export function BattleScreen() {
  const run = useRunStore(s => s.run)!
  const winBattle = useRunStore(s => s.winBattle)
  const loseBattle = useRunStore(s => s.loseBattle)
  const battle = useBattleStore(s => s.battle)
  const animating = useBattleStore(s => s.animating)

  const p1Team = useMemo(() => packTeam(run.roster), [run.roster])
  const p2Team = useMemo(() => packTeam(run.challenger), [run.challenger])
  const { sendMove, sendSwitch } = useBattle(p1Team, p2Team)

  const color = TYPE_COLORS[run.gymType]

  useEffect(() => {
    if (!battle || battle.phase !== 'ended' || animating) return
    const won = battle.winner === 'p1'
    const t = setTimeout(() => {
      useBattleStore.getState().clearBattle()
      if (won) winBattle()
      else loseBattle()
    }, 1400)
    return () => clearTimeout(t)
  }, [battle?.phase, battle?.winner, animating])

  if (!battle || !battle.p1Active.name) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">A challenger approaches…</p>
      </div>
    )
  }

  const { p1Active, p2Active, log, phase, availableMoves, forcedSwitch, availableSwitches, event, seq } = battle
  const canAct = phase === 'waiting' && !animating
  const eventFor = (side: 'p1' | 'p2') => (event && event.side === side ? event.kind : null)

  return (
    <div className="min-h-screen bg-slate-950 text-white px-3 py-4 sm:py-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold uppercase tracking-widest ${color.text}`}>
            {TYPE_EMOJI[run.gymType]} {run.gymType} Gym
          </span>
          <span className="text-slate-400 text-xs">
            Challenger {run.challengerIndex + 1} / {run.totalChallengers} · Turn {battle.turn}
          </span>
        </div>

        {/* Arena */}
        <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-b from-sky-900/60 via-slate-900 to-emerald-950">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-900/40 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <InfoCard mon={p2Active} label="Challenger" />
            <TeamDots team={battle.p2Team} />
          </div>
          <div className="absolute right-[8%] sm:right-[12%] top-[16%] flex flex-col items-center">
            <Sprite species={p2Active.species} back={false} fainted={p2Active.fainted} event={eventFor('p2')} seq={seq} className="h-24 sm:h-28 relative z-[1]" />
            <div className="w-32 h-6 -mt-4 rounded-[50%] bg-black/30" />
          </div>

          <div className="absolute left-[2%] sm:left-[10%] bottom-[4%] flex flex-col items-center">
            <Sprite species={p1Active.species} back fainted={p1Active.fainted} event={eventFor('p1')} seq={seq} className="h-28 sm:h-40 relative z-[1]" />
            <div className="w-32 sm:w-40 h-7 -mt-6 rounded-[50%] bg-black/30" />
          </div>
          <div className="absolute bottom-3 right-3 z-10">
            <InfoCard mon={p1Active} label="Your Pokémon" />
          </div>

          {phase === 'ended' && !animating && (
            <div className="absolute inset-0 bg-black/60 grid place-items-center z-20">
              <p className="text-3xl font-bold">{battle.winner === 'p1' ? '🏅 Victory!' : '💀 Defeated'}</p>
            </div>
          )}
        </div>

        <BattleLog lines={log} />

        {/* Controls */}
        <div className="min-h-[7.5rem]">
          {canAct && forcedSwitch && (
            <p className="text-sm text-amber-300 mb-2">{p1Active.name} fainted! Choose your next Pokémon:</p>
          )}
          {canAct && !forcedSwitch && (
            <div className="grid grid-cols-2 gap-2">
              {availableMoves.map(m => {
                const d = moveData(m.id)
                const tc = d ? TYPE_COLORS[d.type.toLowerCase() as GymType] : undefined
                return (
                  <button
                    key={m.slot}
                    disabled={m.disabled || m.pp === 0}
                    onClick={() => sendMove(`move ${m.slot}`)}
                    title={d?.desc}
                    className={`bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl p-2.5 text-left transition-colors border-l-4 ${tc?.border ?? 'border-slate-600'}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-sm truncate">{m.name}</span>
                      {d && <TypeBadge type={d.type} small />}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 tabular-nums">
                      <span className="truncate">
                        <span className="hidden sm:inline">{d?.category} · </span>
                        Pow {d?.power || '—'} · Acc {d?.accuracy === true ? '—' : d?.accuracy}
                      </span>
                      <span className="shrink-0 ml-1">{m.pp}/{m.maxPp}</span>
                    </div>
                    {d && d.priority !== 0 && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 bg-amber-900/50 rounded px-1">
                        Priority {d.priority > 0 ? '+' : ''}{d.priority}: acts {d.priority > 0 ? 'first' : 'last'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
          {!canAct && phase !== 'ended' && (
            <p className="text-center text-slate-500 text-sm pt-8">
              {animating ? 'The turn plays out, fastest Pokémon first…' : 'Waiting for the challenger…'}
            </p>
          )}
        </div>

        {/* Party: switch in a teammate */}
        <div className="grid grid-cols-3 gap-2">
          {battle.p1Team.map((mon, i) => {
            const slot = i + 1
            const active = mon.name === p1Active.name
            const canSwitch = canAct && availableSwitches.includes(slot)
            return (
              <button
                key={mon.name}
                onClick={() => sendSwitch(slot)}
                disabled={!canSwitch}
                className={`flex items-center gap-2 rounded-xl p-1.5 text-left border transition-colors ${
                  active ? 'border-slate-500 bg-slate-800' : 'border-slate-800 bg-slate-900'
                } ${canSwitch ? 'hover:border-indigo-400 cursor-pointer' : 'cursor-default'} ${mon.fainted ? 'opacity-40' : ''}`}
              >
                <img src={battleSpriteUrl(mon.species, false)} alt="" className="w-10 h-10 object-contain [image-rendering:pixelated]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{mon.name} <span className="text-slate-400 font-normal">Lv{mon.level}</span></p>
                  <HPBar hp={mon.hp} maxHp={mon.maxHp} size="sm" />
                  <p className="text-[10px] text-slate-500">{active ? 'In battle' : mon.fainted ? 'Fainted' : canSwitch ? 'Tap to switch' : ''}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
