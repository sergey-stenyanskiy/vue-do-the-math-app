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