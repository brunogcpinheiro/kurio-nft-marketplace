import { z } from 'zod'
import { ethAmountSchema, networkSchema } from './common'
import { imageKeySchema } from './nft'

export const quoteLineSchema = z.object({
  cartItemId: z.string(),
  nftId: z.string(),
  slug: z.string(),
  editionId: z.string(),
  name: z.string(),
  tokenId: z.string(),
  imageKey: imageKeySchema,
  editionLabel: z.string(),
  quantity: z.number().int().min(0),
  requestedQuantity: z.number().int().min(1),
  unitPrice: ethAmountSchema,
  lineTotal: ethAmountSchema,
  availability: z.enum(['ok', 'reduced', 'sold_out']),
  priceChanged: z.boolean(),
})
export type QuoteLine = z.infer<typeof quoteLineSchema>

export const quoteSchema = z.object({
  quoteId: z.string(),
  lines: z.array(quoteLineSchema),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  network: networkSchema,
  coupon: z
    .object({ code: z.string(), status: z.enum(['applied', 'invalid', 'expired']) })
    .nullable(),
  expiresAt: z.string(),
  issues: z.array(z.string()),
})
export type Quote = z.infer<typeof quoteSchema>
