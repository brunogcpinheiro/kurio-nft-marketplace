import { expect, test } from './fixtures'

test('duplicate and outdated events do not regress the catalog', async ({ page, mock }) => {
  await mock.goto('/nft/emerald-ape-042')
  await expect(page.locator('[data-price]').first()).toHaveAttribute('data-price', '1.19')

  type Edition = { id: string; price: string }
  const editions = await mock.db(
    (db) =>
      (db.nfts as { id: string; editions: Edition[] }[]).find((n) => n.id === 'nft_042')
        ?.editions ?? [],
  )
  const event = (eventId: string, version: number, price: string) => ({
    eventId,
    nftId: 'nft_042',
    version,
    price,
    previousPrice: '1.19',
    editions: editions.map((e) => (e.id === 'e50' ? { ...e, price } : e)),
  })

  await mock.emit({ event: 'nft.updated', payload: event('evt_dup', 5, '2.00') })
  await expect(page.locator('[data-price]').first()).toHaveAttribute('data-price', '2.00')

  await mock.emit({ event: 'nft.updated', payload: event('evt_dup', 5, '9.99') })
  await page.waitForTimeout(800)
  await expect(page.locator('[data-price]').first()).toHaveAttribute('data-price', '2.00')

  await mock.emit({ event: 'nft.updated', payload: event('evt_old', 2, '0.50') })
  await page.waitForTimeout(800)
  await expect(page.locator('[data-price]').first()).toHaveAttribute('data-price', '2.00')
})

test('connection drop while an order is pending resumes without a second purchase', async ({
  page,
  mock,
  isMobile,
}) => {
  await mock.goto('/')
  await mock.login('ana')
  await mock.addToCart('nft_042', 'e50', 1)
  await page.goto(isMobile ? '/pagamento?step=wallet' : '/pagamento')
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByTestId('wallet-connection')).toContainText('conectada')
  await page.getByTestId(isMobile ? 'checkout-submit-mobile' : 'checkout-submit').click()
  await expect(page).toHaveURL(/\/pedido\//)
  await expect(page.getByTestId('order-pending')).toBeVisible()

  await mock.disconnectSockets()
  await page.context().setOffline(true)
  await page.waitForTimeout(500)
  await page.context().setOffline(false)
  await page.reload()
  await mock.ready()
  await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 15_000 })

  await page.goto('/pagamento')
  await expect(page).toHaveURL(/\/(carrinho|pagamento)/)
  expect(await mock.db((db) => (db.orders as { status: string }[]).map((o) => o.status))).toEqual([
    'confirmed',
  ])
})
