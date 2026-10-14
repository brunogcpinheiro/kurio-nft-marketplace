import { useCallback } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { catalogDefaults, catalogQuerySchema } from '@/api/schemas'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'
import { Blog } from '@/features/catalog/blog'
import { FeaturedBanner } from '@/features/catalog/featured-banner'
import { FiltersDrawer, FiltersPanel } from '@/features/catalog/filters'
import { CatalogGrid } from '@/features/catalog/grid'
import { Hero } from '@/features/catalog/hero'
import { MobileSearch } from '@/features/catalog/mobile-search'
import { Pagination } from '@/features/catalog/pagination'
import { Promos } from '@/features/catalog/promos'
import { catalogQueries } from '@/features/catalog/queries'
import { CatalogToolbar } from '@/features/catalog/toolbar'
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
  const catalog = useQuery({ ...catalogQueries.list(search), placeholderData: keepPreviousData })
  const content = useQuery(contentQueries.home())
  const onSearch = useCallback((q: string | undefined) => update({ q }), [update])

  return (
    <SiteLayout>
      <PageContainer className="pt-10 md:pt-0">
        <div className="flex gap-2 md:hidden">
          <MobileSearch value={search.q} onChange={onSearch} />
          <FiltersDrawer facets={catalog.data?.facets} search={search} onChange={update} />
        </div>

        <Hero content={content.data?.hero} />

        <section
          id="catalogo"
          aria-label="Catálogo"
          className="mt-4 grid scroll-mt-6 gap-12 md:mt-24 xl:grid-cols-[310px_1fr]"
        >
          <aside className="hidden flex-col gap-6 xl:flex">
            <FiltersPanel facets={catalog.data?.facets} search={search} onChange={update} />
            <FeaturedBanner nft={content.data?.featured} />
          </aside>
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <CatalogToolbar search={search} onChange={update} />
              </div>
              <FiltersDrawer
                facets={catalog.data?.facets}
                search={search}
                onChange={update}
                triggerClassName="hidden md:flex xl:hidden"
              />
            </div>
            <CatalogGrid
              data={catalog.data}
              error={catalog.error}
              isPending={catalog.isPending}
              isPlaceholder={catalog.isPlaceholderData}
              isFetching={catalog.isFetching}
              onRetry={() => void catalog.refetch()}
              onReset={reset}
            />
            {catalog.data ? (
              <Pagination page={catalog.data.page} totalPages={catalog.data.totalPages} />
            ) : null}
          </div>
        </section>

        <div className="mt-16 flex flex-col gap-16 md:mt-24 md:gap-24">
          <Promos promos={content.data?.promos} />
          <Blog posts={content.data?.posts} />
        </div>
      </PageContainer>
    </SiteLayout>
  )
}
