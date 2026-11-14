import { useEffect } from 'react'
import { useBattleStore } from '../store/battleStore'
import { useRunStore } from '../store/runStore'
import { useBattle } from '../hooks/useBattle'
import { getGymLeaderTeam, getChallengerTeam } from '../lib/teams'
import { HPBar } from '../components/HPBar'
import { BattleLog } from '../components/BattleLog'
import { TYPE_COLORS, TYPE_EMOJI } from '../lib/typeColors'

export function BattleScreen() {
  const run = useRunStore(s => s.run)!
  const advanceChallenger = useRunStore(s => s.advanceChallenger)
  const endRun = useRunStore(s => s.endRun)
  const battle = useBattleStore(s => s.battle)
  const { sendMove, sendSwitch } = useBattle(
    getGymLeaderTeam(run.gymType),
    getChallengerTeam(run.challengerIndex),
  )

  const color = TYPE_COLORS[run.gymType]

  useEffect(() => {
    if (!battle || battle.phase !== 'ended') return
    const won = battle.winner === 'p1'
    const t = setTimeout(() => {
      useBattleStore.getState().clearBattle()
      if (won) advanceChallenger()
      else endRun()
    }, 1500)
    return () => clearTimeout(t)
  }, [battle?.phase, battle?.winner])

  if (!battle) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading battle…</p>
      </div>
    )
  }

  const { p1Active, p2Active, log, phase, availableMoves, forcedSwitch, availableSwitches } = battle

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col px-4 py-6 max-w-lg mx-auto gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold uppercase tracking-widest ${color.text}`}>
          {TYPE_EMOJI[run.gymType]} {run.gymType} Gym
        </span>
        <span className="text-slate-500 text-xs">
          Challenger {run.challengerIndex + 1} / {run.totalChallengers}
        </span>
      </div>

      {/* Opponent */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-semibold">{p2Active.name}</span>
          {p2Active.status && <span className="text-xs text-yellow-400 uppercase">{p2Active.status}</span>}
        </div>
        <HPBar hp={p2Active.hp} maxHp={p2Active.maxHp} />
      </div>

      {/* Battle log */}
      <BattleLog lines={log} />

      {/* Player */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-semibold">{p1Active.name}</span>
          {p1Active.status && <span className="text-xs text-yellow-400 uppercase">{p1Active.status}</span>}
        </div>
        <HPBar hp={p1Active.hp} maxHp={p1Active.maxHp} />
      </div>

      {/* Controls */}
      {phase === 'waiting' && !forcedSwitch && (
        <div className="grid grid-cols-2 gap-2">
          {availableMoves.map(m => (
            <button
              key={m.slot}
              disabled={m.disabled || m.pp === 0}
              onClick={() => sendMove(`move ${m.slot}`)}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg p-3 text-left transition-colors"
            >
              <p className="font-medium text-sm">{m.name}</p>
              <p className="text-xs text-slate-400 tabular-nums">{m.pp}/{m.maxPp} PP</p>
            </button>
          ))}
        </div>
      )}

      {phase === 'waiting' && forcedSwitch && (
        <div>
          <p className="text-sm text-slate-400 mb-2">Choose a Pokémon to send out:</p>
          <div className="grid grid-cols-3 gap-2">
            {availableSwitches.map(slot => {
              const mon = battle.p1Team[slot - 1]
              return (
                <button
                  key={slot}
                  onClick={() => sendSwitch(slot)}
                  disabled={!mon || mon.fainted}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg p-2 text-center text-sm transition-colors"
                >
                  <p className="font-medium truncate">{mon?.name ?? '—'}</p>
                  {mon && <p className="text-xs text-slate-400">{mon.hp}/{mon.maxHp}</p>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <p className="text-center text-slate-500 text-sm animate-pulse">Processing…</p>
      )}

      {phase === 'ended' && (
        <p className="text-center text-slate-400 text-sm">Battle ended</p>
      )}

      {/* Team overview */}
      <div className="flex gap-2 justify-center mt-auto">
        {battle.p1Team.map((mon, i) => (
          <div
            key={i}
            className={`w-8 h-2 rounded-full ${mon.fainted ? 'bg-red-700' : 'bg-green-500'}`}
            title={mon.name}
          />
        ))}
      </div>
    </div>
  )
}
