import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

function CartPage() {
  return (
    <SiteLayout>
      <PageContainer className="py-10">
        <h1 className="text-2xl font-bold">Carrinho de NFTs</h1>
      </PageContainer>
    </SiteLayout>
  )
}
