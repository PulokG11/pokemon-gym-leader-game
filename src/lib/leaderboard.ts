import { neonConfigured, rpc } from './neon'
import type { GymType } from '../types/game'
import type { Rng } from './progression'

export const NICKNAME_RE = /^[A-Za-z0-9_]{3,16}$/

export function nicknameProblem(name: string): string | null {
  if (name.length < 3) return 'At least 3 characters.'
  if (name.length > 16) return 'At most 16 characters.'
  if (!NICKNAME_RE.test(name)) return 'Letters, numbers and _ only.'
  return null
}

const ADJECTIVES = ['Brave', 'Swift', 'Calm', 'Bold', 'Clever', 'Fierce', 'Lucky', 'Mighty', 'Quiet', 'Sly', 'Steady', 'Wild']
const NOUNS = ['Leader', 'Ranger', 'Tamer', 'Ace', 'Rival', 'Scout', 'Keeper', 'Champ', 'Warden', 'Coach']

export function suggestNickname(rng: Rng = Math.random): string {
  const pick = <T,>(xs: T[]) => xs[Math.floor(rng() * xs.length)]
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${10 + Math.floor(rng() * 90)}`
}

export type LeaderboardError = 'offline' | 'nickname_taken' | 'nickname_invalid' | 'not_authorized' | 'day_closed' | 'unknown'

export class LeaderboardFailure extends Error {
  constructor(public code: LeaderboardError) { super(code) }
}

const KNOWN: LeaderboardError[] = ['offline', 'nickname_taken', 'nickname_invalid', 'not_authorized', 'day_closed']

async function call<T>(name: string, args: Record<string, unknown>): Promise<T> {
  try {
    return await rpc<T>(name, args)
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    throw new LeaderboardFailure(KNOWN.find(k => msg === k) ?? 'unknown')
  }
}

export const leaderboardEnabled = () => neonConfigured

export async function registerPlayer(nickname: string): Promise<{ playerId: string; token: string }> {
  const rows = await call<{ player_id: string; token: string }[]>('register_player', { p_nickname: nickname })
  return { playerId: rows[0].player_id, token: rows[0].token }
}

export async function renamePlayer(playerId: string, token: string, nickname: string): Promise<void> {
  await call('rename_player', { p_player_id: playerId, p_token: token, p_nickname: nickname })
}

export async function submitDaily(
  playerId: string, token: string,
  r: { date: string; gymType: GymType; wins: number; finished: boolean },
): Promise<void> {
  await call('submit_daily', {
    p_player_id: playerId, p_token: token, p_day: r.date, p_gym_type: r.gymType, p_wins: r.wins, p_finished: r.finished,
  })
}

export interface DailyRow { rank: number; nickname: string; gym_type: GymType; wins: number; finished: boolean }
export interface AllTimeRow { rank: number; nickname: string; gym_type: GymType; wins: number; day: string; days_played: number }

export const fetchDailyBoard = (day: string) =>
  call<DailyRow[]>('daily_leaderboard', { p_day: day, p_limit: 50 })

export const fetchAllTimeBoard = () =>
  call<AllTimeRow[]>('alltime_leaderboard', { p_limit: 50 })

export async function fetchStanding(day: string, playerId: string): Promise<{ rank: number; total: number; wins: number } | null> {
  const rows = await call<{ rank: number; total: number; wins: number }[]>('daily_standing', { p_day: day, p_player_id: playerId })
  return rows[0] ?? null
}
