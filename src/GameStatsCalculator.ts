
import { GameSession, GameSessionRate, OvertimeStats } from '@/types/types';

export default class GameStatsCalculator {
  stats: OvertimeStats;

  constructor(stats: OvertimeStats) {
    this.stats = stats;
  }

  lastSession(): GameSession | null {
    return this.sessionFromLast(0);
  }

  sessionFromLast(number: number): GameSession | null {
    return this.stats.sessions[this.stats.sessions.length - 1 - number] ?? null;
  }

  currentSession(): GameSession | null {
    const last = this.lastSession();

    return last && last.status === 'ongoing' ? last : null;
  }

  session(id: string): GameSession | null {
    return this.stats.sessions.find((session) => session.id === id) ?? null;
  }

  overtimeRate(): GameSessionRate {
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

  consecutiveDays(): number {
    let lastSessionTime: Date | null = null;
    let result = 0;

    for (let i = this.stats.sessions.length - 1; i >= 0; i--) {
      const session = this.stats.sessions[i];

      if (!session) return 0;

      if (session.end != null && lastSessionTime != null) {
        if (lastSessionTime.getDay() - session.end.getDay() < 2) {
          result++;

          lastSessionTime = session.end;
        } else {
          return 0;
        }
      }
    }

    return result;
  }

  correctAnswers(): number {
    return this.lastSession()?.rate.correct ?? 0;
  }

  totalAnswers(): number {
    return this.lastSession()?.rate.total ?? 0;
  }

  correctAnswerRate(): number {
    return Math.floor((this.correctAnswers() / this.totalAnswers()) * 100);
  }

  overtimeCorrectAnswers(): number {
    return this.overtimeRate().correct;
  }

  overtimeTotalAnswers(): number {
    return this.overtimeRate().total;
  }

  overtimeCorrectAnswersRate(): number {
    return Math.floor((this.overtimeCorrectAnswers() / this.overtimeTotalAnswers()) * 100);
  }
}