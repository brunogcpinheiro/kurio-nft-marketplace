import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import type { PasswordInput, ProfileInput, User } from '@/api/schemas'
import { useSession } from '@/features/auth/use-session'

export const profileQueries = {
  get: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.profile(userId),
      queryFn: ({ signal }) => profileApi.get(signal),
      staleTime: 60_000,
    }),
}

export function useProfile() {
  const { user } = useSession()
  return useQuery({ ...profileQueries.get(user?.id ?? ''), enabled: Boolean(user) })
}

function useSyncUser() {
  const queryClient = useQueryClient()
  return (user: User) => {
    queryClient.setQueryData(queryKeys.profile(user.id), user)
    queryClient.setQueryData<{ user: User; expiresAt: string }>(queryKeys.session, (current) =>
      current ? { ...current, user } : current,
    )
  }
}

export function useUpdateProfile() {
  const sync = useSyncUser()
  return useMutation({
    mutationFn: (input: ProfileInput) => profileApi.update(input),
    onSuccess: sync,
  })
}

export function useUpdateAvatar() {
  const sync = useSyncUser()
  return useMutation({
    mutationFn: (dataUrl: string | null) => profileApi.updateAvatar(dataUrl),
    onSuccess: sync,
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: (input: PasswordInput) => profileApi.changePassword(input) })
}
