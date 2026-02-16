import { AccountId, CharacterId } from '../types/ids'
import {
  CharacterCreateInput,
  CharacterMetadata,
  CharacterName,
  CharacterUpdatePatch,
  SerializedCharacter,
} from '../types/character.types'

export interface CharacterProps extends CharacterCreateInput {
  id: CharacterId
  accountId: AccountId
  createdAt: Date
  lastPlayedAt?: Date
}

/**
 * Character aggregate root for the Characters domain.
 */
export class Character {
  readonly id: CharacterId
  readonly accountId: AccountId
  private _name: CharacterName
  private _appearanceId?: string
  private _metadata?: CharacterMetadata
  readonly createdAt: Date
  private _lastPlayedAt?: Date

  constructor(props: CharacterProps) {
    this.id = props.id
    this.accountId = props.accountId
    this._name = { ...props.name }
    this._appearanceId = props.appearanceId
    this._metadata = props.metadata ? { ...props.metadata } : undefined
    this.createdAt = new Date(props.createdAt)
    this._lastPlayedAt = props.lastPlayedAt ? new Date(props.lastPlayedAt) : undefined
  }

  get name(): CharacterName {
    return { ...this._name }
  }

  get appearanceId(): string | undefined {
    return this._appearanceId
  }

  get metadata(): CharacterMetadata | undefined {
    return this._metadata ? { ...this._metadata } : undefined
  }

  get lastPlayedAt(): Date | undefined {
    return this._lastPlayedAt ? new Date(this._lastPlayedAt) : undefined
  }

  update(patch: CharacterUpdatePatch): void {
    if (patch.name) {
      this._name = {
        first: patch.name.first ?? this._name.first,
        last: patch.name.last ?? this._name.last,
      }
    }

    if (patch.appearanceId !== undefined) {
      this._appearanceId = patch.appearanceId === null ? undefined : patch.appearanceId
    }

    if (patch.metadata !== undefined) {
      this._metadata = { ...patch.metadata }
    }
  }

  touchLastPlayed(date = new Date()): void {
    this._lastPlayedAt = new Date(date)
  }

  serialize(): SerializedCharacter {
    return {
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      appearanceId: this._appearanceId,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      lastPlayedAt: this._lastPlayedAt?.toISOString(),
    }
  }

  static from(serialized: SerializedCharacter): Character {
    return new Character({
      id: serialized.id,
      accountId: serialized.accountId,
      name: serialized.name,
      appearanceId: serialized.appearanceId,
      metadata: serialized.metadata,
      createdAt: new Date(serialized.createdAt),
      lastPlayedAt: serialized.lastPlayedAt ? new Date(serialized.lastPlayedAt) : undefined,
    })
  }
}
