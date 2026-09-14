import { type OpenCorePlugin } from '@open-core/framework/server'
import {
  CharacterDeletionPolicyContract,
  CharacterSlotPolicyContract,
  CharacterStoreContract,
} from '../../shared'
import { CharactersModule, type CharactersModuleInstallOptions } from '../module/characters.module'

type Constructor<T> = new (...args: any[]) => T

export interface CharactersServerPluginOptions extends CharactersModuleInstallOptions {
  store: CharacterStoreContract | Constructor<CharacterStoreContract>
  slotPolicy?: CharacterSlotPolicyContract | Constructor<CharacterSlotPolicyContract>
  deletionPolicy?: CharacterDeletionPolicyContract | Constructor<CharacterDeletionPolicyContract>
}

export function charactersServerPlugin(options: CharactersServerPluginOptions): OpenCorePlugin {
  return {
    name: '@undefined-labs/characters/server',
    install() {
      CharactersModule.setStore(options.store)

      if (options.slotPolicy) {
        CharactersModule.setSlotPolicy(options.slotPolicy)
      }

      if (options.deletionPolicy) {
        CharactersModule.setDeletionPolicy(options.deletionPolicy)
      }

      CharactersModule.install({
        baseSlots: options.baseSlots,
        bridgeExternalEvents: options.bridgeExternalEvents,
      })
    },
  }
}
