import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  email: z.string(),
  ensName: z.string(),
  walletNickname: z.string(),
  avatarUrl: z.string().nullable(),
})
export type User = z.infer<typeof userSchema>

export const registerInputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Use pelo menos 3 caracteres')
    .max(24, 'Use no máximo 24 caracteres')
    .regex(/^[a-z0-9_.]+$/i, 'Use apenas letras, números, ponto ou sublinhado'),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
})
export type RegisterInput = z.infer<typeof registerInputSchema>

export const loginInputSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
})
export type LoginInput = z.infer<typeof loginInputSchema>

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
  expiresAt: z.string(),
})
export type AuthResponse = z.infer<typeof authResponseSchema>

export const sessionResponseSchema = z.object({
  user: userSchema,
  expiresAt: z.string(),
})
export type SessionResponse = z.infer<typeof sessionResponseSchema>
