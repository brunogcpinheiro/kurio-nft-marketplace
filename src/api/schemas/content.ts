import { z } from 'zod'
import { nftSummarySchema } from './nft'

export const homeContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    mobileTitle: z.string(),
    description: z.string(),
    mobileDescription: z.string(),
    cta: z.string(),
    imageKey: z.enum(['emerald', 'sage', 'ivory', 'golden']),
  }),
  featured: nftSummarySchema,
  promos: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      cta: z.string(),
      imageKey: z.enum(['emerald', 'sage', 'ivory', 'golden']),
    }),
  ),
  posts: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      readingTime: z.string(),
      title: z.string(),
      excerpt: z.string(),
      imageKey: z.enum(['emerald', 'sage', 'ivory', 'golden']),
    }),
  ),
})
export type HomeContent = z.infer<typeof homeContentSchema>
