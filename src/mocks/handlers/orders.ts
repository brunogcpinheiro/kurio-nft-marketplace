import { http, delay } from 'msw'
import {
  createOrderInputSchema,
  realtimeEvents,
  type Order,
  type OrderStatus,
  type OrderUpdatedEvent,
} from '@/api/schemas'
import { getDb, nextId, updateDb, type OrderRecord } from '../db'
import { ApiFailure, json, mocked, parseBody, requireSession, sha256 } from '../http'
import { canonicalJson, resolveIdempotentOrder } from '../idempotency'
import { getScenario } from '../scenarios'
import { emitRealtime } from '../socket-server'
import { buildQuote, quoteTtlMs } from './quote'

export const settleDelayMs = 3000
const timers = new Map<string, ReturnType<typeof setTimeout>>()

const explorers = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  solana: 'https://solscan.io/tx/',
}

function randomHex(size: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(size / 2)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
}

function publicOrder(record: OrderRecord): Order {
  const {
    quoteId: _quoteId,
    settleAt: _settleAt,
    outcome: _outcome,
    purchased: _purchased,
    ...order
  } = record
  return order
}

export function settleOrder(
  orderId: string,
  status: Exclude<OrderStatus, 'pending'>,
  reason?: string,
) {
  const timer = timers.get(orderId)
  if (timer) clearTimeout(timer)
  timers.delete(orderId)
  const event = updateDb((db): OrderUpdatedEvent | null => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order || order.status !== 'pending') return null
    order.status = status
    order.version += 1
    order.settledAt = new Date().toISOString()
    order.rejectionReason =
      status === 'rejected' ? (reason ?? 'Saldo insuficiente na carteira conectada.') : null
    if (status === 'confirmed') {
      for (const line of order.purchased) {
        const nft = db.nfts.find((n) => n.id === line.nftId)
        const edition = nft?.editions.find((e) => e.id === line.editionId)
        if (nft && edition) {
          edition.available = Math.max(0, edition.available - line.quantity)
          nft.version += 1
        }
      }
      const cart = db.carts.find((c) => c.ownerKey === `user:${order.userId}`)
      if (cart) {
        for (const line of order.purchased) {
          const item = cart.items.find((i) => i.id === line.cartItemId)
          if (!item) continue
          if (item.quantity > line.quantity) item.quantity -= line.quantity
          else cart.items = cart.items.filter((i) => i.id !== line.cartItemId)
        }
        if (cart.items.length === 0) cart.couponCode = null
        cart.version += 1
      }
    }
    db.eventCounter += 1
    return {
      eventId: `evt_${db.eventCounter}`,
      orderId: order.id,
      userId: order.userId,
      version: order.version,
      status: order.status,
      txHash: order.txHash,
      rejectionReason: order.rejectionReason,
    }
  })
  if (event) emitRealtime(realtimeEvents.orderUpdated, event, event.userId)
  return event
}

function scheduleSettlement(order: OrderRecord) {
  const wait = Math.max(0, order.settleAt - Date.now())
  timers.set(
    order.id,
    setTimeout(() => settleOrder(order.id, order.outcome), wait),
  )
}

export function settleDueOrders() {
  const now = Date.now()
  for (const order of getDb().orders) {
    if (order.status === 'pending' && !timers.has(order.id)) {
      if (order.settleAt <= now) settleOrder(order.id, order.outcome)
      else scheduleSettlement(order)
    }
  }
}

