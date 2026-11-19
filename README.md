# Pokémon Gym Leader

A browser roguelike where **you are the Gym Leader**: pick a type, draft a team, and defend your Gym against wave after wave of challengers.

**Play it: https://pulokg11.github.io/pokemon-gym-leader-game/**

Works on desktop and mobile, and can be installed as an app (PWA) for offline play.

---

## Game modes

| Mode | Rules |
|---|---|
| **Daily Challenge** | Singles only. The same Gym type, six starters and challengers for every player, chosen by the UTC date. Challengers never stop and gain 3 levels per round. One try per day; your score is how many battles you win. |
| **Gym Quest** | Pick any of the 18 types, choose **Singles** or **Doubles**, and defend against 15 challengers: Rookie → Trainer → Ace Trainer → Rival → Rival Gym Leader → Elite Trainer → Elite Four Member → Champion. Beat all 15 to win. |
| **Regional Quest** | Play as the challenger in **Kanto** (more regions later): pick Bulbasaur, Charmander or Squirtle plus 2 unevolved Kanto Pokémon, then beat the 8 Gym Leaders, the Elite Four and Champion Blue: 13 battles. 3 retries per quest. |

### Regional Quest rules

- **Rising difficulty.** Brock opens with 3 Pokémon and normal movesets; later Leaders bring up to 6 with their best moves. The Elite Four have 6 trained Pokémon with items, and the Champion has a fully trained team with a pseudo-legendary (Dragonite), a legendary (Zapdos) and a Mega-Evolving counter to your starter.
- **Catch after every win.** Choose 1 of 3 unevolved Pokémon from the region. It joins the team, or the **box** once the team has 6. Swap boxed Pokémon in from the map before any battle. Only team members earn XP, up to the next opponent's top level.
- **Full heal after every battle.** Rewards are a Move Tutor, a held item, Rare Candies, an Evolution Stone or a **Mega Stone** for a Pokémon you own (Kanto has no Z-Crystals; they arrive with Alola).
- **Mega Evolution.** A fully evolved holder of the right stone shows a **Mega Evolve** button in battle.
- Kanto includes Pokémon that aren't in Scarlet/Violet (e.g. Onix, Kabuto, Mr. Mime); their moves come from the newest game that has them.

**Battles** run on the real Pokémon Showdown engine: Speed decides who moves first, and priority moves (e.g. Quick Attack +1) go before that. Each turn plays out move by move with animated sprites.

**Singles or Doubles.** In Singles one Pokémon is out on each side and you pick 3 of 6 starters. In Doubles two are out on each side and you pick 4: for each of your Pokémon you choose a move and, for single-target moves, which foe it goes for (spread moves like Surf hit both). Doubles challengers bring 2 Pokémon early on, then 3, then 4.

**Your team grows.** After each win every team member gains XP and learns Gen 9 level-up moves. When its moves are full, a new move is offered instead of replacing one: swap it in from the Team screen whenever you like. Once a Pokémon reaches its evolution level an **Evolve** button appears (in the battle report, the Team screen and the Gym hub); evolving is your choice. Rewards include recruits (up to 6), training, Rare Candies, Evolution Stones, held items and the **Move Tutor**, which teaches one of 3 TM, tutor or egg moves.

**Scouting.** Before each battle, Scout team marks the challenger's Pokémon that are a **⚠ THREAT** to your type and those **✓ WEAK TO YOU**.

**Leaderboards.** Join with an anonymous nickname (no account or email). The **Today** board ranks everyone on today's Daily; the **All time** board shows each player's best Daily run and the Gym type it was on.

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
| Leaderboards | [Neon](https://neon.com) Postgres + Neon Data API + Neon Auth (anonymous tokens) |
| Tests | Vitest |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Getting started

```bash
npm install
npm run dev     # http://localhost:5173/pokemon-gym-leader-game/
```

The committed `.env` points at the game's Neon project, so leaderboards work in development too. Remove those two lines to run fully offline (the Ranking screen then shows this device's results).

## Commands

```bash
npm run dev          # dev server
npm run build        # type-check + production build → dist/
npm run preview      # serve the production build
npm test             # Vitest in watch mode
npm run test:run     # Vitest single run (CI)
npm run typecheck    # TypeScript only (tsc -b, checks the app and tooling configs)
npm run data         # regenerate src/data/dex.json from @pkmn/sim
```

## Project structure

```
src/
├── screens/         # Home, Gym picker, starter select, Gym hub, battle, rewards, events, ranking, how to play
├── components/      # Sprites, HP bars, move info, type badges, battle report, evolution cutscene…
├── store/           # Zustand: run, battle, records, player, settings, ui
├── workers/         # battle.worker.ts — @pkmn/sim in a Web Worker (Singles and Doubles, challenger AI)
├── lib/             # dex, progression, battle requests, economy, upgrades, daily seeding, neon.ts client, leaderboard API
├── data/dex.json    # generated Pokédex (species, learnsets, Move Tutor pools, evolutions, moves)
└── types/game.ts    # shared domain types
scripts/build-dex.mjs   # generates src/data/dex.json
db/migrations/          # leaderboard schema (+ .down.sql rollback)
```

## Leaderboard backend (Neon)

| | |
|---|---|
| Neon project | `pokemon-gym-leader-game` (`sweet-wave-27458428`), branch `main`, AWS Singapore, free plan |
| Schema | [`db/migrations/001_leaderboards.sql`](db/migrations/001_leaderboards.sql) |
| Browser config | `VITE_NEON_AUTH_URL`, `VITE_NEON_DATA_API_URL` in `.env` (public URLs) |

How it fits together:

- **No server of our own.** The browser calls the [Neon Data API](https://neon.com/docs/data-api/get-started) (PostgREST-compatible) at `POST /rpc/<function>`. Every request carries a short-lived anonymous JWT from Neon Auth (`GET /token/anonymous`), which maps to the Postgres role `anonymous`. See `src/lib/neon.ts`.
- **Anonymous nicknames.** `register_player` returns a random secret token, kept in the browser's `localStorage`; the database stores only its SHA-256 hash. Clearing site data loses the nickname.
- **Locked down.** Tables live in a private `gym` schema the API can't see. The Data API exposes only the `api` schema, which contains just these `SECURITY DEFINER` functions: `register_player`, `rename_player`, `submit_daily`, `daily_leaderboard`, `alltime_leaderboard`, `daily_standing`, `daily_gym_type`. CORS allows only the live site and `localhost:5173`.
- **Server-side checks.** `submit_daily` verifies the token, accepts only today's or yesterday's UTC date, recomputes that day's Gym type (same algorithm as `src/lib/daily.ts`), lets wins only increase, and freezes a run once it's finished.
- **Client.** Results sync after every Daily win/loss and retry when the connection returns (`src/lib/syncRunner.ts`). Leaving or reloading during a Daily battle counts as a loss.

The battles themselves run in the browser, so a determined player could still edit their own client; the server checks limit what a tampered client can submit but can't verify every battle.

**Setting up a fresh Neon project:** run `001_leaderboards.sql` up to the Permissions block, enable **Neon Auth** (Better Auth) and add the site as a trusted domain, enable the **Data API** with auth provider Neon Auth, exposed schema `api`, anonymous role `anonymous` and the site's CORS origins, then run the Permissions block (the Data API creates the `anonymous` role). Put the two URLs in `.env`.

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
