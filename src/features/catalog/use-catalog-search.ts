import { getRouteApi, useNavigate } from '@tanstack/react-router'
import type { CatalogQueryInput } from '@/api/schemas'

const route = getRouteApi('/')

export function useCatalogSearch() {
  const search = route.useSearch()
  const navigate = useNavigate({ from: '/' })

  function update(patch: Partial<CatalogQueryInput>) {
    void navigate({
      search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }),
      resetScroll: false,
    })
  }

  function reset() {
    void navigate({ search: {}, resetScroll: false })
  }

  return { search, update, reset }
}
