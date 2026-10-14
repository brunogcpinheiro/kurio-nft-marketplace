import { createFileRoute } from '@tanstack/react-router'
import { ErrorState } from '@/components/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileForm } from '@/features/profile/profile-form'
import { useProfile } from '@/features/profile/queries'

export const Route = createFileRoute('/_auth/perfil/')({
  component: ProfilePage,
})

function ProfilePage() {
  const profile = useProfile()
  if (profile.isPending) {
    return (
      <div className="flex flex-col gap-8" aria-busy="true" aria-label="Carregando perfil">
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-6 md:grid-cols-2 md:gap-x-7">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[79px]" />
          ))}
        </div>
      </div>
    )
  }
  if (!profile.data) {
    return (
      <ErrorState
        title="Não foi possível carregar o perfil"
        error={profile.error}
        onRetry={() => void profile.refetch()}
        retrying={profile.isFetching}
      />
    )
  }
  return <ProfileForm key={profile.data.id} user={profile.data} />
}
