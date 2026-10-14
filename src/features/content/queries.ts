import { queryOptions } from '@tanstack/react-query'
import { contentApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'

export const contentQueries = {
  home: () =>
    queryOptions({
      queryKey: queryKeys.content.home,
      queryFn: ({ signal }) => contentApi.home(signal),
      staleTime: 5 * 60 * 1000,
    }),
}
