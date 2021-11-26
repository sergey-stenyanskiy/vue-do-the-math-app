<template lang="pug">
.stats-message
  span Добро пожаловать на {{consecutiveDays}} тренировочный день.&nbsp;
  .notice(v-if="lastSession")
    span Ваш последний результат - решено {{correctAnswers}} из {{totalAnswers}}.
    .mb-1
    span Общая точность: {{overtimeCorrectAnswersRate}}%.&nbsp;
  .no-stats(v-else) Нет данных по прошлым игровым сессиям.
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import gameStatsMixin from '../mixin/statsCalculatorMixin'

export default defineComponent({
  name: 'StatsMessage',
  mixins: [gameStatsMixin],
  computed: {
    consecutiveDays(): string {
      const days = this.statsCalculator.consecutiveDays();

      return days === 0 ? 'первый' : days.toString();
    },
    lastSession() {
      return this.statsCalculator.lastSession();
    },
    correctAnswers() {
      return this.statsCalculator.correctAnswers();
    },
    totalAnswers() {
      return this.statsCalculator.totalAnswers();
    },
    overtimeCorrectAnswersRate() {
      return this.statsCalculator.overtimeCorrectAnswersRate();
    },
  }
})
</script>

<style lang="scss" scoped>

</style>