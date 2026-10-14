import { http } from 'msw'
import { z } from 'zod'
import { nftUpdatedEventSchema } from '@/api/schemas'
import { applyNftChange } from '../catalog-changes'
import { resetDb } from '../db'
import { ApiFailure, guard, json, noContent, parseBody } from '../http'
import { getScenario, isScenarioName, scenarioList, setScenario } from '../scenarios'
import { disconnectAllSockets, emitRealtime, listSocketConnections } from '../socket-server'

const scenarioInput = z.object({ name: z.string() })

const emitInput = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('nft.updated'),
    nftId: z.string().optional(),
    editionId: z.string().optional(),
    change: z.enum(['price-up', 'price-down', 'sold-out']).optional(),
    payload: nftUpdatedEventSchema.optional(),
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
      if (input.payload) {
        emitRealtime(input.event, input.payload)
        return noContent()
      }
      if (!input.nftId) throw new ApiFailure(422, 'VALIDATION', 'Informe nftId ou payload')
      const event = applyNftChange(input.nftId, input.change ?? 'price-up', input.editionId)
      if (!event) throw new ApiFailure(404, 'NOT_FOUND', 'NFT não encontrado')
      emitRealtime(input.event, event)
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
