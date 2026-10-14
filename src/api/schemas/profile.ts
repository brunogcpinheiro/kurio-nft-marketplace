import { z } from 'zod'

export const profileInputSchema = z.object({
  displayName: z.string().trim().min(2, 'Informe o nome de exibição'),
  username: z
    .string()
    .trim()
    .min(3, 'Use pelo menos 3 caracteres')
    .max(24, 'Use no máximo 24 caracteres')
    .regex(/^[a-z0-9_.]+$/i, 'Use apenas letras, números, ponto ou sublinhado'),
  email: z.string().trim().email('Informe um e-mail válido'),
  ensName: z
    .string()
    .trim()
    .min(1, 'Informe o nome ENS')
    .regex(/^[a-z0-9-]+$/i, 'Use apenas letras, números e hífen'),
  walletNickname: z.string().trim().min(2, 'Informe o apelido da carteira'),
})
export type ProfileInput = z.infer<typeof profileInputSchema>

export const avatarInputSchema = z.object({
  dataUrl: z.string().startsWith('data:image/').nullable(),
})

export const passwordInputSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().min(8, 'A nova senha precisa ter pelo menos 8 caracteres'),
})
export type PasswordInput = z.infer<typeof passwordInputSchema>
