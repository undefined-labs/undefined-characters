import { AccountId } from '../types/ids'

/**
 * Slot policy boundary. Determines how many characters an account can own.
 */
export abstract class CharacterSlotPolicyContract {
  abstract resolveSlots(accountId: AccountId): Promise<number> | number
}
