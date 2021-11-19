<template lang="pug">
.game
  .game-header.mb-5
    button.back-button(type="button" @click="goBack")
      SvgIcon.mr-1(name="cross")
      span Отмена
    .timer {{displayedTime}}
  .question-expression.mb-5(v-if="question")
    .expression-term.mr-1(
      v-for="(term, i) in questionExpression"
      :class="`expression-term-${term.type}`"
    )
      input.input-number(
        type="text"
        v-if="term.type === 'skip'"
        v-model="inputs[term.inputIndex].value"
        :class="{ 'selected': selectedInput === term.inputIndex }"
        :ref="`input${term.inputIndex}`"
        @focus="selectedInput = term.inputIndex, $event.currentTarget.select()"
      )
      span(v-else) {{term.label}}
    .expression-term.expression-equals =
    .mr-1
    .expression-term.expression-answer {{question.answer}}
    span.question-mark(v-if="!questionCompleted") ?
  .controls
    .control-item(v-for="action in buttonActions")
      .digit(v-if="action.type === 'digit'")
        RoundButton(@click="handleActionClick(action)" size="45px")
          template(v-slot:child) {{action.action}}
      .action(v-else-if="action.type === 'action'")
        RoundButton(
            @click="handleActionClick(action)"
            size="45px"
            variant="grey"
          )
            template(v-slot:child) {{action.action}}
button(@click="nextQuestion") Next
teleport(to="body")
  .message
    transition(name="fade-bubble")
      .alert-message.alert-message-info.alert-message-bad-input(v-if="showBadInput")
        | Неверное выражение
    transition(name="fade-bubble")
      .alert-message.alert-message-danger.alert-message-incorrect-answer(v-if="showAnswerIncorrect")
        | Неверный ответ!
    transition(name="fade-bubble")
      .alert-message.alert-message-success.alert-message-correct-answer(v-if="showAnswerCorrect")
        | Правильный ответ!
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { GameSettings, Operator } from '../types/types'

import { getRandomInt } from '../util/random'

import SvgIcon from '../component/SvgIcon.vue'
import RoundButton from '../component/RoundButton.vue'

type QuestionTerm = {
  number: number
  operator: Operator
}

type ExpressionTermType = 'number' | 'operator' | 'equals' | 'answer' | 'skip'

type ExpressionTerm = {
  term: string
  label: string
  type: ExpressionTermType
  inputIndex?: number
}

type Question = {
  settings: GameSettings
  numbers: number[]
  operators: string[]
  hideIndexes: number[]
  terms: QuestionTerm[]
  expression: string
  answer: number
}

type UserAnswer = {
  input: string[]
  value: number | null
}

type State = {
  questions: Question[]
  currentQuestion: number
  startTime: Date
  endTime: Date
  currentTime: Date
  timer: ReturnType<typeof setTimeout> | null
  inputs: { value: string }[]
  selectedInput: number
  showAnswerCorrect: boolean
  showAnswerIncorrect: boolean
  showBadInput: boolean
  questionCompleted: boolean
  userAnswer: UserAnswer
}

type HasTimer = {
  updateTime: (date: Date) => void
  timer: ReturnType<typeof setTimeout>
}

type ButtonAction = {
  action: string
  type: 'digit' | 'blank' | 'action'
}


