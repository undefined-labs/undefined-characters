import { Client } from '@open-core/framework/client'
import { CharacterCreateInput, CharacterId } from '../shared'

export const CharactersClient = Client.createClientLibrary('characters')

/**
 * Emits a server request to select a character.
 */
export function requestCharacterSelect(characterId: CharacterId): void {
  CharactersClient.emitServer('select', { characterId })
}

/**
 * Emits a server request to create a character.
 */
export function requestCharacterCreate(input: CharacterCreateInput): void {
  CharactersClient.emitServer('create', input)
}
