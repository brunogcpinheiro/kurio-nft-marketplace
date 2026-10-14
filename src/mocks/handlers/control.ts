import { http } from 'msw'
import { z } from 'zod'
import { nftUpdatedEventSchema, orderUpdatedEventSchema } from '@/api/schemas'
import { applyNftChange } from '../catalog-changes'
import { getDb, resetDb } from '../db'
import { ApiFailure, guard, json, noContent, parseBody } from '../http'
import { getScenario, isScenarioName, scenarioList, setScenario } from '../scenarios'
import { disconnectAllSockets, emitRealtime, listSocketConnections } from '../socket-server'
import { settleOrder } from './orders'

const scenarioInput = z.object({ name: z.string() })

const emitInput = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('nft.updated'),
    nftId: z.string().optional(),
    editionId: z.string().optional(),
    change: z.enum(['price-up', 'price-down', 'sold-out']).optional(),
    silent: z.boolean().optional(),
    payload: nftUpdatedEventSchema.optional(),
  }),
  z.object({
    event: z.literal('order.updated'),
    orderId: z.string().optional(),
    status: z.enum(['confirmed', 'rejected']).optional(),
    reason: z.string().optional(),
    payload: orderUpdatedEventSchema.optional(),
  }),
])

export const clientStorageKeys = ['kurio:session', 'kurio:guest-cart', 'kurio:scenario']

export const controlHandlers = [
  http.get(
    '/api/__mock/scenarios',
    guard(() => json({ active: getScenario(), available: scenarioList })),
  ),
  http.put(
    '/api/__mock/scenario',
    guard(async ({ request }) => {
      const { name } = await parseBody(request, scenarioInput)
      if (!isScenarioName(name)) throw new ApiFailure(404, 'NOT_FOUND', 'Cenário desconhecido')
      setScenario(name)
      return noContent()
    }),
  ),
  http.post(
    '/api/__mock/reset',
    guard(() => {
      resetDb()
      for (const key of clientStorageKeys) localStorage.removeItem(key)
      sessionStorage.clear()
      return noContent()
    }),
  ),
  http.post(
    '/api/__mock/emit',
    guard(async ({ request }) => {
      const input = await parseBody(request, emitInput)
      if (input.event === 'order.updated') {
        if (input.payload) {
          emitRealtime(input.event, input.payload, input.payload.userId)
          return noContent()
        }
        const orderId =
          input.orderId ??
          getDb()
            .orders.filter((o) => o.status === 'pending')
            .at(-1)?.id
        if (!orderId) throw new ApiFailure(404, 'NOT_FOUND', 'Nenhum pedido pendente')
        const event = settleOrder(orderId, input.status ?? 'confirmed', input.reason)
        if (!event) throw new ApiFailure(409, 'CONFLICT', 'Pedido já finalizado')
        return noContent()
      }
      if (input.payload) {
        emitRealtime(input.event, input.payload)
        return noContent()
      }
      if (!input.nftId) throw new ApiFailure(422, 'VALIDATION', 'Informe nftId ou payload')
      const event = applyNftChange(input.nftId, input.change ?? 'price-up', input.editionId)
      if (!event) throw new ApiFailure(404, 'NOT_FOUND', 'NFT não encontrado')
      if (!input.silent) emitRealtime(input.event, event)
      return noContent()
    }),
  ),
  http.post(
    '/api/__mock/socket/disconnect',
    guard(() => {
      disconnectAllSockets()
      return noContent()
    }),
  ),
  http.get(
    '/api/__mock/socket/connections',
    guard(() => json({ connections: listSocketConnections() })),
  ),
]
