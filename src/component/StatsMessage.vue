<template lang="pug">
.stats-message
  span Добро пожаловать на {{consecutiveDays}} тренировочный день.
  span Ваш последний результат - решено {{correctAnswers}} из {{totalAnswers}}
  span Общая точность: {{correctAnswerRate}}%
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { GameStat } from '../types/types'

export default defineComponent({
  name: 'StatsMessage',
  computed: {
    stats() {
      return this.$store.state.stats;
    },
    consecutiveDays(): number {
      return 10;
    },
    lastSessionStat(): GameStat | null {
      return this.stats[this.stats.length - 1];
    },
    correctAnswers(): number {
      return 10;
    },
    totalAnswers(): number {
      return 10;
    },
    correctAnswerRate(): number {
      return Math.floor(this.correctAnswers / this.totalAnswers) * 100;
    }
  }
})
</script>

<style lang="scss" scoped>

</style>