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

## v0.14.0 — Regional Quest: catch 2 of 5 (2026-11-20)

- **Easier Regional Quest:** after every win you now catch **2 of 5** Pokémon (was 1 of 3)
- **Counters guaranteed:** two of the five hit your next two opponents' specialty types super-effectively, by their own type and, where possible, an attack they already know. They're tagged "✓ Super effective vs Misty (Water)". If a region has no unevolved answer (e.g. no Ground type in Kalos), one is borrowed from the wider Pokédex
- README, How to play and the victory message updated

Rollback: `git checkout v0.13.0 -- .`

## v0.13.0 — Regional Quest: all 9 regions (2026-11-19)

- **Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar and Paldea** join Kanto in the Regional Quest, each with its 3 starters, a catch pool of the region's unevolved Pokémon, 8 Gym Leaders, 4 Elite Four members and a Champion modelled on the original games:
  - Alola uses its trial captains and kahunas in place of Gyms (trials award their Z-Crystal) and Professor Kukui as Champion
  - Galar's Champion Cup (Marnie, Hop, Bede, Allister) stands in for the Elite Four before Leon
  - every Champion brings a legendary or pseudo-legendary: Ho-Oh, Latios, Giratina, Reshiram, Xerneas, Tapu Koko, Zacian, Koraidon; Steven and Diantha Mega Evolve; Kukui uses the starter that beats yours with a Z-Crystal
- **Region rewards:** Mega Stones in Kanto, Hoenn and Kalos; **Z-Crystals** in Alola; standard rewards elsewhere
- **Z-Moves in battle:** a Z-Move toggle shows each attack's Z-Move and uses it once per battle; trainers use Z-Moves too
- **Region picker:** a card per region with its player, starters, Champion and special reward
- One level curve for every region (first Gym Lv 14 → Champion Lv 65); Kanto keeps its hand-set levels
- **Pokédex:** now all 1,024 Pokémon from Kanto to Paldea; Gym Quest and Daily pools are unchanged
- Fixed: winning again after a finished quest no longer errors

Rollback: `git checkout v0.12.0 -- .`

## v0.12.0 — Regional Quest: Kanto (2026-11-19)

