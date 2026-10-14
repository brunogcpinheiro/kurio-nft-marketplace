import { api } from './client'
import {
  authResponseSchema,
  cartSchema,
  catalogPageSchema,
  homeContentSchema,
  nftSchema,
  relatedNftsSchema,
  sessionResponseSchema,
  type CatalogQuery,
  type LoginInput,
  type RegisterInput,
} from './schemas'

export const authApi = {
  register: (input: RegisterInput) =>
    api.post('/auth/register', input).then((r) => authResponseSchema.parse(r.data)),
  login: (input: LoginInput) =>
    api.post('/auth/login', input).then((r) => authResponseSchema.parse(r.data)),
  session: (signal?: AbortSignal) =>
    api.get('/auth/session', { signal }).then((r) => sessionResponseSchema.parse(r.data)),
  logout: () => api.post('/auth/logout').then(() => undefined),
}

export const nftsApi = {
  list: (query: CatalogQuery, signal?: AbortSignal) =>
    api.get('/nfts', { params: query, signal }).then((r) => catalogPageSchema.parse(r.data)),
  detail: (slug: string, signal?: AbortSignal) =>
    api.get(`/nfts/${slug}`, { signal }).then((r) => nftSchema.parse(r.data)),
  related: (slug: string, signal?: AbortSignal) =>
    api.get(`/nfts/${slug}/related`, { signal }).then((r) => relatedNftsSchema.parse(r.data)),
}

export const contentApi = {
  home: (signal?: AbortSignal) =>
    api.get('/content/home', { signal }).then((r) => homeContentSchema.parse(r.data)),
}

export const cartApi = {
  get: (signal?: AbortSignal) => api.get('/cart', { signal }).then((r) => cartSchema.parse(r.data)),
}
