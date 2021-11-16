import { createStore, Commit } from 'vuex'

import { State, GameSettingsData } from '../types/types'

import defaultSettings from '@/constant'

const INITIAL_STATE: State = {
  previousRoute: '',
  settings: defaultSettings
}

export default createStore({
  state: INITIAL_STATE,
  mutations: {
    setPreviousRoute(state: State, previousRoute: string) {
      state.previousRoute = previousRoute;
    },
    setSettings(state: State, settings: GameSettingsData) {
      state.settings = { ...settings, ...state.settings };
    }
  },
  actions: {
    setPreviousRoute({ commit }: {commit: Commit}, previousRoute: string) {
      commit('setPreviousRoute', previousRoute);
    },
    setSettings({ commit }: {commit: Commit}, settings: GameSettingsData) {
      commit('setSettings', settings);
    }
  },
  modules: {
  }
})
