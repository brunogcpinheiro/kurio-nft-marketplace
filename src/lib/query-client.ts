import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => {
        if (isAxiosError(error) && error.response && error.response.status < 500) return false
        return count < 2
      },
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
})
