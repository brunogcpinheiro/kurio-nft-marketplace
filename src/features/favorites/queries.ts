import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { toast } from 'sonner'
import { favoritesApi } from '@/api/endpoints'
import { errorMessage } from '@/api/errors'
import { queryKeys } from '@/api/query-keys'
import type { NftSummary } from '@/api/schemas'
import { session, useStoredSession } from '@/features/auth/session'

type Favorites = { nftIds: string[]; items: NftSummary[] }

export const favoritesQueries = {
  list: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.favorites(userId),
      queryFn: ({ signal }) => favoritesApi.list(signal),
      staleTime: 60_000,
    }),
}

export function useFavorites() {
  const stored = useStoredSession()
  const query = useQuery({
    ...favoritesQueries.list(stored?.userId ?? ''),
    enabled: Boolean(stored),
  })
  const ids = query.data?.nftIds ?? []
  return { ...query, ids, isFavorite: (nft: Pick<NftSummary, 'id'>) => ids.includes(nft.id) }
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const href = useRouterState({ select: (s) => s.location.href })
  const stored = useStoredSession()
  const key = queryKeys.favorites(stored?.userId ?? '')

  const mutation = useMutation({
    mutationFn: async ({ nftId, next }: { nftId: string; next: boolean; name: string }) => {
      if (next) await favoritesApi.add(nftId)
      else await favoritesApi.remove(nftId)
    },
    onMutate: async ({ nftId, next }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Favorites>(key)
      queryClient.setQueryData<Favorites>(key, (current) => {
        const ids = current?.nftIds ?? []
        const items = current?.items ?? []
        return {
          nftIds: next ? [...new Set([...ids, nftId])] : ids.filter((id) => id !== nftId),
          items: next ? items : items.filter((item) => item.id !== nftId),
        }
      })
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      toast.error('Não foi possível atualizar os favoritos', { description: errorMessage(error) })
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.next
          ? `${variables.name} salvo nos favoritos`
          : `${variables.name} removido dos favoritos`,
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  function toggle(nft: Pick<NftSummary, 'id' | 'name'>, currentlyFavorite: boolean) {
    if (!session.get()) {
      toast('Entre para salvar favoritos')
      void navigate({ to: '/login', search: { redirect: href } })
      return
    }
    mutation.mutate({ nftId: nft.id, next: !currentlyFavorite, name: nft.name })
  }

  return { toggle, isPending: mutation.isPending }
}
