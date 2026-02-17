import * as Server from '@open-core/framework/server'
import { Character } from '../../shared/domain/character'
import { CharactersError } from '../../shared/errors'
import { ACTIVE_CHARACTER_META_KEY } from '../../shared/constants'
import { CharacterDeletionContext } from '../../shared/contracts/character-deletion-policy.contract'
import { CharacterDeletionPolicyContract } from '../../shared/contracts/character-deletion-policy.contract'
import { CharacterSlotPolicyContract } from '../../shared/contracts/character-slot-policy.contract'
import { CharacterStoreContract } from '../../shared/contracts/character-store.contract'
import { createCharacterId } from '../../shared/utils/create-character-id'
import { CharacterCreateInput, CharacterUpdatePatch, SerializedCharacter } from '../../shared/types/character.types'
import { AccountId, CharacterId } from '../../shared/types/ids'
import {
  emitCharactersCreated,
  emitCharactersDeleted,
  emitCharactersSelected,
  emitCharactersUnselected,
  emitCharactersUpdated,
} from '../events/characters-events'

/**
 * Characters domain service.
 *
 * @remarks
 * This service enforces ownership checks, slot policy limits, deletion policy
 * rules, and emits characters library events for each domain action.
 */
@Server.Service()
export class Characters {
  constructor(
    private readonly store: CharacterStoreContract,
    private readonly slots: CharacterSlotPolicyContract,
    private readonly deletion: CharacterDeletionPolicyContract,
  ) { }

  /**
   * Returns all characters owned by the provided account.
   */
  async listByAccount(accountId: AccountId): Promise<Character[]> {
    return this.store.listByAccount(accountId)
  }

  /**
   * Creates a new character after enforcing slot limits for the account.
   * Emits `characters:created` on success.
   */
  async create(accountId: AccountId, input: CharacterCreateInput): Promise<Character> {
    const maxSlots = await Promise.resolve(this.slots.resolveSlots(accountId))
    const existing = await this.store.listByAccount(accountId)

    if (existing.length >= maxSlots) {
      throw new CharactersError(
        `Character slot limit reached for account '${accountId}'. Allowed slots: ${maxSlots}`,
      )
    }

    const character = new Character({
      id: createCharacterId(),
      accountId,
      name: input.name,
      appearanceId: input.appearanceId,
      metadata: input.metadata,
      createdAt: new Date(),
    })

    await this.store.create(character)
    emitCharactersCreated({ character })
    return character
  }

  /**
   * Updates a character belonging to the account.
   * Emits `characters:updated` on success.
   */
  async update(
    accountId: AccountId,
    characterId: CharacterId,
    patch: CharacterUpdatePatch,
  ): Promise<Character> {
    const character = await this.requireOwnedCharacter(accountId, characterId)
    character.update(patch)

    await this.store.update(character)
    emitCharactersUpdated({ character })
    return character
  }

  /**
   * Deletes a character belonging to the account.
   * Applies deletion policy checks and emits `characters:deleted` on success.
   */
  async delete(
    accountId: AccountId,
    characterId: CharacterId,
    context?: CharacterDeletionContext,
  ): Promise<void> {
    const character = await this.requireOwnedCharacter(accountId, characterId)

    const canDelete = await Promise.resolve(
      this.deletion.canDelete({
        accountId,
        character,
        context,
      }),
    )

    if (!canDelete) {
      throw new CharactersError(
        `Deletion policy denied character '${characterId}' for account '${accountId}'`,
      )
    }

    await this.store.delete(characterId)
    emitCharactersDeleted({ characterId, accountId })
  }

  /**
   * Selects an owned character and binds it to the player's runtime metadata.
   * Emits `characters:selected` on success.
   */
  async select(
    player: Server.Player,
    characterId: CharacterId,
    fallbackAccountId?: AccountId,
  ): Promise<Character> {
    const accountId = this.resolvePlayerAccountId(player, fallbackAccountId)
    const character = await this.requireOwnedCharacter(accountId, characterId)

    character.touchLastPlayed(new Date())
    await this.store.update(character)

    player.setMeta(ACTIVE_CHARACTER_META_KEY, character)

    emitCharactersSelected({
      player,
      character,
    })

    return character
  }

  /**
   * Returns the currently active character bound to the player metadata.
   */
  getActive(player: Server.Player): Character | null {
    const value = player.getMeta<Character | SerializedCharacter | null>(ACTIVE_CHARACTER_META_KEY)
    if (!value) return null

    if (value instanceof Character) {
      return value
    }

    if (typeof value === 'object' && value !== null && 'id' in value && 'accountId' in value) {
      return Character.from(value as SerializedCharacter)
    }

    return null
  }

  /**
   * Clears the active character metadata from the player.
   * Emits `characters:unselected` when an active character existed.
   */
  clearActive(player: Server.Player): void {
    const active = this.getActive(player)
    if (!active) {
      return
    }

    player.setMeta(ACTIVE_CHARACTER_META_KEY, null)
    emitCharactersUnselected({ player, characterId: active.id })
  }

  private resolvePlayerAccountId(player: Server.Player, fallbackAccountId?: AccountId): AccountId {
    const accountId = player.accountID ?? fallbackAccountId
    if (!accountId) {
      throw new CharactersError(
        `Cannot resolve accountId for player '${player.clientID}' while selecting character`,
      )
    }

    return accountId
  }

  private async requireOwnedCharacter(
    accountId: AccountId,
    characterId: CharacterId,
  ): Promise<Character> {
    const character = await this.store.getById(characterId)
    if (!character) {
      throw new CharactersError(`Character '${characterId}' not found`)
    }

    if (character.accountId !== accountId) {
      throw new CharactersError(
        `Character '${characterId}' does not belong to account '${accountId}'`,
      )
    }

    return character
  }
}
