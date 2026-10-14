import { expect, test, tinyPng } from './fixtures'

test.describe('profile and wallets', () => {
  test('profile, password and avatar edits with validation', async ({ page, mock }) => {
    await mock.goto('/')
    await mock.login('ana')
    await mock.goto('/perfil')

    await page.getByLabel('Nome de exibição').fill('Ana Lima Souza')
    await page.getByLabel('Nome de usuário').fill('bruno')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByRole('alert')).toContainText('Este nome de usuário já está em uso')

    await page.getByLabel('Nome de usuário').fill('ana')
    await page.getByLabel('Senha atual').fill('errada')
    await page.getByLabel('Nova senha', { exact: true }).fill('novasenha1')
    await page.getByLabel('Confirmar nova senha').fill('novasenha1')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByRole('alert')).toContainText('Senha atual incorreta')

    await page.getByLabel('Senha atual').fill('kurio123')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Perfil atualizado')).toBeVisible()

    await page
      .getByTestId('avatar-input')
      .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: tinyPng })
    await expect(page.getByText('Avatar atualizado')).toBeVisible()
    await expect(page.getByAltText('Avatar de Ana Lima Souza')).toBeVisible()

    await page.reload()
    await mock.ready()
    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Lima Souza')
    await expect(page.getByAltText('Avatar de Ana Lima Souza')).toBeVisible()

    await mock.logout()
    await mock.goto('/login')
    await page.getByPlaceholder('contato@email.com').fill('ana@kurio.app')
    await page.getByPlaceholder('Senha').fill('novasenha1')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('wallet form validates the address and persists', async ({ page, mock }) => {
    await mock.goto('/')
    await mock.login('bruno')
    await mock.goto('/perfil/carteiras')

    const form = page.getByTestId('wallet-form-primary')
    await expect(form.getByLabel('Nome de exibição')).toHaveValue('Bruno Pinheiro')
    await form.getByLabel('Nome do perfil').fill('brunop')
    await form.getByLabel('Endereço da carteira').fill('0x123')
    await form.getByLabel('Código de indicação').fill('KURIO-BRUNO')
    await form.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(form.getByRole('alert')).toContainText('endereço 0x com 40 caracteres')

    await form.getByLabel('Endereço da carteira').fill('0xA91F3c8E2b7D4a6F1e9C0b5A8d7E6f4C3b2A1E82')
    await form.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(form.getByRole('alert')).toContainText('já está cadastrado')

    await form.getByLabel('Endereço da carteira').fill(`0x${'ab'.repeat(20)}`)
    await form.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(page.getByTestId('wallet-summary-primary')).toContainText(`0x${'ab'.repeat(20)}`)

    await page.reload()
    await mock.ready()
    await expect(page.getByTestId('wallet-summary-primary')).toContainText('brunop')
  })
})
