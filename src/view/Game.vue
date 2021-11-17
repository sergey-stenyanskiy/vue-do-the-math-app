<template lang="pug">
.game
  .game-header.mb-5
    button.back-button(type="button" @click="goBack")
      SvgIcon.mr-1(name="cross")
      span Отмена
    .timer {{displayedTime}}
  .question-expression.mb-5
    span.expression-term(
      v-for="(term, i) in expression"
      :class="[`expression-term-${term.type}`, { 'mr-1': i < expression.length - 1 }]"
    ) {{term.term}}
    span.question-mark ?
  .controls
    .digits
      .digit(v-for="digit in digits")
        RoundButton(@click="handleDigitClick(digit)" size="45px")
          template(v-slot:child) {{digit}}
    .actions
      .action(v-for="action in actions")
        RoundButton(
          @click="handleActionClick(action)"
          size="45px"
          variant="grey"
        )
          template(v-slot:child) {{action}}
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
}

type HasTimer = {
  updateTime: (date: Date) => void
  timer: ReturnType<typeof setTimeout>
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
      timer: null
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
        this.question.terms.forEach((term, i) => {
          const { number, operator } = term;

          if (!this.question.hideIndexes.includes(i)) {
            terms.push({ term: number.toString(), type: 'number' });
          } else {
            terms.push({ term: ' ', type: 'skip' });
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
    handleDigitClick(digit: number) {
    },
    handleActionClick(action: string) {
    },
    nextQuestion() {
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

      this.questions.push({
        numbers,
        operators,
        terms,
        hideIndexes,
        expression,
        answer,
        settings: { ...this.settings }
      });

      this.currentQuestion++;
    }
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

.controls {
  width: 400px;
  display: flex;
  flex-direction: row;
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

.action {
  padding-bottom: 16px;
}

.digit {
  flex: 0 0 33.33%;
  padding-bottom: 16px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
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

.expression-term-skip {
  width: 20px;
  height: 1em;
  border-bottom: 1px solid #c0c0c0;
}

</style>