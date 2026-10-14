import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'

export const Route = createFileRoute('/nft/$slug')({
  component: NftPage,
})

function NftPage() {
  const { slug } = Route.useParams()
  return (
    <SiteLayout>
      <PageContainer className="py-10">
        <h1 className="text-2xl font-bold">{slug}</h1>
      </PageContainer>
    </SiteLayout>
  )
}