export const orderHandlers = [
  http.post(
    '/api/orders',
    mocked({ key: 'orders', private: true }, async ({ request }) => {
      const { user } = requireSession(request)
      const key = request.headers.get('idempotency-key')
      if (!key) throw new ApiFailure(422, 'VALIDATION', 'Idempotency-Key é obrigatório')
      const input = await parseBody(request, createOrderInputSchema)
      const bodyHash = await sha256(canonicalJson(input))
      const resolution = resolveIdempotentOrder(getDb().idempotency, key, user.id, bodyHash)
      if (resolution.kind === 'mismatch') {
        throw new ApiFailure(
          409,
          'IDEMPOTENCY_MISMATCH',
          'Esta chave já foi usada com outro conteúdo.',
        )
      }
      if (resolution.kind === 'replay') {
        const existing = getDb().orders.find((o) => o.id === resolution.orderId)
        if (!existing) throw new ApiFailure(404, 'NOT_FOUND', 'Pedido não encontrado')
        return json(publicOrder(existing))
      }

      const ownerKey = `user:${user.id}`
      const stored = getDb().quotes.find(
        (q) => q.quoteId === input.quoteId && q.ownerKey === ownerKey,
      )
      if (!stored)
        throw new ApiFailure(404, 'NOT_FOUND', 'Cotação não encontrada. Atualize o carrinho.')
      const fresh = buildQuote(ownerKey)
      const nftsChanged = Object.entries(stored.nftVersions).some(
        ([id, version]) => getDb().nfts.find((n) => n.id === id)?.version !== version,
      )
      const cart = getDb().carts.find((c) => c.ownerKey === ownerKey)
      const expired = Date.parse(stored.expiresAt) < Date.now() - quoteTtlMs
      if (
        nftsChanged ||
        expired ||
        cart?.version !== stored.cartVersion ||
        fresh.total !== stored.total ||
        fresh.lines.some((l) => l.availability !== 'ok')
      ) {
        throw new ApiFailure(
          409,
          'QUOTE_STALE',
          'A cotação mudou. Revise os valores antes de confirmar.',
          undefined,
          { quote: fresh },
        )
      }
      if (fresh.lines.length === 0)
        throw new ApiFailure(422, 'VALIDATION', 'O carrinho está vazio.')

      const wallet = input.walletId
        ? getDb().wallets.find((w) => w.id === input.walletId && w.userId === user.id)
        : null
      if (input.walletId && !wallet)
        throw new ApiFailure(404, 'NOT_FOUND', 'Carteira não encontrada')
      const now = Date.now()
      const txHash = `0x${randomHex(64)}`
      const record: OrderRecord = {
        id: nextId('ord'),
        userId: user.id,
        status: 'pending',
        version: 1,
        txHash,
        explorerUrl: `${explorers[input.network]}${txHash}`,
        createdAt: new Date(now).toISOString(),
        settledAt: null,
        rejectionReason: null,
        lines: fresh.lines,
        subtotal: fresh.subtotal,
        discount: fresh.discount,
        networkFee: fresh.networkFee,
        total: fresh.total,
        wallet: {
          provider: input.provider,
          address: wallet?.address ?? input.collector.address,
          network: input.network,
          label: wallet?.nickname ?? 'Carteira informada',
        },
        quoteId: fresh.quoteId,
        settleAt: now + settleDelayMs,
        outcome: getScenario() === 'payment-rejected' ? 'rejected' : 'confirmed',
        purchased: fresh.lines.map((l) => ({
          cartItemId: l.cartItemId,
          nftId: l.nftId,
          editionId: l.editionId,
          quantity: l.quantity,
        })),
      }
      updateDb((db) => {
        db.orders.push(record)
        db.idempotency.push({ key, userId: user.id, bodyHash, orderId: record.id })
      })
      scheduleSettlement(record)
      if (getScenario() === 'order-timeout') await delay(12000)
      return json(publicOrder(record), 201)
    }),
  ),
  http.get(
    '/api/orders/:orderId',
    mocked({ key: 'orders', private: true }, ({ request, params }) => {
      const { user } = requireSession(request)
      settleDueOrders()
      const order = getDb().orders.find((o) => o.id === params.orderId)
      if (!order) throw new ApiFailure(404, 'NOT_FOUND', 'Pedido não encontrado')
      if (order.userId !== user.id)
        throw new ApiFailure(403, 'FORBIDDEN', 'Este pedido pertence a outra conta.')
      return json(publicOrder(order))
    }),
  ),
]
