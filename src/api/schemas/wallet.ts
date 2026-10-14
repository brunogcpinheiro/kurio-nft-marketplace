import { z } from 'zod'
import { networkSchema, providerSchema } from './common'

export const walletSlotSchema = z.enum(['primary', 'secondary'])
export type WalletSlot = z.infer<typeof walletSlotSchema>

export const walletInputSchema = z.object({
  displayName: z.string().trim().min(2, 'Informe o nome de exibição'),
  nickname: z.string().trim().min(2, 'Informe um apelido para a carteira'),
  network: networkSchema,
  profileName: z.string().trim().min(2, 'Informe o nome do perfil'),
  address: z.string().trim().min(1, 'Informe o endereço da carteira'),
  secondaryAddress: z.string().trim().nullable(),
  provider: providerSchema,
  referralCode: z.string().trim().min(1, 'Informe o código de indicação'),
  email: z.string().trim().email('Informe um e-mail válido'),
  ensName: z
    .string()
    .trim()
    .min(1, 'Informe o nome ENS')
    .regex(/^[a-z0-9-]+$/i, 'Use apenas letras, números e hífen'),
})
export type WalletInput = z.infer<typeof walletInputSchema>

export const walletSchema = walletInputSchema.extend({
  id: z.string(),
  slot: walletSlotSchema,
})
export type Wallet = z.infer<typeof walletSchema>

export const walletsResponseSchema = z.object({
  primary: walletSchema.nullable(),
  secondary: walletSchema.nullable(),
})
export type WalletsResponse = z.infer<typeof walletsResponseSchema>
