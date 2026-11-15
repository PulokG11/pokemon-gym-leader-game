import { useState } from 'react'
import { useRecordsStore } from '../store/recordsStore'
import { dailyType, utcDate } from '../lib/daily'
import { TypeBadge } from '../components/TypeBadge'
import { ScreenHeader } from '../components/ScreenHeader'

type Tab = 'today' | 'all'

export function RankingScreen() {
  const [tab, setTab] = useState<Tab>('today')
  const daily = useRecordsStore(s => s.daily)
  const quests = useRecordsStore(s => s.quests)
  const today = utcDate()
  const mine = daily[today]
  const allTime = Object.values(daily).sort((a, b) => b.wins - a.wins || b.date.localeCompare(a.date))
  const clears = quests.filter(q => q.cleared).length

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <ScreenHeader title="Ranking" sub="Daily Challenge results: most wins in a single run." />
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div role="tablist" className="flex gap-1 bg-ink-900 rounded-xl p-1 w-fit">
          {(['today', 'all'] as Tab[]).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold ${tab === t ? 'bg-gold-400 text-ink-900' : 'text-white/70 hover:text-white'}`}
            >
              {t === 'today' ? 'Today' : 'All time'}
            </button>
          ))}
        </div>

        <p className="text-sm text-white/70 bg-ink-900 border border-white/10 rounded-xl px-4 py-3">
          Showing results from this device. Global leaderboards for everyone need online sign-in, which isn’t built yet.
        </p>

        {tab === 'today' ? (
          <div className="rounded-xl bg-ink-900 border border-white/10 p-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              Today’s Gym ({today} UTC) <TypeBadge type={dailyType(today)} />
            </div>
            {mine ? (
              <table className="w-full mt-3 text-sm">
                <thead>
                  <tr className="text-left text-white/50 text-xs uppercase tracking-wider">
                    <th className="py-1 w-12">#</th><th>Player</th><th className="text-right">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/10">
                    <td className="py-2 font-bold text-gold-300">1</td>
                    <td>You {!mine.finished && <span className="text-xs text-white/50">(in progress)</span>}</td>
                    <td className="text-right font-extrabold tabular-nums">{mine.wins}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="mt-3 text-white/60">You haven’t played today’s Daily Challenge yet.</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-ink-900 border border-white/10 p-4">
            {allTime.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/50 text-xs uppercase tracking-wider">
                    <th className="py-1 w-12">#</th><th>Date (UTC)</th><th>Gym</th><th className="text-right">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {allTime.map((r, i) => (
                    <tr key={r.date} className="border-t border-white/10">
                      <td className={`py-2 font-bold ${i === 0 ? 'text-gold-300' : 'text-white/60'}`}>{i + 1}</td>
                      <td className="tabular-nums">{r.date}</td>
                      <td><TypeBadge type={r.gymType} small /></td>
                      <td className="text-right font-extrabold tabular-nums">{r.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-white/60">No Daily Challenge results yet.</p>
            )}
          </div>
        )}

        {quests.length > 0 && (
          <p className="text-sm text-white/60">
            Gym Quest: {quests.length} {quests.length === 1 ? 'run' : 'runs'} finished, {clears} cleared.
          </p>
        )}
      </div>
    </div>
  )
}
