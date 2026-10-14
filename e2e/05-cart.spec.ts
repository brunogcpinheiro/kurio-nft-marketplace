import { expect, test } from './fixtures'

test.describe('cart', () => {
  test('quantities, removal, coupons and persistence across reload and login', async ({
    page,
    mock,
  }) => {
    await mock.goto('/')
    await mock.addToCart('nft_042', 'e50', 2)
    await mock.addToCart('nft_314', 'e50', 1)
    await mock.goto('/carrinho')

    const items = page.getByTestId('cart-item').filter({ visible: true })
    await expect(items).toHaveCount(2)
    await expect(page.getByTestId('summary-total').first()).toHaveText('3.786 ETH')

    await items.first().getByRole('button', { name: 'Aumentar quantidade' }).click()
    await expect(items.first().locator('output')).toHaveText('3')
    await expect(page.getByTestId('summary-subtotal').first()).toHaveText('4.96 ETH')

    const coupon = page
      .getByPlaceholder('Digite o código promocional...')
      .filter({ visible: true })
      .first()
    await coupon.fill('GENESIS')
    await coupon.press('Enter')
    await expect(page.getByRole('alert').first()).toContainText('Cupom expirado')
    await coupon.fill('NADA')
    await coupon.press('Enter')
    await expect(page.getByRole('alert').first()).toContainText('Cupom inválido')
    await coupon.fill('KURIO10')
    await coupon.press('Enter')
    await expect(
      page.getByRole('status').filter({ hasText: 'Cupom KURIO10 aplicado' }).first(),
    ).toBeVisible()
    await expect(page.getByTestId('summary-discount').first()).toHaveText('(-) 0.496 ETH')

    await page.reload()
    await mock.ready()
    await expect(items).toHaveCount(2)
    await expect(page.getByTestId('summary-discount').first()).toHaveText('(-) 0.496 ETH')

    await page
      .getByRole('button', { name: /Remover Violet Nomad/ })
      .first()
      .click()
    await expect(items).toHaveCount(1)

    await mock.login('bruno')
    await mock.goto('/carrinho')
    await expect(items).toHaveCount(1)
    await expect(items.first()).toContainText('Emerald Ape #042')
    await expect(
      page.getByRole('status').filter({ hasText: 'Cupom KURIO10 aplicado' }).first(),
    ).toBeVisible()
  })

  test('guest cart requires login before checkout and keeps items', async ({ page, mock }) => {
    await mock.goto('/')
    await mock.addToCart('nft_088', 'e50', 1)
    await mock.goto('/carrinho')
    await page.getByRole('button', { name: 'Conectar e finalizar' }).first().click()
    await expect(page).toHaveURL(/\/login\?redirect=%2Fpagamento/)
    await page.getByPlaceholder('contato@email.com').fill('bruno@kurio.app')
    await page.getByPlaceholder('Senha').fill('kurio123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/pagamento/)
    await expect(page.getByTestId('review-line').first()).toContainText('Ivory Baron #088')
  })
})
