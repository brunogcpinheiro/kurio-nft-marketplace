import { queryOptions, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ordersApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import { useStoredSession } from '@/features/auth/session'

export const orderQueries = {
  detail: (userId: string, orderId: string) =>
    queryOptions({
      queryKey: queryKeys.orders.detail(userId, orderId),
      queryFn: ({ signal }) => ordersApi.get(orderId, signal),
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: (query) => (query.state.data?.status === 'pending' ? 5000 : false),
      retry: (count, error) => {
        if (isAxiosError(error) && error.response && [403, 404].includes(error.response.status))
          return false
        return count < 2
      },
    }),
}

export function useOrder(orderId: string) {
  const stored = useStoredSession()
  return useQuery({
    ...orderQueries.detail(stored?.userId ?? '', orderId),
    enabled: Boolean(stored),
  })
}
