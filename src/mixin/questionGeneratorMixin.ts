import { defineComponent } from 'vue'

import QuestionGenerator from '@/QuestionGenerator'

export default defineComponent({
  data() {
    return {
      questionGenerator: new QuestionGenerator()
    }
  }
})