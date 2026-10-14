import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

async function settleImages(page: Page) {
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'))
    for (const img of images) img.loading = 'eager'
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
  })
  await page.waitForTimeout(300)
}

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-14T12:00:00Z'))
  })

  test('home', async ({ page, mock }) => {
    await mock.goto('/')
    await expect(page.getByTestId('nft-card').first()).toBeVisible()
    await expect(page.locator('section[aria-labelledby="blog-title"] article')).toHaveCount(4)
    await settleImages(page)
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('nft detail', async ({ page, mock }) => {
    await mock.goto('/nft/emerald-ape-042')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' }).first(),
    ).toBeVisible()
    await settleImages(page)
    await expect(page).toHaveScreenshot('nft-detail.png', { fullPage: true })
  })

  test('cart', async ({ page, mock }) => {
    await mock.goto('/')
    await mock.login('ana')
    await mock.addToCart('nft_042', 'e50', 2)
    await mock.addToCart('nft_314', 'e50', 6)
    await mock.addToCart('nft_088', 'e50', 9)
    await mock.goto('/carrinho')
    await expect(page.getByTestId('summary-total').first()).toHaveText('26.846 ETH')
    await settleImages(page)
    await expect(page).toHaveScreenshot('cart.png', { fullPage: true })
  })

  test('checkout', async ({ page, mock, isMobile }) => {
    await mock.goto('/')
    await mock.login('ana')
    await mock.addToCart('nft_042', 'e50', 2)
    await mock.addToCart('nft_314', 'e50', 6)
    await mock.addToCart('nft_088', 'e50', 9)
    await page.goto(isMobile ? '/pagamento?step=wallet' : '/pagamento')
    await expect(
      page.getByTestId(isMobile ? 'checkout-total-mobile' : 'checkout-total'),
    ).toHaveText('26.846 ETH')
    await settleImages(page)
    await expect(page).toHaveScreenshot('checkout.png', { fullPage: true })
  })
})
