import type { ReactNode } from 'react'
import { ScreenHeader } from '../components/ScreenHeader'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-ink-900 border border-white/10 p-5">
      <h2 className="font-ui font-bold text-xl text-gold-300">{title}</h2>
      <div className="mt-2 text-sm text-white/80 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export function HowToPlayScreen() {
  return (
    <div className="home-bg min-h-screen text-white">
      <ScreenHeader title="How to play" sub="You’re the Gym Leader. Challengers come to you." />
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        <Section title="Daily Challenge">
          <p>Everyone gets the same Gym type, the same six starters and the same challengers each day. Daily battles are Singles. The day resets at midnight UTC.</p>
          <p>Challengers never stop coming and get stronger every round. You get one try: your score is how many battles you win before your Gym falls. Leaving or reloading the page during a Daily battle counts as a loss; between battles you can safely leave and continue later.</p>
          <p>Pick a nickname to appear on the Ranking. Today’s board ranks everyone on today’s Gym; the All time board shows each player’s best Daily run and which Gym it was on. No account or email is needed.</p>
        </Section>
        <Section title="Gym Quest">
          <p>Pick any of the 18 types and a format: Singles (pick 3 of 6 starters) or Doubles (pick 4). Defend your Gym against 15 challengers, from Rookies through a Rival and the Elite Four to the Champion.</p>
          <p>Beat all 15 to win the quest. Lose one battle and the quest ends.</p>
        </Section>
        <Section title="Regional Quest">
          <p>This time you are the challenger. Choose one of 9 regions, pick one of its starters and 2 unevolved Pokémon from that region, then beat its 8 Gym Leaders (Alola’s trial captains and kahunas), its Elite Four (Galar’s Champion Cup) and its Champion. Each opponent is tougher than the last, and every Champion brings a legendary or pseudo-legendary.</p>
          <p>After every win your whole team is healed and you catch 2 of 5 new Pokémon; two of the five are strong against your next two opponents. Six can be on the team; the rest wait in the box, and you can swap them in before any battle. Boxed Pokémon don’t earn XP.</p>
          <p>Rewards are Move Tutors, held items, Rare Candies and Evolution Stones, plus Mega Stones in Kanto, Hoenn and Kalos and Z-Crystals in Alola. Use the Mega Evolve or Z-Move button in battle. You have 3 retries: lose a fourth time and the quest ends.</p>
        </Section>
        <Section title="Battles">
          <p>Pick a move each turn. The faster Pokémon (higher Speed) acts first, unless a move has priority: Quick Attack (+1) goes before normal moves even from a slower Pokémon.</p>
          <p>Tap a teammate in your party row to switch. When a Pokémon faints, choose who goes in next.</p>
          <p>In Doubles, two Pokémon are out on each side. Choose a move for each of yours in turn; single-target moves then ask which foe to aim at, while spread moves like Surf hit both.</p>
        </Section>
        <Section title="Growing your team">
          <p>After every win, each team member gains XP and learns new moves. Once it knows four, new moves are offered instead: open the Pokémon in Team and tap a move to swap one in.</p>
          <p>When a Pokémon reaches its evolution level, an Evolve button appears in the battle report, the Team screen and the Gym hub. Evolving is up to you.</p>
          <p>Before each battle, Scout team shows which challengers are a threat to your type and which are weak to it. In Gym Quest, build the Scouting Room to also see their exact moves, ability and held item.</p>
        </Section>
        <Section title="Settings">
          <p>Battle speed plays turns at 1×, 2× or 3×. Simple effects turns off sprite and evolution animations.</p>
        </Section>
      </div>
    </div>
  )
}
