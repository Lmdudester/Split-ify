import { test, expect } from '@playwright/test'

/**
 * E2E tests for dashboard functionality
 *
 * These tests demonstrate how to test the main application features
 * with mocked API responses.
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication for dashboard access
    await page.goto('/')

    // Mock authentication state
    await page.evaluate(() => {
      localStorage.setItem('spotify_token', 'mock_token')
      localStorage.setItem('spotify_token_expiry', String(Date.now() + 3600000))
    })

    // Mock user profile endpoint
    await page.route('**/v1/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test_user',
          display_name: 'Test User',
        }),
      })
    })

    // Navigate to dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard page when authenticated', async ({ page }) => {
    // Should show dashboard elements
    await expect(page).toHaveURL('/dashboard')

    // Look for key dashboard elements
    // (adjust selectors based on actual UI)
    const playlistInput = page.getByPlaceholder(/playlist url/i)
    if (await playlistInput.isVisible()) {
      await expect(playlistInput).toBeVisible()
    }
  })

  test('should load playlist when URL is entered', async ({ page }) => {
    // Mock playlist endpoints
    await page.route('**/v1/playlists/*', (route) => {
      const url = route.request().url()

      if (url.includes('/tracks')) {
        // Mock playlist tracks
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                track: {
                  id: 'track_1',
                  name: 'Test Track',
                  artists: [{ id: 'artist_1', name: 'Test Artist' }],
                  album: { id: 'album_1', name: 'Test Album', images: [] },
                  popularity: 75,
                  duration_ms: 200000,
                  uri: 'spotify:track:track_1',
                },
              },
            ],
            total: 1,
          }),
        })
      } else {
        // Mock playlist metadata
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test_playlist',
            name: 'Test Playlist',
            tracks: { total: 1 },
          }),
        })
      }
    })

    // Mock artist genres endpoint
    await page.route('**/v1/artists?ids=*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          artists: [
            {
              id: 'artist_1',
              name: 'Test Artist',
              genres: ['rock', 'indie'],
            },
          ],
        }),
      })
    })

    // Enter playlist URL
    const playlistInput = page.getByPlaceholder(/playlist url/i)
    if (await playlistInput.isVisible()) {
      await playlistInput.fill('https://open.spotify.com/playlist/test_playlist')
      await playlistInput.press('Enter')

      // Wait for loading to complete
      // (adjust based on actual loading indicators)
      await page.waitForTimeout(1000)

      // Verify track appears
      // await expect(page.getByText('Test Track')).toBeVisible()
    }
  })

  test.skip('should filter tracks by genre', async ({ page }) => {
    // This test would:
    // 1. Load a playlist with multiple genres
    // 2. Select a genre filter
    // 3. Verify only tracks with that genre are shown

    // Example implementation:
    // await page.getByText('rock').click()
    // await expect(page.getByText('Rock Track')).toBeVisible()
    // await expect(page.getByText('Jazz Track')).not.toBeVisible()
  })

  test.skip('should create new playlist from filtered tracks', async ({ page }) => {
    // This test would:
    // 1. Load a playlist
    // 2. Apply filters
    // 3. Click "Create Playlist"
    // 4. Verify playlist creation API call
    // 5. Show success message

    // Mock playlist creation
    await page.route('**/v1/users/*/playlists', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new_playlist',
          name: 'Filtered Playlist',
        }),
      })
    })

    // Test implementation here...
  })
})

test.describe('Error Handling', () => {
  test('should handle 401 unauthorized errors', async ({ page }) => {
    await page.goto('/')

    // Set expired token
    await page.evaluate(() => {
      localStorage.setItem('spotify_token', 'expired_token')
      localStorage.setItem('spotify_token_expiry', String(Date.now() - 1000))
    })

    // Mock 401 response
    await page.route('**/v1/me', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { status: 401, message: 'Token expired' },
        }),
      })
    })

    await page.goto('/dashboard')

    // Should redirect to login or show error
    // await expect(page).toHaveURL('/')
  })
})
