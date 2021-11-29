import { Question, Operator, GameSettings, QuestionTerm } from '../types/types'

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

type PluralizationOptions = {
  one: string
  few: string
  many: string
}

export function pluralize(count: number, options: PluralizationOptions): string {
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return options.many;
  }

  const lastDigit = count % 10;

  switch (lastDigit) {
    case 0: case 5: case 6: case 7: case 8: case 9: return options.many;
    case 1: return options.one;
    case 2: case 3: case 4: return options.few;
    default: return options.one
  }
}

type GenerateQuestionConfig = {
  gameSettings: GameSettings
  minNumber?: number
  maxNumber?: number
}

function generateQuestionNumbers(min: number, max: number, n: number): number[] {
  const numbers: number[] = [];

  for (let i = 0; i < n; i++) {
    numbers.push(getRandomInt(min, max + 1));
  }

  return numbers;
}

function generateQuestionOperators(n: number, allowedOperators: Operator[]): Operator[] {
  const operators: Operator[] = [];

  for (let i = 0; i < n; i++) {
    const index = getRandomInt(0, allowedOperators.length);

    operators.push(allowedOperators[index]);
  }

  return operators;
}

function generateQuestionTerms(numbers: number[], operators: Operator[]): QuestionTerm[] {
  return numbers.map((number, i) => ({ number, operator: operators[i] }));
}

function generateQuestionHiddenNumbers(difficulty: number, termsNumber: number): number[] {
  const indexesToChoose: number[] = (new Array(termsNumber)).fill(0).map((item, i) => i);
  const hideIndexes: number[] = [];

  for (let i = 0; i < difficulty; i++) {
    const index = getRandomInt(0, indexesToChoose.length);

    hideIndexes.push(indexesToChoose[index]);
    indexesToChoose.splice(index, 1);
  }

  return hideIndexes;
}

function buildQuestionExpression(terms: QuestionTerm[]): string {
  let expression = '';

  for (let i = 0; i < terms.length; i++) {
    expression += terms[i].number + (terms[i].operator ?? '');
  }

  return expression;
}

export function generateQuestion({
  gameSettings,
  minNumber = 1,
  maxNumber = 10
}: GenerateQuestionConfig): Question {
  const numNumbers = gameSettings.difficulty + 1;

  const numbers = generateQuestionNumbers(minNumber, maxNumber, numNumbers);

  const numOperators = numNumbers - 1;

  const operators = generateQuestionOperators(numOperators, gameSettings.operators);

  const terms = generateQuestionTerms(numbers, operators);

  const hideIndexes = generateQuestionHiddenNumbers(gameSettings.difficulty, numNumbers);

  const expression = buildQuestionExpression(terms);

  // eslint-disable-next-line no-new-func
  const answer = (new Function(`return ${expression};`))();

  return {
    numbers,
    operators,
    terms,
    hideIndexes,
    expression,
    answer,
    settings: { ...gameSettings }
  }
}