import { cards, closeFilters, expect, openFilters, search, test } from './fixtures'

test.describe('catálogo', () => {
  test('busca, filtros combinados, ordenação e paginação compõem a URL e sobrevivem ao histórico', async ({
    page,
    mock,
  }) => {
    await mock.goto('/')
    await expect(cards(page)).toHaveCount(9)

    await search(page, 'Signal')
    await expect(page).toHaveURL(/q=Signal/)
    await expect(cards(page).getByRole('heading').first()).toContainText('Signal')
    await expect(page.getByTestId('catalog-grid')).toHaveAttribute('aria-busy', 'false')
    for (const name of await cards(page).getByRole('heading').allTextContents())
      expect(name).toContain('Signal')

    await search(page, '')
    await openFilters(page)
    await page.getByRole('button', { name: /^Música/ }).click()
    await expect(page).toHaveURL(/category=musica/)
    await expect(page.getByTestId('catalog-grid')).toHaveAttribute('aria-busy', 'false')
    const ethereum = page.getByRole('button', { name: /^Ethereum/ })
    await expect(ethereum).toContainText(/\(\d+\)/)
    const expected = Number(/\((\d+)\)/.exec((await ethereum.textContent()) ?? '')?.[1])
    expect(expected).toBeGreaterThan(1)
    await ethereum.click()
    await closeFilters(page)
    await expect(page).toHaveURL(/category=musica/)
    await expect(page).toHaveURL(/network=ethereum/)
    await expect(cards(page)).toHaveCount(expected)

    const sort = page.getByRole('combobox')
    if (await sort.isVisible()) {
      await sort.click()
      await page.getByRole('option', { name: 'Menor preço' }).click()
      await expect(page).toHaveURL(/sort=price-asc/)
      await expect
        .poll(async () => {
          const numbers = await cards(page)
            .locator('[data-price]')
            .evaluateAll((els) => els.map((el) => Number(el.getAttribute('data-price'))))
          return (
            numbers.length > 1 && numbers.every((n, i) => i === 0 || n >= (numbers[i - 1] ?? 0))
          )
        })
        .toBe(true)
    }

    await openFilters(page)
    await page.getByRole('button', { name: /^Música/ }).click()
    await page.getByRole('button', { name: /^Ethereum/ }).click()
    await closeFilters(page)
    await expect(page).not.toHaveURL(/category=/)
    await expect(cards(page)).toHaveCount(9)

    const firstPageFirst = await cards(page).first().getByRole('heading').textContent()
    await page.getByRole('link', { name: 'Página 2' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('link', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(cards(page).first().getByRole('heading')).not.toHaveText(firstPageFirst ?? '')
    const secondPageFirst = await cards(page).first().getByRole('heading').textContent()

    await page.reload()
    await mock.ready()
    await expect(page).toHaveURL(/page=2/)
    await expect(cards(page).first().getByRole('heading')).toHaveText(secondPageFirst ?? '')

    await page.goBack()
    await expect(page).not.toHaveURL(/page=2/)
    await expect(page.getByRole('link', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await page.goForward()
    await expect(page).toHaveURL(/page=2/)
  })

  test('mudar de filtro reinicia a paginação', async ({ page, mock }) => {
    await mock.goto('/?page=3')
    await expect(page.getByRole('link', { name: 'Página 3' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await openFilters(page)
    await page.getByRole('button', { name: /^Ethereum/ }).click()
    await closeFilters(page)
    await expect(page).toHaveURL(/network=ethereum/)
    await expect(page).not.toHaveURL(/page=/)
  })

  test('resultado vazio oferece limpar filtros', async ({ page, mock }) => {
    await mock.goto('/?category=assinaturas&network=solana')
    await expect(page.getByRole('status')).toContainText('Nenhum NFT encontrado')
    await page.getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(page).toHaveURL(/\/(#catalogo)?$/)
    await expect(cards(page)).toHaveCount(9)
  })

  test.describe('respostas fora de ordem', () => {
    test.use({ scenario: 'out-of-order' })
    test('a grade mostra a última busca mesmo quando a primeira resposta chega depois', async ({
      page,
      mock,
    }) => {
      await mock.goto('/')
      await search(page, 'Sig')
      await search(page, 'Signal')
      await expect(page).toHaveURL(/q=Signal/)
      await expect(cards(page).getByRole('heading').first()).toContainText('Signal', {
        timeout: 15_000,
      })
      await page.waitForTimeout(3500)
      const names = await cards(page).getByRole('heading').allTextContents()
      expect(names.length).toBeGreaterThan(0)
      for (const name of names) expect(name).toContain('Signal')
    })
  })
})
