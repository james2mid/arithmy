import { probsPickRandom as weightedChoice, randomInt } from '@/lib/utils'

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

export function generateQuestion (difficulty: number): Question {
  // We want complicated operators to be more common as difficulty increases
  const operatorProbs = {
    add: difficulty + 200,
    subtract: difficulty + 100,
    multiply: difficulty + 50,
    divide: difficulty
  }

  const operator = weightedChoice(operatorProbs)

  if (operator === 'add') {
    const floor = ~~Math.pow(difficulty + 10, 0.5)
    const ceiling = ~~Math.pow(difficulty + 10, 0.7)

    return {
      operator,
      firstTerm: randomInt(floor, ceiling),
      secondTerm: randomInt(floor, ceiling)
    }
  } else if (operator === 'subtract') {
    const floor = ~~Math.pow(difficulty + 10, 0.5)
    const ceiling = ~~Math.pow(difficulty + 10, 0.7)

    return {
      operator,
      firstTerm: randomInt(floor, ceiling),
      secondTerm: randomInt(floor, ceiling)
    }
  } else if (operator === 'multiply') {
    const floor = ~~Math.pow(difficulty + 10, 0.3)
    const ceiling = ~~Math.pow(difficulty + 10, 0.5)

    return {
      operator,
      firstTerm: randomInt(floor, ceiling),
      secondTerm: randomInt(floor, ceiling)
    }
  } else if (operator === 'divide') {
    const floor = ~~Math.pow(difficulty + 10, 0.3)
    const ceiling = ~~Math.pow(difficulty + 10, 0.5)

    // Take the terms from a whole number multiplication
    // rnd1 * rnd2 = res
    // ∴ ans = rnd1 = res / rnd2

    const rnd1 = randomInt(floor, ceiling)
    const rnd2 = randomInt(floor, ceiling)

    return {
      operator,
      firstTerm: rnd1 * rnd2,
      secondTerm: rnd2
    }
  }

  throw new Error()
}
