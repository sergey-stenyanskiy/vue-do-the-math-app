<template lang="pug">
.game
  .game-header.mb-5
    button.back-button(type="button" @click="goBack")
      SvgIcon.mr-1(name="cross")
      span Отмена
    .timer {{displayedTime}}
  .question-expression.mb-5
    .expression-term(
      v-for="(term, i) in expression"
      :class="[`expression-term-${term.type}`, { 'mr-1': i < expression.length - 1 }]"
    )
      input.input-number(
        type="text"
        v-if="term.type === 'skip'"
        v-model="inputs[term.inputIndex].value"
        :class="{ 'selected': selectedInput === term.inputIndex }"
        :ref="`input${term.inputIndex}`"
        @focus="selectedInput = term.inputIndex"
      )
      span(v-else) {{term.term}}
    span.question-mark ?
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

type State = {
  questions: Question[]
  currentQuestion: number
  startTime: Date
  endTime: Date
  currentTime: Date
  timer: ReturnType<typeof setTimeout> | null
  inputs: { value: string }[]
  selectedInput: number
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
      selectedInput: -1
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
    expression(): ExpressionTerm[] {
      const terms: ExpressionTerm[] = [];

      if (this.question) {
        let inputIndex = 0;

        this.question.terms.forEach((term, i) => {
          const { number, operator } = term;

          if (!this.question.hideIndexes.includes(i)) {
            terms.push({ term: number.toString(), type: 'number' });
          } else {
            terms.push({ term: ' ', type: 'skip', inputIndex: inputIndex++ });
          }

          if (operator) {
            terms.push({ term: operator === '*' ? 'x' : operator, type: 'operator' });
          }
        });

        const answer = this.question.answer.toString();

        terms.push({ term: '=', type: 'equals' });
        terms.push({ term: answer, type: 'answer' });
      }

      return terms;
    }
  },
  mounted() {
    this.attachTimer();

    this.nextQuestion();
  },
  unmounted() {
    this.removeTimer();
  },
  methods: {
    attachTimer() {
      this.timer = setTimeout((function timerfun(this: HasTimer) {
        const time = new Date();

        this.updateTime(time);

        // @ts-ignore
        this.timer = setTimeout(timerfun.bind(this), 1000);
      // @ts-ignore
      }).bind(this), 0);
    },
    removeTimer() {
      if (this.timer) {
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
    focusInput(index: number) {
      const input = this.$refs[`input${index}`] as HTMLInputElement;

      if (input) {
        input.focus();
      }
    },
    handleActionClick(action: ButtonAction) {
      if (action.action === '>') {
        this.setSelectedInput(this.selectedInput + 1);
      }

      if (action.action === '<') {
        this.setSelectedInput(this.selectedInput - 1);
      }
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
</style>