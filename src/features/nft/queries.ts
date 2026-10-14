import { queryOptions } from '@tanstack/react-query'
import { nftsApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'

export const nftQueries = {
  detail: (slug: string) =>
    queryOptions({
      queryKey: queryKeys.nfts.detail(slug),
      queryFn: ({ signal }) => nftsApi.detail(slug, signal),
      staleTime: 30_000,
    }),
  related: (slug: string) =>
    queryOptions({
      queryKey: queryKeys.nfts.related(slug),
      queryFn: ({ signal }) => nftsApi.related(slug, signal),
      staleTime: 30_000,
    }),
}