export default defineComponent({
  name: "Game",
  components: {
    RoundButton,
    SvgIcon
  },
  beforeRouteLeave(
    from,
    to,
    next
  ) {
    this.$store.dispatch('setPreviousRoute', this.$route.fullPath);

    next();
  },
  data(): State {
    const { timeConstraint } = this.$store.state.settings;

    const startTime = new Date();

    const endTime = new Date(startTime.getTime());
    endTime.setMinutes(endTime.getMinutes() + timeConstraint);

    return {
      questions: [],
      currentQuestion: -1,
      startTime,
      endTime,
      currentTime: startTime,
      timer: null,
      inputs: [],
      selectedInput: -1,
      showAnswerCorrect: false,
      showAnswerIncorrect: false,
      showBadInput: false,
      questionCompleted: false,
      userAnswer: {
        input: [],
        value: null
      }
    };
  },
  computed: {
    timeLeft(): Date {
      return new Date(this.endTime.getTime() - this.currentTime.getTime());
    },
    displayedTime(): string {
      const minutes = this.timeLeft.getMinutes();
      const seconds = this.timeLeft.getSeconds();

      return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    },
    buttonActions(): ButtonAction[] {
      return [
        { action: '1', type: 'digit' },
        { action: '2', type: 'digit' },
        { action: '3', type: 'digit' },
        { action: '<', type: 'action' },
        { action: '4', type: 'digit' },
        { action: '5', type: 'digit' },
        { action: '6', type: 'digit' },
        { action: '>', type: 'action' },
        { action: '7', type: 'digit' },
        { action: '8', type: 'digit' },
        { action: '9', type: 'digit' },
        { action: '?', type: 'action' },
        { action: '', type: 'blank' },
        { action: '0', type: 'digit' },
        { action: '', type: 'blank' },
        { action: '=', type: 'action' },
      ];
    },
    digits(): number[] {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    },
    actions(): string[] {
      return ['<', '>', '?', '='];
    },
    settings(): GameSettings {
      return this.$store.state.settings;
    },
    question(): Question {
      return this.questions[this.currentQuestion];
    },
    // TODO переименовать, questionExpressionTerms
    questionExpression(): ExpressionTerm[] {
      const terms: ExpressionTerm[] = [];

      if (this.question) {
        let inputIndex = 0;

        this.question.terms.forEach((term, i) => {
          const { number, operator } = term;

          if (number) {
            const numTerm = number.toString();

            if (this.questionCompleted) {
              if (this.userAnswerCorrect) {
                const answerTerm = this.userAnswer.input[inputIndex++];

                terms.push({ term: answerTerm, label: answerTerm, type: 'number' });
              } else {
                terms.push({ term: numTerm, label: numTerm, type: 'number' });
              }
            } else if (this.question.hideIndexes.includes(i)) {
              terms.push({ term: ' ', label: ' ', type: 'skip', inputIndex: inputIndex++ });
            } else {
              terms.push({ term: numTerm, label: numTerm, type: 'number' });
            }
          }

          if (operator) {
            terms.push({
              term: operator,
              label: operator === '*' ? 'x' : operator,
              type: 'operator'
            });
          }
        });
      }

      return terms;
    },
    userAnswerExpression(): string | null {
      if (!this.validateUserInput()) {
        return null;
      }

      let answerExpression = "";

      const questionExpression = this.questionExpression;

      for (const term of questionExpression) {
        if (term.inputIndex != null) {
          answerExpression += this.inputs[term.inputIndex].value;
        } else {
          answerExpression += term.term;
        }
      }

      return answerExpression;
    },
    userAnswerValue(): number | null {
      const expr = this.userAnswerExpression;

      if (expr) {
        // eslint-disable-next-line no-new-func
        const calc = new Function(`return ${expr};`);

        return calc();
      }

      return null;
    },
    userAnswerCorrect(): boolean {
      return this.userAnswerValue === this.question.answer;
    }
  },
  mounted() {
    this.attachTimer();

    this.nextQuestion();

    this.$nextTick(() => this.resetInputState());
  },
  unmounted() {
    this.removeTimer();
  },
  methods: {
    completeQuestion() {
      this.questionCompleted = true;
    },
    toggleShowBadInput() {
      this.showBadInput = true;

      setTimeout(() => { this.showBadInput = false; }, 1500);
    },
    toggleShowAnswerCorrect() {
      this.showAnswerCorrect = true;

      setTimeout(() => { this.showAnswerCorrect = false; }, 1500);
    },
    toggleShowAnswerInсorrect() {
      this.showAnswerIncorrect = true;

      setTimeout(() => { this.showAnswerIncorrect = false; }, 1500);
    },
    validateUserInput(): boolean {
      for (const { value } of this.inputs) {
        if (!value || value === '' || Number.isNaN(+value)) {
          return false;
        }
      }

      return true;
    },
    saveUserAnswer() {
      if (this.validateUserInput()) {
        this.userAnswer.input = this.inputs.map((input) => input.value);
        this.userAnswer.value = this.userAnswerValue;
      }
    },
    checkUserAnswer() {
      if (this.userAnswerValue) {
        if (this.userAnswerCorrect) {
          this.toggleShowAnswerCorrect();

          this.completeQuestion();
        } else {
          this.toggleShowAnswerInсorrect();
        }
      } else {
        this.toggleShowBadInput();
      }
    },
    // TODO переименовать
    attachTimer() {
      this.timer = setTimeout((function timerfun(this: HasTimer) {
        const time = new Date();

        this.updateTime(time);

        // @ts-ignore
        this.timer = setTimeout(timerfun.bind(this), 1000);
      // @ts-ignore
      }).bind(this), 0);
    },
    // TODO переименовать
    removeTimer() {
      if (this.timer) {
        // TODO ошибка при построении проекта -- несоответствие типов аргумента clearTimeout и
        // this.timer; найти способ корректного разрешения определений typescript

        // clearTimeout(this.timer);
      }
    },
    updateTime(time: Date) {
      this.currentTime = new Date(time.getTime());
    },
    goBack() {
      if (this.$store.state.previousRoute !== '') {
        this.$router.push(this.$store.state.previousRoute);
      } else {
        this.$router.push({ name: 'Home' });
      }
    },
    setSelectedInput(index: number) {
      this.selectedInput = Math.max(0, Math.min(this.inputs.length - 1, index));

      this.focusInput(this.selectedInput);
    },
    // TODO дать более осмысленное имя
    focusInput(index: number) {
      const input = this.$refs[`input${index}`] as HTMLInputElement;

      if (input) {
        input.focus();
      }
    },
    // TODO вынести логику обработки действия в отдельный метод
    handleActionClick(action: ButtonAction) {
      if (action.action === '>') {
        this.setSelectedInput(this.selectedInput + 1);
      }

      if (action.action === '<') {
        this.setSelectedInput(this.selectedInput - 1);
      }

      if (action.type === 'digit') {
        this.inputs[this.selectedInput].value += action.action;
      }

      if (action.action === '=') {
        this.checkUserAnswer();
      }

      if (action.action === '?') {
        this.completeQuestion();
      }

      this.focusInput(this.selectedInput);
    },
    nextQuestion() {
      const question = this.generateNextQuestion();

      this.questions.push(question);
      this.currentQuestion++;

      this.resetInputState();
    },
    resetInputState() {
      for (let i = 0; i < this.question.hideIndexes.length; i++) {
        this.inputs[i] = { value: "" };
      }

      this.selectedInput = 0;

      this.focusInput(0);
    },
    // TODO сделать функцию генерации вопроса независимой от компонента, необходимые параметры
    // генерации передавать в аргументах
    // TODO возможно вынести в отдельный файл
    generateNextQuestion(): Question {
      const minNumber = 1;
      const maxNumber = 10;

      const numNumbers = this.settings.difficulty + 1;

      const numbers: number[] = [];

      for (let i = 0; i < numNumbers; i++) {
        numbers.push(getRandomInt(minNumber, maxNumber + 1));
      }

      const numOperators = numNumbers - 1;

      const operators: Operator[] = [];

      for (let i = 0; i < numOperators; i++) {
        const index = getRandomInt(0, this.settings.operators.length);

        operators.push(this.settings.operators[index]);
      }

      const terms = numbers.map((number, i) => ({ number, operator: operators[i] }));

      const indexesToChoose: number[] = (new Array(numNumbers)).fill(0).map((item, i) => i);
      const hideIndexes: number[] = [];

      for (let i = 0; i < this.settings.difficulty; i++) {
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
        settings: { ...this.settings }
      }
    },
  }
})
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 16px;
  height: 16px;
}

