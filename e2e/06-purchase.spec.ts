import { cards, expect, test } from './fixtures'

test('complete purchase from catalog to confirmed receipt', async ({ page, mock, isMobile }) => {
  await mock.goto('/')
  await mock.login('ana')
  await mock.goto('/')
  await cards(page).first().getByRole('link').first().click()
  await expect(page).toHaveURL(/\/nft\//)
  await page
    .getByRole('button', { name: /^Comprar/i })
    .first()
    .click()
  await expect(page).toHaveURL(/\/carrinho/)
  const total = (await page.getByTestId('summary-total').first().textContent()) ?? ''
  await page.getByRole('button', { name: 'Conectar e finalizar' }).first().click()
  await expect(page).toHaveURL(/\/pagamento/)

  if (isMobile) {
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page).toHaveURL(/step=wallet/)
  }
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByTestId('wallet-connection')).toContainText('conectada')
  await page.getByTestId(isMobile ? 'checkout-submit-mobile' : 'checkout-submit').click()

  await expect(page).toHaveURL(/\/pedido\//)
  await expect(page.getByTestId('order-pending')).toBeVisible()
  await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('receipt-total')).toHaveText(total)
  await expect(page.getByTestId('receipt-line')).toHaveCount(1)
  await expect(page.getByTestId('receipt-tx')).toContainText('0x')

  const cart = await mock.db(
    (db) =>
      (db.carts as { ownerKey: string; items: unknown[] }[]).find(
        (c) => c.ownerKey === 'user:usr_ana',
      )?.items.length,
  )
  expect(cart).toBe(0)
})
