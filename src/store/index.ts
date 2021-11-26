import { createStore, Commit, Getter, GetterTree } from 'vuex'

import { State, GameSettingsData, GameStat, GameSession, GameSessionData, GameSessionRate, OvertimeStats } from '../types/types'

import uuid from '../util/uuid'

import defaultSettings from '@/constant'

function dumpStats(stats: OvertimeStats) {
  if (!stats.sessions || stats.sessions.length === 0) {
    localStorage.removeItem('stats');
  } else {
    localStorage.setItem('stats', JSON.stringify(stats));
  }
}

const EMPTY_STATS = {
  sessions: []
};

const initialStats = JSON.parse(localStorage.getItem('stats') ?? 'null') ?? EMPTY_STATS;

const INITIAL_STATE: State = {
  previousRoute: '',
  settings: defaultSettings,
  stats: initialStats
}

type SetGameSessionPayload = {
  id: string
  data: GameSessionData
}

type StoreGetters = {
  lastSession: GameSession | null
  currentSession: GameSession | null
  consecutiveDays: number
  sessionFromLast: (number: number) => GameSession | null
}

export default createStore({
  state: INITIAL_STATE,
  mutations: {
    setPreviousRoute(state: State, previousRoute: string) {
      state.previousRoute = previousRoute;
    },
    setSettings(state: State, settings: GameSettingsData) {
      state.settings = { ...state.settings, ...settings };
    },
    addGameStat(state: State, stat: GameStat) {
      const currentSession = state.stats.sessions[state.stats.sessions.length - 1];

      currentSession.stats = [...currentSession.stats, stat];

      if (stat.userAnswerCorrect) {
        currentSession.rate.correct++;
      } else {
        currentSession.rate.incorrect++;
      }

      currentSession.rate.total++;

      dumpStats(state.stats);
    },
    startGameSession(state: State) {
      state.stats.sessions.push({
        id: uuid(),
        stats: [],
        start: new Date(),
        end: null,
        status: 'ongoing',
        rate: {
          total: 0,
          correct: 0,
          incorrect: 0,
        }
      });

      dumpStats(state.stats);
    },
    setGameSession(state: State, { id, data } : SetGameSessionPayload) {
      state.stats.sessions = state.stats.sessions.map((session, i) => {
        if (session.id === id) {
          return {
            ...session,
            ...data
          }
        }

        return session;
      });

      dumpStats(state.stats);
    },
    endGameSession() {}
  },
  actions: {
    setPreviousRoute({ commit }: {commit: Commit}, previousRoute: string) {
      commit('setPreviousRoute', previousRoute);
    },
    setSettings({ commit }: {commit: Commit}, settings: GameSettingsData) {
      commit('setSettings', settings);
    },
    addGameStat({ commit }: {commit: Commit}, stat: GameStat) {
      commit('addGameStat', stat);
    },
    startGameSession({ commit }: {commit: Commit}) {
      commit('startGameSession');
    },
    setGameSession({ commit }: {commit: Commit}, payload: SetGameSessionPayload) {
      commit('setGameSession', payload);
    },
    endGameSession({ commit, getters }: { commit: Commit, getters: StoreGetters }) {
      commit('setGameSession', {
        id: getters.currentSession?.id,
        data: {
          end: new Date(),
          status: 'ended'
        }
      });

      commit('endGameSession');
    }
  },
  getters: {
    lastSession(state: State, getters: StoreGetters): GameSession | null {
      return getters.sessionFromLast(0);
    },
    sessionFromLast(state: State): (number: number) => GameSessionData | null {
      return function getSessionFromLast(number: number): GameSessionData | null {
        return state.stats.sessions[state.stats.sessions.length - 1 - number] ?? null;
      }
    },
    currentSession(state: State, getters: StoreGetters): GameSession | null {
      const last = getters.lastSession;

      return last && last.status === 'ongoing' ? last : null;
    },
    session(state: State): (id: string) => GameSession | null {
      return function sessionById(id: string): GameSession | null {
        return state.stats.sessions.find((session) => session.id === id) ?? null;
      }
    },
  },
  modules: {
  }
})
