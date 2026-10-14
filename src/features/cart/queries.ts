import { queryOptions, useQuery } from '@tanstack/react-query'
import { cartApi, quoteApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import { useSyncExternalStore } from 'react'
import { session } from '@/features/auth/session'
import { guestCart } from './use-guest-cart'

const none = () => null

export function useCartOwnerKey() {
  const current = useSyncExternalStore(session.subscribe, session.get, none)
  const guest = useSyncExternalStore(guestCart.subscribe, guestCart.get, none)
  if (current) return `user:${current.userId}`
  return guest ? `guest:${guest}` : 'anonymous'
}

export const cartQueries = {
  get: (ownerKey: string) =>
    queryOptions({
      queryKey: queryKeys.cart(ownerKey),
      queryFn: ({ signal }) => cartApi.get(signal),
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    }),
}

export function useCart() {
  const ownerKey = useCartOwnerKey()
  return useQuery({ ...cartQueries.get(ownerKey), enabled: ownerKey !== 'anonymous' })
}

export function useCartCount() {
  const { data } = useCart()
  return data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

export const quoteQueries = {
  current: (ownerKey: string) =>
    queryOptions({
      queryKey: queryKeys.quote(ownerKey),
      queryFn: ({ signal }) => quoteApi.current(signal),
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    }),
}

export function useQuote(enabled = true) {
  const ownerKey = useCartOwnerKey()
  return useQuery({
    ...quoteQueries.current(ownerKey),
    enabled: enabled && ownerKey !== 'anonymous',
  })
}
