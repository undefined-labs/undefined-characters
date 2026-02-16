import { Character } from '../domain/character'
import { AccountId, CharacterId } from '../types/ids'

/**
 * Persistence boundary for character data.
 * Integrators must provide a concrete implementation.
 */
export abstract class CharacterStoreContract {
  abstract listByAccount(accountId: AccountId): Promise<Character[]>
  abstract getById(characterId: CharacterId): Promise<Character | null>
  abstract create(character: Character): Promise<void>
  abstract update(character: Character): Promise<void>
  abstract delete(characterId: CharacterId): Promise<void>
}
