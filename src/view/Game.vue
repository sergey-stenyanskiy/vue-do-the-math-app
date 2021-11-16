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

import { Operator } from '../types/types'

import RoundButton from '../component/RoundButton.vue'

type State = {
  questions: string[]
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
      questions: []
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
    getRandomInt(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);

      return Math.floor(Math.random() * (max - min)) + min;
    },
    nextQuestion() {
      const minDigit = 1;
      const maxDigit = 10;

      const numDigits = this.settings.difficulty + 1;
      const numOperators = numDigits - 1;

      const digits: number[] = [];
      const operators: Operator[] = [];

      for (let i = 0; i < numDigits; i++) {
        digits.push(this.getRandomInt(minDigit, maxDigit + 1));
      }

      for (let i = 0; i < numOperators; i++) {
        const index = this.getRandomInt(0, this.settings.operators.length);

        operators.push(this.settings.operators[index]);
      }

      const terms = digits.map((digit, i) => ({ digit, operator: operators[i] }));

      let acum = '';

      for (let i = 0; i < terms.length; i++) {
        acum += terms[i].digit.toString();

        if (terms[i].operator) {
          acum += terms[i].operator;
        }
      }

      this.questions.push(acum);
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