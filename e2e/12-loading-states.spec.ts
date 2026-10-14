import { cards, expect, test } from './fixtures'

test.describe('loading and failure feedback', () => {
  test.describe('slow network', () => {
    test.use({ scenario: 'slow-network' })
    test('shows skeletons before the catalog and cart summary', async ({ page, mock }) => {
      await mock.goto('/')
      await expect(page.getByTestId('catalog-skeleton')).toBeVisible()
      await expect(cards(page).first()).toBeVisible({ timeout: 15_000 })
      await mock.addToCart('nft_042', 'e50', 1)
      await mock.goto('/carrinho')
      await expect(page.getByTestId('cart-summary').first()).toHaveAttribute('aria-busy', 'true')
      await expect(page.getByTestId('summary-total').filter({ visible: true }).first()).toBeVisible(
        { timeout: 15_000 },
      )
    })
  })

  test.describe('server error', () => {
    test.use({ scenario: 'server-error' })
    test('shows the failure and recovers on retry', async ({ page, mock }) => {
      await mock.goto('/')
      await expect(
        page.getByRole('alert').filter({ hasText: 'Não foi possível carregar o catálogo' }),
      ).toBeVisible({ timeout: 20_000 })
      await page.getByRole('button', { name: /Tentar novamente/ }).click()
      await expect(cards(page).first()).toBeVisible({ timeout: 15_000 })
    })
  })
})
