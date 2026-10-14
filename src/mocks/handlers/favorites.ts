import { http } from 'msw'
import { getDb, updateDb } from '../db'
import { ApiFailure, json, mocked, noContent, requireSession } from '../http'
import { getScenario } from '../scenarios'
import { toSummary } from './nfts'

function failIfScenario() {
  if (getScenario() === 'favorites-fail') {
    throw new ApiFailure(503, 'UNAVAILABLE', 'Não foi possível atualizar os favoritos agora.')
  }
}

export const favoritesHandlers = [
  http.get(
    '/api/favorites',
    mocked({ key: 'favorites', private: true }, ({ request }) => {
      const { user } = requireSession(request)
      const db = getDb()
      const nftIds = db.favorites[user.id] ?? []
      const items = nftIds.flatMap((id) => {
        const nft = db.nfts.find((n) => n.id === id)
        return nft ? [toSummary(nft)] : []
      })
      return json({ nftIds, items })
    }),
  ),
  http.put(
    '/api/favorites/:nftId',
    mocked({ key: 'favorites', private: true }, ({ request, params }) => {
      const { user } = requireSession(request)
      failIfScenario()
      const nftId = String(params.nftId)
      if (!getDb().nfts.some((n) => n.id === nftId))
        throw new ApiFailure(404, 'NOT_FOUND', 'NFT não encontrado')
      updateDb((db) => {
        const list = db.favorites[user.id] ?? []
        if (!list.includes(nftId)) list.push(nftId)
        db.favorites[user.id] = list
      })
      return noContent()
    }),
  ),
  http.delete(
    '/api/favorites/:nftId',
    mocked({ key: 'favorites', private: true }, ({ request, params }) => {
      const { user } = requireSession(request)
      failIfScenario()
      updateDb((db) => {
        db.favorites[user.id] = (db.favorites[user.id] ?? []).filter((id) => id !== params.nftId)
      })
      return noContent()
    }),
  ),
]
