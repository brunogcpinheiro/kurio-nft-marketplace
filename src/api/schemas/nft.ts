import { z } from 'zod'
import { ethAmountSchema, networkSchema } from './common'

export const imageKeySchema = z.enum(['emerald', 'sage', 'ivory', 'golden'])
export type ImageKey = z.infer<typeof imageKeySchema>

export const editionSchema = z.object({
  id: z.string(),
  label: z.string(),
  price: ethAmountSchema,
  available: z.number().int().min(0),
  total: z.number().int().positive().nullable(),
})
export type Edition = z.infer<typeof editionSchema>

export const nftSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tokenId: z.string(),
  imageKey: imageKeySchema,
  price: ethAmountSchema,
  previousPrice: ethAmountSchema.nullable(),
  rare: z.boolean(),
  network: networkSchema,
  category: z.string(),
  version: z.number().int(),
})
export type NftSummary = z.infer<typeof nftSummarySchema>

export const nftSchema = nftSummarySchema.extend({
  collection: z.string(),
  description: z.string(),
  longDescription: z.string(),
  attributes: z.array(z.string()),
  rating: z.object({ average: z.number(), count: z.number().int() }),
  editions: z.array(editionSchema),
  contract: z.string(),
  listedAt: z.string(),
})
export type Nft = z.infer<typeof nftSchema>

export const catalogSortSchema = z.enum(['recent', 'price-asc', 'price-desc', 'popular'])
export type CatalogSort = z.infer<typeof catalogSortSchema>

export const catalogTabSchema = z.enum(['all', 'new', 'trending'])
export type CatalogTab = z.infer<typeof catalogTabSchema>

export const catalogQuerySchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  category: z.string().min(1).optional().catch(undefined),
  network: networkSchema.optional().catch(undefined),
  minPrice: ethAmountSchema.optional().catch(undefined),
  maxPrice: ethAmountSchema.optional().catch(undefined),
  sort: catalogSortSchema.default('recent').catch('recent'),
  tab: catalogTabSchema.default('all').catch('all'),
  page: z.number().int().min(1).default(1).catch(1),
})
export type CatalogQuery = z.infer<typeof catalogQuerySchema>
export type CatalogQueryInput = z.input<typeof catalogQuerySchema>

export const catalogDefaults = { sort: 'recent', tab: 'all', page: 1 } as const

export const facetSchema = z.object({ slug: z.string(), name: z.string(), count: z.number().int() })

export const catalogPageSchema = z.object({
  items: z.array(nftSummarySchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  facets: z.object({
    categories: z.array(facetSchema),
    networks: z.array(facetSchema.extend({ slug: networkSchema })),
    priceRange: z.object({ min: ethAmountSchema, max: ethAmountSchema }),
  }),
})
export type CatalogPage = z.infer<typeof catalogPageSchema>

export const relatedNftsSchema = z.object({ items: z.array(nftSummarySchema) })
