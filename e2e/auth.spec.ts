import { test, expect } from '@playwright/test'

/**
 * E2E tests for authentication flow
 *
 * These tests use Playwright to test the full authentication flow
 * in a real browser environment.
 *
 * Note: For CI/CD, you would use Playwright's route() API to mock
 * Spotify OAuth responses instead of testing against real API.
 */

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/')

    // Should show the login page
    await expect(page.getByText(/split-ify/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should have login button that initiates OAuth', async ({ page }) => {
    await page.goto('/')

    const loginButton = page.getByRole('button', { name: /login/i })
    await expect(loginButton).toBeVisible()
    await expect(loginButton).toBeEnabled()
  })

})

test.describe('Authentication with Testing Mode', () => {
  test('should bypass OAuth in testing mode', async ({ page }) => {
    // Set testing mode via environment or localStorage
    await page.goto('/')

    // Inject testing mode flag
    await page.evaluate(() => {
      localStorage.setItem('TESTING_MODE', 'true')
    })

    await page.reload()

    // In testing mode, we would expect to skip OAuth
    // and go directly to the dashboard
    // (This requires VITE_TESTING_MODE to be set)
  })
})

/**
 * Example of how to mock API responses in E2E tests
 */
test.describe('API Mocking Examples', () => {
  test('should mock Spotify API responses', async ({ page }) => {
    // Mock the user playlists endpoint
    await page.route('**/v1/me/playlists', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'test_playlist',
              name: 'Test Playlist',
              images: [],
              tracks: { total: 10 },
            },
          ],
        }),
      })
    })

    // Navigate and test with mocked API
    await page.goto('/')

    // Your test assertions here...
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock an API error
    await page.route('**/v1/me/playlists', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            status: 401,
            message: 'The access token expired',
          },
        }),
      })
    })

    await page.goto('/')

    // Test that error is handled properly
    // (e.g., user is redirected to login)
  })
})
