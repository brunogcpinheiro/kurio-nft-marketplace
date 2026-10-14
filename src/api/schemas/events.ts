import { z } from 'zod'
import { ethAmountSchema } from './common'
import { editionSchema } from './nft'
import { orderStatusSchema } from './order'

export const nftUpdatedEventSchema = z.object({
  eventId: z.string(),
  nftId: z.string(),
  version: z.number().int(),
  price: ethAmountSchema,
  previousPrice: ethAmountSchema.nullable(),
  editions: z.array(editionSchema),
})
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>

export const orderUpdatedEventSchema = z.object({
  eventId: z.string(),
  orderId: z.string(),
  userId: z.string(),
  version: z.number().int(),
  status: orderStatusSchema,
  txHash: z.string().nullable(),
  rejectionReason: z.string().nullable(),
})
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>

export const realtimeEvents = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
} as const
