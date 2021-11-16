<template lang="pug">
form#settings-form(@submit.prevent="handleSubmit")
  h4 Настройки
  input#settings-time-constraint(type="range" min="1" max="10" step="1" v-model="timeConstraint")
  .mb-1
  label(for="time-constraint") Длительность {{timeConstraint}} минут
  .mb-1
  input#settings-difficulty(type="range" min="1" max="10" step="1" v-model="difficulty")
  .mb-1
  label(for="difficulty") Сложность {{difficulty}}
  .operators
    .operator(v-for="operator in operatorOptions")
      input(type="checkbox" :value="operator.operator" v-model="operators")
      .mr-1
      | {{operator.label}}
  button(type="submit") Начать
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

export default defineComponent({
  name: 'SettingsForm',
  data(): State {
    return {
      ...defaultSettings
    }
  },
  computed: {
    operatorOptions(): OperatorOption[] {
      return [
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
      ]
    }
  },
  methods: {
    handleSubmit() {
      this.$store.dispatch('setSettings', {
        timeConstraint: this.timeConstraint,
        difficulty: this.difficulty,
        operators: [...this.operators]
      });

      this.$router.push({ name: 'Game' });
    }
  }
})
</script>

<style lang="scss" scoped>
.operator {
  display: flex;
  flex-direction: row;
}
</style>