- **Regional Quest** is playable, starting with **Kanto** (other regions are listed as coming soon). You play the challenger:
  - choose Bulbasaur, Charmander or Squirtle, then 2 of 8 unevolved Kanto Pokémon (your team matches Brock's 3)
  - 13 battles: Brock, Misty, Lt. Surge, Erika, Koga, Sabrina, Blaine, Giovanni, then Lorelei, Bruno, Agatha, Lance and Champion Blue
  - difficulty rises: Gyms grow from 3 to 6 Pokémon; early Leaders use normal level-up moves, later ones their best moves; the Elite Four bring 6 trained Pokémon with held items; Blue brings a trained team with Dragonite, Zapdos and the Mega-Evolving starter that beats yours
  - **3 retries** per quest; a loss heals the team and repeats the battle
  - after every win: the whole team (and box) is healed, team members earn XP up to the next opponent's top level, you **catch 1 of 3** unevolved Kanto Pokémon, and pick **1 of 3 rewards** (Move Tutor, held item, Rare Candy, Evolution Stone, or a Mega Stone one of your Pokémon can use)
  - team of up to 6; extra catches go to the **box**, which you can swap from on the map before any battle; boxed Pokémon earn no XP
  - Champion / Hall of Fame ending
- **Mega Evolution in battle:** a **Mega Evolve** toggle for your fully evolved holder of the right stone; trainers Mega Evolve too, with Mega sprites and log lines
- **Pokédex:** all 151 Kanto Pokémon (legendaries included) and their later evolutions; Pokémon not in Scarlet/Violet use the newest game's learnset. Gym Quest and Daily pools are unchanged
- Shared Pokémon card and Details window, now used by both starter screens

Rollback: `git checkout v0.11.1 -- .`

## v0.11.1 — Starter cards and Details (2026-11-19)

- **Starter cards** now show just the essentials: image, name, level, type, base stat total, ability and what it evolves into (with the level), plus a separate **Details** button. Tap the card to pick or remove it
- **Details** opens a full breakdown: all six base stats with bars and the total, the moveset at its current level (type, category, power, accuracy, PP, effect), **Strong against** (types its own-type moves hit for double damage) and **Weak to** (attack types that deal it double damage, ×4 marked)

Rollback: `git checkout v0.11.0 -- .`

## v0.11.0 — Doubles battles, evolution on demand, Move Tutor (2026-11-19)

- **Doubles battles** (Gym Quest): choose Singles or Doubles when picking starters. Doubles puts two Pokémon out on each side; you pick 4 starters, challengers bring 2 early on, then 3, then 4. Each turn you choose for each of your Pokémon in turn (▼ marks who is choosing, their card is highlighted), and single-target moves ask "Who should X go for?" with name tags over the foes; spread moves hit both. Forced replacements, fainted slots and the challenger AI (per-foe targeting, no ally-only moves) all handle two slots. Runs on Showdown's `gen9doublescustomgame`
- **Starter select redesign:** "Pick 3 starters" (4 in Doubles) from 6, your Gym's strengths and weaknesses, a Singles/Doubles toggle, compact cards with an ⓘ panel (ability, base stat total, evolution chain, moves with type dots, add/remove) and a bottom bar with your picks and **Open the Gym ▶**
- **Gym hub:** a Doubles tag next to the Gym name; "✓ N weak to you" next to "⚠ N strong vs you"; a dismissable **First run** panel (goal, losing still counts, scouting tip); a "✦ N Pokémon can evolve" bar
- **Scout team** marks each challenger Pokémon as **⚠ THREAT** (has a type your Gym is weak to) or **✓ WEAK TO YOU**
- **Evolution on demand:** Pokémon no longer evolve automatically. At the evolution level an **Evolve** button appears in the battle report, the Team screen and the hub (Eevee-style branches let you pick); a cutscene plays "What? X is evolving!" then "Evolution complete!"
- **Battle report** opens as a modal after every win: HP bars or FNT, XP, level-ups, move chips, new moves and Evolve buttons, then Continue
- **New moves are offered, not forced:** when a Pokémon already knows 4 moves, a new level-up move is offered ("New move ★ X — swap in from Team") instead of replacing the oldest. In the Team screen, tap a move to replace it with any move it has learned (level-up moves so far plus tutored moves)
- **Move Tutor reward:** choose a Pokémon, pick 1 of 3 TM, tutor or egg moves it can't learn by levelling, choose a move to forget, Confirm. Seeded in the Daily so everyone gets the same offers. `dex.json` now carries up to 10 tutor moves per species (+86 KB)
- `npm run typecheck` now runs `tsc -b` (the old command checked no files)

Rollback: `git checkout v0.10.0 -- .`

## v0.10.0 — Design pass (2026-11-19)

- **One visual language:** team select, end-of-run, Ranking, How to play, the Gym picker and the error screen moved from the old slate/indigo look onto the orange stage, coal panels and gold main action used everywhere else
- **Pixel arenas:** every Gym type has its own pixel-art arena (sky, stepped ridge, dithered ground and a type motif such as lava pools, waves, tufts, fog and candles), used in the Gym hub, the Gym picker and battle, with raised battle platforms in the arena's colours
- **Gym picker** shows each Gym as a card: its Leader on their arena, the Gym name, type and weaknesses
- **Pixel item sprites** (PokeAPI) replace emoji for bag items, rewards, the merchant, hub tabs, Gym Funds and home tiles; move categories show PHY/SPE/STA tags
- **Type:** Press Start 2P only for the logo and screen titles; Pixelify Sans for names, buttons and card titles; Nunito for body text
- **Accessibility:** type badges and move buttons now meet WCAG AA contrast on every type (was as low as ~1.5:1 on Electric); visible gold keyboard focus ring; no horizontal scroll at 375px
- Fixed a stray scrollbar on the Gym progress track

Rollback: `git checkout v0.8.0 -- .`

## v0.8.0 — Gym upgrades and smarter challengers (2026-11-15)

Built from the mockup and Product Guide; detailed v0.8 instructions can refine it.

- **Gym upgrades** tab in the Gym hub, bought with Gym Funds (not available in the Daily Challenge):
  - Pokémon Center ₽300: +20% HP after each win instead of 10%
  - Training Room ₽300: training rewards more common and +1 extra level
  - Item Workshop ₽250: held item rewards more common, with a spare item
  - Recruitment Office ₽300: recruits offer 4 Pokémon instead of 3
  - Gym Reputation ₽250: +25% Gym Funds
  - Home Crowd ₽300: your lead starts each battle with +1 Speed
  - Analysis Desk ₽250 / Infirmary ₽250: every second win gives a reroll / a Hyper Potion
  - Type Arena ₽350: 2 turns of the type's weather or terrain (sun, rain, sand, snow, Electric/Grassy/Psychic/Misty terrain); types without one give the lead +1 to its stronger attack
  - Type Forge ₽400: the type's boosting item now, plus a burn (Fire), paralysis (Electric) or poison (Poison) on the challenger's lead, or −1 Speed for other types
- **Challenger AI by class:** Promising Trainers pick moves at random; Trainers favour strong attacks; Ace Trainers, Rivals, Gym Leaders, Elite and Champion use type matchups, open with status moves and sometimes switch out of bad matchups

Rollback: `git checkout v0.9.0 -- .`

## v0.9.0 — Battle presentation (2026-11-15)

Order so far: v0.7 → v0.6 → v0.9; v0.8 (upgrades and challenger AI) comes next.

- **VS intro:** your Gym (shown by a famous Leader of your type) against the challenger, "X wants to battle!" (tap to skip)
- **New battle layout:** top bar with both sides' remaining Pokémon, Home, battle speed (1×/2×/3×) and effects toggle; type-themed arena; cream info cards with level, HP bar, status tag (PSN, SLP…) and Speed; your exact HP, the foe's as a percentage
- **Text box** with "What will X do?" and a ▼ button for the **Battle history** (newest first)
- **Moves** coloured by type with a PP bar and an effectiveness badge against the current foe (×2, ×4, ×½, ×¼, ×0), checked against the engine for every type pairing
- **Pokémon (S)** button swaps the moves for your party to switch; **Details** shows both Pokémon's types and full move info; keys **1–4** pick moves
- **Gym Defended!** with confetti and the challenger's parting line, or **Gym fallen…** on a loss; Continue leads to rewards
- No sound toggle yet: the game has no sound assets

Rollback: `git checkout v0.6.0 -- .`

## v0.6.0 — Gym hub (2026-11-15)

Released after v0.7.0 by design (order: v0.7 → v0.6 → v0.9 → v0.8).

- **Gym hub** between battles: your Gym's name (e.g. Cinder Crater Gym), challenger number, Gym Funds, and a 15-node progress track with boss diamonds at 5 (Rival), 10 (Rival Gym Leader), 14 (Elite Four) and 15 (Champion). Daily shows wins so far
- **Challenger card:** trainer class, name and quote, team preview, team types and a "⚠ N strong vs you" warning; Battle! starts the fight
- **Scout team:** trainer, battle style, each Pokémon's level, types and possible abilities, and the types your Gym is weak to
- **Team / Bag / Log tabs:** six team slots with LEAD, HP and FNT; bag items and spare held items; the run log
- Trainer sprites from Pokémon Showdown: a famous Leader of your type for you, a class sprite for each challenger
- Gym Quest titles now line up with the boss nodes (Rival is challenger 5)

Rollback: `git checkout v0.7.0 -- .`

## v0.7.0 — Economy and rewards (2026-11-15)

Released before v0.6 by design: the release order is v0.7 → v0.6 → v0.9 → v0.8.

- **Gym Funds:** start with ₽150; each win pays ₽100 + ₽20 per challenger beaten
- **Choose a reward** after every win: 3 cards (Common/Rare/Epic), Reroll (1 to start), or Skip for bonus funds. Battle report under Details. Daily offers are the same for every player
- **Grow the team to 6:** a Recruit card is always offered while the team has room — pick 1 of 3 Pokémon of your Gym's type you don't own, joining near your team's level; at 6, choose who leaves
- **Rewards:** Pokémon Training (+3 levels), Team Training (+1 each), Revive Pack, Potion Supply, Rare Candy Box, Evolution Stone (evolves at any level, incl. stone/trade evolutions), held items (Gym type booster, Leftovers, Sitrus Berry, Quick Claw, Focus Sash, Expert Belt…), League Favour (+2 rerolls)
- **What's next?** after each reward: Training Camp (one Pokémon +3 levels or the team +1) or Visiting Merchant (Potion ₽80, Revive ₽150, Rare Candy ₽200, Evolution Stone ₽300, held items ₽250)
- **HP carries over** between battles; conscious Pokémon recover 10% after a win; fainted ones sit out until revived
- **Team modal:** HP, moves, held item, use bag items, give/take held items, reorder (first conscious Pokémon leads)
- Trainer sprites from Pokémon Showdown on the event cards

Rollback: `git checkout v0.5.0 -- .`

## v0.5.0 — Online leaderboards (2026-11-15)

- **Backend moved to Neon:** Supabase is removed from the stack. Leaderboards run on Neon Postgres (project `pokemon-gym-leader-game`, free plan) through the Neon Data API, with Neon Auth anonymous tokens; no server of our own. `@supabase/supabase-js` and the Supabase GitHub secrets are no longer used
- **Leaderboards:** global Today and All time Daily Challenge boards. All time shows each player's best Daily run with its Gym type, date and Dailies played; your row is highlighted, with your position shown even outside the top 50
- **Anonymous nicknames:** pick a nickname (or roll a random one) the first time you start a Daily, or from the nickname button on the home screen; no account or email. "Play without ranking" is available. Nicknames can be changed
- **Server checks:** results go through validated database functions in a dedicated `api` schema (token check, today/yesterday UTC only, server-computed Gym type, wins only increase, finished runs frozen); tables sit in a private `gym` schema. Schema in `db/migrations/001_leaderboards.sql` with a `.down.sql` rollback
- **Sync:** Daily results upload after every win/loss and retry when back online
- **Fair play:** leaving or reloading during a Daily battle now counts as a loss, so battles can't be replayed
- README updated with the Neon setup

Rollback: `git checkout v0.4.0 -- .` (database: run `db/migrations/001_leaderboards.down.sql` in the Neon project)

## v0.4.0 — Home screen and game modes (2026-11-15)

- **Home screen:** pixel-art "Gym Leader" title, hero showing today's Daily starters, mode cards, Continue card for a saved run, Ranking and How to play tiles, settings, credits
- **Daily Challenge:** the UTC date picks the same Gym type, five starters and challenger sequence for every player. Challengers never stop and climb 3 levels per round (Lv 10, 13, 16 … up to 100). One try per UTC day; score = battles won
- **Gym Quest:** pick any type and defend against 15 challengers, titled Rookie → Trainer → Ace Trainer → Rival → Rival Gym Leader → Elite Trainer → Elite Four Member → Champion
- **Regional Quest:** shown as coming soon
- **Ranking:** Today and All time tabs for Daily results (wins and Gym type). Results are stored on this device only; global leaderboards need an online backend with sign-in
- **Settings:** battle speed 1×/2×/3×, Full/Simple effects (Simple turns off sprite and evolution animations), Install as an app when the browser offers it
- Saved v0.3 runs carry over as Gym Quests and keep their original 5-challenger length

Rollback: `git checkout v0.3.1 -- .`

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
