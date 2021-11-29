import { getRandomInt } from './util/util';

import { Operator, QuestionTerm, Question, GameSettings } from './types/types'

type GenerateQuestionConfig = {
  gameSettings: GameSettings
  minNumber?: number
  maxNumber?: number
}

export default class QuestionGenerator {
  // eslint-disable-next-line class-methods-use-this
  private generateQuestionNumbers(min: number, max: number, n: number): number[] {
    const numbers: number[] = [];

    for (let i = 0; i < n; i++) {
      numbers.push(getRandomInt(min, max + 1));
    }

    return numbers;
  }

  // eslint-disable-next-line class-methods-use-this
  private generateQuestionOperators(n: number, allowedOperators: Operator[]): Operator[] {
    const operators: Operator[] = [];

    for (let i = 0; i < n; i++) {
      const index = getRandomInt(0, allowedOperators.length);

      operators.push(allowedOperators[index]);
    }

    return operators;
  }

  // eslint-disable-next-line class-methods-use-this
  private generateQuestionTerms(numbers: number[], operators: Operator[]): QuestionTerm[] {
    return numbers.map((number, i) => ({ number, operator: operators[i] }));
  }

  // eslint-disable-next-line class-methods-use-this
  private generateQuestionHiddenNumbers(difficulty: number, termsNumber: number): number[] {
    const indexesToChoose: number[] = (new Array(termsNumber)).fill(0).map((item, i) => i);
    const hideIndexes: number[] = [];

    for (let i = 0; i < difficulty; i++) {
      const index = getRandomInt(0, indexesToChoose.length);

      hideIndexes.push(indexesToChoose[index]);
      indexesToChoose.splice(index, 1);
    }

    return hideIndexes;
  }

  // eslint-disable-next-line class-methods-use-this
  private buildQuestionExpression(terms: QuestionTerm[]): string {
    let expression = '';

    for (let i = 0; i < terms.length; i++) {
      expression += terms[i].number + (terms[i].operator ?? '');
    }

    return expression;
  }

  generateQuestion({
    gameSettings,
    minNumber = 1,
    maxNumber = 10
  }: GenerateQuestionConfig): Question {
    const numNumbers = gameSettings.difficulty + 1;

    const numbers = this.generateQuestionNumbers(minNumber, maxNumber, numNumbers);

    const numOperators = numNumbers - 1;

    const operators = this.generateQuestionOperators(numOperators, gameSettings.operators);

    const terms = this.generateQuestionTerms(numbers, operators);

    const hideIndexes = this.generateQuestionHiddenNumbers(gameSettings.difficulty, numNumbers);

    const expression = this.buildQuestionExpression(terms);

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
}
