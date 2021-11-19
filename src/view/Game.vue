<template lang="pug">
.game
  .game-header.mb-5
    .game-header-left
      button.button(type="button" @click="goBack")
        SvgIcon.mr-1(name="cross")
        span Отмена
      .mr-1
      button.button(type="button" @click="nextQuestion" v-if="questionCompleted")
        span Следующий вопрос
    .timer {{displayedTime}}
  .question-expression.mb-5(v-if="question")
    .expression-term.mr-1(
      v-for="(term, i) in questionExpressionTerms"
      :class="`expression-term-${term.type}`"
    )
      input.input-number(
        type="text"
        v-if="term.type === 'skip'"
        v-model="inputs[term.inputIndex].value"
        :class="{ 'selected': selectedInput === term.inputIndex }"
        :ref="`input${term.inputIndex}`"
        @focus="selectedInput = term.inputIndex, $event.currentTarget.select()"
      )
      span(v-else) {{term.label}}
    .expression-term.expression-equals =
    .mr-1
    .expression-term.expression-answer {{question.answer}}
    span.question-mark(v-if="!questionCompleted") ?
  .controls
    .control-item(v-for="action in buttonActions")
      .digit(v-if="action.type === 'digit'")
        RoundButton(
          @click="handleActionClick(action)"
          size="45px"
          :disabled="questionCompleted"
        )
          template(v-slot:child) {{action.action}}
      .action(v-else-if="action.type === 'action'")
        RoundButton(
            @click="handleActionClick(action)"
            size="45px"
            variant="blue-grey"
            :disabled="questionCompleted"
          )
            template(v-slot:child) {{action.action}}
teleport(to="body")
  .message
    transition(name="fade-bubble")
      .alert-message.alert-message-info.alert-message-bad-input(v-if="showGiveUpOnQuestion")
        | Показан верный ответ
    transition(name="fade-bubble")
      .alert-message.alert-message-warning.alert-message-bad-input(v-if="showBadInput")
        | Неверное выражение
    transition(name="fade-bubble")
      .alert-message.alert-message-danger.alert-message-incorrect-answer(v-if="showAnswerIncorrect")
        | Неверный ответ!
    transition(name="fade-bubble")
      .alert-message.alert-message-success.alert-message-correct-answer(v-if="showAnswerCorrect")
        | Правильный ответ!
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { GameSettings, Question, UserAnswer, GameStats, ExpressionTerm } from '../types/types'

import { generateQuestion } from '../util/util'

import SvgIcon from '../component/SvgIcon.vue'
import RoundButton from '../component/RoundButton.vue'

type State = {
  questions: Question[]
  currentQuestion: number
  startTime: Date
  endTime: Date
  currentTime: Date
  gameTimer: number
  messageTimer: number
  inputs: { value: string }[]
  selectedInput: number
  showGiveUpOnQuestion: boolean
  showAnswerCorrect: boolean
  showAnswerIncorrect: boolean
  showBadInput: boolean
  questionCompleted: boolean
  stats: GameStats
}

type ButtonAction = {
  action: string
  type: 'digit' | 'blank' | 'action'
}

