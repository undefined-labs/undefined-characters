# Client API

Client API is intentionally minimal.

## Exports

- `CharactersClient`
- `requestCharacterSelect(characterId)`
- `requestCharacterCreate(input)`

## Notes

- This package does not provide UI.
- These helpers only emit server requests through the OpenCore client library bridge.
- Event names emitted to server follow the characters namespace conventions.
- No client-side plugin is exposed for this package. The client surface stays transport-only on purpose.
