import { describe, it, expect } from 'vitest'
import { BattleStreams } from '@pkmn/sim'
import { nameOf, parseRequest, slotOf, switchTargets } from './battleRequest'

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
