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
