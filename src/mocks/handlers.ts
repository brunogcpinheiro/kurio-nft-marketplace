import { authHandlers } from './handlers/auth'
import { cartHandlers } from './handlers/cart'
import { contentHandlers } from './handlers/content'
import { controlHandlers } from './handlers/control'
import { favoritesHandlers } from './handlers/favorites'
import { nftHandlers } from './handlers/nfts'
import { profileHandlers } from './handlers/profile'
import { walletHandlers } from './handlers/wallets'
import { socketHandlers } from './socket-server'

export const handlers = [
  ...controlHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...contentHandlers,
  ...cartHandlers,
  ...favoritesHandlers,
  ...profileHandlers,
  ...walletHandlers,
  ...socketHandlers,
]
