import { AccountId, CharacterId } from './ids'

export interface CharacterName {
  first: string
  last: string
}

export type CharacterMetadata = Record<string, unknown>

export interface CharacterCreateInput {
  name: CharacterName
  appearanceId?: string
  metadata?: CharacterMetadata
}

export interface CharacterUpdatePatch {
  name?: Partial<CharacterName>
  appearanceId?: string | null
  metadata?: CharacterMetadata
}

export interface SerializedCharacter {
  id: CharacterId
  accountId: AccountId
  name: CharacterName
  appearanceId?: string
  metadata?: CharacterMetadata
  createdAt: string
  lastPlayedAt?: string
}
