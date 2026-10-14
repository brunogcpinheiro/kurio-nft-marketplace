import type { WebSocketHandler } from 'msw'

export const socketHandlers: WebSocketHandler[] = []

export function emitRealtime(_event: string, _payload: unknown, _targetUserId?: string) {
  return 0
}
