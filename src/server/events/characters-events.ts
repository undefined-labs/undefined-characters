import { Server } from '@open-core/framework/server'
import { Character } from '../../shared/domain/character'
import {
  CharactersCreatedEvent,
  CharactersDeletedEvent,
  CharactersSelectedEvent,
  CharactersUnselectedEvent,
  CharactersUpdatedEvent,
} from '../../shared/events/characters-event.types'

export const CharactersEvents = Server.createServerLibrary('characters')

let bridgeExternalEvents = false

export function configureCharactersEvents(options?: { bridgeExternalEvents?: boolean }) {
  bridgeExternalEvents = options?.bridgeExternalEvents ?? false
}

export function emitCharactersCreated(event: CharactersCreatedEvent): void {
  CharactersEvents.emit('created', event)

  if (!bridgeExternalEvents) return

  CharactersEvents.emitExternal('created', {
    character: toPublicCharacter(event.character),
  })
}

export function emitCharactersUpdated(event: CharactersUpdatedEvent): void {
  CharactersEvents.emit('updated', event)

  if (!bridgeExternalEvents) return

  CharactersEvents.emitExternal('updated', {
    character: toPublicCharacter(event.character),
  })
}

export function emitCharactersDeleted(event: CharactersDeletedEvent): void {
  CharactersEvents.emit('deleted', event)

  if (!bridgeExternalEvents) return

  CharactersEvents.emitExternal('deleted', {
    characterId: event.characterId,
    accountId: event.accountId,
  })
}

export function emitCharactersSelected(event: CharactersSelectedEvent<{ clientID: number }>): void {
  CharactersEvents.emit('selected', event)

  if (!bridgeExternalEvents) return

  CharactersEvents.emitExternal('selected', {
    characterId: event.character.id,
    accountId: event.character.accountId,
    playerClientId: event.player.clientID,
  })
}

export function emitCharactersUnselected(
  event: CharactersUnselectedEvent<{ clientID: number }>,
): void {
  CharactersEvents.emit('unselected', event)

  if (!bridgeExternalEvents) return

  CharactersEvents.emitExternal('unselected', {
    characterId: event.characterId,
    playerClientId: event.player.clientID,
  })
}

function toPublicCharacter(character: Character): {
  id: string
  accountId: string
  name: { first: string; last: string }
  appearanceId?: string
} {
  return {
    id: character.id,
    accountId: character.accountId,
    name: character.name,
    appearanceId: character.appearanceId,
  }
}
