<template>
  <div id="app" class="container px-4 mx-auto text-center">
    <h1 class="mt-12 text-3xl font-medium">Arithmy</h1>

    <div class="flex flex-wrap content-around my-16 space-y-10 md:space-y-0">
      <div class="flex items-center justify-center w-full md:w-1/2">
        <div class="flex-col items-center justify-center px-10 py-2 text-white bg-blue-300 rounded-lg md:py-16 md:px-20">
          <p class="text-2xl">Score</p>
          <transition>
            <p class="-mt-3 text-6xl font-bold transition ease-linear">{{ score }}</p>
          </transition>
        </div>
      </div>

      <div class="flex-col items-center w-full space-y-5 md:w-1/2">
        <p class="mt-3 text-4xl font-bold">
          {{ question.firstTerm }}
          {{ operatorSymbol }}
          {{ question.secondTerm }}
        </p>

        <t-input
          v-model="input"
          v-focus
          @keydown="filterNumbers"
          @keyup.enter="submit"
          :status="inputStatus"
          class="p-0 mx-auto text-2xl font-medium text-center"
          maxlength="5"
        />

        <div
          class="h-1 mx-auto transition-all ease-linear bg-blue-500 rounded-md"
          :style="barStyle"
        ></div>

        <t-button
          @click="submit"
          :disabled="submitting"
          variant="primary"
          class="font-medium"
        >Submit</t-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { generateQuestion, Question, getScore, getSymbol, getResult } from '@/lib/questions'

/** The length of time for each question, in milliseconds. */
const QUESTION_TIME = 10000

@Component
export default class App extends Vue {
  score = 0
  previousInput = ''
  input = ''
  inputStatus: 'success' | 'error' | 'warning' | null = null
  submitting = false
  // eslint-disable-next-line
  question: Question = null as any
  questionStart: number = Date.now()
  barStyle: any = {
    width: 0
  }

  barStyleTimer!: number
  timeoutTimer!: number

  created () {
    this.loadNextQuestion()
  }

  beforeDestroy () {
    clearInterval(this.barStyleTimer)
  }

  filterNumbers (event: KeyboardEvent) {
    // Always allow backspaces
    if (event.key === 'Backspace') {
      return
    }

    // Prevent non-appropriate keys from being added
    const { key } = event
    const validKeys = ['-', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
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

  get operatorSymbol (): string {
    return getSymbol(this.question)
  }

  initBarStyleTimer () {
    this.barStyleTimer = setInterval(() => {
      this.barStyle = this.getBarStyle()
    }, 100)
  }

  getBarStyle () {
    const fullWidth = 200

    const timeElapsed = Date.now() - this.questionStart
    const timeRemaining = QUESTION_TIME - timeElapsed

    if (timeRemaining <= 0) {
      return {
        width: '0px'
      }
    }

    const timeMultiplier = timeRemaining / QUESTION_TIME

    const width = fullWidth * timeMultiplier
    console.log(width)

    return {
      width: `${width}px`
    }
  }

  loadNextQuestion (): void {
    this.input = ''
    this.previousInput = ''
    this.inputStatus = null
    this.submitting = false
    this.questionStart = Date.now()

    this.question = generateQuestion({
      add: 0.4,
      subtract: 0.3,
      multiply: 0.3,
      divide: 0
    }, 1, 20)

    this.initBarStyleTimer()

    // Initialise the timeout timer
    this.timeoutTimer = setTimeout(() => {
      this.submit()
    }, QUESTION_TIME)
  }

  submit (): void {
    this.submitting = true

    const { input } = this
    const attempt = parseInt(input)
    const answer = getResult(this.question)
    const correct = (attempt === answer)

    if (correct) {
      // Input is correct
      this.inputStatus = 'success'

      const questionScore = getScore(this.question)
      this.score += questionScore
    } else {
      // Input is incorrect
      this.inputStatus = 'error'
    }

    clearInterval(this.barStyleTimer)
    clearInterval(this.timeoutTimer)

    setTimeout(() => {
      this.loadNextQuestion()
    }, correct ? 500 : 1000)
  }
}
</script>

<style>
  * { user-select: none; }
</style>
