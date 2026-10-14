import { useEffect, useRef, useState } from 'react'
import type { Provider } from '@/api/schemas'
import { simulationApi } from '@/features/simulation/use-scenario'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'refused' | 'disconnected'

export function useWalletConnection(
  initial: Provider | null,
  onChange: (provider: Provider | null) => void,
) {
  const [status, setStatus] = useState<ConnectionStatus>(initial ? 'connected' : 'idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function connect(provider: Provider) {
    if (timer.current) clearTimeout(timer.current)
    setStatus('connecting')
    const scenarios = await simulationApi.scenarios().catch(() => null)
    const refused = scenarios?.active === 'wallet-refused'
    timer.current = setTimeout(() => {
      if (refused) {
        setStatus('refused')
        onChange(null)
      } else {
        setStatus('connected')
        onChange(provider)
      }
    }, 1200)
  }

  function disconnect() {
    if (timer.current) clearTimeout(timer.current)
    setStatus('disconnected')
    onChange(null)
  }

  return { status, connect, disconnect }
}
