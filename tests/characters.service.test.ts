import { describe, expect, it, vi } from 'vitest'
import { Player } from '@open-core/framework/server'
import { Character } from '../src/shared/domain/character'
import { CharacterDeletionPolicyContract } from '../src/shared/contracts/character-deletion-policy.contract'
import { CharacterSlotPolicyContract } from '../src/shared/contracts/character-slot-policy.contract'
import { CharacterStoreContract } from '../src/shared/contracts/character-store.contract'
import { ACTIVE_CHARACTER_META_KEY } from '../src/shared/constants'
import { CharactersEvents } from '../src/server/events/characters-events'
import { DefaultDeletionPolicy } from '../src/server/policies/default-deletion.policy'
import { FixedSlotPolicy } from '../src/server/policies/fixed-slot.policy'
import { Characters } from '../src/server/services/characters'

class InMemoryCharacterStore extends CharacterStoreContract {
  private readonly characters = new Map<string, Character>()

  async listByAccount(accountId: string): Promise<Character[]> {
    return [...this.characters.values()].filter((character) => character.accountId === accountId)
  }

  async getById(characterId: string): Promise<Character | null> {
    return this.characters.get(characterId) ?? null
  }

  async create(character: Character): Promise<void> {
    this.characters.set(character.id, character)
  }

  async update(character: Character): Promise<void> {
    this.characters.set(character.id, character)
  }

  async delete(characterId: string): Promise<void> {
    this.characters.delete(characterId)
  }
}

class MockPlayer {
  readonly clientID: number
  readonly accountID?: string
  private readonly meta = new Map<string, unknown>()

  constructor(params: { clientID: number; accountID?: string }) {
    this.clientID = params.clientID
    this.accountID = params.accountID
  }

  setMeta(key: string, value: unknown): void {
    this.meta.set(key, value)
  }

  getMeta<T = unknown>(key: string): T | undefined {
    return this.meta.get(key) as T | undefined
  }
}

describe('CharactersService', () => {
  it('enforces slot limit when creating a character', async () => {
    const store = new InMemoryCharacterStore()
    const slots = new FixedSlotPolicy(1)
    const deletion = new DefaultDeletionPolicy()
    const service = new Characters(store, slots, deletion)

    await service.create('acc:1', {
      name: { first: 'John', last: 'Doe' },
    })

    await expect(
      service.create('acc:1', {
        name: { first: 'Jane', last: 'Doe' },
      }),
    ).rejects.toThrow('slot limit')
  })

  it('rejects update when character owner does not match', async () => {
    const store = new InMemoryCharacterStore()
    const service = new Characters(store, new FixedSlotPolicy(2), new DefaultDeletionPolicy())

    const character = await service.create('acc:1', {
      name: { first: 'John', last: 'Owner' },
    })

    await expect(
      service.update('acc:2', character.id, {
        name: { first: 'Hacker' },
      }),
    ).rejects.toThrow('does not belong')
  })

  it('sets active character metadata on select', async () => {
    const store = new InMemoryCharacterStore()
    const service = new Characters(store, new FixedSlotPolicy(2), new DefaultDeletionPolicy())

    const character = await service.create('acc:1', {
      name: { first: 'Eve', last: 'Select' },
    })

    const player = new MockPlayer({ clientID: 7, accountID: 'acc:1' })
    await service.select(player as unknown as Player, character.id)

    const active = player.getMeta<Character>(ACTIVE_CHARACTER_META_KEY)
    expect(active?.id).toBe(character.id)
  })

  it('emits created event through internal library bus', async () => {
    const store = new InMemoryCharacterStore()
    const service = new Characters(store, new FixedSlotPolicy(2), new DefaultDeletionPolicy())
    const handler = vi.fn()

    CharactersEvents.once('created', handler)

    await service.create('acc:1', {
      name: { first: 'Nora', last: 'Events' },
    })

    expect(handler).toHaveBeenCalledTimes(1)
    const payload = handler.mock.calls[0]![0] as { character: Character }
    expect(payload.character.accountId).toBe('acc:1')
  })

  it('emits selected event through internal library bus', async () => {
    const store = new InMemoryCharacterStore()
    const service = new Characters(store, new FixedSlotPolicy(2), new DefaultDeletionPolicy())
    const handler = vi.fn()

    const character = await service.create('acc:1', {
      name: { first: 'Sam', last: 'Select' },
    })

    CharactersEvents.once('selected', handler)

    const player = new MockPlayer({ clientID: 22, accountID: 'acc:1' })
    await service.select(player as unknown as Player, character.id)

    expect(handler).toHaveBeenCalledTimes(1)
    const payload = handler.mock.calls[0]![0] as {
      player: { clientID: number }
      character: Character
    }
    expect(payload.player.clientID).toBe(22)
    expect(payload.character.id).toBe(character.id)
  })

  it('applies custom deletion policy result', async () => {
    class DenyDeletionPolicy extends CharacterDeletionPolicyContract {
      canDelete(): boolean {
        return false
      }
    }

    const store = new InMemoryCharacterStore()
    const slots: CharacterSlotPolicyContract = new FixedSlotPolicy(2)
    const deletion: CharacterDeletionPolicyContract = new DenyDeletionPolicy()
    const service = new Characters(store, slots, deletion)

    const character = await service.create('acc:9', {
      name: { first: 'No', last: 'Delete' },
    })

    await expect(service.delete('acc:9', character.id)).rejects.toThrow('Deletion policy denied')
  })
})
