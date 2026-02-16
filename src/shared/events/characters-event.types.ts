import { Character } from '../domain/character'
import { AccountId, CharacterId } from '../types/ids'

export interface CharactersCreatedEvent {
  character: Character
}

export interface CharactersUpdatedEvent {
  character: Character
}

export interface CharactersDeletedEvent {
  characterId: CharacterId
  accountId: AccountId
}

export interface CharactersSelectedEvent<TPlayer = unknown> {
  player: TPlayer
  character: Character
}

export interface CharactersUnselectedEvent<TPlayer = unknown> {
  player: TPlayer
  characterId: CharacterId
}
