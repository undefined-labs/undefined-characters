# Architecture

`@undefined-labs/characters` is structured into three layers:

- `shared/`: domain model, ids, DTOs, contracts, and constants
- `server/`: event hub, policies, plugin/module wiring, and `CharactersService`
- `client/`: minimal helper functions to emit server requests

## Design Goals

- Keep domain contracts framework-agnostic in `shared/`
- Keep server runtime logic in `server/`
- Keep client surface transport-only
- Avoid coupling to specific persistence, identity, or UI systems

## Contracts-First Approach

The package relies on integrator-provided persistence through `CharacterStoreContract`.
Slot and deletion behavior are policy-driven through explicit contracts.

Defaults provided by the server module:

- `FixedSlotPolicy`
- `DefaultDeletionPolicy`

## Events Model

The package uses OpenCore Library API events through `createServerLibrary('characters')`.

Internal orchestration is done with `CharactersEvents.emit(...)`.
Optional external bridge events are published with `CharactersEvents.emitExternal(...)`.

Server integration is plugin-first (`charactersServerPlugin(...)`) with module compatibility retained for existing consumers.
