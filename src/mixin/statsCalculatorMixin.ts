import { defineComponent } from 'vue'

import store from '../store/index'

import GameStatsCalculator from '@/GameStatsCalculator'

export default defineComponent({
  data() {
    return {
      statsCalculator: new GameStatsCalculator(store.state.stats)
    }
  }
})