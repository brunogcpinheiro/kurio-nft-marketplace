import { setupWorker } from 'msw/browser'
import { resetDb } from './db'
import { handlers } from './handlers'
import { clientStorageKeys } from './handlers/control'
import { isScenarioName, setScenario } from './scenarios'

export const worker = setupWorker(...handlers)

function applyBootParams() {
  const url = new URL(window.location.href)
  const scenario = url.searchParams.get('scenario')
  const reset = url.searchParams.get('reset')
  if (!scenario && !reset) return
  if (reset) {
    resetDb()
    for (const key of clientStorageKeys) localStorage.removeItem(key)
    sessionStorage.clear()
  }
  if (isScenarioName(scenario)) setScenario(scenario)
  url.searchParams.delete('scenario')
  url.searchParams.delete('reset')
  window.history.replaceState(window.history.state, '', url)
}

export async function startMocks() {
  applyBootParams()
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: import.meta.env.PROD,
  })
}
