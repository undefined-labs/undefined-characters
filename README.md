# @open-core/characters

Reusable Characters domain library for OpenCore.

This package provides:

- Character CRUD service logic
- Active character selection bound to `Player` runtime metadata
- Slot policy abstraction (`CharacterSlotPolicyContract`)
- Deletion policy abstraction (`CharacterDeletionPolicyContract`)
- Internal library events through OpenCore Library API
- Optional external bridge events (`emitExternal`)

This package intentionally does not include UI, gameplay situations, concrete database adapters, or appearance customization logic.

## Installation

```bash
pnpm add @open-core/characters
```

## Entry Points

- `@open-core/characters/server`
- `@open-core/characters/client`
- `@open-core/characters/shared`

## Server Integration

### 1) Provide a store implementation

The store is required and must implement `CharacterStoreContract`.

```ts
import { CharacterStoreContract } from '@open-core/characters/shared'

class MyCharacterStore extends CharacterStoreContract {
  async listByAccount(accountId) { /* ... */ }
  async getById(characterId) { /* ... */ }
  async create(character) { /* ... */ }
  async update(character) { /* ... */ }
  async delete(characterId) { /* ... */ }
}
```

### 2) Configure and install module

```ts
import { CharactersModule } from '@open-core/characters/server'

CharactersModule.setStore(new MyCharacterStore())
CharactersModule.install({
  baseSlots: 3,
  bridgeExternalEvents: false,
})
```

### 3) Resolve and use service

```ts
import { CharactersModule } from '@open-core/characters/server'

const characters = CharactersModule.resolveService()
```

## Internal Events

Event hub: `CharactersEvents`.

Internal events emitted by the library:

- `created` -> `{ character }`
- `updated` -> `{ character }`
- `deleted` -> `{ characterId, accountId }`
- `selected` -> `{ player, character }`
- `unselected` -> `{ player, characterId }`

Example:

```ts
import { CharactersEvents } from '@open-core/characters/server'

CharactersEvents.on('created', ({ character }) => {
  // internal reaction
})
```

## Optional External Bridge

When `bridgeExternalEvents: true` is used, the module also emits minimal cross-resource events with namespaced event ids:

- `opencore:characters:created`
- `opencore:characters:updated`
- `opencore:characters:deleted`
- `opencore:characters:selected`
- `opencore:characters:unselected`

These external payloads are stable and intentionally minimal.

## Active Character Metadata

The selected character is stored in player metadata key:

`opencore.characters.active`

Use `CharactersService.getActive(player)` and `CharactersService.clearActive(player)` to manage this state.

## Client Helpers

Client helper surface is minimal and transport-focused:

- `CharactersClient`
- `requestCharacterSelect(characterId)`
- `requestCharacterCreate(input)`

No UI is included.

## Documentation

Additional docs are available in [`docs/`](./docs):

- [Architecture](./docs/architecture.md)
- [Server API](./docs/server-api.md)
- [Client API](./docs/client-api.md)
- [Events](./docs/events.md)
