import { CharacterSlotPolicyContract } from '../../shared/contracts/character-slot-policy.contract'
import { AccountId } from '../../shared/types/ids'

/**
 * Default slot policy with a fixed base amount.
 */
export class FixedSlotPolicy extends CharacterSlotPolicyContract {
  constructor(private readonly baseSlots: number) {
    super()
  }

  resolveSlots(_accountId: AccountId): number {
    return this.baseSlots
  }
}
