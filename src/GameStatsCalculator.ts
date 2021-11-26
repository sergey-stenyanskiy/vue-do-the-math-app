
import { GameSession, GameSessionRate, OvertimeStats } from '@/types/types';

export default class GameStatsCalculator {
  stats: OvertimeStats;

  constructor(stats: OvertimeStats) {
    this.stats = stats;
  }

  get lastSession(): GameSession | null {
    return this.sessionFromLast(0);
  }

  sessionFromLast(number: number): GameSession | null {
    return this.stats.sessions[this.stats.sessions.length - 1 - number] ?? null;
  }

  get currentSession(): GameSession | null {
    const last = this.lastSession;

    return last && last.status === 'ongoing' ? last : null;
  }

  session(id: string): GameSession | null {
    return this.stats.sessions.find((session) => session.id === id) ?? null;
  }

  get overtimeRate(): GameSessionRate {
    const result: GameSessionRate = {
      correct: 0,
      incorrect: 0,
      total: 0
    };

    this.stats.sessions.forEach((session) => {
      session.stats.forEach((stat) => {
        if (stat.userAnswerCorrect) {
          result.correct++;
        } else {
          result.incorrect++;
        }

        result.total++;
      });
    });

    return result;
  }

  get consecutiveDays(): number {
    let lastSessionTime: Date | null = null;
    let result = 0;

    if (this.stats.sessions.length === 0) {
      return 0;
    }

    for (let i = this.stats.sessions.length - 1; i >= 0; i--) {
      const session = this.stats.sessions[i];

      if (lastSessionTime != null) {
        if (lastSessionTime.getDay() - session.start.getDay() < 2) {
          result++;
        } else {
          return 0;
        }
      }

      lastSessionTime = session.start;
    }

    return result;
  }

  get correctAnswers(): number {
    return this.lastSession?.rate.correct ?? 0;
  }

  get totalAnswers(): number {
    return this.lastSession?.rate.total ?? 0;
  }

  get correctAnswerRate(): number {
    return Math.floor((this.correctAnswers / this.totalAnswers) * 100);
  }

  get overtimeCorrectAnswers(): number {
    return this.overtimeRate.correct;
  }

  get overtimeTotalAnswers(): number {
    return this.overtimeRate.total;
  }

  get overtimeCorrectAnswersRate(): number {
    return Math.floor((this.overtimeCorrectAnswers / this.overtimeTotalAnswers) * 100);
  }
}