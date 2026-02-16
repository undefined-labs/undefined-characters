import { Character } from '../domain/character'
import { AccountId } from '../types/ids'

export interface CharacterDeletionContext {
  reason?: string
  requestedBy?: string
}

export interface CharacterDeletionInput {
  accountId: AccountId
  character: Character
  context?: CharacterDeletionContext
}

/**
 * Deletion policy boundary. Controls if a character can be deleted.
 */
export abstract class CharacterDeletionPolicyContract {
  abstract canDelete(input: CharacterDeletionInput): Promise<boolean> | boolean
}
