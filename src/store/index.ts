import { createStore, Commit } from 'vuex'

import { State, GameSettingsData, GameStat } from '../types/types'

import defaultSettings from '@/constant'

const INITIAL_STATE: State = {
  previousRoute: '',
  settings: defaultSettings,
  stats: []
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
      state.stats = [...state.stats, stat];
    }
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
    }
  },
  modules: {
  }
})
