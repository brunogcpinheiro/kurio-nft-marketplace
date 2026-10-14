import { io, type Socket } from 'socket.io-client'
import { session } from '@/features/auth/session'
import { guestCart } from '@/features/cart/use-guest-cart'
import { env } from '@/lib/env'
import { mocksReady } from '@/lib/mocks-ready'

let socket: Socket | null = null

function identity() {
  return { token: session.get()?.token ?? '', guest: guestCart.get() ?? '' }
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(env.socketUrl, {
      autoConnect: false,
      transports: ['websocket'],
      auth: (cb) => cb(identity()),
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
    })
  }
  return socket
}

export function connectSocket() {
  void mocksReady.then(() => {
    const current = getSocket()
    if (current.connected) current.disconnect()
    current.connect()
  })
}
