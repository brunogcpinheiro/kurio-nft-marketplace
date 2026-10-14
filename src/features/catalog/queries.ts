import { queryOptions } from '@tanstack/react-query'
import { nftsApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import type { CatalogQuery } from '@/api/schemas'

export const catalogQueries = {
  list: (query: CatalogQuery) =>
    queryOptions({
      queryKey: queryKeys.nfts.list(query),
      queryFn: ({ signal }) => nftsApi.list(query, signal),
      staleTime: 30_000,
    }),
}
