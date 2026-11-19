import { describe, it, expect } from 'vitest'
import { BattleStreams } from '@pkmn/sim'
import { buildChoice, nameOf, parseRequest, slotOf, slotRequests, switchTargets } from './battleRequest'

const team = (names: string[]) =>
  names.map(n => `|${n}|||tackle,growl|Hardy|||||50|`).join(']')

async function nextRequest(it: AsyncIterator<string>) {
  for (;;) {
    const { value, done } = await it.next()
    if (done) throw new Error('stream ended')
    const req = parseRequest(value)
    if (req && !req.wait) return req
  }
}

const activeName = (req: any) => nameOf(req.side.pokemon.find((p: any) => p.active).ident)

describe('switching by name', () => {
  it('finds the right slot after the engine reorders the party', async () => {
    const stream = new BattleStreams.BattleStream()
    const { p1, p2 } = BattleStreams.getPlayerStreams(stream)
    const p1It = p1[Symbol.asyncIterator]()
    const p2It = p2[Symbol.asyncIterator]()

    stream.write(`>start {"formatid":"gen9customgame"}`)
    stream.write(`>player p1 ${JSON.stringify({ name: 'Gym Leader', team: team(['Bulbasaur', 'Charmander', 'Squirtle']) })}`)
    stream.write(`>player p2 ${JSON.stringify({ name: 'Challenger', team: team(['Snorlax']) })}`)

    await nextRequest(p1It) // team preview
    await nextRequest(p2It)
    stream.write('>p1 team 123')
    stream.write('>p2 team 1')

    let req = await nextRequest(p1It)
    await nextRequest(p2It)
    expect(activeName(req)).toBe('Bulbasaur')

    stream.write(`>p1 switch ${slotOf(req, 'Squirtle')}`)
    stream.write('>p2 move 2')
    req = await nextRequest(p1It)
    await nextRequest(p2It)
    expect(activeName(req)).toBe('Squirtle')

    // The engine swapped Bulbasaur into Squirtle's old slot: slot 1 is now Squirtle.
    expect(slotOf(req, 'Bulbasaur')).toBe(3)
    expect(switchTargets(req)).toEqual(['Charmander', 'Bulbasaur'])

    stream.write(`>p1 switch ${slotOf(req, 'Bulbasaur')}`)
    stream.write('>p2 move 2')
    req = await nextRequest(p1It)
    expect(activeName(req)).toBe('Bulbasaur')
  })

  it('runs a Doubles battle: per-slot moves with targets, forced switches and passes', async () => {
    const { Dex } = await import('@pkmn/sim')
    const mt = (id: string) => Dex.moves.get(id).target
    const stream = new BattleStreams.BattleStream()
    const { p1, p2, omniscient } = BattleStreams.getPlayerStreams(stream)
    const log: string[] = []
    ;(async () => { for await (const c of omniscient) log.push(...c.split('\n')) })()
    const p1It = p1[Symbol.asyncIterator]()
    const p2It = p2[Symbol.asyncIterator]()
    const strong = (n: string) => `|${n}|||thunderbolt,surf,earthquake,protect|Hardy|||||100|`
    const weak = (n: string) => `|${n}|||splash|Hardy|||||5|`
    stream.write(`>start {"formatid":"gen9doublescustomgame"}`)
    stream.write(`>player p1 ${JSON.stringify({ name: 'Gym Leader', team: [strong('Raichu'), strong('Golem'), strong('Lapras')].join(']') })}`)
    stream.write(`>player p2 ${JSON.stringify({ name: 'Challenger', team: [weak('Magikarp'), weak('Feebas'), weak('Wurmple')].join(']') })}`)
    await nextRequest(p1It); await nextRequest(p2It)
    stream.write('>p1 team 123'); stream.write('>p2 team 123')

    let req = await nextRequest(p1It)
    let foeReq = await nextRequest(p2It)
    let slots = slotRequests(req, mt)
    expect(slots.map(s => s.name)).toEqual(['Raichu', 'Golem'])
    expect(slots[0].moves.find(m => m.id === 'thunderbolt')?.target).toBe('normal')
    expect(slots[1].moves.find(m => m.id === 'earthquake')?.target).toBe('allAdjacent')

    // Raichu targets the left foe with Thunderbolt; Golem's Surf hits everyone, so it takes no target.
    stream.write(`>p1 ${buildChoice(req, [{ kind: 'move', move: 1, target: 1 }, { kind: 'move', move: 2 }])}`)
    stream.write(`>p2 ${buildChoice(foeReq, slotRequests(foeReq, mt).map(() => ({ kind: 'move' as const, move: 1 })))}`)

    // Both foes faint: the challenger must send in its last Pokémon to one slot and pass the other.
    foeReq = await nextRequest(p2It)
    const foeSlots = slotRequests(foeReq, mt)
    expect(foeSlots.filter(s => s.forced)).toHaveLength(1)
    expect(foeSlots.filter(s => s.pass)).toHaveLength(1)
    stream.write(`>p2 ${buildChoice(foeReq, foeSlots.map(s => (s.forced ? { kind: 'switch' as const, name: 'Wurmple' } : { kind: 'pass' as const })))}`)

    req = await nextRequest(p1It)
    slots = slotRequests(req, mt)
    expect(slots.every(s => !s.forced)).toBe(true)
    expect(log.some(l => l.startsWith('|switch|p2a: Wurmple') || l.startsWith('|switch|p2b: Wurmple'))).toBe(true)
  })

  it('excludes fainted and active Pokémon from switch targets', () => {
    const req = {
      side: {
        pokemon: [
          { ident: 'p1: Fennekin', active: true, condition: '0 fnt' },
          { ident: 'p1: Cyndaquil', active: false, condition: '5/41' },
          { ident: 'p1: Slugma', active: false, condition: '0 fnt' },
        ],
      },
    }
    expect(switchTargets(req)).toEqual(['Cyndaquil'])
    expect(slotOf(req, 'Cyndaquil')).toBe(2)
    expect(slotOf(req, 'Missingno')).toBe(0)
  })
})
