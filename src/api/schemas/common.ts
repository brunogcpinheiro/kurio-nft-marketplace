import { z } from 'zod'

export const networkSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Network = z.infer<typeof networkSchema>

export const providerSchema = z.enum(['metamask', 'walletconnect', 'coinbase'])
export type Provider = z.infer<typeof providerSchema>

export const ethAmountSchema = z.string().regex(/^\d+(\.\d{1,18})?$/, 'Valor em ETH inválido')

export const errorCodeSchema = z.enum([
  'VALIDATION',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'QUOTE_STALE',
  'UNAVAILABLE',
  'IDEMPOTENCY_MISMATCH',
])
export type ErrorCode = z.infer<typeof errorCodeSchema>

export const apiErrorSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
})
export type ApiError = z.infer<typeof apiErrorSchema>

export const networkLabels: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

export const providerLabels: Record<Provider, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}
