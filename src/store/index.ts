import { createStore, Commit } from 'vuex'

import { State } from '../types/types'

const INITIAL_STATE: State = {
  previousRoute: ''
}

export default createStore({
  state: INITIAL_STATE,
  mutations: {
    setPreviousRoute(state: State, previousRoute: string) {
      state.previousRoute = previousRoute;
    }
  },
  actions: {
    setPreviousRoute({ commit }: {commit: Commit}, previousRoute: string) {
      commit('setPreviousRoute', previousRoute);
    }
  },
  modules: {
  }
})
