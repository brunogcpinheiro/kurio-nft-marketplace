import { useSyncExternalStore } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import type { AuthResponse } from '@/api/schemas'
import { guestCart } from '@/features/cart/use-guest-cart'
import { session, sessionFromAuth } from './session'

const none = () => null

export function useSession() {
  const stored = useSyncExternalStore(session.subscribe, session.get, none)
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => authApi.session(signal),
    enabled: Boolean(stored),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  const user = stored && query.data ? query.data.user : null
  const status = !stored
    ? ('anonymous' as const)
    : query.isPending
      ? ('loading' as const)
      : user
        ? ('authenticated' as const)
        : ('anonymous' as const)
  return { user, status, isAuthenticated: status === 'authenticated' }
}

export function useSessionActions() {
  const queryClient = useQueryClient()
  return {
    signIn(auth: AuthResponse) {
      queryClient.clear()
      session.set(sessionFromAuth(auth))
      guestCart.clear()
      queryClient.setQueryData(queryKeys.session, { user: auth.user, expiresAt: auth.expiresAt })
    },
    async signOut() {
      try {
        await authApi.logout()
      } finally {
        session.clear()
        queryClient.clear()
      }
    },
  }
}