export default defineComponent({
  name: "Game",
  components: {
    RoundButton,
    SvgIcon
  },
  beforeRouteLeave(
    from,
    to,
    next
  ) {
    this.$store.dispatch('setPreviousRoute', this.$route.fullPath);

    next();
  },
  data(): State {
    const { timeConstraint } = this.$store.state.settings;

    const startTime = new Date();

    const endTime = new Date(startTime.getTime());
    endTime.setMinutes(endTime.getMinutes() + timeConstraint);

    return {
      questions: [],
      currentQuestion: -1,
      startTime,
      endTime,
      currentTime: startTime,
      gameTimer: -1,
      messageTimer: -1,
      inputs: [],
      selectedInput: -1,
      showGiveUpOnQuestion: false,
      showAnswerCorrect: false,
      showAnswerIncorrect: false,
      showBadInput: false,
      questionCompleted: false,
      stats: []
    };
  },
  computed: {
    timeLeft(): Date {
      return new Date(this.endTime.getTime() - this.currentTime.getTime());
    },
    displayedTime(): string {
      const minutes = this.timeLeft.getMinutes();
      const seconds = this.timeLeft.getSeconds();

      return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    },
    buttonActions(): ButtonAction[] {
      return [
        { action: '1', type: 'digit' },
        { action: '2', type: 'digit' },
        { action: '3', type: 'digit' },
        { action: '<', type: 'action' },
        { action: '4', type: 'digit' },
        { action: '5', type: 'digit' },
        { action: '6', type: 'digit' },
        { action: '>', type: 'action' },
        { action: '7', type: 'digit' },
        { action: '8', type: 'digit' },
        { action: '9', type: 'digit' },
        { action: '?', type: 'action' },
        { action: '', type: 'blank' },
        { action: '0', type: 'digit' },
        { action: '', type: 'blank' },
        { action: '=', type: 'action' },
      ];
    },
    digits(): number[] {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    },
    actions(): string[] {
      return ['<', '>', '?', '='];
    },
    settings(): GameSettings {
      return this.$store.state.settings;
    },
    question(): Question {
      return this.questions[this.currentQuestion];
    },
    questionExpressionTerms(): ExpressionTerm[] {
      const terms: ExpressionTerm[] = [];

      if (this.question) {
        let inputIndex = 0;

        this.question.terms.forEach((term, i) => {
          const { number, operator } = term;

          if (number) {
            const numTerm = number.toString();

            if (this.questionCompleted) {
              if (this.userAnswerCorrect) {
                const answerTerm = this.inputs[inputIndex++].value;

                terms.push({ term: answerTerm, label: answerTerm, type: 'number' });
              } else {
                terms.push({ term: numTerm, label: numTerm, type: 'number' });
              }
            } else if (this.question.hideIndexes.includes(i)) {
              terms.push({ term: ' ', label: ' ', type: 'skip', inputIndex: inputIndex++ });
            } else {
              terms.push({ term: numTerm, label: numTerm, type: 'number' });
            }
          }

          if (operator) {
            terms.push({
              term: operator,
              label: operator === '*' ? 'x' : operator,
              type: 'operator'
            });
          }
        });
      }

      return terms;
    },
    userAnswerExpression(): string | null {
      if (!this.validateUserInput()) {
        return null;
      }

      let answerExpression = "";

      for (const term of this.questionExpressionTerms) {
        if (term.inputIndex != null) {
          answerExpression += this.inputs[term.inputIndex].value;
        } else {
          answerExpression += term.term;
        }
      }

      return answerExpression;
    },
    userAnswerValue(): number | null {
      if (this.userAnswerExpression) {
        // eslint-disable-next-line no-new-func
        const calc = new Function(`return ${this.userAnswerExpression};`);

        return calc();
      }

      return null;
    },
    userAnswerCorrect(): boolean {
      return this.userAnswerValue === this.question.answer;
    }
  },
  mounted() {
    this.setGameTimer();

    this.nextQuestion();

    this.$nextTick(() => this.resetInputState());
  },
  unmounted() {
    this.clearGameTimer();
    this.clearMessageTimer();
  },
  methods: {
    completeQuestion() {
      this.makeStat();

      this.questionCompleted = true;
    },
    setShowGiveUpOnQuestion(show: boolean) {
      this.showGiveUpOnQuestion = show;
    },
    setShowBadInput(show: boolean) {
      this.showBadInput = show;
    },
    setShowAnswerCorrect(show: boolean) {
      this.showAnswerCorrect = show;
    },
    setShowAnswerIncorrect(show: boolean) {
      this.showAnswerIncorrect = show;
    },
    clearMessageTimer() {
      if (this.messageTimer > 0) {
        window.clearTimeout(this.messageTimer);

        this.messageTimer = -1;
      }
    },
    toggleInput(setInput: (value: boolean) => void) {
      setInput(true);

      this.clearMessageTimer();

      this.messageTimer = window.setTimeout(() => setInput(false), 1500);
    },
    toggleShowGiveUpOnQuestion() {
      this.toggleInput(this.setShowGiveUpOnQuestion);
    },
    toggleShowBadInput() {
      this.toggleInput(this.setShowBadInput);
    },
    toggleShowAnswerCorrect() {
      this.toggleInput(this.setShowAnswerCorrect);
    },
    toggleShowAnswerInсorrect() {
      this.toggleInput(this.setShowAnswerIncorrect);
    },
    validateUserInput(): boolean {
      for (const { value } of this.inputs) {
        if (!value || value === '' || Number.isNaN(+value)) {
          return false;
        }
      }

      return true;
    },
    makeStat() {
      const userAnswer: UserAnswer = {
        input: this.validateUserInput() ? this.inputs.map((input) => input.value) : [],
        value: this.validateUserInput() ? this.userAnswerValue : null
      };

      this.stats.push({
        question: this.question,
        userAnswer,
        userAnswerCorrect: this.userAnswerCorrect
      })
    },
    checkUserAnswer() {
      if (this.userAnswerValue) {
        if (this.userAnswerCorrect) {
          this.toggleShowAnswerCorrect();

          this.completeQuestion();
        } else {
          this.toggleShowAnswerInсorrect();
        }
      } else {
        this.toggleShowBadInput();
      }
    },
    setGameTimer() {
      const it = this;

      this.gameTimer = window.setTimeout((function timerfun(this: typeof it) {
        const time = new Date();

        this.updateTime(time);

        this.gameTimer = window.setTimeout(timerfun.bind(this), 1000);
      }).bind(this), 0);
    },
    clearGameTimer() {
      if (this.gameTimer > 0) {
        window.clearTimeout(this.gameTimer);

        this.gameTimer = -1;
      }
    },
    updateTime(time: Date) {
      this.currentTime = new Date(time.getTime());
    },
    goBack() {
      if (this.$store.state.previousRoute !== '') {
        this.$router.push(this.$store.state.previousRoute);
      } else {
        this.$router.push({ name: 'Home' });
      }
    },
    setSelectedInput(index: number) {
      this.selectedInput = Math.max(0, Math.min(this.inputs.length - 1, index));

      this.focusUserInput(this.selectedInput);
    },
    focusUserInput(index: number) {
      const input = this.$refs[`input${index}`] as HTMLInputElement;

      if (input) {
        input.focus();
      }
    },
    handleActionClick(action: ButtonAction) {
      if (!this.questionCompleted) {
        this.handleAction(action);

        this.focusUserInput(this.selectedInput);
      }
    },
    handleAction(action: ButtonAction) {
      if (action.action === '>') {
        this.setSelectedInput(this.selectedInput + 1);
      }

      if (action.action === '<') {
        this.setSelectedInput(this.selectedInput - 1);
      }

      if (action.type === 'digit') {
        this.inputs[this.selectedInput].value += action.action;
      }

      if (action.action === '=') {
        this.checkUserAnswer();
      }

      if (action.action === '?') {
        this.toggleShowGiveUpOnQuestion();

        this.completeQuestion();
      }
    },
    nextQuestion() {
      const question = this.generateNextQuestion();

      this.questions.push(question);
      this.currentQuestion++;

      this.resetGameState();
      this.resetInputState();
    },
    resetGameState() {
      this.questionCompleted = false;
    },
    resetInputState() {
      for (let i = 0; i < this.question.hideIndexes.length; i++) {
        this.inputs[i] = { value: "" };
      }

      this.selectedInput = 0;

      this.focusUserInput(0);
    },
    generateNextQuestion(): Question {
      return generateQuestion({
        gameSettings: this.settings
      });
    },
  }
})
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 16px;
  height: 16px;
}

