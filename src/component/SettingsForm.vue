<template lang="pug">
form#settings-form(@submit.prevent="handleSubmit")
  h4 Настройки
  input#settings-time-constraint(
    type="range"
    :min="settings.minTimeConstraint"
    :max="settings.maxTimeConstraint"
    step="1" v-model="timeConstraint"
  )
  label(for="time-constraint") Длительность: {{timeConstraint}} {{minutesInflection(timeConstraint)}}
  .mb-2
  input#settings-difficulty(
    type="range"
    :min="settings.minDifficulty"
    :max="settings.maxDifficulty"
    step="1"
    v-model="difficulty"
  )
  label(for="difficulty") Сложность: {{difficulty}}
  .mb-2
  .operators
    .operator(v-for="operator in operatorOptions")
      input(type="checkbox" :value="operator.operator" v-model="operators")
      .mr-1
      | {{operator.label}}
  .mb-3
  .actions
    button.button(type="submit") Начать
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { GameSettings, Operator } from '../types/types'

import defaultSettings from "../constant/index"

type State = GameSettings

type OperatorOption = {
  operator: Operator,
  label: string
}

const OPERATOR_OPTIONS: OperatorOption[] = [
  {
    operator: '+',
    label: 'Сложение'
  },
  {
    operator: '-',
    label: 'Вычитание'
  },
  {
    operator: '*',
    label: 'Умножение'
  },
  {
    operator: '/',
    label: 'Деление'
  },
  {
    operator: '**',
    label: 'Возведение в степень'
  },
];

export default defineComponent({
  name: 'SettingsForm',
  data(): State {
    return {
      ...defaultSettings
    }
  },
  computed: {
    operatorOptions(): OperatorOption[] {
      return OPERATOR_OPTIONS;
    },
    settings(): GameSettings {
      return this.$store.state.settings;
    }
  },
  methods: {
    minutesInflection(numMinutes: number): string {
      const lastTwoDigits = numMinutes % 100;

      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'минут';
      }

      const lastDigit = numMinutes % 10;

      switch (lastDigit) {
        case 0: case 5: case 6: case 7: case 8: case 9: return 'минут';
        case 1: return 'минута';
        case 2: case 3: case 4: return 'минуты';
        default: return 'минут'
      }
    },
    handleSubmit() {
      this.$store.dispatch('setSettings', {
        timeConstraint: +this.timeConstraint,
        difficulty: +this.difficulty,
        operators: [...this.operators]
      });

      this.$router.push({ name: 'Game' });
    }
  }
})
</script>

<style lang="scss" scoped>
#settings-form {
  display: flex;
  flex-direction: column;
}

.operator {
  display: flex;
  flex-direction: row;
}

input[type="range"] {
  width: 250px;
  margin: 0;
  margin-bottom: 4px;
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: end;
}

.button {
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
</style>