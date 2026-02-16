import { CharacterId } from '../types/ids'

export function createCharacterId(): CharacterId {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `char_${time}_${random}`
}
