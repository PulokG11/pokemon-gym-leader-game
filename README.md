# Pokémon Gym Leader

A browser roguelike where **you are the Gym Leader**: pick a type, draft a team, and defend your Gym against wave after wave of challengers.

**Play it: https://pulokg11.github.io/pokemon-gym-leader-game/**

Works on desktop and mobile, and can be installed as an app (PWA) for offline play.

---

## Game modes

| Mode | Rules |
|---|---|
| **Daily Challenge** | The same Gym type, five starters and challengers for every player, chosen by the UTC date. Challengers never stop and gain 3 levels per round. One try per day; your score is how many battles you win. |
| **Gym Quest** | Pick any of the 18 types and defend against 15 challengers: Rookie → Trainer → Ace Trainer → Rival → Rival Gym Leader → Elite Trainer → Elite Four Member → Champion. Beat all 15 to win. |
| **Regional Quest** | Coming soon. |

**Battles** run on the real Pokémon Showdown engine: Speed decides who moves first, and priority moves (e.g. Quick Attack +1) go before that. Each turn plays out move by move with animated sprites.

**Your team grows.** Choose 3 of 5 starters of your Gym's type. After each win every team member gains XP, learns Gen 9 level-up moves and evolves at the right level into a stronger form.

**Ranking.** The Ranking screen shows your Daily Challenge results (today and all time, with the Gym type). Results are currently stored on your device; online leaderboards with anonymous nicknames are in progress.

---

## Stack

| Layer | Tool |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Build | Vite 6, vite-plugin-pwa |
| State | Zustand 5 (persisted to `localStorage`) |
| Battle engine | [`@pkmn/sim`](https://github.com/pkmn/ps) (Pokémon Showdown) in a Web Worker |
| Pokédex data | Generated from `@pkmn/sim` into `src/data/dex.json` |
| Sprites | [PokeAPI sprites](https://github.com/PokeAPI/sprites) |
| Tests | Vitest |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Getting started

```bash
npm install
npm run dev     # http://localhost:5173/pokemon-gym-leader-game/
```

No backend or keys are needed to play.

## Commands

```bash
npm run dev          # dev server
npm run build        # type-check + production build → dist/
npm run preview      # serve the production build
npm test             # Vitest in watch mode
npm run test:run     # Vitest single run (CI)
npm run typecheck    # TypeScript only
npm run data         # regenerate src/data/dex.json from @pkmn/sim
```

## Project structure

```
src/
├── screens/         # Home, type select, team select, battle, rewards, ranking, how to play
├── components/      # Sprites, HP bars, move info, type badges…
├── store/           # Zustand: run, battle, records, settings, ui
├── workers/         # battle.worker.ts — @pkmn/sim in a Web Worker
├── lib/             # dex, progression (XP/evolution), daily seeding, labels
├── data/dex.json    # generated Pokédex (species, learnsets, evolutions, moves)
└── types/game.ts    # shared domain types
scripts/build-dex.mjs   # generates src/data/dex.json
```

## Deployment

Every push to `main` runs the type-check and tests, then builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`). The live game is at **https://pulokg11.github.io/pokemon-gym-leader-game/**.

## Versioning and rollback

Each release is a git tag (`v0.4.0`, …) with an entry in [CHANGELOG.md](CHANGELOG.md). To roll back:

```bash
git checkout v0.4.0 -- .
git commit -m "rollback: to v0.4.0"
git push origin main
```

## Credits

Battles run on the Pokémon Showdown simulator via [`@pkmn/sim`](https://github.com/pkmn/ps) (MIT). Sprites from [PokeAPI](https://github.com/PokeAPI/sprites). Pokémon © Nintendo / Game Freak; this is a non-commercial fan project.
