import { http } from 'msw'
import { walletInputSchema, walletSlotSchema } from '@/api/schemas'
import { getDb, nextId, updateDb } from '../db'
import { ApiFailure, json, mocked, parseBody, requireSession } from '../http'

const evmAddress = /^0x[a-fA-F0-9]{40}$/
const solanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export function validateAddress(network: string, address: string) {
  if (network === 'solana')
    return solanaAddress.test(address)
      ? null
      : 'Informe um endereço Solana válido (base58, 32 a 44 caracteres)'
  return evmAddress.test(address) ? null : 'Informe um endereço 0x com 40 caracteres hexadecimais'
}

export const walletHandlers = [
  http.get(
    '/api/wallets',
    mocked({ key: 'wallets', private: true }, ({ request }) => {
      const { user } = requireSession(request)
      const mine = getDb().wallets.filter((w) => w.userId === user.id)
      const strip = (slot: 'primary' | 'secondary') => {
        const found = mine.find((w) => w.slot === slot)
        if (!found) return null
        const { userId: _userId, ...wallet } = found
        return wallet
      }
      return json({ primary: strip('primary'), secondary: strip('secondary') })
    }),
  ),
  http.put(
    '/api/wallets/:slot',
    mocked({ key: 'wallets', private: true }, async ({ request, params }) => {
      const { user } = requireSession(request)
      const slot = walletSlotSchema.parse(params.slot)
      const input = await parseBody(request, walletInputSchema)
      const addressError = validateAddress(input.network, input.address)
      if (addressError)
        throw new ApiFailure(422, 'VALIDATION', 'Verifique os campos destacados.', {
          address: addressError,
        })
      if (
        input.secondaryAddress &&
        !input.secondaryAddress.endsWith('.eth') &&
        validateAddress(input.network, input.secondaryAddress)
      ) {
        throw new ApiFailure(422, 'VALIDATION', 'Verifique os campos destacados.', {
          secondaryAddress: 'Informe um ENS (.eth) ou um endereço válido',
        })
      }
      const taken = getDb().wallets.some(
        (w) =>
          w.address.toLowerCase() === input.address.toLowerCase() &&
          !(w.userId === user.id && w.slot === slot),
      )
      if (taken)
        throw new ApiFailure(409, 'CONFLICT', 'Este endereço já está cadastrado.', {
          address: 'Este endereço já está cadastrado em outra carteira',
        })
      const saved = updateDb((db) => {
        const existing = db.wallets.find((w) => w.userId === user.id && w.slot === slot)
        if (existing) {
          Object.assign(existing, input)
          return existing
        }
        const created = { ...input, id: nextId('wal'), slot, userId: user.id }
        db.wallets.push(created)
        return created
      })
      const { userId: _userId, ...wallet } = saved
      return json(wallet)
    }),
  ),
]
