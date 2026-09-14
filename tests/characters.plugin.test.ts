import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CharacterDeletionPolicyContract,
  CharacterSlotPolicyContract,
  CharacterStoreContract,
} from '../src/shared'
import { CharactersModule } from '../src/server/module/characters.module'
import { charactersServerPlugin } from '../src/server/plugin/characters.plugin'

class InMemoryStore extends CharacterStoreContract {
  async listByAccount(): Promise<any[]> {
    return []
  }

  async getById(): Promise<any> {
    return null
  }

  async create(): Promise<void> {}

  async update(): Promise<void> {}

  async delete(): Promise<void> {}
}

class SlotPolicy extends CharacterSlotPolicyContract {
  resolveSlots(): number {
    return 3
  }
}

class DeletionPolicy extends CharacterDeletionPolicyContract {
  canDelete(): boolean {
    return true
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('charactersServerPlugin', () => {
  it('adapts plugin options to CharactersModule', async () => {
    const setStoreSpy = vi.spyOn(CharactersModule, 'setStore').mockImplementation(() => undefined)
    const setSlotPolicySpy = vi.spyOn(CharactersModule, 'setSlotPolicy').mockImplementation(() => undefined)
    const setDeletionPolicySpy = vi
      .spyOn(CharactersModule, 'setDeletionPolicy')
      .mockImplementation(() => undefined)
    const installSpy = vi.spyOn(CharactersModule, 'install').mockImplementation(() => undefined)

    const plugin = charactersServerPlugin({
      store: InMemoryStore,
      slotPolicy: SlotPolicy,
      deletionPolicy: DeletionPolicy,
      baseSlots: 5,
      bridgeExternalEvents: true,
    })

    await plugin.install({} as any)

    expect(plugin.name).toBe('@undefined-labs/characters/server')
    expect(setStoreSpy).toHaveBeenCalledWith(InMemoryStore)
    expect(setSlotPolicySpy).toHaveBeenCalledWith(SlotPolicy)
    expect(setDeletionPolicySpy).toHaveBeenCalledWith(DeletionPolicy)
    expect(installSpy).toHaveBeenCalledWith({
      baseSlots: 5,
      bridgeExternalEvents: true,
    })
  })

  it('keeps optional policies optional', async () => {
    const setStoreSpy = vi.spyOn(CharactersModule, 'setStore').mockImplementation(() => undefined)
    const setSlotPolicySpy = vi.spyOn(CharactersModule, 'setSlotPolicy').mockImplementation(() => undefined)
    const setDeletionPolicySpy = vi
      .spyOn(CharactersModule, 'setDeletionPolicy')
      .mockImplementation(() => undefined)
    const installSpy = vi.spyOn(CharactersModule, 'install').mockImplementation(() => undefined)

    const plugin = charactersServerPlugin({
      store: new InMemoryStore(),
    })

    await plugin.install({} as any)

    expect(setStoreSpy).toHaveBeenCalledTimes(1)
    expect(setSlotPolicySpy).not.toHaveBeenCalled()
    expect(setDeletionPolicySpy).not.toHaveBeenCalled()
    expect(installSpy).toHaveBeenCalledWith({
      baseSlots: undefined,
      bridgeExternalEvents: undefined,
    })
  })
})
