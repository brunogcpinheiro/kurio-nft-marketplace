import './app.css'
import { renderApp } from './app'
import { markMocksReady } from '@/lib/mocks-ready'

async function enableMocking() {
  if (import.meta.env.VITE_API_MOCKING !== 'true') return
  const { startMocks } = await import('./mocks/browser')
  await startMocks()
}

void enableMocking().finally(markMocksReady)
renderApp()
