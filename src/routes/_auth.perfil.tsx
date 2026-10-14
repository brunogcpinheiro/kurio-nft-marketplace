import { Outlet, createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'

export const Route = createFileRoute('/_auth/perfil')({
  component: AccountLayout,
})

function AccountLayout() {
  return (
    <SiteLayout footer={false}>
      <PageContainer className="py-10">
        <Outlet />
      </PageContainer>
    </SiteLayout>
  )
}
