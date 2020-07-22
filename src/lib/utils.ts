/** Generates a random number between the provided minimum and maximum (inclusive). */
export function randomInt (min: number, max: number): number {
  if (typeof min !== 'number' || typeof max !== 'number' || isNaN(min) || isNaN(max) || min >= max) {
    throw new Error('Values for `min` and `max` must be valid integers.')
  }

  const multiplicand = Math.random()
  const diff = max - min

  return min + Math.floor(multiplicand * diff)
}

export type ProbMap <T extends string> = {
  [K in T]: number
}

/** Picks a random key with respects to weightings in the given probability map. */
export function probsPickRandom <T extends string> (probs: ProbMap<T>): T {
  const keys = Object.keys(probs) as T[]

  if (keys.length === 0) {
    throw new Error('The probability map must not be empty.')
  }

  // Ensure the probability map is normalised
  const sum = Object.values<number>(probs).reduce((z, a) => z + a, 0)
  const normProbs = Object.fromEntries(
    keys.map(k => ([k, probs[k] / sum]))
  )

  // Pick one randomly
  const random = Math.random()
  let probCounter = 0

  for (const k of keys) {
    probCounter += normProbs[k]
    if (probCounter > random) {
      return k
    }
  }

  return keys[keys.length - 1]
}
