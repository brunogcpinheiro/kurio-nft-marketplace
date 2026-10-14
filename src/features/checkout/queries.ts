import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiError, isTimeoutError } from '@/api/errors'
import { ordersApi } from '@/api/endpoints'
import { quoteSchema, type CreateOrderInput, type Order, type Quote } from '@/api/schemas'
import { isAxiosError } from 'axios'

export class StaleQuoteError extends Error {
  constructor(public quote: Quote) {
    super('QUOTE_STALE')
  }
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      input,
      idempotencyKey,
    }: {
      input: CreateOrderInput
      idempotencyKey: string
    }): Promise<Order> => {
      const attempt = () => ordersApi.create(input, idempotencyKey)
      try {
        return await attempt()
      } catch (error) {
        if (isTimeoutError(error)) return attempt()
        if (getApiError(error)?.code === 'QUOTE_STALE' && isAxiosError(error)) {
          const parsed = quoteSchema.safeParse(error.response?.data?.quote)
          if (parsed.success) throw new StaleQuoteError(parsed.data)
        }
        throw error
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['quote'] })
    },
  })
}
