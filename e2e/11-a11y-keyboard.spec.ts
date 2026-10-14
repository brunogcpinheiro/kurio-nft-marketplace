import AxeBuilder from '@axe-core/playwright'
import { cards, expect, test } from './fixtures'

async function noSeriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([])
}

test.describe('accessibility', () => {
  test('keyboard reaches the first card and opens it', async ({ page, mock, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation is checked on desktop')
    await mock.goto('/')
    await expect(cards(page).first()).toBeVisible()
    const target = cards(page).first().getByRole('link').first()
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press('Tab')
      if (await target.evaluate((el) => el === document.activeElement)) break
    }
    await expect(target).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/nft\//)
  })

  test('login dialog traps focus and restores it on escape', async ({ page, mock, isMobile }) => {
    test.skip(isMobile, 'the login screen is a dialog only on desktop')
    await mock.goto('/')
    const trigger = page.getByRole('link', { name: 'Entrar' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByPlaceholder('contato@email.com')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeFocused()
  })

  test('form errors are announced and linked to the fields', async ({ page, mock }) => {
    await mock.goto('/cadastro')
    await page.getByRole('button', { name: /Criar (conta|perfil)/ }).click()
    const alerts = page.getByRole('alert')
    await expect(alerts.first()).toBeVisible()
    const username = page.getByPlaceholder('Nome de usuário')
    const describedBy = await username.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(username).toHaveAttribute('aria-invalid', 'true')
  })

  test('main screens have no serious axe violations and no horizontal overflow', async ({
    page,
    mock,
  }) => {
    await mock.goto('/')
    await mock.login('ana')
    await mock.addToCart('nft_042', 'e50', 1)
    for (const path of ['/', '/nft/emerald-ape-042', '/carrinho', '/pagamento']) {
      await mock.goto(path)
      await page.waitForTimeout(800)
      await noSeriousViolations(page)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, `overflow on ${path}`).toBeLessThanOrEqual(0)
    }
  })
})
