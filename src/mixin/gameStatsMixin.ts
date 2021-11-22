import { defineComponent } from 'vue'

import { GameSession, GameSessionRate } from '@/types/types';

export default defineComponent({
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
    },
    overtimeRate(): GameSessionRate {
      return this.$store.getters.overtimeRate;
    },
    overtimeCorrectAnswers(): number {
      return this.overtimeRate.correct;
    },
    overtimeTotalAnswers(): number {
      return this.overtimeRate.total;
    },
    overtimeCorrectAnswersRate(): number {
      return Math.floor((this.overtimeCorrectAnswers / this.overtimeTotalAnswers) * 100);
    },
  }
})