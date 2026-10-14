import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PageContainer } from '@/components/layout/page-container'
import { SiteLayout } from '@/components/layout/site-layout'

export const authSearchSchema = z.object({ redirect: z.string().optional().catch(undefined) })

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  component: () => (
    <SiteLayout>
      <PageContainer className="py-10">
        <h1 className="text-2xl font-bold">Entrar</h1>
      </PageContainer>
    </SiteLayout>
  ),
})
