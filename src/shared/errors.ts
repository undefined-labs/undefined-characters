export class CharactersError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CharactersError'
  }
}
