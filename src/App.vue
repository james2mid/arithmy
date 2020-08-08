<template>
  <div id="app" class="container px-4 mx-auto text-center">
    <h1 class="mt-12 text-3xl font-medium">Arithmy</h1>

    <div class="flex flex-wrap content-around my-16 space-y-10 md:space-y-0">
      <div class="flex items-center justify-center w-full md:w-1/2">
        <div class="flex flex-col items-center justify-center w-32 h-32 text-white bg-blue-300 rounded-lg md:w-56 md:h-56">
          <p class="text-2xl">Score</p>
          <p class="-mt-3 text-6xl font-bold">{{ score }}</p>
        </div>
      </div>

      <div class="flex flex-col items-center w-full space-y-5 md:w-1/2">
        <p class="mt-3 text-4xl font-bold">
          {{ question.firstTerm }}
          {{ operatorSymbol }}
          {{ question.secondTerm }}
        </p>

        <t-input
          v-model="input"
          ref="input"
          @keydown="inputFilter"
          @keyup.enter="submit"
          :status="inputStatus"
          :disabled="submitting"
          class="p-0 mx-auto text-2xl font-medium text-center"
          maxlength="5"
        />

        <div id="timer" class="w-56 h-2 p-0 bg-blue-200 rounded-md">
          <div class="h-2 bg-blue-600 rounded-md" :style="`width: ${timeRemaining}%;`"></div>
        </div>

        <t-button
          @click="submit"
          :disabled="submitting"
          variant="primary"
          class="font-medium transition-colors duration-200"
        >Submit</t-button>
      </div>
    </div>

    <a
      href="https://jamesmiddleton.me"
      target="_blank"
      class="mr-3 text-sm text-gray-500 transition-colors duration-300 hover:text-gray-700"
    >Created by JM</a>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { generateQuestion, Question, getScore, getSymbol, getResult } from '@/lib/questions'

/** How often the time bar should update, in milliseconds. */
const TIME_BAR_UPDATE_INTERVAL = 50

@Component
export default class App extends Vue {
  score = 0
  input = ''
  inputStatus: 'success' | 'error' | 'warning' | null = null
  submitting = false
  // eslint-disable-next-line
  question: Question = null as any
  questionStart: number = Date.now()
  timeRemaining = 0

  tmrTimeRemaining!: number
  tmrTimeout!: number

  created () {
    // Load score from localStorage
    const existingScoreRaw = window.localStorage.getItem('score')
    if (existingScoreRaw) {
      const existingScore = parseInt(existingScoreRaw)
      if (existingScore) {
        this.score = existingScore
      }
    }

    // Save score to localStorage
    this.$watch('score', () => {
      console.log('saving')
      window.localStorage.setItem('score', this.score.toString())
    })

    this.loadNextQuestion()
  }

  beforeDestroy () {
    clearInterval(this.tmrTimeRemaining)
    clearTimeout(this.tmrTimeout)
  }

  /** Filters input so that only numeric values are accepted. */
  inputFilter (event: KeyboardEvent) {
    // Always allow backspaces
    if (event.key === 'Backspace') {
      return
    }

    // Prevent non-appropriate keys from being added
    const { key } = event
    const validKeys = ['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    if (!validKeys.includes(key)) {
      event.preventDefault()
      return
    }

    // Calculate the resulting string if the key were to be added
    const { selectionStart, selectionEnd } = (event.target as HTMLInputElement)
    const currentValue = this.input

    const nextValue: string = [
      currentValue.slice(0, selectionStart || 0),
      key,
      currentValue.slice(selectionEnd || 0)
    ].join('')

    // Prevent invalid integers from being entered
    if (!nextValue.match(/^-?[0-9]*$/)) {
      event.preventDefault()
    }
  }

  /** Gets the operator symbol for the current question. */
  get operatorSymbol (): string {
    return getSymbol(this.question)
  }

  get questionDuration (): number {
    return 10000 / Math.pow(Math.E, this.score / 1000)
  }

  /** Starts up the timer to frequently update the progress bar. */
  initTimeRemainingTimer () {
    this.tmrTimeRemaining = setInterval(() => {
      if (this.submitting) {
        return
      }

      this.timeRemaining = this.getTimeRemaining()
    }, TIME_BAR_UPDATE_INTERVAL)
  }

  /** Calculates the proportion of time remaining for the current question. */
  getTimeRemaining () {
    const timeElapsed = Date.now() - this.questionStart
    const timeRemaining = this.questionDuration - timeElapsed

    // If timeout has passed, return 0
    if (timeRemaining <= 0) {
      return 0
    }

    // Otherwise return proportion of time remaining
    return (timeRemaining / this.questionDuration) * 100
  }

  /** Generates and loads a new question and resets relevant vars. */
  loadNextQuestion (): void {
    this.input = ''
    this.inputStatus = null
    this.submitting = false
    this.questionStart = Date.now()

    this.question = generateQuestion(this.score)

    // Re-focus the input box
    this.$nextTick(() => {
      const el = this.$refs.input as HTMLInputElement
      el && el.focus()
    })

    // Keep time remaining up-to-date
    this.initTimeRemainingTimer()

    // Initialise the timeout timer
    this.tmrTimeout = setTimeout(() => {
      this.submit()
    }, this.questionDuration)
  }

  /** Processes the current attempt and starts a timer to load the next question. */
  submit (): void {
    // Prevent spamming of submit
    if (this.submitting) {
      return
    }

    this.submitting = true

    const { input } = this
    const attempt = parseInt(input)
    const answer = getResult(this.question)
    const correct = (attempt === answer)

    if (correct) {
      this.inputStatus = 'success'

      const questionScore = getScore(this.question)
      this.score += questionScore
    } else {
      this.inputStatus = 'error'

      const questionScore = getScore(this.question)
      const reduction = questionScore - 5

      this.score = this.score > reduction
        ? this.score - reduction
        : 0
    }

    // Display answer even when correct
    // as formatting may differ
    this.input = answer.toString()

    clearInterval(this.tmrTimeRemaining)
    clearTimeout(this.tmrTimeout)

    setTimeout(() => {
      this.loadNextQuestion()
    }, correct ? 500 : 1000)
  }
}
</script>

<style>
  * { user-select: none; }
</style>
