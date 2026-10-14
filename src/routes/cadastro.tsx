import { createFileRoute } from '@tanstack/react-router'
import { AuthScreen } from '@/features/auth/auth-screen'
import { authSearchSchema } from './login'

export const Route = createFileRoute('/cadastro')({
  validateSearch: authSearchSchema,
  component: RegisterPage,
})

function RegisterPage() {
  const { redirect } = Route.useSearch()
  return <AuthScreen mode="register" redirect={redirect} />
}
