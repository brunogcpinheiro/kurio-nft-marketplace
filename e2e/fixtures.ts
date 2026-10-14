import { test as base, expect, type Page } from '@playwright/test'

export type ScenarioName =
  | 'default'
  | 'slow-network'
  | 'variable-latency'
  | 'out-of-order'
  | 'offline'
  | 'server-error'
  | 'session-expired'
  | 'register-conflict'
  | 'coupon-expired'
  | 'price-change-in-checkout'
  | 'edition-sold-out'
  | 'order-timeout'
  | 'payment-rejected'
  | 'wallet-refused'
  | 'favorites-fail'
  | 'empty-catalog'

export const users = {
  ana: { email: 'ana@kurio.app', password: 'kurio123', name: 'Ana' },
  bruno: { email: 'bruno@kurio.app', password: 'kurio123', name: 'Bruno' },
} as const

type UserKey = keyof typeof users

type Mock = {
  goto: (path: string) => Promise<void>
  ready: () => Promise<void>
  login: (user: UserKey) => Promise<void>
  logout: () => Promise<void>
  setScenario: (name: ScenarioName) => Promise<void>
  addToCart: (nftId: string, editionId: string, quantity: number) => Promise<void>
  emit: (body: Record<string, unknown>) => Promise<number>
  disconnectSockets: () => Promise<void>
  db: <T>(select: (db: Record<string, unknown>) => T) => Promise<T>
}

type Fixtures = { scenario: ScenarioName; mock: Mock; isMobile: boolean }

async function waitForApp(page: Page) {
  await page.waitForFunction(
    () =>
      navigator.serviceWorker.controller !== null &&
      (document.querySelector('#root')?.children.length ?? 0) > 0,
    null,
    { timeout: 20_000 },
  )
}

export const test = base.extend<Fixtures>({
  scenario: ['default', { option: true }],
  isMobile: async ({ viewport }, provide) => {
    await provide((viewport?.width ?? 1440) < 768)
  },
  mock: async ({ page, scenario }, provide) => {
    await page.addInitScript((name) => {
      if (!sessionStorage.getItem('kurio:test-seeded')) {
        localStorage.clear()
        sessionStorage.setItem('kurio:test-seeded', '1')
      }
      if (name !== 'default' && !localStorage.getItem('kurio:scenario'))
        localStorage.setItem('kurio:scenario', name)
    }, scenario)

    const api: Mock = {
      goto: async (path) => {
        await page.goto(path)
        await waitForApp(page)
      },
      ready: () => waitForApp(page),
      login: async (user) => {
        const credentials = users[user]
        await page.evaluate(async ({ email, password }) => {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-guest-cart': localStorage.getItem('kurio:guest-cart') ?? '',
            },
            body: JSON.stringify({ email, password }),
          })
          if (!res.ok) throw new Error(`login failed: ${res.status}`)
          const auth = await res.json()
          localStorage.setItem(
            'kurio:session',
            JSON.stringify({ token: auth.token, userId: auth.user.id, expiresAt: auth.expiresAt }),
          )
          localStorage.removeItem('kurio:guest-cart')
        }, credentials)
        await page.reload()
        await waitForApp(page)
      },
      logout: async () => {
        await page.evaluate(() => localStorage.removeItem('kurio:session'))
        await page.reload()
        await waitForApp(page)
      },
      setScenario: async (name) => {
        await page.evaluate(async (scenarioName) => {
          const res = await fetch('/api/__mock/scenario', {
            method: 'PUT',
            body: JSON.stringify({ name: scenarioName }),
          })
          if (!res.ok) throw new Error(`scenario failed: ${res.status}`)
        }, name)
      },
      addToCart: async (nftId, editionId, quantity) => {
        await page.evaluate(
          async (input) => {
            const session = JSON.parse(localStorage.getItem('kurio:session') ?? 'null')
            let guest = localStorage.getItem('kurio:guest-cart')
            if (!session && !guest) {
              guest = `g_test${Math.random().toString(36).slice(2, 8)}`
              localStorage.setItem('kurio:guest-cart', guest)
            }
            const res = await fetch('/api/cart/items', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                ...(session
                  ? { authorization: `Bearer ${session.token}` }
                  : { 'x-guest-cart': guest ?? '' }),
              },
              body: JSON.stringify(input),
            })
            if (!res.ok) throw new Error(`addToCart failed: ${res.status}`)
          },
          { nftId, editionId, quantity },
        )
      },
      emit: (body) =>
        page.evaluate(async (payload) => {
          const res = await fetch('/api/__mock/emit', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
          return res.status
        }, body),
      disconnectSockets: async () => {
        await page.evaluate(() => fetch('/api/__mock/socket/disconnect', { method: 'POST' }))
      },
      db: (select) =>
        page.evaluate((fn) => {
          const db = JSON.parse(localStorage.getItem('kurio:mock-db') ?? '{}')
          return new Function('db', `return (${fn})(db)`)(db)
        }, select.toString()),
    }
    await provide(api)
  },
})

export { expect }

export async function search(page: Page, term: string) {
  const input = page.getByRole('searchbox', { name: 'Buscar NFTs' })
  if (!(await input.isVisible())) await page.getByRole('button', { name: 'Abrir busca' }).click()
  await input.click()
  await input.press('ControlOrMeta+a')
  await input.press('Backspace')
  if (term) await input.pressSequentially(term)
  await input.press('Enter')
}

export async function openFilters(page: Page) {
  const trigger = page.getByRole('button', { name: /^Filtros/ })
  if (await trigger.isVisible()) await trigger.click()
}

export async function closeFilters(page: Page) {
  const close = page
    .getByRole('dialog', { name: 'Filtros' })
    .getByRole('button', { name: 'Fechar' })
  if (await close.isVisible()) await close.click()
}

export function cards(page: Page) {
  return page.getByTestId('nft-card')
}

export const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
