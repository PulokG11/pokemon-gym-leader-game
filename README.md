# Pokémon Gym Leader

A browser roguelike with two sides of the Pokémon League: **defend your own Gym** against wave after wave of challengers, or **take on a whole region** as the challenger, from the first Gym to the Champion.

**Play it: https://pulokg11.github.io/pokemon-gym-leader-game/**

Works on desktop and mobile, and can be installed as an app (PWA) for offline play. Current release: **v0.16.1** ([changelog](CHANGELOG.md)).

---

## Game modes

| Mode | You are | Goal |
|---|---|---|
| **Daily Challenge** | A Gym Leader | Same Gym type, six starters and challengers for every player that UTC day. Challengers never stop; your score is how many you beat. One try per day, Singles only. |
| **Gym Quest** | A Gym Leader | Pick any of the 18 types, Singles or Doubles, and a mode. **Title Defense:** beat 15 challengers (Rookie → Trainer → Ace Trainer → Rival → Rival Gym Leader → Elite Trainer → Elite Four → Champion); one loss costs you the title. **Endless:** challengers never stop and losses don't end the run; score = wins, Retire to save it. |
| **Regional Quest** | The challenger | Pick one of 9 regions, earn its 8 badges, beat its Elite Four and its Champion: 13 battles, 3 retries. |
| *Dream Team Builder* | — | Coming soon |
| *Legendary Conquerer* | — | Coming soon |

### Gym Quest and Daily Challenge

- **Draft.** Choose 3 of 6 starters of your Gym's type (4 in Doubles). Each card shows level, type, base stat total, ability and evolution; **Details** opens the full stats, moveset and type matchups.
- **Gym hub.** See the next challenger, **Scout** their team (each Pokémon tagged **⚠ THREAT** or **✓ WEAK TO YOU**), and manage your team, bag and log.
- **Economy.** Wins pay Gym Funds and offer 1 of 3 rewards: recruits (team up to 6), training, Rare Candies, Evolution Stones, potions, revives, held items, League Favour rerolls and the **Move Tutor**. After each reward, visit the **Training Camp** (free levels) or the **Visiting Merchant**.
- **Gym upgrades** (Gym Quest only): Pokémon Center, Training Room, Item Workshop, Recruitment Office, Gym Reputation, Home Crowd, Analysis Desk, Scouting Room (Scout shows exact moves, ability and held item) and Infirmary, plus a type **Arena** (weather or terrain at the start of battle) and a type **Forge**.
- **HP carries over** between battles: conscious Pokémon recover 10% after a win; fainted ones need a Revive.
- **Endless mode.** After a loss the team is fully healed and the next challenger steps in (no reward for that battle). Challengers keep climbing: every 5th is a Rival Gym Leader, every 10th an Elite Four member, every 25th a Champion; past challenger 15 levels rise more slowly but teams grow to 4, 5 and then 6 Pokémon.
- **Doubles.** Two Pokémon out on each side; for each of yours you pick a move and, for single-target moves, which foe to hit (spread moves like Surf hit both). Doubles challengers bring 2, then 3, then 4 Pokémon.
- **Challenger AI** grows with each class: Rookies pick at random, Trainers favour strong attacks, Ace Trainers and up play type matchups, use status moves and switch out of bad matchups.

### Regional Quest

| Region | Starters | Gyms (first → last) | Champion | Region power |
|---|---|---|---|---|
| Kanto | Bulbasaur, Charmander, Squirtle | Brock → Giovanni | Blue (Zapdos, Dragonite; counters your starter) | Mega Stones |
| Johto | Chikorita, Cyndaquil, Totodile | Falkner → Clair | Lance (Ho-Oh, Tyranitar) | — |
| Hoenn | Treecko, Torchic, Mudkip | Roxanne → Juan | Steven (Latios, Mega Metagross) | Mega Stones |
| Sinnoh | Turtwig, Chimchar, Piplup | Roark → Volkner | Cynthia (Giratina, Garchomp) | — |
| Unova | Snivy, Tepig, Oshawott | Cilan → Drayden | Alder (Reshiram, Hydreigon) | — |
| Kalos | Chespin, Fennekin, Froakie | Viola → Wulfric | Diantha (Xerneas, Mega Gardevoir) | Mega Stones |
| Alola | Rowlet, Litten, Popplio | Captain Ilima → Kahuna Hapu (trials) | Kukui (Tapu Koko, Kommo-o; counters your starter) | Z-Crystals |
| Galar | Grookey, Scorbunny, Sobble | Milo → Raihan | Leon (Zacian, Dragapult), after the Champion Cup | — |
| Paldea | Sprigatito, Fuecoco, Quaxly | Katy → Grusha | Geeta (Koraidon, Garchomp) | — |

