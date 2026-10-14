export type CouponFixture = { code: string; percentBps: number; expiresAt: string }

export const couponFixtures: CouponFixture[] = [
  { code: 'KURIO10', percentBps: 1000, expiresAt: '2027-01-01T00:00:00.000Z' },
  { code: 'GENESIS', percentBps: 2000, expiresAt: '2026-01-01T00:00:00.000Z' },
]
