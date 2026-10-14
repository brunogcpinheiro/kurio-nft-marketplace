import { z } from 'zod'
import { ethAmountSchema, networkSchema, providerSchema } from './common'
import { quoteLineSchema } from './quote'

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'rejected'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const collectorSchema = z.object({
  displayName: z.string().trim().min(2, 'Informe o nome de exibição'),
  username: z.string().trim().min(3, 'Informe o nome de usuário'),
  network: networkSchema,
  profileName: z.string().trim().min(2, 'Informe o nome do perfil'),
  address: z.string().trim().min(1, 'Informe o endereço da carteira'),
  secondaryAddress: z.string().trim().optional(),
  provider: providerSchema,
  referralCode: z.string().trim().min(1, 'Informe o código de indicação'),
  email: z.string().trim().email('Informe um e-mail válido'),
  ensName: z.string().trim().min(1, 'Informe o nome ENS'),
  note: z.string().trim().max(500, 'Use no máximo 500 caracteres').optional(),
})
export type Collector = z.infer<typeof collectorSchema>

export const createOrderInputSchema = z.object({
  quoteId: z.string(),
  provider: providerSchema,
  walletId: z.string().nullable(),
  network: networkSchema,
  collector: collectorSchema,
})
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: orderStatusSchema,
  version: z.number().int(),
  txHash: z.string().nullable(),
  explorerUrl: z.string().nullable(),
  createdAt: z.string(),
  settledAt: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  lines: z.array(quoteLineSchema),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  wallet: z.object({
    provider: providerSchema,
    address: z.string(),
    network: networkSchema,
    label: z.string(),
  }),
})
export type Order = z.infer<typeof orderSchema>
