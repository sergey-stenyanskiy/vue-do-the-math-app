import { OvertimeStats } from '@/GameStatsCalculator/types'

export type Operators = ['+', '-', '*', '/', '**']

export type Operator = Operators[number]

export type GameSettings = {
  minDifficulty: number,
  maxDifficulty: number,
  minTimeConstraint: number,
  maxTimeConstraint: number,
  timeConstraint: number
  difficulty: number
  operators: Operator[]
}

export type GameSettingsData = Partial<GameSettings>

export type DefaultSettings = {
  minDifficulty: 1,
  maxDifficulty: 5,
  minTimeConstraint: 1,
  maxTimeConstraint: 10,
  timeConstraint: 5
  difficulty: 3
  operators: ['+', '*']
}

export type QuestionTerm = {
  number: number
  operator: Operator
}

export type Question = {
  settings: GameSettings
  numbers: number[]
  operators: string[]
  hideIndexes: number[]
  terms: QuestionTerm[]
  expression: string
  answer: number
}

export type UserAnswer = {
  input: string[]
  value: number | null
}

export type GameStat = {
  question: Question
  userAnswer: UserAnswer | null
  userAnswerCorrect: boolean
}

export type GameStats = GameStat[]

export type GameSessionStatus = 'ongoing' | 'ended';

export type State = {
  previousRoute: string
  settings: GameSettings
  stats: OvertimeStats
}

export type ExpressionTermType = 'number' | 'operator' | 'equals' | 'answer' | 'skip'

export type ExpressionTerm = {
  term: string
  label: string
  type: ExpressionTermType
  inputIndex?: number
}