.game {
  display: flex;
  flex-direction: column;
  align-items: center;

  font-family: arial;
}

.game-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.button {
  outline: none;
  text-transform: uppercase;
  margin: 0;
  padding: 8px 16px;
  font-family: arial;
  color: #78909C;
  border: none;
  border-radius: 2px;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 2px 1px #B0BEC5;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.timer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  background: #FAFAFA;
  color: #78909C;
  width: 75px;
  padding: 4px;
  border: 1px solid #C5CAE9;
}

.input-number {
  width: 30px;
  overflow: hidden;
  padding: 4px;
  border: none;
  outline: none;

  border-radius: 0;
  border-bottom: 1px solid #c0c0c0;

  box-shadow: 0 0 2px 1px rgba(0,0,0,0);

  transition: box-shadow, background-color, border-bottom, 0.2s linear;
}

.input-number:focus, .input-number.selected {
  border-radius: 2px;
  border-bottom: 1px solid transparent;

  background: #fafafa;
  box-shadow: 0 0 2px 1px rgba(0,0,0,0.2);
}

.controls {
  width: 400px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.control-item {
  flex: 0 0 25%;
  padding-bottom: 16px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.digits {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.actions {
  display: flex;
  flex-direction: column;
}

.question-expression {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  font-size: 1.18em;
}

.expression-term, .question-mark {
  color: #c0c0c0;
}

.expression-term-number {
  color: black;
  font-weight: 700;
  border-bottom: 1px solid transparent;
  padding: 4px;
}

.message {
  position: relative;
}

.alert-message {
  font-family: arial;
  font-size: 1.05em;
  border-radius: 4px;
  padding: 8px 16px;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  width: 180px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-message-success {
  border: 1px solid #43A047;
  color: #43A047;
  background: #C8E6C9;
}

.alert-message-warning {
  border: 1px solid #FFC107;
  color: #FFC107;
  background: #FFF8E1;
}

.alert-message-info {
  border: 1px solid #17A2B8;
  color: #17A2B8;
  background: #D1ECF1;
}

.alert-message-danger {
  border: 1px solid #C62828;
  color: #C62828;
  background: #FFEBEE;
}

.game-header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.fade-bubble-enter-from {
  opacity: 0;
  top: 4px;
}

.fade-bubble-leave-to {
  opacity: 0;
}

.fade-bubble-leave-from, .fade-bubble-enter-to {
  opacity: 1;
  top: 0;
}

.fade-bubble-enter-active, .fade-bubble-leave-active {
  transition: opacity, 0.1s ease-in;
}
</style>