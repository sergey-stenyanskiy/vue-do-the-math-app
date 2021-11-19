export type Operators = ['+', '-', '*', '/', '**']

export type Operator = Operators[number]

export type GameSettings = {
  timeConstraint: number
  difficulty: number
  operators: Operator[]
}

export type GameSettingsData = Partial<GameSettings>

export type DefaultSettings = {
  timeConstraint: 5
  difficulty: 3
  operators: ['+', '*']
}

export type State = {
  previousRoute: string
  settings: GameSettings
}

export type QuestionTerm = {
  number: number
  operator: Operator
}

export type ExpressionTermType = 'number' | 'operator' | 'equals' | 'answer' | 'skip'

export type ExpressionTerm = {
  term: string
  label: string
  type: ExpressionTermType
  inputIndex?: number
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
