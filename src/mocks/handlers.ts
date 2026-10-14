import { controlHandlers } from './handlers/control'
import { socketHandlers } from './socket-server'

export const handlers = [...controlHandlers, ...socketHandlers]
