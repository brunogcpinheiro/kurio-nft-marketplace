import { authHandlers } from './handlers/auth'
import { cartHandlers } from './handlers/cart'
import { contentHandlers } from './handlers/content'
import { controlHandlers } from './handlers/control'
import { nftHandlers } from './handlers/nfts'
import { socketHandlers } from './socket-server'

export const handlers = [
  ...controlHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...contentHandlers,
  ...cartHandlers,
  ...socketHandlers,
]
