# Changelog

Every release is a git tag. Live build: https://pulokg11.github.io/pokemon-gym-leader-game/

## Rolling back

Redeploy an earlier release by restoring its tree onto `main` (pushing to `main` redeploys GitHub Pages):

```bash
git checkout v0.1.0 -- .
git commit -m "rollback: to v0.1.0"
git push origin main
```

---

## v0.3.1 — Fix stuck switch after a faint (2026-11-15)

- **Fix:** after a few switches, the party buttons could stay disabled when a Pokémon fainted, so the next Pokémon couldn't be sent out. The engine reorders the party on every switch; the UI was matching against the original order. Switches now go by Pokémon name, and the slot is looked up from the engine's latest state
- Regression test drives a real engine battle through two switches (`src/lib/battleRequest.test.ts`)

Rollback: `git checkout v0.3.0 -- .`

## v0.3.0 — Team building, progression and sprites (2026-11-15)

- **Team select:** after picking a gym type, choose 3 of 5 random unevolved Pokémon of that type (Lv 12–16), with artwork, base stats, ability, evolution level and full move details (type, category, power, accuracy, PP, priority, effect)
- **Progression:** every team member earns XP after each win (cubic level curve); level-ups teach Gen 9 level-up moves (oldest move is forgotten past 4) and trigger evolutions with higher base stats. Item/trade/friendship evolutions happen at Lv 30 (or 10 levels after the previous stage)
- **Challengers:** random teams scaled to your team's level and climbing each round, evolved to match their level
- **Battle:** animated sprites (PokeAPI), turns replay event-by-event in the engine's real order (Speed, then move priority), Speed shown on each Pokémon, a log note when a priority move beats a faster foe, effectiveness/crit/miss messages, voluntary switching
- **Post-battle summary:** XP gained, level-ups, learned/forgotten moves and an evolution reveal
- Pokédex data is generated from `@pkmn/sim` into `src/data/dex.json` (`npm run data`); sprites are cached for offline play
- Saved runs moved to a new storage key (`gym-run-v2`); in-progress v0.2.0 runs are not carried over

Rollback: `git checkout v0.2.0 -- .`

## v0.2.0 — Playable prototype (2026-11-15)

- Gym type picker (18 types) → 5-challenger run → reward screen → win/loss screen
- Real battles on `@pkmn/sim` (Pokémon Showdown engine) in a Web Worker; random-move AI opponent
- 18 gym leader teams + 5 challenger archetypes (`src/lib/teams.ts`), covered by `src/lib/teams.test.ts`
- HP bars, battle log, move/PP buttons, forced-switch picker
- Tooling: Vitest 2 → 3 (Vite 6 compatible), `@types/node`, `vite-env.d.ts`, PWA precache limit raised to 10 MB for the 6.6 MB battle worker
- Known gaps: reward choices are placeholders; AI picks random moves; worker bundles all generations' data

Rollback: `git checkout v0.1.0 -- .`

## v0.1.0 — Project scaffold

- React 19 + TypeScript + Vite 6 + Zustand + Tailwind v4 + Supabase client + PWA
- GitHub Actions CI (typecheck, tests) and GitHub Pages deploy
