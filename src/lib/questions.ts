import { probsPickRandom, randomInt, ProbMap } from '@/lib/utils'

interface OperatorInfo {
  symbol: string;
  noun: string;
  calc: (a: number, b: number) => number;
  score: number;
}

export type Operator = 'add' | 'subtract' | 'multiply' | 'divide'

const operators: Record<Operator, OperatorInfo> = {
  add: {
    symbol: '+',
    noun: 'addition',
    calc: (a, b) => a + b,
    score: 10
  },
  subtract: {
    symbol: '−',
    noun: 'subtraction',
    calc: (a, b) => a - b,
    score: 15
  },
  multiply: {
    symbol: '×',
    noun: 'multiplication',
    calc: (a, b) => a * b,
    score: 20
  },
  divide: {
    symbol: '÷',
    noun: 'division',
    calc: (a, b) => a / b,
    score: 25
  }
}

export interface Question {
  operator: Operator;
  firstTerm: number;
  secondTerm: number;
}

export function getScore (question: Question): number {
  const { operator } = question
  return operators[operator].score
}

export function getSymbol (question: Question): string {
  const { operator } = question
  return operators[operator].symbol
}

export function getResult (question: Question): number {
  const { operator, firstTerm: a, secondTerm: b } = question
  return operators[operator].calc(a, b)
}

export function generateQuestion (operatorProbs: ProbMap<Operator>, floor: number, ceiling: number): Question {
  const operator = probsPickRandom(operatorProbs)

  if (operator === 'divide') {
    // Take the terms from a whole number multiplication
    // m1 * m2 = r
    // ∴ m1 = r / m2

    const m1 = randomInt(floor, ceiling)
    const m2 = randomInt(floor, ceiling)

    const firstTerm = m1 * m2
    const secondTerm = m2

    return { operator, firstTerm, secondTerm }
  } else {
    const firstTerm = randomInt(floor, ceiling)
    const secondTerm = randomInt(floor, ceiling)

    return { operator, firstTerm, secondTerm }
  }
}
