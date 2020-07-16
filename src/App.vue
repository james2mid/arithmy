<template>
  <div id="app" class="container mx-auto px-4 text-center pt-5">
    <h1 class="text-2xl font-medium mb-4">Arithmy</h1>

    <div class="rounded-lg bg-blue-300 inline-block mx-auto text-white py-4 px-8 my-6">
      <p class="text-lg">Score</p>
      <p class="text-2xl font-bold">{{ score }}</p>
    </div>

    <p class="font-bold text-4xl mt-3">
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
      class="mx-auto my-5 text-center font-medium text-2xl p-0"
      maxlength="5"
    />

    <t-button
      @click="submit"
      :disabled="submitting"
      variant="primary"
      class="mt-5 font-medium"
    >Submit</t-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

type Operator = 'add' | 'subtract' | 'multiply' | 'divide'

interface Question {
  operator: Operator;
  firstTerm: number;
  secondTerm: number;
}

const scoreMappings: Record<Operator, number> = {
  add: 10,
  subtract: 20,
  multiply: 30,
  divide: 40
}

function getQuestionScore (question: Question): number {
  const { operator } = question
  return scoreMappings[operator]
}

function getOperatorSymbol (operator: Operator): string {
  switch (operator) {
    case 'add':
      return '+'
    case 'subtract':
      return '−'
    case 'multiply':
      return '×'
    case 'divide':
      return '÷'
  }
}

function getResult (question: Question): number {
  const { operator, firstTerm, secondTerm } = question

  switch (operator) {
    case 'add':
      return firstTerm + secondTerm
    case 'subtract':
      return firstTerm - secondTerm
    case 'multiply':
      return firstTerm * secondTerm
    case 'divide':
      return firstTerm / secondTerm
  }
}

/** Generates a random number between the provided minimum and maximum (inclusive). */
function randomInt (min: number, max: number): number {
  if (typeof min !== 'number' || typeof max !== 'number' || isNaN(min) || isNaN(max) || min >= max) {
    throw new Error('Values for `min` and `max` must be valid integers.')
  }

  const multiplicand = Math.random()
  const diff = max - min

  return min + Math.floor(multiplicand * diff)
}

function generateQuestion (): Question {
  const operator = 'add' // randomInt(0, )
  const firstTerm = randomInt(1, 20)
  const secondTerm = randomInt(1, 20)

  return { operator, firstTerm, secondTerm }
}

@Component
export default class App extends Vue {
  score = 0
  previousInput = ''
  input = ''
  inputStatus: 'success' | 'error' | 'warning' | null = null
  submitting = false

  question!: Question

  created () {
    this.question = generateQuestion()
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
    const { operator } = this.question
    return getOperatorSymbol(operator)
  }

  loadNextQuestion (): void {
    this.input = ''
    this.previousInput = ''
    this.inputStatus = null
    this.submitting = false

    this.question = generateQuestion()
  }

  submit (): void {
    this.submitting = true

    const { input } = this
    const attempt = parseInt(input)

    const result = getResult(this.question)

    if (result === attempt) {
      // Input is correct
      this.inputStatus = 'success'

      const questionScore = getQuestionScore(this.question)
      this.score += questionScore
    } else {
      // Input is incorrect
      this.inputStatus = 'error'
    }

    setTimeout(this.loadNextQuestion.bind(this), 500)
  }
}
</script>
