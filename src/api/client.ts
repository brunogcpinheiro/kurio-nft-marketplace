import axios from 'axios'
import { session } from '@/features/auth/session'
import { guestCart } from '@/features/cart/use-guest-cart'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 8000,
  headers: { Accept: 'application/json' },
})

let unauthenticatedHandler: (() => void) | null = null

export function onUnauthenticated(handler: () => void) {
  unauthenticatedHandler = handler
}

api.interceptors.request.use((config) => {
  const current = session.get()
  if (current) config.headers.Authorization = `Bearer ${current.token}`
  const guest = guestCart.get()
  if (guest) config.headers['X-Guest-Cart'] = guest
  return config
})

api.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && session.get()) {
    session.clear()
    unauthenticatedHandler?.()
  }
  return Promise.reject(error)
})
