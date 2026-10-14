import './app.css'

async function enableMocking() {
  if (import.meta.env.VITE_API_MOCKING !== 'true') return
  const { startMocks } = await import('./mocks/browser')
  await startMocks()
}

enableMocking()
  .then(() => import('./app'))
  .then(({ renderApp }) => renderApp())
