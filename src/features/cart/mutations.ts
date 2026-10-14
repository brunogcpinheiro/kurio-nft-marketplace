import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cartApi } from '@/api/endpoints'
import { errorMessage, hasErrorCode } from '@/api/errors'
import { queryKeys } from '@/api/query-keys'
import type { AddCartItemInput, Cart } from '@/api/schemas'
import { guestCart } from './use-guest-cart'
import { useCartOwnerKey } from './queries'
import { session } from '@/features/auth/session'

export function useAddToCart() {
  const queryClient = useQueryClient()
  const ownerKey = useCartOwnerKey()
  return useMutation({
    mutationFn: (input: AddCartItemInput) => {
      if (!session.get()) guestCart.ensure()
      return cartApi.addItem(input)
    },
    onSuccess: (cart: Cart) => {
      const key = session.get() ? `user:${session.get()!.userId}` : `guest:${guestCart.get()}`
      queryClient.setQueryData(queryKeys.cart(key), cart)
      if (key !== ownerKey) void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['quote'] })
    },
    onError: (error, input) => {
      toast.error('Não foi possível adicionar ao carrinho', { description: errorMessage(error) })
      if (hasErrorCode(error, 'CONFLICT')) {
        void queryClient.invalidateQueries({ queryKey: ['nfts'] })
        void queryClient.invalidateQueries({ queryKey: ['cart'] })
      }
      void input
    },
  })
}
