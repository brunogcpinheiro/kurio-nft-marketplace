import { z } from 'zod'
import { api } from './client'
import {
  authResponseSchema,
  cartSchema,
  catalogPageSchema,
  homeContentSchema,
  nftSchema,
  relatedNftsSchema,
  sessionResponseSchema,
  nftSummarySchema,
  userSchema,
  walletSchema,
  walletsResponseSchema,
  type AddCartItemInput,
  type CatalogQuery,
  type LoginInput,
  type PasswordInput,
  type ProfileInput,
  type RegisterInput,
  type WalletInput,
  type WalletSlot,
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
  addItem: (input: AddCartItemInput) =>
    api.post('/cart/items', input).then((r) => cartSchema.parse(r.data)),
}

export const favoritesApi = {
  list: (signal?: AbortSignal) =>
    api
      .get('/favorites', { signal })
      .then((r) =>
        z.object({ nftIds: z.array(z.string()), items: z.array(nftSummarySchema) }).parse(r.data),
      ),
  add: (nftId: string) => api.put(`/favorites/${nftId}`).then(() => undefined),
  remove: (nftId: string) => api.delete(`/favorites/${nftId}`).then(() => undefined),
}

export const profileApi = {
  get: (signal?: AbortSignal) =>
    api.get('/profile', { signal }).then((r) => userSchema.parse(r.data)),
  update: (input: ProfileInput) =>
    api.patch('/profile', input).then((r) => userSchema.parse(r.data)),
  updateAvatar: (dataUrl: string | null) =>
    api.patch('/profile/avatar', { dataUrl }).then((r) => userSchema.parse(r.data)),
  changePassword: (input: PasswordInput) =>
    api.post('/profile/password', input).then(() => undefined),
}

export const walletsApi = {
  list: (signal?: AbortSignal) =>
    api.get('/wallets', { signal }).then((r) => walletsResponseSchema.parse(r.data)),
  save: (slot: WalletSlot, input: WalletInput) =>
    api.put(`/wallets/${slot}`, input).then((r) => walletSchema.parse(r.data)),
}
