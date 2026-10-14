import { expect, test } from './fixtures'

test('price change during checkout updates the summary and blocks a stale confirmation', async ({
  page,
  mock,
  isMobile,
}) => {
  await mock.goto('/')
  await mock.login('ana')
  await mock.addToCart('nft_042', 'e50', 2)
  await page.goto(isMobile ? '/pagamento?step=wallet' : '/pagamento')
  const total = page.getByTestId(isMobile ? 'checkout-total-mobile' : 'checkout-total')
  await expect(total).toHaveText('2.396 ETH')

  await mock.emit({ event: 'nft.updated', nftId: 'nft_042', change: 'price-up' })
  await expect(page.getByTestId('realtime-notice')).toContainText(
    'Emerald Ape #042 agora custa 1.37 ETH',
  )
  await expect(total).toHaveText('2.756 ETH')

  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByTestId('wallet-connection')).toContainText('conectada')

  await mock.emit({ event: 'nft.updated', nftId: 'nft_042', change: 'price-up', silent: true })
  await page.getByTestId(isMobile ? 'checkout-submit-mobile' : 'checkout-submit').click()

  const dialog = page.getByTestId('stale-quote-dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Emerald Ape #042: 1.37 ETH → 1.58 ETH')
  expect(await mock.db((db) => (db.orders as unknown[]).length)).toBe(0)

  await dialog.getByRole('button', { name: 'Confirmar com os novos valores' }).click()
  await expect(page).toHaveURL(/\/pedido\//)
  await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('receipt-total')).toHaveText('3.176 ETH')
})
