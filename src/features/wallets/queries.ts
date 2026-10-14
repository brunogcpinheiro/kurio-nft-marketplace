import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { walletsApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import type { Wallet, WalletInput, WalletSlot, WalletsResponse } from '@/api/schemas'
import { useSession } from '@/features/auth/use-session'

export const walletQueries = {
  list: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.wallets(userId),
      queryFn: ({ signal }) => walletsApi.list(signal),
      staleTime: 60_000,
    }),
}

export function useWallets() {
  const { user } = useSession()
  return useQuery({ ...walletQueries.list(user?.id ?? ''), enabled: Boolean(user) })
}

export function useSaveWallet() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slot, input }: { slot: WalletSlot; input: WalletInput }) =>
      walletsApi.save(slot, input),
    onSuccess: (wallet: Wallet) => {
      queryClient.setQueryData<WalletsResponse>(queryKeys.wallets(user?.id ?? ''), (current) => ({
        primary: wallet.slot === 'primary' ? wallet : (current?.primary ?? null),
        secondary: wallet.slot === 'secondary' ? wallet : (current?.secondary ?? null),
      }))
    },
  })
}
