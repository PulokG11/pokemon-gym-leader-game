import { useEffect, useState } from 'react'
import { useRecordsStore } from '../store/recordsStore'
import { usePlayerStore } from '../store/playerStore'
import { dailyType, utcDate } from '../lib/daily'
import {
  fetchAllTimeBoard, fetchDailyBoard, fetchStanding, leaderboardEnabled,
  type AllTimeRow, type DailyRow,
} from '../lib/leaderboard'
import { syncDailyResults } from '../lib/syncRunner'
import { TypeBadge } from '../components/TypeBadge'
import { ScreenHeader } from '../components/ScreenHeader'
import { NicknameDialog } from '../components/NicknameDialog'

type Tab = 'today' | 'all'
type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ok'; data: T }

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`py-1.5 px-2 font-bold ${right ? 'text-right' : 'text-left'}`}>{children}</th>
}

function RankCell({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
  return <td className="py-2 px-2 w-12 font-black tabular-nums text-white/70">{medal ?? rank}</td>
}

function TodayBoard({ rows, me, standing }: {
  rows: DailyRow[]; me: string | null; standing: { rank: number; total: number; wins: number } | null
}) {
  if (!rows.length) return <p className="text-white/60 p-4">No one has played today’s Daily yet. Be the first!</p>
  const meListed = rows.some(r => r.nickname === me)
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-white/50 text-[11px] uppercase tracking-wider"><Th>#</Th><Th>Player</Th><Th right>Wins</Th></tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.nickname} className={`border-t border-white/10 ${r.nickname === me ? 'bg-gold-400/15' : ''}`}>
            <RankCell rank={r.rank} />
            <td className="py-2 px-2 font-bold">
              {r.nickname}
              {r.nickname === me && <span className="ml-1.5 text-[10px] text-gold-300 uppercase">You</span>}
              {!r.finished && <span className="ml-1.5 text-[10px] text-emerald-300 uppercase">Playing</span>}
            </td>
            <td className="py-2 px-2 text-right font-black tabular-nums">{r.wins}</td>
          </tr>
        ))}
        {me && !meListed && standing && (
          <tr className="border-t-2 border-dashed border-white/20 bg-gold-400/15">
            <RankCell rank={standing.rank} />
            <td className="py-2 px-2 font-bold">{me} <span className="text-[10px] text-gold-300 uppercase">You</span></td>
            <td className="py-2 px-2 text-right font-black tabular-nums">{standing.wins}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function AllTimeBoard({ rows, me }: { rows: AllTimeRow[]; me: string | null }) {
  if (!rows.length) return <p className="text-white/60 p-4">No Daily results yet.</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-white/50 text-[11px] uppercase tracking-wider">
          <Th>#</Th><Th>Player</Th><Th>Gym</Th><Th right>Wins</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.nickname} className={`border-t border-white/10 ${r.nickname === me ? 'bg-gold-400/15' : ''}`}>
            <RankCell rank={r.rank} />
            <td className="py-2 px-2">
              <span className="font-bold">{r.nickname}</span>
              {r.nickname === me && <span className="ml-1.5 text-[10px] text-gold-300 uppercase">You</span>}
              <span className="block text-[11px] text-white/50">
                {formatDay(r.day)} · {r.days_played} {r.days_played === 1 ? 'Daily' : 'Dailies'} played
              </span>
            </td>
            <td className="py-2 px-2"><TypeBadge type={r.gym_type} small /></td>
            <td className="py-2 px-2 text-right font-black tabular-nums">{r.wins}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DeviceResults() {
  const daily = useRecordsStore(s => s.daily)
  const rows = Object.values(daily).sort((a, b) => b.wins - a.wins || b.date.localeCompare(a.date))
  if (!rows.length) return <p className="text-white/60 p-4">No Daily Challenge results on this device yet.</p>
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-white/50 text-[11px] uppercase tracking-wider"><Th>Date (UTC)</Th><Th>Gym</Th><Th right>Wins</Th></tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.date} className="border-t border-white/10">
            <td className="py-2 px-2 tabular-nums">{r.date}</td>
            <td className="py-2 px-2"><TypeBadge type={r.gymType} small /></td>
            <td className="py-2 px-2 text-right font-black tabular-nums">{r.wins}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function RankingScreen() {
  const [tab, setTab] = useState<Tab>('today')
  const [today] = useState(utcDate)
  const [daily, setDaily] = useState<Load<DailyRow[]>>({ state: 'loading' })
  const [allTime, setAllTime] = useState<Load<AllTimeRow[]>>({ state: 'loading' })
  const [standing, setStanding] = useState<{ rank: number; total: number; wins: number } | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { playerId, nickname } = usePlayerStore()
  const online = leaderboardEnabled()

  useEffect(() => {
    if (!online) return
    let live = true
    ;(async () => {
      await syncDailyResults()
      fetchDailyBoard(today)
        .then(data => live && setDaily({ state: 'ok', data }))
        .catch(() => live && setDaily({ state: 'error' }))
      fetchAllTimeBoard()
        .then(data => live && setAllTime({ state: 'ok', data }))
        .catch(() => live && setAllTime({ state: 'error' }))
      if (playerId) fetchStanding(today, playerId).then(s => live && setStanding(s)).catch(() => {})
    })()
    return () => { live = false }
  }, [online, today, playerId, nickname])

  const current = tab === 'today' ? daily : allTime

  return (
    <div className="home-bg min-h-screen text-white">
      <ScreenHeader
        title="Ranking"
        sub={tab === 'today' ? 'Most wins in today’s Daily Challenge.' : 'Best single Daily run of every player, across all days.'}
      />
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" className="flex gap-1 bg-ink-900 rounded-xl p-1">
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
          {tab === 'today' && (
            <span className="flex items-center gap-2 text-sm text-white/70">
              {formatDay(today)} <TypeBadge type={dailyType(today)} />
            </span>
          )}
        </div>

        {online && !nickname && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gold-400/10 border border-gold-400/40 px-4 py-3">
            <span className="text-sm">Pick a nickname to put your Daily results on the board.</span>
            <button onClick={() => setShowDialog(true)} className="rounded-lg px-3 py-1.5 text-sm font-black bg-gold-400 text-ink-900 hover:bg-gold-300">
              Join the leaderboard
            </button>
          </div>
        )}

        <div className="rounded-xl bg-ink-900 border border-white/10 overflow-hidden" role="tabpanel">
          {!online ? (
            <>
              <p className="text-sm text-white/60 px-4 pt-4">The online leaderboard isn’t available in this build. Your results on this device:</p>
              <DeviceResults />
            </>
          ) : current.state === 'loading' ? (
            <p className="text-white/60 p-4 animate-pulse">Loading rankings…</p>
          ) : current.state === 'error' ? (
            <>
              <p className="text-sm text-amber-300 px-4 pt-4">Couldn’t reach the leaderboard. Your results on this device:</p>
              <DeviceResults />
            </>
          ) : tab === 'today' ? (
            <TodayBoard rows={(current.data as DailyRow[])} me={nickname} standing={standing} />
          ) : (
            <AllTimeBoard rows={(current.data as AllTimeRow[])} me={nickname} />
          )}
        </div>
      </div>

      {showDialog && <NicknameDialog onCancel={() => setShowDialog(false)} onDone={() => setShowDialog(false)} />}
    </div>
  )
}
