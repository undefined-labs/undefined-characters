# Server API

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
