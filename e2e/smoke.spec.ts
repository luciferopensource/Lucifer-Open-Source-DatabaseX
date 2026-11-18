import { expect, test } from '@playwright/test'

const ROUTES = ['/', '/total-database', '/total-database/extensions?q=.mkv', '/compare', '/sources', '/search?q=mkv']

test.describe('routes', () => {
  for (const path of ROUTES) {
    test(`${path} renders without console errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1').first()).toBeVisible()
      expect(errors).toEqual([])
    })
  }

  test('retired backup routes show the 404 page', async ({ page }) => {
    await page.goto('/stream-backup-1')
    await expect(page.getByRole('heading', { name: 'This page is not here' })).toBeVisible()
  })
})

test.describe('appearance', () => {
  test('theme toggle persists across reload', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('lx-theme'))
    await page.reload()
    await page.getByRole('button', { name: /appearance/i }).click()
    await page.getByRole('button', { name: 'Dark' }).click()
    await page.getByRole('button', { name: 'Close settings' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('command palette opens with the keyboard and searches', async ({ page }) => {
    await page.goto('/')
    // The shortcut is desktop muscle memory; touch devices use the search trigger.
    const trigger = page.locator('.nav__search')
    if (await trigger.isVisible()) await trigger.click()
    else await page.keyboard.press('ControlOrMeta+k')
    const palette = page.locator('.palette')
    await expect(palette).toBeVisible()
    await palette.locator('input').fill('mkv')
    await expect(palette.getByRole('option', { name: /\.mkv/i }).first()).toBeVisible()
  })

  test('sidebar can be hidden and restored from the top bar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the sidebar toggle is desktop-only; mobile keeps the horizontal nav')
    await page.goto('/')
    await page.getByRole('button', { name: 'Hide sidebar' }).first().click()
    await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'hidden')
    await page.getByRole('button', { name: 'Show sidebar' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'shown')
  })
})

test.describe('embed mode', () => {
  test('strips the shell', async ({ page }) => {
    await page.goto('/total-database?embed=1')
    await expect(page.locator('.sidebar')).toHaveCount(0)
    await expect(page.locator('.topbar')).toHaveCount(0)
    await expect(page.locator('.footer')).toHaveCount(0)
  })
})