- **Draft.** Pick a starter, then 2 unevolved Pokémon of that region, so your team matches the first Leader's 3.
- **Rising difficulty.** Gyms grow from 3 to 6 Pokémon; the first four Leaders use normal level-up moves, the next four their best moves. The Elite Four (in Galar, the Champion Cup: Marnie, Hop, Bede, Allister) bring 6 trained Pokémon with held items; Champions are fully trained and bring a legendary or pseudo-legendary. Levels follow one curve: Lv 14 at the first Gym to Lv 65 for the Champion.
- **After every win** the whole team and box are healed, team members earn XP up to the next opponent's top level, you **catch 2 of 5** unevolved Pokémon of the region (two of the five are guaranteed to hit your next two opponents' types super-effectively, and are tagged so), and pick **1 of 3 rewards**: Move Tutor, held item, Rare Candy, Evolution Stone, or the region's power (a Mega Stone or Z-Crystal one of your Pokémon can use). Alola's trials also award their Z-Crystal.
- **Team and box.** Six Pokémon travel with you; extra catches wait in the box and can be swapped in before any battle. Boxed Pokémon earn no XP.
- **Mega Evolution and Z-Moves.** A fully evolved holder of its Mega Stone shows a **Mega Evolve** button; a Z-Crystal holder shows a **Z-Move** button that turns a matching attack into its Z-Move, once per battle. Trainers use both.
- **3 retries.** A loss heals your team and repeats the battle; a fourth loss ends the quest. Beat the Champion to enter the Hall of Fame.
- Regions include Pokémon that aren't in Scarlet/Violet (e.g. Onix, Kabuto, Mr. Mime); their moves come from the newest game that has them.

### Every mode

- **Battles** run on the real Pokémon Showdown engine: Speed decides who moves first, priority moves (e.g. Quick Attack +1) go before that, and turns play out move by move with animated sprites, a battle log, effectiveness badges on moves and 1×/2×/3× speed.
- **Your team grows.** Every win gives XP and Gen 9 level-up moves. With 4 moves known, new ones are offered instead of forced: tap a move in the Team screen to swap. At the evolution level an **Evolve** button appears (battle report, Team screen, hub) and an evolution cutscene plays; evolving is your choice.
- **Battle report** after every win: HP, XP, level-ups, new moves and Evolve buttons.
- **Leaderboards.** Join with an anonymous nickname (no account or email). The **Today** board ranks everyone on today's Daily; the **All time** board shows each player's best Daily run and its Gym type. Gym Quest and Regional Quest results are kept on your device.

---

## Stack

| Layer | Tool |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Build | Vite 6, vite-plugin-pwa |
| State | Zustand 5 (persisted to `localStorage`) |
| Battle engine | [`@pkmn/sim`](https://github.com/pkmn/ps) (Pokémon Showdown) in a Web Worker |
| Pokédex data | Generated from `@pkmn/sim` into `src/data/dex.json`: all 1,024 Pokémon, learnsets, Move Tutor pools, evolutions, Mega forms, regional catch pools |
| Sprites | [PokeAPI sprites](https://github.com/PokeAPI/sprites) (Pokémon, items); [Pokémon Showdown](https://play.pokemonshowdown.com/sprites/) (trainers, Mega Evolutions) |
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
npm run test:run     # Vitest single run (CI); on low-memory machines add --no-file-parallelism
npm run typecheck    # TypeScript only (tsc -b, checks the app and tooling configs)
npm run data         # regenerate src/data/dex.json from @pkmn/sim
```

## Project structure

```
src/
├── screens/         # Home, Gym picker, starter select, Gym hub, battle, rewards, events, ranking, how to play,
│                    #   Regional Quest: region picker, draft, map hub, rewards
├── components/      # Sprites, HP bars, Pokémon cards and Details, move info, battle report, evolution cutscene…
├── store/           # Zustand: run, battle, records, player, settings, ui
├── workers/         # battle.worker.ts — @pkmn/sim in a Web Worker (Singles, Doubles, Mega Evolution, Z-Moves, AI)
├── lib/             # dex, progression, battle requests, economy, upgrades, daily seeding, neon.ts client, leaderboard API,
│                    #   regions.ts (9 regions' trainers), regional.ts (team building, catches, Mega/Z rewards)
├── data/dex.json    # generated Pokédex (species, learnsets, tutor pools, evolutions, moves, Megas, region pools)
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

Each release is a git tag (latest `v0.16.1`) with an entry in [CHANGELOG.md](CHANGELOG.md), including its rollback command. To roll back, e.g. to v0.16.0:

```bash
git checkout v0.16.0 -- .
git commit -m "rollback: to v0.16.0"
git push origin main
```

## Credits

Battles run on the Pokémon Showdown simulator via [`@pkmn/sim`](https://github.com/pkmn/ps) (MIT). Sprites from [PokeAPI](https://github.com/PokeAPI/sprites) and [Pokémon Showdown](https://play.pokemonshowdown.com/sprites/). Pokémon © Nintendo / Game Freak; this is a non-commercial fan project.
