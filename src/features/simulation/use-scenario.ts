import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '@/api/client'

const scenariosSchema = z.object({
  active: z.string(),
  available: z.array(z.object({ name: z.string(), title: z.string(), description: z.string() })),
})

export const simulationApi = {
  scenarios: (signal?: AbortSignal) =>
    api.get('/__mock/scenarios', { signal }).then((r) => scenariosSchema.parse(r.data)),
  setScenario: (name: string) => api.put('/__mock/scenario', { name }).then(() => undefined),
  reset: () => api.post('/__mock/reset').then(() => undefined),
  emit: (body: Record<string, unknown>) => api.post('/__mock/emit', body).then(() => undefined),
  disconnectSockets: () => api.post('/__mock/socket/disconnect').then(() => undefined),
}

export function useScenario(enabled: boolean) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['simulation', 'scenarios'],
    queryFn: ({ signal }) => simulationApi.scenarios(signal),
    enabled,
    staleTime: Infinity,
  })
  const select = useMutation({
    mutationFn: simulationApi.setScenario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['simulation'] }),
  })
  const reset = useMutation({
    mutationFn: async () => {
      await simulationApi.reset()
      queryClient.clear()
      window.location.assign('/')
    },
  })
  const emit = useMutation({ mutationFn: simulationApi.emit })
  const disconnect = useMutation({ mutationFn: simulationApi.disconnectSockets })
  return { query, select, reset, emit, disconnect }
}
