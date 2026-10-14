import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import { realtimeEvents } from '@/api/schemas'
import { applyNftChange } from './catalog-changes'
import { getDb } from './db'
import { findSession } from './http'
import { getScenario } from './scenarios'
import { settleDueOrders } from './handlers/orders'

type Connection = {
  id: string
  userId: string | null
  ownerKey: string | null
  isOpen: () => boolean
  emit: (event: string, payload: unknown) => void
  close: () => void
}

const link = ws.link(`${import.meta.env.VITE_SOCKET_URL}/*`)
const connections = new Map<string, Connection>()
const pingIntervalMs = 20000

export const socketHandlers = [
  link.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    const id = crypto.randomUUID()
    const timers: ReturnType<typeof setTimeout>[] = []
    const ping = setInterval(() => connection.client.send('2'), pingIntervalMs)
    let open = true

    const entry: Connection = {
      id,
      userId: null,
      ownerKey: null,
      isOpen: () => open,
      emit: (event, payload) => io.client.emit(event, payload),
      close: () => connection.client.close(),
    }
    connections.set(id, entry)

    connection.client.addEventListener('message', (message) => {
      if (typeof message.data !== 'string') return
      for (const packet of message.data.split('\x1e')) {
        if (!packet.startsWith('40')) continue
        const auth = parseAuth(packet.slice(2))
        const session = findSession(auth.token)
        entry.userId = session?.userId ?? null
        entry.ownerKey = entry.userId
          ? `user:${entry.userId}`
          : auth.guest
            ? `guest:${auth.guest}`
            : null
        scheduleScenario(entry, timers)
        settleDueOrders()
      }
    })

    connection.client.addEventListener('close', () => {
      open = false
      clearInterval(ping)
      for (const timer of timers) clearTimeout(timer)
      connections.delete(id)
    })
  }),
]

function parseAuth(raw: string): { token: string | null; guest: string | null } {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      token: typeof parsed.token === 'string' && parsed.token ? parsed.token : null,
      guest: typeof parsed.guest === 'string' && parsed.guest ? parsed.guest : null,
    }
  } catch {
    return { token: null, guest: null }
  }
}

function scheduleScenario(entry: Connection, timers: ReturnType<typeof setTimeout>[]) {
  const scenario = getScenario()
  const ownerKey = entry.ownerKey
  if ((scenario !== 'price-change-in-checkout' && scenario !== 'edition-sold-out') || !ownerKey)
    return
  timers.push(
    setTimeout(() => {
      const cart = getDb().carts.find((c) => c.ownerKey === ownerKey)
      const first = cart?.items[0]
      if (!first) return
      const change = scenario === 'edition-sold-out' ? 'sold-out' : 'price-up'
      const event = applyNftChange(first.nftId, change, first.editionId)
      if (event) emitRealtime(realtimeEvents.nftUpdated, event)
    }, 5000),
  )
}

export function listSocketConnections() {
  return Array.from(connections.values())
    .filter((c) => c.isOpen())
    .map((c) => ({ userId: c.userId, ownerKey: c.ownerKey }))
}

export function emitRealtime(event: string, payload: unknown, targetUserId?: string) {
  let delivered = 0
  for (const connection of connections.values()) {
    if (!connection.isOpen()) {
      connections.delete(connection.id)
      continue
    }
    if (event === realtimeEvents.orderUpdated && connection.userId !== targetUserId) continue
    connection.emit(event, payload)
    delivered += 1
  }
  return delivered
}

export function disconnectAllSockets() {
  const count = connections.size
  for (const connection of connections.values()) connection.close()
  return count
}
