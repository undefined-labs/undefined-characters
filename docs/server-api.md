# Server API

## Plugin-first setup

Use the package as a server plugin during `Server.init()`.

```ts
import { Server } from '@open-core/framework/server'
import { charactersServerPlugin } from '@undefined-labs/characters/server'

await Server.init({
  mode: 'CORE',
  plugins: [
    charactersServerPlugin({
      store: new MyCharacterStore(),
      baseSlots: 3,
      bridgeExternalEvents: true,
    }),
  ],
})
```

`charactersServerPlugin(...)` wires store/policies and calls module installation internally.

## charactersServerPlugin

```ts
interface CharactersServerPluginOptions {
  store: CharacterStoreContract | Constructor<CharacterStoreContract>
  slotPolicy?: CharacterSlotPolicyContract | Constructor<CharacterSlotPolicyContract>
  deletionPolicy?: CharacterDeletionPolicyContract | Constructor<CharacterDeletionPolicyContract>
  baseSlots?: number
  bridgeExternalEvents?: boolean
}
```

## CharactersModule

`CharactersModule` handles installation and DI registration.

### Methods

- `setStore(storeOrClass)`
- `setSlotPolicy(policyOrClass)`
- `setDeletionPolicy(policyOrClass)`
- `install(options?)`
- `resolveService()`

### install options

```ts
interface CharactersModuleInstallOptions {
  baseSlots?: number
  bridgeExternalEvents?: boolean
}
```

If `CharacterStoreContract` is not registered before `install()`, the module throws a clear error.

## CharactersService

`CharactersService` is the domain entry point for character lifecycle.

### Methods

- `listByAccount(accountId)`
- `create(accountId, input)`
- `update(accountId, characterId, patch)`
- `delete(accountId, characterId, context?)`
- `select(player, characterId, fallbackAccountId?)`
- `getActive(player)`
- `clearActive(player)`

### Key Behaviors

- Slot checks are enforced on `create` through `CharacterSlotPolicyContract`.
- Ownership checks are enforced on `update`, `delete`, and `select`.
- Deletion policy check is enforced on `delete`.
- Active character metadata key is `opencore.characters.active`.

## Policies

### FixedSlotPolicy

Default slot policy with fixed amount from module options.

### DefaultDeletionPolicy

Allows deletion only when character belongs to the given account.

## Concrete Usage Example

The following example shows a complete practical flow:

- Integrator-provided store
- Module installation
- Character create/select/update (including appearance reference)
- Domain event listener with `@Server.OnLibraryEvent(...)`

```ts
import { Server } from '@open-core/framework/server'
import {
  Character,
  CharacterStoreContract,
  CharactersModule,
  CharactersService,
} from '@undefined-labs/characters/server'
import type { AccountId, CharacterId } from '@undefined-labs/characters/shared'

class MyCharacterStore extends CharacterStoreContract {
  private readonly data = new Map<CharacterId, Character>()

  async listByAccount(accountId: AccountId): Promise<Character[]> {
    return [...this.data.values()].filter((c) => c.accountId === accountId)
  }

  async getById(characterId: CharacterId): Promise<Character | null> {
    return this.data.get(characterId) ?? null
  }

  async create(character: Character): Promise<void> {
    // Replace with INSERT in your DB
    this.data.set(character.id, character)
  }

  async update(character: Character): Promise<void> {
    // Replace with UPDATE in your DB
    this.data.set(character.id, character)
  }

  async delete(characterId: CharacterId): Promise<void> {
    // Replace with DELETE in your DB
    this.data.delete(characterId)
  }
}

CharactersModule.setStore(new MyCharacterStore())
CharactersModule.install({
  baseSlots: 3,
  bridgeExternalEvents: true,
})

@Server.Controller()
export class CharactersController {
  private readonly characters: CharactersService

  constructor() {
    this.characters = CharactersModule.resolveService()
  }

  @Server.OnNet('characters:create')
  async createCharacter(
    player: Server.Player,
    input: {
      firstName: string
      lastName: string
      appearanceId?: string
    },
  ) {
    const accountId = player.accountID
    if (!accountId) throw new Error('Player has no account linked')

    const created = await this.characters.create(accountId, {
      name: { first: input.firstName, last: input.lastName },
      appearanceId: input.appearanceId,
      metadata: {
        createdFrom: 'character_creator_ui',
      },
    })

    player.emit('characters:created:ok', created.serialize())
  }

  @Server.OnNet('characters:select')
  async selectCharacter(player: Server.Player, payload: { characterId: string }) {
    const selected = await this.characters.select(player, payload.characterId)
    player.emit('characters:selected:ok', selected.serialize())
  }

  @Server.OnNet('characters:update-appearance')
  async updateAppearance(
    player: Server.Player,
    payload: {
      characterId: string
      appearanceId: string
    },
  ) {
    const accountId = player.accountID
    if (!accountId) throw new Error('Player has no account linked')

    const updated = await this.characters.update(accountId, payload.characterId, {
      appearanceId: payload.appearanceId,
    })

    player.emit('characters:updated:ok', updated.serialize())
  }

  @Server.OnLibraryEvent('characters', 'selected')
  onCharacterSelected(payload: { player: Server.Player; character: Character }) {
    // Example: load inventory/faction/session projections
    const { player, character } = payload
    player.emit('characters:projection:ready', { characterId: character.id })
  }
}
```