.game {
  display: flex;
  flex-direction: column;
  align-items: center;

  font-family: arial;
}

.game-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.back-button {
  outline: none;
  text-transform: uppercase;
  margin: 0;
  padding: 8px 16px;
  font-family: arial;
  color: #78909C;
  border: none;
  border-radius: 2px;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 2px 1px #B0BEC5;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.timer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  background: #FAFAFA;
  color: #78909C;
  width: 75px;
  padding: 4px;
  border: 1px solid #C5CAE9;
}

.input-number {
  width: 30px;
  overflow: hidden;
  padding: 4px;
  border: none;
  outline: none;

  border-radius: 0;
  border-bottom: 1px solid #c0c0c0;

  box-shadow: 0 0 2px 1px rgba(0,0,0,0);

  transition: box-shadow, background-color, border-bottom, 0.2s linear;
}

.input-number:focus, .input-number.selected {
  border-radius: 2px;
  border-bottom: 1px solid transparent;

  background: #fafafa;
  box-shadow: 0 0 2px 1px rgba(0,0,0,0.2);
}

.controls {
  width: 400px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.control-item {
  flex: 0 0 25%;
  padding-bottom: 16px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.digits {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.actions {
  display: flex;
  flex-direction: column;
}

.question-expression {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  font-size: 1.18em;
}

.expression-term, .question-mark {
  color: #c0c0c0;
}

.expression-term-number {
  color: black;
  font-weight: 700;
}

.message {
  position: relative;
}

.alert-message {
  font-family: arial;
  font-size: 1.05em;
  border-radius: 4px;
  padding: 8px 16px;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  width: 180px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-message-success {
  border: 1px solid #43A047;
  color: #43A047;
  background: #C8E6C9;
}

.alert-message-info {
  border: 1px solid #E65100;
  color: #E65100;
  background: #FFF8E1;
}

.alert-message-danger {
  border: 1px solid #C62828;
  color: #C62828;
  background: #FFEBEE;
}

.fade-bubble-enter-from {
  opacity: 0;
  top: 4px;
}

.fade-bubble-leave-to {
  opacity: 0;
}

.fade-bubble-leave-from, .fade-bubble-enter-to {
  opacity: 1;
  top: 0;
}

.fade-bubble-enter-active, .fade-bubble-leave-active {
  transition: opacity, 0.1s ease-in;
}
</style>