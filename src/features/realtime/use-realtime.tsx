import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/api/query-keys'
import {
  nftUpdatedEventSchema,
  orderUpdatedEventSchema,
  realtimeEvents,
  type NftSummary,
  type NftUpdatedEvent,
  type Order,
} from '@/api/schemas'
import { session } from '@/features/auth/session'
import { mocksReady } from '@/lib/mocks-ready'
import { realtimeNotices } from './notices'
import { createEventDeduper, isNewerVersion } from './version-guard'

type ListLike = { items: NftSummary[] }

function patchSummary(item: NftSummary, event: NftUpdatedEvent): NftSummary {
  if (item.id !== event.nftId || !isNewerVersion(item, event)) return item
  return { ...item, price: event.price, previousPrice: event.previousPrice, version: event.version }
}

export function useRealtime() {
  const queryClient = useQueryClient()
  const deduper = useRef<ReturnType<typeof createEventDeduper> | null>(null)
  const accept = (eventId: string) => {
    deduper.current ??= createEventDeduper()
    return deduper.current(eventId)
  }
  const everConnected = useRef(false)

  useEffect(() => {
    let disposed = false
    let cleanup = () => undefined
    void mocksReady
      .then(() => import('@/lib/socket'))
      .then(({ connectSocket, getSocket }) => {
        if (disposed) return
        const socket = getSocket()

        const onNftUpdated = (raw: unknown) => {
          const parsed = nftUpdatedEventSchema.safeParse(raw)
          if (!parsed.success || !accept(parsed.data.eventId)) return
          const event = parsed.data
          let name: string | null = null
          let touched = false

          for (const query of queryClient
            .getQueryCache()
            .findAll({ queryKey: queryKeys.nfts.all })) {
            const data = query.state.data
            if (!data || typeof data !== 'object') continue
            if ('items' in data && Array.isArray((data as ListLike).items)) {
              const list = data as ListLike
              if (!list.items.some((i) => i.id === event.nftId)) continue
              const match = list.items.find((i) => i.id === event.nftId)
              if (match && !isNewerVersion(match, event)) continue
              name ??= match?.name ?? null
              touched = true
              queryClient.setQueryData(query.queryKey, {
                ...list,
                items: list.items.map((i) => patchSummary(i, event)),
              })
              continue
            }
            if ('id' in data && (data as NftSummary).id === event.nftId) {
              const detail = data as NftSummary & { editions?: unknown }
              if (!isNewerVersion(detail, event)) continue
              name ??= detail.name
              touched = true
              queryClient.setQueryData(query.queryKey, {
                ...detail,
                price: event.price,
                previousPrice: event.previousPrice,
                version: event.version,
                editions: event.editions,
              })
            }
          }

          void queryClient.invalidateQueries({ queryKey: ['cart'] })
          void queryClient.invalidateQueries({ queryKey: ['quote'] })

          const soldOut = event.editions.every((e) => e.available === 0)
          const subject = name ?? 'Um NFT do catálogo'
          const message = soldOut
            ? `${subject} esgotou e saiu de disponibilidade.`
            : `${subject} agora custa ${event.price} ETH.`
          realtimeNotices.push({
            kind: soldOut ? 'availability' : 'price',
            message,
            nftId: event.nftId,
          })
          if (touched || name) toast.info(message)
        }

        const onOrderUpdated = (raw: unknown) => {
          const parsed = orderUpdatedEventSchema.safeParse(raw)
          if (!parsed.success || !accept(parsed.data.eventId)) return
          const event = parsed.data
          const current = session.get()
          if (!current || event.userId !== current.userId) return
          const key = queryKeys.orders.detail(current.userId, event.orderId)
          const existing = queryClient.getQueryData<Order>(key)
          if (existing && !isNewerVersion(existing, event)) return
          if (existing) {
            queryClient.setQueryData<Order>(key, {
              ...existing,
              status: event.status,
              version: event.version,
              txHash: event.txHash ?? existing.txHash,
              rejectionReason: event.rejectionReason,
              settledAt: event.status === 'pending' ? existing.settledAt : new Date().toISOString(),
            })
          } else {
            void queryClient.invalidateQueries({ queryKey: key })
          }
          if (event.status === 'confirmed')
            void queryClient.invalidateQueries({ queryKey: ['cart'] })
        }

        const onConnect = () => {
          if (!everConnected.current) {
            everConnected.current = true
            return
          }
          void queryClient.invalidateQueries({ queryKey: ['cart'] })
          void queryClient.invalidateQueries({ queryKey: ['quote'] })
          void queryClient.invalidateQueries({ queryKey: ['orders'] })
          void queryClient.invalidateQueries({
            queryKey: ['nfts', 'detail'],
            refetchType: 'active',
          })
        }

        socket.on(realtimeEvents.nftUpdated, onNftUpdated)
        socket.on(realtimeEvents.orderUpdated, onOrderUpdated)
        socket.on('connect', onConnect)
        connectSocket()

        const unsubscribe = session.subscribe(() => connectSocket())

        cleanup = () => {
          unsubscribe()
          socket.off(realtimeEvents.nftUpdated, onNftUpdated)
          socket.off(realtimeEvents.orderUpdated, onOrderUpdated)
          socket.off('connect', onConnect)
          socket.disconnect()
        }
      })

    return () => {
      disposed = true
      cleanup()
    }
  }, [queryClient])
}
