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
          <p>Coming soon.</p>
        </Section>
        <Section title="Battles">
          <p>Pick a move each turn. The faster Pokémon (higher Speed) acts first, unless a move has priority: Quick Attack (+1) goes before normal moves even from a slower Pokémon.</p>
          <p>Tap a teammate in your party row to switch. When a Pokémon faints, choose who goes in next.</p>
          <p>In Doubles, two Pokémon are out on each side. Choose a move for each of yours in turn; single-target moves then ask which foe to aim at, while spread moves like Surf hit both.</p>
        </Section>
        <Section title="Growing your team">
          <p>After every win, each team member gains XP and learns new moves. Once it knows four, new moves are offered instead: open the Pokémon in Team and tap a move to swap one in.</p>
          <p>When a Pokémon reaches its evolution level, an Evolve button appears in the battle report, the Team screen and the Gym hub. Evolving is up to you.</p>
          <p>Before each battle, Scout team shows which challengers are a threat to your type and which are weak to it.</p>
        </Section>
        <Section title="Settings">
          <p>Battle speed plays turns at 1×, 2× or 3×. Simple effects turns off sprite and evolution animations.</p>
        </Section>
      </div>
    </div>
  )
}
