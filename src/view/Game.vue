<template lang="pug">
.game
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
| {{questions}}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { GameSettings, Operator } from '../types/types'

import { getRandomInt } from '../util/random'

import RoundButton from '../component/RoundButton.vue'

type Term = {
  number: number
  operator: Operator
}

type Question = {
  settings: GameSettings
  numbers: number[]
  operators: string[]
  hideIndexes: number[]
  terms: Term[]
  expression: string
  answer: number
}

type State = {
  questions: Question[]
  currentQuestion: number
}


export default defineComponent({
  name: "Game",
  components: {
    RoundButton
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
    return {
      questions: [],
      currentQuestion: -1
    };
  },
  computed: {
    digits(): number[] {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    },
    actions(): string[] {
      return ['<', '>', '?', '='];
    },
    settings() {
      return this.$store.state.settings;
    }
  },
  methods: {
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

      // const operatorsToChoose: Operator[] = [...this.settings.operators];
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
</style>