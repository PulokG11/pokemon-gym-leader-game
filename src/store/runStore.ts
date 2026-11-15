import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bag, EventKind, GymType, ProgressReport, RosterMember, RunState } from '../types/game'
import {
  GYM_QUEST_LENGTH, buildChallenger, buildDailyChallenger, evolveNow, gainXp, levelUp,
  starterCandidates, xpReward, type Rng,
} from '../lib/progression'
import {
  BAG_INFO, MAX_TEAM, POST_WIN_RECOVERY, POTION_HEAL, REVIVE_HP, START_FUNDS, START_REROLLS,
  GENERIC_ITEMS, fundsForWin, merchantStock, rewardOffer, skipBonus, typeItemFor, type BagItem, type Reward,
} from '../lib/economy'
import { upgradesFor, type UpgradeId } from '../lib/upgrades'
import { species } from '../lib/dex'
import { dailyRng, dailyType, utcDate } from '../lib/daily'
import { useRecordsStore } from './recordsStore'

export type ActionResult = { ok: true; message: string } | { ok: false; message: string }

interface RunStore {
  run: RunState | null
  startQuest: (gymType: GymType) => void
  /** Starts today's Daily Challenge; returns false if today's try is already used. */
  startDaily: () => boolean
  confirmTeam: (uids: string[]) => void
  /** `finalHp` maps each Pokémon's display name to its HP fraction when the battle ended. */
  winBattle: (finalHp?: Record<string, number>) => void
  loseBattle: (forfeited?: boolean) => void
  markBattleOpen: (key: string) => void
  // Rewards
  rerollReward: () => void
  skipReward: () => void
  takeReward: (reward: Reward, opts?: { targetUid?: string; recruit?: RosterMember; replaceUid?: string }) => ActionResult
  // What's next?
  chooseEvent: (kind: EventKind) => void
  campTrain: (target: string | 'team') => ActionResult
  buy: (stockId: string) => ActionResult
  finishEvent: () => void
  // Team and bag
  buyUpgrade: (id: UpgradeId) => ActionResult
  useBagItem: (item: BagItem, uid: string) => ActionResult
  giveHeldItem: (item: string, uid: string) => void
  takeHeldItem: (uid: string) => void
  moveMember: (uid: string, dir: -1 | 1) => void
  continueRun: () => void
  startBattle: () => void
  clearRun: () => void
}

const EMPTY_BAG: Bag = { potion: 0, revive: 0, candy: 0, stone: 0 }

function baseRun(gymType: GymType): RunState {
  return {
    id: crypto.randomUUID(),
    mode: 'quest',
    gymType,
    dailyDate: null,
    challengerIndex: 0,
    totalChallengers: GYM_QUEST_LENGTH,
    candidates: [],
    roster: [],
    challenger: [],
    lastProgress: [],
    won: false,
    funds: START_FUNDS,
    bag: { ...EMPTY_BAG },
    heldItems: [],
    upgrades: [],
    rerolls: START_REROLLS,
    log: [],
    phase: 'team_select',
    rank: 1,
    rulesVersion: '1.3',
    schemaVersion: 4,
  }
}

/** Seeded for the Daily (same offers for everyone), random for Gym Quest. */
export function runRng(run: RunState, salt: string): Rng {
  return run.mode === 'daily' && run.dailyDate ? dailyRng(run.dailyDate, `${salt}:${run.challengerIndex}`) : Math.random
}

function nextChallenger(run: RunState, roster: RosterMember[], index: number): RosterMember[] {
  return run.mode === 'daily' && run.dailyDate
    ? buildDailyChallenger(index, dailyRng(run.dailyDate, `challenger:${index}`))
    : buildChallenger(roster, index)
}

function recordResult(run: RunState, wins: number, finished: boolean, cleared: boolean) {
  const records = useRecordsStore.getState()
  if (run.mode === 'daily' && run.dailyDate) {
    records.recordDaily({ date: run.dailyDate, gymType: run.gymType, wins, finished })
  } else if (finished) {
    records.recordQuest({ gymType: run.gymType, wins, cleared, finishedAt: new Date().toISOString() })
  }
}

