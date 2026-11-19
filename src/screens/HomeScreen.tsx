import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ItemIcon, itemSprite } from '../components/ItemIcon'
import { useRunStore } from '../store/runStore'
import { useRecordsStore } from '../store/recordsStore'
import { useSettingsStore, type BattleSpeed } from '../store/settingsStore'
import { useUiStore } from '../store/uiStore'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { dailyRng, dailyType, formatCountdown, msUntilUtcMidnight, utcDate } from '../lib/daily'
import { starterCandidates } from '../lib/progression'
import { battleSpriteUrl, species } from '../lib/dex'
import { challengerLabel, modeName, runPlace } from '../lib/runLabels'
import { TYPE_COLORS } from '../lib/typeColors'
import { PokeBall } from '../components/PokeBall'
import { NicknameDialog } from '../components/NicknameDialog'
import { usePlayerStore } from '../store/playerStore'
import { leaderboardEnabled } from '../lib/leaderboard'

const APP_VERSION = 'v0.4.0'

function useUtcClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now
}

function Segmented<T extends string | number>({
  value, options, onChange, label,
}: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {options.map(o => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-w-11 px-3 py-1 rounded-md text-xs font-bold transition-colors ${
            value === o.value ? 'bg-gold-400 text-ink-900' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-white/80">{label}</span>
      {children}
    </div>
  )
}

function Tile({ icon, title, sub, onClick }: { icon: ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl bg-ink-900/95 border border-black/40 px-3 py-4 shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:bg-ink-800 transition-all"
    >
      <span className="text-2xl leading-none" aria-hidden="true">{icon}</span>
      <span className="font-extrabold text-white">{title}</span>
      <span className="text-[11px] text-white/60">{sub}</span>
    </button>
  )
}

export function HomeScreen() {
  const run = useRunStore(s => s.run)
  const startDaily = useRunStore(s => s.startDaily)
  const clearRun = useRunStore(s => s.clearRun)
  const dailyResults = useRecordsStore(s => s.daily)
  const { speed, effects, setSpeed, setEffects } = useSettingsStore()
  const go = useUiStore(s => s.go)
  const install = useInstallPrompt()
  const player = usePlayerStore()
  const [dialog, setDialog] = useState<null | 'daily' | 'profile'>(null)

  const now = useUtcClock()
  const today = utcDate(now)
  const todayType = dailyType(today)
  const todayResult = dailyResults[today]
  const heroTeam = useMemo(
    () => starterCandidates(todayType, dailyRng(today, 'starters')).slice(0, 3),
    [today, todayType],
  )
  const activeRun = run && run.phase !== 'run_ended' ? run : null
  const dailyInProgress = activeRun?.mode === 'daily' && activeRun.dailyDate === today
  const typeColor = TYPE_COLORS[todayType]

  function beginDaily() {
    if (activeRun && !confirm(`Starting the Daily Challenge will abandon your ${modeName(activeRun)} run. Continue?`)) return
    clearRun()
    if (startDaily()) go('run')
  }

  function playDaily() {
    if (dailyInProgress) return go('run')
    if (todayResult) return go('ranking')
    if (leaderboardEnabled() && !player.playerId && !player.declined) return setDialog('daily')
    beginDaily()
  }

  function newRegional() {
    if (activeRun && !confirm(`Start a new Regional Quest? Your current ${modeName(activeRun)} run will be abandoned.`)) return
    go('region_select')
  }

  function newQuest() {
    if (activeRun && !confirm(`Start a new Gym Quest? Your current ${modeName(activeRun)} run will be abandoned.`)) return
    go('type_select')
  }

  return (
    <div className="home-bg min-h-screen text-white relative overflow-hidden font-sans">
      {/* Diagonal light/dark bands */}
      <div className="absolute inset-x-[-20%] top-[52%] h-[70%] bg-ember-700/60 -skew-y-12 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-x-[-20%] top-[-30%] h-[50%] bg-white/5 -skew-y-12 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-md mx-auto px-4 pt-8 pb-6 flex flex-col">
        {leaderboardEnabled() && (
          <button
            onClick={() => setDialog('profile')}
            className="absolute top-3 right-4 flex flex-col items-center gap-0.5 group"
            aria-label={player.nickname ? `Nickname: ${player.nickname}. Change nickname` : 'Set a nickname for the leaderboard'}
          >
            <span className="w-11 h-11 rounded-lg bg-ink-900 border-2 border-black/40 grid place-items-center shadow-[0_3px_0_rgba(0,0,0,0.35)] group-hover:bg-ink-800">
              <PokeBall className="w-6 h-6" />
            </span>
            <span className="text-[10px] font-extrabold max-w-20 truncate">{player.nickname ?? 'Nickname'}</span>
          </button>
        )}

        {/* Title */}
        <header className="flex flex-col items-center text-center">
          <span className="inline-block -skew-x-12 bg-ink-900 border-2 border-white/90 px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase shadow-[3px_3px_0_#1c1613]">
            <span className="inline-block skew-x-12">A Pokémon roguelike</span>
          </span>
          <h1 className="mt-6 flex flex-col items-center gap-4" aria-label="Gym Leader">
            <span className="pixel-title text-white text-[56px] sm:text-[72px]">GYM</span>
            <span className="pixel-title text-gold-400 text-[44px] sm:text-[60px]">LEADER</span>
          </h1>
        </header>

        {/* Hero: today's daily starters on a dark band */}
        <div className="relative mt-6 -mx-4 h-40" aria-hidden="true">
          <div className="absolute left-1/2 w-[160vw] -translate-x-1/2 top-8 bottom-2 bg-ink-900 -skew-y-6 shadow-[0_-4px_0_#f6c443,0_6px_0_rgba(0,0,0,0.25)]" />
          <div className="absolute inset-x-0 bottom-8 flex items-end justify-center gap-4">
            {heroTeam.map((m, i) => (
              <div key={m.uid} className="flex flex-col items-center" style={{ marginBottom: i === 1 ? 10 : 0 }}>
                <img
                  src={battleSpriteUrl(m.species, false)}
                  alt=""
                  className="h-24 object-contain [image-rendering:pixelated] relative z-[1] -scale-x-100"
                />
                <div className="w-20 h-4 -mt-7 rounded-[50%] bg-black/45" />
              </div>
            ))}
          </div>
        </div>

        <main className="flex flex-col gap-3 mt-2">
          {activeRun && !dailyInProgress && (
            <button
              onClick={() => go('run')}
              className="group flex items-center gap-3 rounded-xl bg-ink-900 border-2 border-gold-400/80 px-4 py-3 text-left shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:bg-ink-800 transition-colors"
            >
              <PokeBall className="w-8 h-8 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] font-black tracking-[0.18em] uppercase text-gold-300">Continue</span>
                <span className="block font-extrabold truncate capitalize">
                  {modeName(activeRun)} · {runPlace(activeRun)}
                </span>
                <span className="block text-xs text-white/60 truncate">
                  {activeRun.phase === 'team_select' ? 'Choosing your team' : challengerLabel(activeRun)}
                </span>
              </span>
              <span className="text-gold-400 text-xl group-hover:translate-x-0.5 transition-transform" aria-hidden="true">▶</span>
            </button>
          )}

          {/* Daily Challenge */}
          <button
            onClick={playDaily}
            className="group flex items-center gap-3 rounded-xl bg-ink-900 border-l-[6px] border-gold-400 px-3 py-3 text-left shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:bg-ink-800 transition-colors"
          >
            <span className="w-14 h-14 shrink-0 rounded-lg bg-black/40 grid place-items-center overflow-hidden">
              <img src={battleSpriteUrl(heroTeam[0]?.species ?? '', false)} alt="" className="w-12 h-12 object-contain [image-rendering:pixelated]" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-[0.18em] uppercase text-white/60">Daily Challenge</span>
                <span className={`${typeColor.bg} text-white text-[10px] font-black uppercase tracking-wide rounded px-1.5 py-px`}>
                  {todayType}
                </span>
              </span>
              <span className="block font-extrabold text-lg leading-tight mt-0.5">
                {dailyInProgress ? 'Continue today’s Gym' : todayResult ? `Today: ${todayResult.wins} ${todayResult.wins === 1 ? 'win' : 'wins'}` : 'Same Gym for everyone today'}
              </span>
              <span className="block text-xs text-white/60 mt-0.5">
                {todayResult && !dailyInProgress
                  ? `Try used · new Gym in ${formatCountdown(msUntilUtcMidnight(now))}`
                  : `Endless challengers · one try · ends in ${formatCountdown(msUntilUtcMidnight(now))}`}
              </span>
            </span>
            <span className="text-gold-400 text-xl group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
              {todayResult && !dailyInProgress ? <ItemIcon src={itemSprite({ held: 'Shiny Charm' })} className="w-7 h-7" alt="Ranking" /> : '▶'}
            </span>
          </button>

          {/* Gym Quest */}
          <button
            onClick={newQuest}
            className="group flex items-center gap-3 rounded-xl bg-gold-400 text-ink-900 border-2 border-gold-300 px-4 py-4 text-left shadow-[0_5px_0_#b8431a,0_0_28px_rgba(255,215,106,0.45)] hover:bg-gold-300 hover:-translate-y-0.5 transition-all"
          >
            <PokeBall className="w-9 h-9 shrink-0" />
            <span className="flex-1">
              <span className="block font-black text-xl leading-tight">Gym Quest</span>
              <span className="block text-sm font-semibold text-ink-800/80">Pick a type and defend against 15 challengers</span>
            </span>
            <span className="text-xl group-hover:translate-x-0.5 transition-transform" aria-hidden="true">▶</span>
          </button>

          {/* Regional Quest */}
          <button
            onClick={newRegional}
            className="group flex items-center gap-3 rounded-xl bg-ink-900 border-2 border-black px-4 py-3 text-left shadow-[0_4px_0_rgba(0,0,0,0.35)] hover:bg-ink-800 transition-colors"
          >
            <ItemIcon src={itemSprite({ held: 'Town Map' })} className="w-9 h-9" />
            <span className="flex-1">
              <span className="block font-extrabold text-lg leading-tight">Regional Quest</span>
              <span className="block text-xs text-white/65">Pick a starter, earn 8 badges, beat the Elite Four and the Champion</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 rounded px-2 py-1">Kanto</span>
            <span className="text-gold-400 text-xl group-hover:translate-x-0.5 transition-transform" aria-hidden="true">▶</span>
          </button>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <Tile icon={<ItemIcon src={itemSprite({ held: 'Shiny Charm' })} className="w-9 h-9" />} title="Ranking" sub="Daily results" onClick={() => go('ranking')} />
            <Tile icon={<ItemIcon src={itemSprite({ held: 'Teachy TV' })} className="w-9 h-9" />} title="How to play" sub="Modes and rules" onClick={() => go('how_to_play')} />
          </div>

          <section aria-label="Settings" className="rounded-xl bg-ink-900/90 border border-black/40 px-4 py-2 mt-1">
            <SettingRow label="Battle speed">
              <Segmented<BattleSpeed>
                label="Battle speed"
                value={speed}
                onChange={setSpeed}
                options={[{ value: 1, label: '1×' }, { value: 2, label: '2×' }, { value: 3, label: '3×' }]}
              />
            </SettingRow>
            <SettingRow label="Effects">
              <Segmented
                label="Effects"
                value={effects}
                onChange={setEffects}
                options={[{ value: 'full', label: 'Full' }, { value: 'simple', label: 'Simple' }]}
              />
            </SettingRow>
            {install && (
              <SettingRow label="Play as an app">
                <button onClick={install} className="px-3 py-1 rounded-md text-xs font-bold bg-gold-400 text-ink-900 hover:bg-gold-300">
                  Install
                </button>
              </SettingRow>
            )}
          </section>
        </main>

        <footer className="mt-5 text-center text-[11px] leading-relaxed text-white/80">
          Battles run on the Pokémon Showdown simulator (@pkmn/sim, MIT). Sprites from PokeAPI.
          <br />
          Pokémon © Nintendo / Game Freak. Fan project · {APP_VERSION}
          {heroTeam.length > 0 && (
            <span className="sr-only">Today’s Daily starters include {heroTeam.map(m => species(m.species).name).join(', ')}.</span>
          )}
        </footer>
      </div>

      {dialog && (
        <NicknameDialog
          allowSkip={dialog === 'daily'}
          onCancel={() => setDialog(null)}
          onDone={() => {
            const next = dialog
            setDialog(null)
            if (next === 'daily') beginDaily()
          }}
        />
      )}
    </div>
  )
}
