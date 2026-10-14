import { expect, test, users } from './fixtures'

test.describe('conta e sessão', () => {
  test('cadastro cria sessão e volta ao fluxo anterior', async ({ page, mock, isMobile }) => {
    await mock.goto('/cadastro?redirect=%2Fnft%2Femerald-ape-042')
    await page.getByPlaceholder('Nome de usuário').fill('novo_colecionador')
    await page.getByPlaceholder('Digite seu e-mail', { exact: true }).fill('novo@kurio.app')
    await page.getByPlaceholder('Senha', { exact: true }).fill('senhaforte1')
    await page.getByPlaceholder('Confirmar senha').fill('senhaforte1')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    await expect(page).toHaveURL(/\/nft\/emerald-ape-042/)
    expect(await page.evaluate(() => localStorage.getItem('kurio:session'))).toBeTruthy()
    if (!isMobile) await expect(page.getByRole('link', { name: 'novo_colecionador' })).toBeVisible()
  })

  test.describe('conflito de cadastro', () => {
    test.use({ scenario: 'register-conflict' })
    test('erro do servidor aparece no campo de e-mail', async ({ page, mock }) => {
      await mock.goto('/cadastro')
      await page.getByPlaceholder('Nome de usuário').fill('outro_user')
      await page.getByPlaceholder('Digite seu e-mail', { exact: true }).fill('outro@kurio.app')
      await page.getByPlaceholder('Senha', { exact: true }).fill('senhaforte1')
      await page.getByPlaceholder('Confirmar senha').fill('senhaforte1')
      await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
      await expect(page.getByRole('alert')).toContainText('Este e-mail já está em uso')
      await expect(page).toHaveURL(/\/cadastro/)
    })
  })

  test('login inválido, login válido e logout', async ({ page, mock, isMobile }) => {
    await mock.goto('/login')
    await page.getByPlaceholder('contato@email.com').fill(users.ana.email)
    await page.getByPlaceholder('Senha').fill('errada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByRole('alert')).toContainText('E-mail ou senha inválidos')

    await page.getByPlaceholder('Senha').fill(users.ana.password)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/$/)
    if (!isMobile) await expect(page.getByRole('link', { name: 'Ana' })).toBeVisible()

    await mock.goto('/perfil')
    await page.getByRole('button', { name: 'Sair' }).first().click()
    await expect(page).toHaveURL(/\/$/)
    await mock.goto('/perfil')
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })

  test.describe('sessão expirada', () => {
    test.use({ scenario: 'session-expired' })
    test('expiração durante a navegação leva ao login preservando o destino', async ({
      page,
      mock,
    }) => {
      await mock.goto('/')
      await mock.login('ana')
      await mock.goto('/perfil/favoritos')
      await expect(page).toHaveURL(/\/login\?redirect=%2Fperfil%2Ffavoritos/)
      await expect(page.getByText('Sua sessão expirou')).toBeVisible()
      await mock.setScenario('default')
      await page.getByPlaceholder('contato@email.com').fill(users.ana.email)
      await page.getByPlaceholder('Senha').fill(users.ana.password)
      await page.getByRole('button', { name: 'Entrar' }).click()
      await expect(page).toHaveURL(/\/perfil\/favoritos/)
    })
  })

  test('troca de usuário não vaza carrinho nem favoritos', async ({ page, mock }) => {
    await mock.goto('/')
    await mock.login('ana')
    await mock.addToCart('nft_042', 'e50', 2)
    await mock.goto('/perfil/favoritos')
    await expect(page.getByTestId('favorites-grid').getByTestId('nft-card')).toHaveCount(3)
    await expect(page.getByRole('link', { name: /Carrinho, 2 itens/ }).first()).toBeVisible()

    await page.getByRole('button', { name: 'Sair' }).first().click()
    await expect(page).toHaveURL(/\/$/)
    await mock.login('bruno')
    await mock.goto('/perfil/favoritos')
    await expect(page.getByRole('status')).toContainText('Você ainda não favoritou')
    await expect(page.getByRole('link', { name: /Carrinho, 0 itens/ }).first()).toBeVisible()
  })
})
