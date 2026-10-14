import { z } from 'zod'
import { editionSchema, nftSummarySchema } from './nft'

export const cartItemSchema = z.object({
  id: z.string(),
  nftId: z.string(),
  editionId: z.string(),
  quantity: z.number().int().min(1),
  nft: nftSummarySchema,
  edition: editionSchema,
})
export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = z.object({
  id: z.string(),
  items: z.array(cartItemSchema),
  couponCode: z.string().nullable(),
  version: z.number().int(),
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemInputSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  quantity: z.number().int().min(1),
})
export type AddCartItemInput = z.infer<typeof addCartItemInputSchema>

export const updateCartItemInputSchema = z.object({ quantity: z.number().int().min(1) })

export const couponInputSchema = z.object({
  code: z.string().trim().min(1, 'Digite um código').toUpperCase(),
})
