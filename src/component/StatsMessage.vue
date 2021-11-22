<template lang="pug">
.stats-message
  span Добро пожаловать на {{consecutiveDays}} тренировочный день.&nbsp;
  .notice(v-if="lastSession")
    span Ваш последний результат - решено {{correctAnswers}} из {{totalAnswers}}.&nbsp;
    span Общая точность: {{correctAnswerRate}}%.&nbsp;
  .no-stats(v-else) Нет данных по прошлым игровым сессиям.
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { GameSession } from '../types/types'

export default defineComponent({
  name: 'StatsMessage',
  computed: {
    stats() {
      return this.$store.state.stats;
    },
    consecutiveDays(): number {
      return this.$store.getters.consecutiveDays === 0 ? 'первый' : this.$store.getters.consecutiveDays;
    },
    lastSession(): GameSession | null {
      return this.$store.getters.lastSession;
    },
    correctAnswers(): number {
      return this.lastSession?.rate.correct ?? 0;
    },
    totalAnswers(): number {
      return this.lastSession?.rate.total ?? 0;
    },
    correctAnswerRate(): number {
      return Math.floor((this.correctAnswers / this.totalAnswers) * 100);
    }
  }
})
</script>

<style lang="scss" scoped>

</style>