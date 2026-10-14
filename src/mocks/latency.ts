import { delay } from 'msw'
import { getScenario, scenarioState } from './scenarios'

const between = (min: number, max: number) => Math.round(min + Math.random() * (max - min))

export async function networkDelay(key: string) {
  const scenario = getScenario()
  if (scenario === 'slow-network') return delay(between(2500, 4000))
  if (scenario === 'variable-latency') return delay(between(50, 3000))
  if (scenario === 'out-of-order' && key === 'catalog') {
    const now = Date.now()
    const first = now - scenarioState.lastCatalogCallAt > 3000
    scenarioState.lastCatalogCallAt = now
    return delay(first ? 2500 : 200)
  }
  return delay(between(150, 400))
}