const nameOf = (m: RosterMember) => species(m.species).name
const hpOf = (m: RosterMember) => m.hp ?? 1

function describe(r: ProgressReport): string[] {
  const name = species(r.before.species).name
  const out: string[] = []
  if (r.after.level !== r.before.level) out.push(`${name} grew to Lv ${r.after.level}!`)
  for (const e of r.events) {
    if (e.kind === 'evolve') out.push(`${species(e.from).name} evolved into ${species(e.to).name}!`)
    if (e.kind === 'learn') out.push(`${species(r.after.species).name} learned ${e.move}${e.forgot ? ` (forgot ${e.forgot})` : ''}.`)
  }
  return out.length ? out : [`${name} is unchanged.`]
}

const withLog = (run: RunState, lines: string[]): RunState => ({ ...run, log: [...lines.reverse(), ...(run.log ?? [])].slice(0, 80) })

function replaceMember(run: RunState, after: RosterMember): RunState {
  return { ...run, roster: run.roster.map(m => (m.uid === after.uid ? { ...after, hp: hpOf(m), item: m.item } : m)) }
}

export const useRunStore = create<RunStore>()(
  persist(
    (set, get) => {
      /** Applies a change to the current run and returns a message for the UI. */
      const apply = (fn: (run: RunState) => { run: RunState; message: string } | string): ActionResult => {
        const run = get().run
        if (!run) return { ok: false, message: 'No active run.' }
        const r = fn(run)
        if (typeof r === 'string') return { ok: false, message: r }
        set({ run: withLog(r.run, [r.message]) })
        return { ok: true, message: r.message }
      }

      return {
        run: null,

        startQuest: (gymType) =>
          set({ run: { ...baseRun(gymType), candidates: starterCandidates(gymType) } }),

        startDaily: () => {
          const date = utcDate()
          if (useRecordsStore.getState().daily[date]) return false
          const gymType = dailyType(date)
          const run: RunState = {
            ...baseRun(gymType),
            mode: 'daily',
            dailyDate: date,
            totalChallengers: null,
            candidates: starterCandidates(gymType, dailyRng(date, 'starters')),
          }
          recordResult(run, 0, false, false) // entering uses today's one try
          set({ run })
          return true
        },

        confirmTeam: (uids) =>
          set(({ run }) => {
            if (!run) return {}
            const roster = uids.map(u => run.candidates.find(c => c.uid === u)!).filter(Boolean).map(m => ({ ...m, hp: 1, item: null }))
            return { run: { ...run, roster, challenger: nextChallenger(run, roster, 0), phase: 'gym' } }
          }),

        winBattle: (finalHp = {}) => {
          const run = get().run
          if (!run) return
          // HP after the battle, then the post-win recovery for everyone still standing.
          const has = (u: UpgradeId) => (run.upgrades ?? []).includes(u)
          const recovery = has('center') ? 0.2 : POST_WIN_RECOVERY
          const healed = run.roster.map(m => {
            const fought = finalHp[nameOf(m)]
            const hp = fought === undefined ? hpOf(m) : fought
            return { ...m, hp: hp > 0 ? Math.min(1, hp + recovery) : 0 }
          })
          const xp = xpReward(run.challenger)
          const lastProgress = healed.map(m => gainXp(m, xp))
          const roster = lastProgress.map((r, i) => ({ ...r.after, hp: healed[i].hp, item: healed[i].item }))
          const wins = run.challengerIndex + 1
          const funds = Math.round(fundsForWin(run.challengerIndex) * (has('reputation') ? 1.25 : 1))
          const cleared = run.totalChallengers !== null && wins >= run.totalChallengers
          recordResult(run, wins, cleared, cleared)
          const lines = [`Victory! +₽${funds} Gym Funds.`, ...lastProgress.flatMap(r => (r.events.length ? describe(r) : []))]
          const everySecond = wins % 2 === 0
          const bag = { ...(run.bag ?? EMPTY_BAG) }
          let rerolls = run.rerolls ?? 0
          if (everySecond && has('analysis')) { rerolls += 1; lines.push('Analysis Desk: +1 reward reroll.') }
          if (everySecond && has('infirmary')) { bag.potion += 1; lines.push('Infirmary: a Hyper Potion was added to your bag.') }
          const next: RunState = {
            ...run, roster, lastProgress, challengerIndex: wins, battleKey: null, bag, rerolls,
            funds: (run.funds ?? 0) + funds, lastFunds: funds,
          }
          if (cleared) {
            set({ run: withLog({ ...next, won: true, phase: 'run_ended' }, lines) })
            return
          }
          const withNext = { ...next, challenger: nextChallenger(run, roster, wins) }
          set({
            run: withLog({
              ...withNext,
              phase: 'reward_pending',
              rewardTaken: false,
              event: null,
              campUsed: false,
              rewardOffer: rewardOffer(run.gymType, roster.length, runRng(withNext, 'reward'), { training: (run.upgrades ?? []).includes('training'), workshop: (run.upgrades ?? []).includes('workshop') }),
            }, lines),
          })
        },

        loseBattle: (forfeited = false) => {
          const run = get().run
          if (!run) return
          recordResult(run, run.challengerIndex, true, false)
          set({ run: { ...run, won: false, forfeited, battleKey: null, phase: 'run_ended' } })
        },

        markBattleOpen: (key) => set(({ run }) => (run ? { run: { ...run, battleKey: key } } : {})),

        rerollReward: () =>
          set(({ run }) => {
            if (!run || !run.rerolls) return {}
            const rerolls = run.rerolls - 1
            const rng = runRng(run, `reroll:${rerolls}`)
            return { run: { ...run, rerolls, rewardOffer: rewardOffer(run.gymType, run.roster.length, rng, { training: (run.upgrades ?? []).includes('training'), workshop: (run.upgrades ?? []).includes('workshop') }) } }
          }),

        skipReward: () =>
          set(({ run }) => {
            if (!run) return {}
            const bonus = skipBonus(run.challengerIndex - 1)
            return { run: withLog({ ...run, funds: (run.funds ?? 0) + bonus, rewardTaken: true, phase: 'event' }, [`Skipped the reward for +₽${bonus}.`]) }
          }),

        takeReward: (reward, opts = {}) => {
          const res = apply(run => {
            const bag = { ...(run.bag ?? EMPTY_BAG) }
            const target = run.roster.find(m => m.uid === opts.targetUid)
            switch (reward.kind) {
              case 'recruit': {
                const rec = opts.recruit
                if (!rec) return 'Choose a Pokémon to recruit.'
                const joined = { ...rec, hp: 1, item: null }
                if (run.roster.length < MAX_TEAM) {
                  return { run: { ...run, roster: [...run.roster, joined] }, message: `${nameOf(rec)} joined your Gym!` }
                }
                const out = run.roster.find(m => m.uid === opts.replaceUid)
                if (!out) return 'Your team is full: choose who leaves.'
                const heldItems = out.item ? [...(run.heldItems ?? []), out.item] : run.heldItems
                return {
                  run: { ...run, heldItems, roster: run.roster.map(m => (m.uid === out.uid ? joined : m)) },
                  message: `${nameOf(rec)} joined your Gym; ${nameOf(out)} left.`,
                }
              }
              case 'training': {
                if (!target) return 'Choose a Pokémon to train.'
                const r = levelUp(target, (run.upgrades ?? []).includes('training') ? 4 : 3)
                return { run: replaceMember(run, r.after), message: describe(r).join(' ') }
              }
              case 'team_training': {
                const reports = run.roster.map(m => levelUp(m, 1))
                const next = reports.reduce((acc, r) => replaceMember(acc, r.after), run)
                return { run: next, message: 'The whole team gained a level!' }
              }
              case 'revive_pack': bag.revive += 2; return { run: { ...run, bag }, message: 'Got 2 Revives.' }
              case 'potion_supply': bag.potion += 2; return { run: { ...run, bag }, message: 'Got 2 Hyper Potions.' }
              case 'rare_candy': bag.candy += 2; return { run: { ...run, bag }, message: 'Got 2 Rare Candies.' }
              case 'evo_stone': bag.stone += 1; return { run: { ...run, bag }, message: 'Got an Evolution Stone.' }
              case 'league_favour': return { run: { ...run, rerolls: (run.rerolls ?? 0) + 2 }, message: 'Gained 2 reward rerolls.' }
              case 'held_item': {
                if (!reward.item) return 'Unknown item.'
                if ((run.upgrades ?? []).includes('workshop')) {
                  const spare = GENERIC_ITEMS.filter(i => i !== reward.item)[Math.floor(Math.random() * (GENERIC_ITEMS.length - 1))]
                  run = { ...run, heldItems: [...(run.heldItems ?? []), spare] }
                }
                if (target) {
                  const heldItems = target.item ? [...(run.heldItems ?? []), target.item] : run.heldItems
                  return {
                    run: { ...run, heldItems, roster: run.roster.map(m => (m.uid === target.uid ? { ...m, item: reward.item } : m)) },
                    message: `${nameOf(target)} is now holding ${reward.item}.`,
                  }
                }
                return { run: { ...run, heldItems: [...(run.heldItems ?? []), reward.item] }, message: `Put ${reward.item} in the bag.` }
              }
            }
          })
          if (res.ok) set(({ run }) => (run ? { run: { ...run, rewardTaken: true, phase: 'event' } } : {}))
          return res
        },

        chooseEvent: (kind) =>
          set(({ run }) => {
            if (!run) return {}
            return { run: { ...run, event: kind, stock: kind === 'merchant' ? merchantStock(run.gymType, runRng(run, 'merchant')) : run.stock } }
          }),

        campTrain: (target) =>
          apply(run => {
            if (run.campUsed) return 'The Training Camp is done for today.'
            if (target === 'team') {
              const next = run.roster.reduce((acc, m) => replaceMember(acc, levelUp(m, 1).after), run)
              return { run: { ...next, campUsed: true }, message: 'Training Camp: the whole team gained a level!' }
            }
            const m = run.roster.find(x => x.uid === target)
            if (!m) return 'Choose a Pokémon.'
            const r = levelUp(m, 3)
            return { run: { ...replaceMember(run, r.after), campUsed: true }, message: `Training Camp: ${describe(r).join(' ')}` }
          }),

        buy: (stockId) =>
          apply(run => {
            const s = run.stock?.find(x => x.id === stockId)
            if (!s) return 'That item is sold out.'
            if ((run.funds ?? 0) < s.price) return 'Not enough Gym Funds.'
            const funds = (run.funds ?? 0) - s.price
            if (s.kind === 'bag') {
              const bag = { ...(run.bag ?? EMPTY_BAG) }
              bag[s.item as BagItem] += 1
              return { run: { ...run, funds, bag }, message: `Bought a ${BAG_INFO[s.item as BagItem].name} for ₽${s.price}.` }
            }
            return {
              run: { ...run, funds, heldItems: [...(run.heldItems ?? []), s.item], stock: run.stock?.filter(x => x.id !== stockId) },
              message: `Bought ${s.item} for ₽${s.price}.`,
            }
          }),

        finishEvent: () => set(({ run }) => (run ? { run: { ...run, phase: 'gym', event: null } } : {})),

        startBattle: () => set(({ run }) => (run ? { run: { ...run, phase: 'battle' } } : {})),

        buyUpgrade: (id) =>
          apply(run => {
            if (run.mode === 'daily') return 'The Daily Challenge has no upgrades.'
            const owned = run.upgrades ?? []
            if (owned.includes(id)) return 'Already built.'
            const u = upgradesFor(run.gymType).find(x => x.id === id)
            if (!u) return 'Unknown upgrade.'
            if ((run.funds ?? 0) < u.price) return 'Not enough Gym Funds.'
            const heldItems = id === 'forge' ? [...(run.heldItems ?? []), typeItemFor(run.gymType)] : run.heldItems
            return {
              run: { ...run, funds: (run.funds ?? 0) - u.price, upgrades: [...owned, id], heldItems },
              message: `Built the ${u.name}${id === 'forge' ? ` and got a ${typeItemFor(run.gymType)}` : ''}.`,
            }
          }),

        useBagItem: (item, uid) =>
          apply(run => {
            const bag = { ...(run.bag ?? EMPTY_BAG) }
            const m = run.roster.find(x => x.uid === uid)
            if (!m) return 'Choose a Pokémon.'
            if (!bag[item]) return `No ${BAG_INFO[item].name} left.`
            const hp = hpOf(m)
            switch (item) {
              case 'potion': {
                if (hp <= 0) return `${nameOf(m)} has fainted. Use a Revive.`
                if (hp >= 1) return `${nameOf(m)} is already at full HP.`
                bag.potion--
                return { run: { ...run, bag, roster: run.roster.map(x => (x.uid === uid ? { ...x, hp: Math.min(1, hp + POTION_HEAL) } : x)) }, message: `${nameOf(m)} recovered HP.` }
              }
              case 'revive': {
                if (hp > 0) return `${nameOf(m)} hasn’t fainted.`
                bag.revive--
                return { run: { ...run, bag, roster: run.roster.map(x => (x.uid === uid ? { ...x, hp: REVIVE_HP } : x)) }, message: `${nameOf(m)} was revived!` }
              }
              case 'candy': {
                bag.candy--
                const r = levelUp(m, 1)
                return { run: { ...replaceMember(run, r.after), bag }, message: describe(r).join(' ') }
              }
              case 'stone': {
                const r = evolveNow(m)
                if (!r) return `${nameOf(m)} can’t evolve any further.`
                bag.stone--
                return { run: { ...replaceMember(run, r.after), bag }, message: describe(r).join(' ') }
              }
            }
          }),

        giveHeldItem: (item, uid) =>
          set(({ run }) => {
            if (!run) return {}
            const spare = [...(run.heldItems ?? [])]
            const i = spare.indexOf(item)
            if (i < 0) return {}
            spare.splice(i, 1)
            const m = run.roster.find(x => x.uid === uid)
            if (!m) return {}
            if (m.item) spare.push(m.item)
            return { run: withLog({ ...run, heldItems: spare, roster: run.roster.map(x => (x.uid === uid ? { ...x, item } : x)) }, [`${nameOf(m)} is now holding ${item}.`]) }
          }),

        takeHeldItem: (uid) =>
          set(({ run }) => {
            const m = run?.roster.find(x => x.uid === uid)
            if (!run || !m?.item) return {}
            return { run: { ...run, heldItems: [...(run.heldItems ?? []), m.item], roster: run.roster.map(x => (x.uid === uid ? { ...x, item: null } : x)) } }
          }),

        moveMember: (uid, dir) =>
          set(({ run }) => {
            if (!run) return {}
            const i = run.roster.findIndex(m => m.uid === uid)
            const j = i + dir
            if (i < 0 || j < 0 || j >= run.roster.length) return {}
            const roster = [...run.roster]
            ;[roster[i], roster[j]] = [roster[j], roster[i]]
            return { run: { ...run, roster } }
          }),

        continueRun: () => set(({ run }) => (run ? { run: { ...run, phase: 'battle' } } : {})),

        clearRun: () => set({ run: null }),
      }
    },
    {
      name: 'gym-run-v2',
      version: 2,
      migrate: (persisted: any) => {
        const run = persisted?.run
        if (run) {
          if (run.mode !== 'daily') { run.mode = 'quest'; run.dailyDate = run.dailyDate ?? null }
          run.bag ??= { ...EMPTY_BAG }
          run.heldItems ??= []
          run.rerolls ??= START_REROLLS
          run.funds ||= START_FUNDS
          run.log ??= []
          // An old run waiting on the previous reward screen gets a fresh offer.
          if (run.phase === 'reward_pending' && !run.rewardOffer) run.rewardOffer = rewardOffer(run.gymType, run.roster.length, Math.random)
        }
        return persisted
      },
    }
  )
)
