import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthScreen } from '@/features/auth/auth-screen'

export const authSearchSchema = z.object({ redirect: z.string().optional().catch(undefined) })

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  return <AuthScreen mode="login" redirect={redirect} />
}
