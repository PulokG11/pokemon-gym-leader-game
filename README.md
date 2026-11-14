# Pokémon Gym Leader Game

A browser-based roguelike where you defend a monotype Gym against successive challengers.

Prototype URL: _(GitHub Pages — set up after first push to main)_

---

## Stack

| Layer | Tool |
|---|---|
| Language | TypeScript |
| Bundler | Vite 6 |
| UI | React 19 |
| State | Zustand 5 |
| Battle engine | `@pkmn/sim` in Web Worker |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (Postgres, RLS, Edge Functions) |
| Auth | Supabase Auth |
| PWA | vite-plugin-pwa |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Getting started

```bash
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

## Commands

```bash
npm run dev          # dev server at localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
npm test             # Vitest in watch mode
npm run test:run     # Vitest single run (CI)
npm run test:e2e     # Playwright e2e tests
npm run typecheck    # TypeScript type check only
```

## Project structure

```
src/
├── workers/         # battle.worker.ts — @pkmn/sim in a Web Worker
├── store/           # Zustand slices: run, profile, battle
├── components/      # Shared UI components
├── screens/         # Top-level screens (Setup, Gym, Battle, Rewards…)
├── lib/             # supabase.ts client
└── types/           # game.ts — domain types (RunState, RosterMember…)
tests/               # Vitest unit tests
e2e/                 # Playwright end-to-end tests
.github/workflows/   # CI: test → deploy to GitHub Pages
```

## Architecture notes

- The battle worker exposes only `INIT / MOVE / SWITCH` commands. Privileged `@pkmn/sim` commands (`eval`, `forcewin`, `reseed`) are never forwarded.
- Two persistence scopes: **run** (`localStorage`, versioned schema `gym-run-v1`) and **profile** (Supabase Postgres with RLS).
- Daily Challenge enforcement lives in a Supabase Edge Function — one accepted attempt per UTC day, server-side.
- Save schema version is tracked independently of the app version.
