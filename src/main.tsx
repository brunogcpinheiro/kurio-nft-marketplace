import './app.css'
import { renderApp } from './app'
import { env } from '@/lib/env'
import { markMocksReady } from '@/lib/mocks-ready'

async function enableMocking() {
  if (!env.apiMocking) return
  const { startMocks } = await import('./mocks/browser')
  await startMocks()
}

void enableMocking().finally(markMocksReady)
renderApp()
