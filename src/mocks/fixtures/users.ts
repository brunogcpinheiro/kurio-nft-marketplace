import type { User } from '@/api/schemas'
import type { Wallet } from '@/api/schemas'

export type UserFixture = {
  user: User
  passwordHash: string
  wallets: Wallet[]
  favorites: string[]
}

const passwordHash = 'fd382aa43a55b3a8389b3ae8879756810af23f700e112d224f13bff94ebc85c2'

export const userFixtures: UserFixture[] = [
  {
    user: {
      id: 'usr_ana',
      username: 'ana',
      displayName: 'Ana Lima',
      email: 'ana@kurio.app',
      ensName: 'analima',
      walletNickname: 'Principal',
      avatarUrl: null,
    },
    passwordHash,
    wallets: [
      {
        id: 'wal_ana_primary',
        slot: 'primary',
        displayName: 'Ana Lima',
        nickname: 'Principal',
        network: 'ethereum',
        profileName: 'analima',
        address: '0xA91F3c8E2b7D4a6F1e9C0b5A8d7E6f4C3b2A1E82',
        secondaryAddress: null,
        provider: 'metamask',
        referralCode: 'KURIO-ANA',
        email: 'ana@kurio.app',
        ensName: 'analima',
      },
      {
        id: 'wal_ana_secondary',
        slot: 'secondary',
        displayName: 'Ana Lima',
        nickname: 'Reserva',
        network: 'polygon',
        profileName: 'nova',
        address: '0x5B2c9D1e7F4a3B6c8E0d2F1a9C7b5E3d4A6F8C21',
        secondaryAddress: null,
        provider: 'coinbase',
        referralCode: 'KURIO-ANA',
        email: 'ana@kurio.app',
        ensName: 'nova',
      },
    ],
    favorites: ['nft_042', 'nft_118', 'nft_207'],
  },
  {
    user: {
      id: 'usr_bruno',
      username: 'bruno',
      displayName: 'Bruno Pinheiro',
      email: 'bruno@kurio.app',
      ensName: 'brunop',
      walletNickname: 'Principal',
      avatarUrl: null,
    },
    passwordHash,
    wallets: [],
    favorites: [],
  },
]
