import { GameStats, GameSessionStatus } from '../types/types'

export type GameSessionRate = {
  total: number
  correct: number
  incorrect: number
}

export type GameSession = {
  id: string
  stats: GameStats
  start: Date
  end: Date | null
  rate: GameSessionRate
  status: GameSessionStatus
}

export type GameSessionData = Partial<GameSession>

export type OvertimeStats = {
  sessions: GameSession[]
}
