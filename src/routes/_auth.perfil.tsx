import { Outlet, createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'
import { AccountNav } from '@/features/profile/account-nav'

export const Route = createFileRoute('/_auth/perfil')({
  component: AccountLayout,
})

function AccountLayout() {
  return (
    <SiteLayout footer={false}>
      <PageContainer className="flex flex-col gap-6 pt-6 pb-16 md:flex-row md:gap-7 md:pt-8">
        <AccountNav />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </PageContainer>
    </SiteLayout>
  )
}
