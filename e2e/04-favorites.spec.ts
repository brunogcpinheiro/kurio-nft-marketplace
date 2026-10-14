import { expect, test } from './fixtures'

test.describe('favoritos', () => {
  test('exige sessão e persiste após recarregar', async ({ page, mock }) => {
    await mock.goto('/nft/ivory-baron-088')
    await page
      .getByRole('button', { name: /Favoritar Ivory Baron/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/login\?redirect=%2Fnft%2Fivory-baron-088/)

    await mock.login('bruno')
    await mock.goto('/nft/ivory-baron-088')
    const button = page.getByRole('button', { name: /Favoritar Ivory Baron/ }).first()
    await button.click()
    await expect(page.getByRole('button', { name: /Remover Ivory Baron/ }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByText('Ivory Baron #088 salvo nos favoritos')).toBeVisible()

    await page.reload()
    await mock.ready()
    await expect(page.getByRole('button', { name: /Remover Ivory Baron/ }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await mock.goto('/perfil/favoritos')
    await expect(page.getByTestId('favorites-grid')).toContainText('Ivory Baron #088')
  })

  test.describe('falha na mutation', () => {
    test.use({ scenario: 'favorites-fail' })
    test('atualização otimista reverte e avisa', async ({ page, mock }) => {
      await mock.goto('/')
      await mock.login('bruno')
      await mock.goto('/nft/golden-beat-207')
      const button = page.getByRole('button', { name: /Favoritar Golden Beat/ }).first()
      await button.click()
      await expect(
        page.getByText('Não foi possível atualizar os favoritos', { exact: true }),
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: /Favoritar Golden Beat/ }).first(),
      ).toHaveAttribute('aria-pressed', 'false')
      const ids = await mock.db((db) => (db.favorites as Record<string, string[]>).usr_bruno)
      expect(ids).toEqual([])

      await mock.setScenario('default')
      await button.click()
      await expect(
        page.getByRole('button', { name: /Remover Golden Beat/ }).first(),
      ).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
