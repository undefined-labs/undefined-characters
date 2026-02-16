import { GLOBAL_CONTAINER } from '@open-core/framework'
import {
  CharacterDeletionPolicyContract,
  CharacterSlotPolicyContract,
  CharacterStoreContract,
} from '../../shared'
import { configureCharactersEvents } from '../events/characters-events'
import { DefaultDeletionPolicy } from '../policies/default-deletion.policy'
import { FixedSlotPolicy } from '../policies/fixed-slot.policy'
import { CharactersService } from '../services/characters.service'

type Constructor<T> = new (...args: any[]) => T

export interface CharactersModuleInstallOptions {
  baseSlots?: number
  bridgeExternalEvents?: boolean
}

/**
 * Module installer for the Characters library.
 *
 * @remarks
 * - Registers default slot and deletion policies when they are not already provided.
 * - Requires a CharacterStoreContract implementation provided by the integrator.
 * - Registers CharactersService once and keeps installation idempotent.
 */
export class CharactersModule {
  private static installed = false

  static setStore(provider: CharacterStoreContract | Constructor<CharacterStoreContract>): void {
    const container = this.getContainer()

    if (typeof provider === 'function') {
      container.registerSingleton(CharacterStoreContract as any, provider)
      return
    }

    container.register(CharacterStoreContract as any, { useValue: provider })
  }

  static setSlotPolicy(
    provider: CharacterSlotPolicyContract | Constructor<CharacterSlotPolicyContract>,
  ): void {
    const container = this.getContainer()

    if (typeof provider === 'function') {
      container.registerSingleton(CharacterSlotPolicyContract as any, provider)
      return
    }

    container.register(CharacterSlotPolicyContract as any, { useValue: provider })
  }

  static setDeletionPolicy(
    provider: CharacterDeletionPolicyContract | Constructor<CharacterDeletionPolicyContract>,
  ): void {
    const container = this.getContainer()

    if (typeof provider === 'function') {
      container.registerSingleton(CharacterDeletionPolicyContract as any, provider)
      return
    }

    container.register(CharacterDeletionPolicyContract as any, { useValue: provider })
  }

  static install(options?: CharactersModuleInstallOptions): void {
    const container = this.getContainer()

    configureCharactersEvents({
      bridgeExternalEvents: options?.bridgeExternalEvents,
    })

    if (!container.isRegistered(CharacterStoreContract as any)) {
      throw new Error(
        "CharactersModule requires a CharacterStoreContract provider. Use CharactersModule.setStore(...) before install().",
      )
    }

    if (!container.isRegistered(CharacterSlotPolicyContract as any)) {
      container.register(CharacterSlotPolicyContract as any, {
        useValue: new FixedSlotPolicy(options?.baseSlots ?? 3),
      })
    }

    if (!container.isRegistered(CharacterDeletionPolicyContract as any)) {
      container.register(CharacterDeletionPolicyContract as any, {
        useValue: new DefaultDeletionPolicy(),
      })
    }

    if (!container.isRegistered(CharactersService)) {
      container.registerSingleton(CharactersService, CharactersService)
    }

    this.installed = true
  }

  static resolveService(): CharactersService {
    if (!this.installed) {
      this.install()
    }

    return this.getContainer().resolve(CharactersService)
  }

  private static getContainer(): any {
    return (globalThis as any).oc_container ?? GLOBAL_CONTAINER
  }
}
