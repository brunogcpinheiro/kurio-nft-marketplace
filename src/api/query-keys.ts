import type { CatalogQuery } from './schemas'

export const queryKeys = {
  session: ['session'] as const,
  nfts: {
    all: ['nfts'] as const,
    list: (query: CatalogQuery) => ['nfts', 'list', query] as const,
    detail: (slug: string) => ['nfts', 'detail', slug] as const,
    related: (slug: string) => ['nfts', 'related', slug] as const,
  },
  content: { home: ['content', 'home'] as const },
  favorites: (userId: string) => ['favorites', userId] as const,
  cart: (ownerKey: string) => ['cart', ownerKey] as const,
  quote: (ownerKey: string) => ['quote', ownerKey] as const,
  orders: {
    detail: (userId: string, orderId: string) => ['orders', userId, orderId] as const,
  },
  profile: (userId: string) => ['profile', userId] as const,
  wallets: (userId: string) => ['wallets', userId] as const,
}
