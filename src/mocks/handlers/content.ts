import { http } from 'msw'
import { getDb } from '../db'
import { featuredSlug, homeContentFixture } from '../fixtures/content'
import { ApiFailure, json, mocked } from '../http'
import { toSummary } from './nfts'

export const contentHandlers = [
  http.get(
    '/api/content/home',
    mocked({ key: 'content', flaky: true }, () => {
      const nft = getDb().nfts.find((n) => n.slug === featuredSlug) ?? getDb().nfts[0]
      if (!nft) throw new ApiFailure(404, 'NOT_FOUND', 'Conteúdo indisponível')
      return json({ ...homeContentFixture, featured: toSummary(nft) })
    }),
  ),
]
