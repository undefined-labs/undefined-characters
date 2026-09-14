# Events

`@undefined-labs/characters` emits internal domain events through `CharactersEvents`.

## Internal Events

- `created`: `{ character }`
- `updated`: `{ character }`
- `deleted`: `{ characterId, accountId }`
- `selected`: `{ player, character }`
- `unselected`: `{ player, characterId }`

These are emitted via `CharactersEvents.emit(...)`.

## External Bridge Events (Optional)

When module option `bridgeExternalEvents` is enabled, the library emits external namespaced events:

- `opencore:characters:created`
- `opencore:characters:updated`
- `opencore:characters:deleted`
- `opencore:characters:selected`
- `opencore:characters:unselected`

These are emitted via `CharactersEvents.emitExternal(...)` with minimal stable payloads.

## Listening Internally

```ts
import { CharactersEvents } from '@undefined-labs/characters/server'

CharactersEvents.on('selected', ({ player, character }) => {
  // internal runtime orchestration
})
```
