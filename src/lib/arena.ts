import type { GymType } from '../types/game'

/** Tailwind gradient used as each Gym type's arena backdrop. */
export const ARENA: Record<GymType, string> = {
  fire: 'from-orange-300 via-rose-300 to-red-400', water: 'from-sky-300 via-cyan-300 to-blue-500',
  grass: 'from-lime-200 via-green-300 to-emerald-500', electric: 'from-yellow-200 via-amber-300 to-yellow-500',
  ghost: 'from-violet-300 via-purple-400 to-indigo-700', dragon: 'from-indigo-300 via-violet-400 to-indigo-600',
  normal: 'from-stone-200 via-amber-100 to-stone-400', ice: 'from-cyan-100 via-sky-200 to-cyan-400',
  fighting: 'from-amber-200 via-orange-300 to-red-600', poison: 'from-fuchsia-300 via-purple-400 to-fuchsia-700',
  ground: 'from-amber-200 via-yellow-600 to-amber-700', flying: 'from-sky-200 via-sky-300 to-indigo-300',
  psychic: 'from-pink-200 via-pink-300 to-fuchsia-500', bug: 'from-lime-200 via-lime-400 to-green-600',
  rock: 'from-stone-300 via-stone-400 to-stone-600', dark: 'from-neutral-500 via-neutral-700 to-neutral-900',
  steel: 'from-slate-200 via-slate-300 to-zinc-500', fairy: 'from-rose-100 via-pink-200 to-rose-400',
}
