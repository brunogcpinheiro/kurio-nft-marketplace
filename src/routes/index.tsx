import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { catalogDefaults, catalogQuerySchema } from '@/api/schemas'
import { HomeContent } from '@/features/catalog/home-content'
import { catalogQueries } from '@/features/catalog/queries'
import { useCatalogSearch } from '@/features/catalog/use-catalog-search'
import { contentQueries } from '@/features/content/queries'

export const Route = createFileRoute('/')({
  validateSearch: catalogQuerySchema,
  search: { middlewares: [stripSearchParams(catalogDefaults)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    void context.queryClient.prefetchQuery(catalogQueries.list(deps))
    void context.queryClient.prefetchQuery(contentQueries.home())
  },
  component: HomePage,
})

function HomePage() {
  const { search, update, reset } = useCatalogSearch()
  return <HomeContent search={search} update={update} reset={reset} />
}
