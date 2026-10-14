import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cartApi } from '@/api/endpoints'
import { errorMessage, hasErrorCode } from '@/api/errors'
import { queryKeys } from '@/api/query-keys'
import type { AddCartItemInput, Cart } from '@/api/schemas'
import { session } from '@/features/auth/session'
import { useCartOwnerKey } from './queries'
import { guestCart } from './use-guest-cart'

function currentOwnerKey() {
  const current = session.get()
  if (current) return `user:${current.userId}`
  const guest = guestCart.get()
  return guest ? `guest:${guest}` : 'anonymous'
}

function useCartSync() {
  const queryClient = useQueryClient()
  const ownerKey = useCartOwnerKey()
  return {
    apply(cart: Cart) {
      const key = currentOwnerKey()
      queryClient.setQueryData(queryKeys.cart(key), cart)
      if (key !== ownerKey) void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['quote'] })
    },
    recover(error: unknown) {
      if (hasErrorCode(error, 'CONFLICT') || hasErrorCode(error, 'NOT_FOUND')) {
        void queryClient.invalidateQueries({ queryKey: ['nfts'] })
        void queryClient.invalidateQueries({ queryKey: ['cart'] })
        void queryClient.invalidateQueries({ queryKey: ['quote'] })
      }
    },
  }
}

export function useAddToCart() {
  const sync = useCartSync()
  return useMutation({
    mutationFn: (input: AddCartItemInput) => {
      if (!session.get()) guestCart.ensure()
      return cartApi.addItem(input)
    },
    onSuccess: sync.apply,
    onError: (error) => {
      toast.error('Não foi possível adicionar ao carrinho', { description: errorMessage(error) })
      sync.recover(error)
    },
  })
}

export function useUpdateCartItem() {
  const sync = useCartSync()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: sync.apply,
    onError: (error) => {
      toast.error('Não foi possível alterar a quantidade', { description: errorMessage(error) })
      sync.recover(error)
    },
  })
}

export function useRemoveCartItem() {
  const sync = useCartSync()
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string; name: string }) => cartApi.removeItem(itemId),
    onSuccess: (cart, variables) => {
      sync.apply(cart)
      toast.success(`${variables.name} removido do carrinho`)
    },
    onError: (error) => {
      toast.error('Não foi possível remover o item', { description: errorMessage(error) })
      sync.recover(error)
    },
  })
}

export function useApplyCoupon() {
  const sync = useCartSync()
  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onSuccess: (cart) => {
      sync.apply(cart)
      toast.success(`Cupom ${cart.couponCode} aplicado`)
    },
  })
}

export function useRemoveCoupon() {
  const sync = useCartSync()
  return useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: (cart) => {
      sync.apply(cart)
      toast('Cupom removido')
    },
    onError: (error) =>
      toast.error('Não foi possível remover o cupom', { description: errorMessage(error) }),
  })
}
