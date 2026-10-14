import { http } from 'msw'
import { avatarInputSchema, passwordInputSchema, profileInputSchema } from '@/api/schemas'
import { getDb, updateDb } from '../db'
import {
  ApiFailure,
  hashPassword,
  json,
  mocked,
  noContent,
  parseBody,
  requireSession,
} from '../http'

export const profileHandlers = [
  http.get(
    '/api/profile',
    mocked({ key: 'profile', private: true }, ({ request }) => json(requireSession(request).user)),
  ),
  http.patch(
    '/api/profile',
    mocked({ key: 'profile', private: true }, async ({ request }) => {
      const { user } = requireSession(request)
      const input = await parseBody(request, profileInputSchema)
      const db = getDb()
      const fields: Record<string, string> = {}
      if (
        db.users.some(
          (u) =>
            u.user.id !== user.id && u.user.username.toLowerCase() === input.username.toLowerCase(),
        )
      ) {
        fields.username = 'Este nome de usuário já está em uso'
      }
      if (
        db.users.some((u) => u.user.id !== user.id && u.user.email === input.email.toLowerCase())
      ) {
        fields.email = 'Este e-mail já está em uso'
      }
      if (Object.keys(fields).length)
        throw new ApiFailure(409, 'CONFLICT', 'Alguns dados já estão em uso.', fields)
      const updated = updateDb((d) => {
        const record = d.users.find((u) => u.user.id === user.id)!
        record.user = { ...record.user, ...input, email: input.email.toLowerCase() }
        return record.user
      })
      return json(updated)
    }),
  ),
  http.patch(
    '/api/profile/avatar',
    mocked({ key: 'profile', private: true }, async ({ request }) => {
      const { user } = requireSession(request)
      const input = await parseBody(request, avatarInputSchema)
      if (input.dataUrl && input.dataUrl.length > 400_000) {
        throw new ApiFailure(422, 'VALIDATION', 'Imagem muito grande.', {
          avatar: 'Use uma imagem de até 1 MB',
        })
      }
      const updated = updateDb((d) => {
        const record = d.users.find((u) => u.user.id === user.id)!
        record.user = { ...record.user, avatarUrl: input.dataUrl }
        return record.user
      })
      return json(updated)
    }),
  ),
  http.post(
    '/api/profile/password',
    mocked({ key: 'profile', private: true }, async ({ request }) => {
      const { user } = requireSession(request)
      const input = await parseBody(request, passwordInputSchema)
      const record = getDb().users.find((u) => u.user.id === user.id)!
      const currentHash = await hashPassword(input.currentPassword)
      if (currentHash !== record.passwordHash) {
        throw new ApiFailure(422, 'VALIDATION', 'Senha atual incorreta.', {
          currentPassword: 'Senha atual incorreta',
        })
      }
      const nextHash = await hashPassword(input.newPassword)
      updateDb(() => {
        record.passwordHash = nextHash
      })
      return noContent()
    }),
  ),
]
