import {
  CharacterDeletionInput,
  CharacterDeletionPolicyContract,
} from '../../shared/contracts/character-deletion-policy.contract'

/**
 * Default deletion policy.
 * Allows deletion only when character ownership matches the account.
 */
export class DefaultDeletionPolicy extends CharacterDeletionPolicyContract {
  canDelete(input: CharacterDeletionInput): boolean {
    return input.character.accountId === input.accountId
  }
}
