import { expect, test } from './fixtures'

async function reachWalletStep(page: import('@playwright/test').Page, isMobile: boolean) {
  await page.goto(isMobile ? '/pagamento?step=wallet' : '/pagamento')
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByTestId('wallet-connection')).toContainText('conectada')
}

test.describe('payment failures', () => {
  test.describe('rejected payment', () => {
    test.use({ scenario: 'payment-rejected' })
    test('shows the rejection and keeps the cart', async ({ page, mock, isMobile }) => {
      await mock.goto('/')
      await mock.login('ana')
      await mock.addToCart('nft_042', 'e50', 1)
      await reachWalletStep(page, isMobile)
      await page.getByTestId(isMobile ? 'checkout-submit-mobile' : 'checkout-submit').click()
      await expect(page.getByTestId('order-rejected')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('order-rejected')).toContainText('Saldo insuficiente')
      const cart = await mock.db(
        (db) =>
          (db.carts as { ownerKey: string; items: unknown[] }[]).find(
            (c) => c.ownerKey === 'user:usr_ana',
          )?.items.length,
      )
      expect(cart).toBe(1)
    })
  })

  test('repeated clicks create a single order', async ({ page, mock, isMobile }) => {
    await mock.goto('/')
    await mock.login('ana')
    await mock.addToCart('nft_042', 'e50', 1)
    await reachWalletStep(page, isMobile)
    const submit = page.getByTestId(isMobile ? 'checkout-submit-mobile' : 'checkout-submit')
    await submit.click()
    await submit.click({ force: true }).catch(() => undefined)
    await submit.click({ force: true }).catch(() => undefined)
    await expect(page).toHaveURL(/\/pedido\//)
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
    expect(await mock.db((db) => (db.orders as unknown[]).length)).toBe(1)
  })

  test.describe('timeout after creation', () => {
    test.use({ scenario: 'order-timeout' })
    test('recovers the same order through the idempotency key', async ({
      page,
      mock,
      isMobile,
    }) => {
      test.setTimeout(90_000)
      await mock.goto('/')
      await mock.login('ana')
      await mock.addToCart('nft_042', 'e50', 1)
      await reachWalletStep(page, isMobile)
      await page.getByTestId(isMobile ? 'checkout-submit-mobile' : 'checkout-submit').click()
      await expect(page).toHaveURL(/\/pedido\//, { timeout: 40_000 })
      await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 15_000 })
      expect(await mock.db((db) => (db.orders as unknown[]).length)).toBe(1)
      expect(await mock.db((db) => (db.idempotency as unknown[]).length)).toBe(1)
    })
  })
})
