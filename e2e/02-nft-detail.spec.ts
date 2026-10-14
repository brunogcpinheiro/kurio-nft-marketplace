import { expect, test } from './fixtures'

test.describe('nft detail', () => {
  test('direct access renders the nft with editions and quantity limit', async ({ page, mock }) => {
    await mock.goto('/nft/sage-nomad-009')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sage Nomad #009' }).first(),
    ).toBeVisible()
    await expect(page.getByRole('radio', { name: '1/1, esgotada' }).first()).toBeDisabled()

    await page
      .getByRole('radio', { name: /^1\/10/ })
      .first()
      .click()
    const increase = page.getByRole('button', { name: 'Aumentar quantidade' }).first()
    await expect(increase).toBeDisabled()
    await expect(page.getByRole('status').filter({ hasText: 'Máximo de 1' }).first()).toBeVisible()

    await page
      .getByRole('radio', { name: /^1\/50/ })
      .first()
      .click()
    await expect(increase).toBeEnabled()
    await increase.click()
    await expect(page.locator('output').first()).toHaveText('2')
  })

  test('missing nft shows a dedicated error with a way back to the catalog', async ({
    page,
    mock,
  }) => {
    await mock.goto('/nft/nao-existe')
    await expect(page.getByRole('status')).toContainText('NFT não encontrado')
    await page.getByRole('link', { name: 'Voltar ao catálogo' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('buy adds to the cart and navigates', async ({ page, mock }) => {
    await mock.goto('/nft/emerald-ape-042')
    await page
      .getByRole('button', { name: /^Comprar/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/carrinho/)
    const count = await mock.db(
      (db) => (db.carts as { items: { quantity: number }[] }[])[0]?.items[0]?.quantity,
    )
    expect(count).toBe(1)
  })
})
