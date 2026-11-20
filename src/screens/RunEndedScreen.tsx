import { useRunStore } from '../store/runStore'
import { useBattleStore } from '../store/battleStore'
import { useUiStore } from '../store/uiStore'
import { TYPE_COLORS } from '../lib/typeColors'
import { LEADER_SPRITE, gymName, trainerSprite } from '../lib/trainers'
import { artworkUrl, species } from '../lib/dex'
import { modeName } from '../lib/runLabels'
import { regionOf, trainerTitleName } from '../lib/regions'
import { ProgressCard } from '../components/ProgressCard'

export function RunEndedScreen() {
  const run = useRunStore(s => s.run)!
  const clearRun = useRunStore(s => s.clearRun)
  const clearBattle = useBattleStore(s => s.clearBattle)
  const go = useUiStore(s => s.go)
  const color = TYPE_COLORS[run.gymType]
  const { won } = run
  const wins = run.challengerIndex - (run.losses ?? 0)
  const endless = !!run.endless
  const isDaily = run.mode === 'daily'
  const regional = run.mode === 'regional'
  const region = regionOf(run.region)
  const badges = region.trainers.slice(0, wins).filter(t => t.badge).length
  const noun = region.badgeNoun ?? 'badge'

  function leave(to: 'home' | 'type_select' | 'region_select' | 'ranking') {
    clearBattle()
    clearRun()
    go(to)
  }

  return (
    <div className="home-bg min-h-screen text-white px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-4">
        <img src={trainerSprite(regional ? region.playerSprite : LEADER_SPRITE[run.gymType])} alt="" className={`h-36 [image-rendering:pixelated] ${won || isDaily || endless ? '' : 'grayscale opacity-70'}`} />
        <h2 className="screen-title text-3xl">
          {regional ? (won ? `${region.name} Champion!` : 'Quest over') : won ? 'Quest complete!' : endless ? `Retired after ${wins} ${wins === 1 ? 'win' : 'wins'}` : isDaily ? `${wins} ${wins === 1 ? 'win' : 'wins'} today` : 'Gym fallen…'}
        </h2>
        <p className="text-white/65">
          {regional
            ? won
              ? `You completed all 8 ${noun}s, beat the Elite Four and ${trainerTitleName(region.trainers.at(-1)!)}. Your team enters the Hall of Fame.`
              : `Out of retries against ${region.trainers[wins]?.name}. You completed ${badges} ${noun}${badges === 1 ? '' : 's'} and won ${wins} of ${region.trainers.length} battles.`
            : endless
            ? `You faced ${run.challengerIndex} challengers in Endless mode: ${wins} ${wins === 1 ? 'win' : 'wins'}, ${run.losses ?? 0} ${run.losses === 1 ? 'loss' : 'losses'}. The result is saved to your records.`
            : won
            ? `You defended your Gym against all ${run.totalChallengers} challengers, Champion included.`
            : isDaily
              ? `Your Gym held for ${wins} ${wins === 1 ? 'battle' : 'battles'}. Today's try is used; a new Daily Gym opens at midnight UTC.`
              : `You defeated ${wins} of ${run.totalChallengers} challengers before losing your title.`}
        </p>
        {run.forfeited && (
          <p className="text-sm text-amber-300">
            The page was left or reloaded during a Daily battle, so that battle counted as a loss.
          </p>
        )}
        <p className={`text-sm font-semibold uppercase tracking-widest ${color.text}`}>
          {modeName(run)} · {regional ? region.name : gymName(run.gymType)}
        </p>

        {regional && won ? (
          <div className="w-full">
            <p className="font-ui font-bold text-gold-300 mb-2">Hall of Fame</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {run.roster.map(m => (
                <div key={m.uid} className="rounded-xl bg-ink-900 border-2 border-gold-400/60 p-2 flex flex-col items-center">
                  <img src={artworkUrl(m.species)} alt="" className="w-16 h-16 object-contain" />
                  <span className="text-sm font-semibold">{species(m.species).name}</span>
                  <span className="text-xs text-white/65">Lv {m.level}</span>
                </div>
              ))}
            </div>
          </div>
        ) : won && run.lastProgress.length > 0 ? (
          <div className="w-full flex flex-col gap-3 text-left">
            {run.lastProgress.map((r, i) => <ProgressCard key={r.uid} report={r} delay={i * 250} />)}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {run.roster.map(m => (
              <div key={m.uid} className="flex flex-col items-center">
                <img src={artworkUrl(m.species)} alt="" className="w-20 h-20 object-contain" />
                <span className="text-sm font-semibold">{species(m.species).name}</span>
                <span className="text-xs text-white/65">Lv {m.level}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {isDaily ? (
            <button onClick={() => leave('ranking')} className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black shadow-[0_4px_0_#b8431a] rounded-xl font-semibold">
              See ranking
            </button>
          ) : regional ? (
            <button onClick={() => leave('region_select')} className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black shadow-[0_4px_0_#b8431a] rounded-xl font-semibold">
              New Regional Quest
            </button>
          ) : (
            <button onClick={() => leave('type_select')} className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-900 border-2 border-black shadow-[0_4px_0_#b8431a] rounded-xl font-semibold">
              New Gym Quest
            </button>
          )}
          <button onClick={() => leave('home')} className="px-6 py-3 bg-ink-900 hover:bg-ink-800 border-2 border-black rounded-xl font-semibold">
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
