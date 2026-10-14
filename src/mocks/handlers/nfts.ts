import { http } from 'msw'
import {
  catalogQuerySchema,
  type CatalogPage,
  type CatalogQuery,
  type Network,
  type NftSummary,
} from '@/api/schemas'
import { getDb, type NftRecord } from '../db'
import { ApiFailure, json, mocked } from '../http'
import { getScenario } from '../scenarios'

export const pageSize = 9

const categoryNames: Record<string, string> = {
  'arte-digital': 'Arte digital',
  fotografia: 'Fotografia',
  musica: 'Música',
  'arte-3d': 'Arte 3D',
  colecionaveis: 'Colecionáveis',
  generativa: 'Generativa',
  jogos: 'Jogos',
  assinaturas: 'Assinaturas',
  utilidade: 'Utilidade',
}
const categoryOrder = Object.keys(categoryNames)
const networkNames: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}
const networkOrder: Network[] = ['ethereum', 'polygon', 'solana']

export function toSummary(nft: NftRecord): NftSummary {
  return {
    id: nft.id,
    slug: nft.slug,
    name: nft.name,
    tokenId: nft.tokenId,
    imageKey: nft.imageKey,
    price: nft.price,
    previousPrice: nft.previousPrice,
    rare: nft.rare,
    network: nft.network,
    category: nft.category,
    version: nft.version,
  }
}

function parseQuery(url: URL): CatalogQuery {
  const raw: Record<string, unknown> = Object.fromEntries(url.searchParams.entries())
  if (typeof raw.page === 'string') raw.page = Number(raw.page)
  return catalogQuerySchema.parse(raw)
}

function matches(
  nft: NftRecord,
  query: CatalogQuery,
  newestListing: number,
  skip?: keyof CatalogQuery,
) {
  if (query.q) {
    const term = query.q.toLowerCase()
    const haystack = `${nft.name} ${nft.collection} ${nft.tokenId}`.toLowerCase()
    if (!haystack.includes(term)) return false
  }
  if (skip !== 'category' && query.category && nft.category !== query.category) return false
  if (skip !== 'network' && query.network && nft.network !== query.network) return false
  const price = Number(nft.price)
  if (query.minPrice && price < Number(query.minPrice)) return false
  if (query.maxPrice && price > Number(query.maxPrice)) return false
  if (query.tab === 'new' && newestListing - Date.parse(nft.listedAt) > 14 * 24 * 60 * 60 * 1000)
    return false
  if (query.tab === 'trending' && nft.trendingScore < 70) return false
  return true
}

function sortItems(items: NftRecord[], sort: CatalogQuery['sort']) {
  const copy = [...items]
  if (sort === 'price-asc') copy.sort((a, b) => Number(a.price) - Number(b.price))
  if (sort === 'price-desc') copy.sort((a, b) => Number(b.price) - Number(a.price))
  if (sort === 'popular')
    copy.sort((a, b) => b.trendingScore - a.trendingScore || b.rating.count - a.rating.count)
  if (sort === 'recent') copy.sort((a, b) => Date.parse(b.listedAt) - Date.parse(a.listedAt))
  return copy
}

export const nftHandlers = [
  http.get(
    '/api/nfts',
    mocked({ key: 'catalog', flaky: true }, ({ request }) => {
      const query = parseQuery(new URL(request.url))
      const all = getScenario() === 'empty-catalog' ? [] : getDb().nfts
      const newestListing = Math.max(0, ...all.map((n) => Date.parse(n.listedAt)))
      const filtered = sortItems(
        all.filter((n) => matches(n, query, newestListing)),
        query.sort,
      )
      const total = filtered.length
      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      const page = Math.min(query.page, totalPages)
      const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(toSummary)
      const forCategories = all.filter((n) => matches(n, query, newestListing, 'category'))
      const forNetworks = all.filter((n) => matches(n, query, newestListing, 'network'))
      const prices = getDb().nfts.map((n) => Number(n.price))
      const body: CatalogPage = {
        items,
        page,
        pageSize,
        total,
        totalPages,
        facets: {
          categories: categoryOrder.map((slug) => ({
            slug,
            name: categoryNames[slug] ?? slug,
            count: forCategories.filter((n) => n.category === slug).length,
          })),
          networks: networkOrder.map((slug) => ({
            slug,
            name: networkNames[slug],
            count: forNetworks.filter((n) => n.network === slug).length,
          })),
          priceRange: {
            min: prices.length ? Math.min(...prices).toFixed(2) : '0.00',
            max: prices.length ? Math.max(...prices).toFixed(2) : '0.00',
          },
        },
      }
      return json(body)
    }),
  ),
  http.get(
    '/api/nfts/:slug',
    mocked({ key: 'nft' }, ({ params }) => {
      const nft = getDb().nfts.find((n) => n.slug === params.slug)
      if (!nft) throw new ApiFailure(404, 'NOT_FOUND', 'NFT não encontrado')
      const { trendingScore: _score, ...rest } = nft
      return json(rest)
    }),
  ),
  http.get(
    '/api/nfts/:slug/related',
    mocked({ key: 'nft' }, ({ params }) => {
      const db = getDb()
      const nft = db.nfts.find((n) => n.slug === params.slug)
      if (!nft) throw new ApiFailure(404, 'NOT_FOUND', 'NFT não encontrado')
      const sameCollection = db.nfts.filter(
        (n) => n.id !== nft.id && n.collection === nft.collection,
      )
      const sameCategory = db.nfts.filter(
        (n) => n.id !== nft.id && n.collection !== nft.collection && n.category === nft.category,
      )
      const items = [...sameCollection, ...sameCategory].slice(0, 8).map(toSummary)
      return json({ items })
    }),
  ),
]
