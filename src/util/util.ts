import { Question, Operator, GameSettings } from '../types/types'

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}

type GenerateQuestionConfig = {
  gameSettings: GameSettings
  minNumber?: number
  maxNumber?: number
}

export function generateQuestion({
  gameSettings,
  minNumber = 1,
  maxNumber = 10
}: GenerateQuestionConfig): Question {
  const numNumbers = gameSettings.difficulty + 1;

  const numbers: number[] = [];

  for (let i = 0; i < numNumbers; i++) {
    numbers.push(getRandomInt(minNumber, maxNumber + 1));
  }

  const numOperators = numNumbers - 1;

  const operators: Operator[] = [];

  for (let i = 0; i < numOperators; i++) {
    const index = getRandomInt(0, gameSettings.operators.length);

    operators.push(gameSettings.operators[index]);
  }

  const terms = numbers.map((number, i) => ({ number, operator: operators[i] }));

  const indexesToChoose: number[] = (new Array(numNumbers)).fill(0).map((item, i) => i);
  const hideIndexes: number[] = [];

  for (let i = 0; i < gameSettings.difficulty; i++) {
    const index = getRandomInt(0, indexesToChoose.length);

    hideIndexes.push(indexesToChoose[index]);
    indexesToChoose.splice(index, 1);
  }

  let expression = '';

  for (let i = 0; i < terms.length; i++) {
    expression += terms[i].number + (terms[i].operator ?? '');
  }

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