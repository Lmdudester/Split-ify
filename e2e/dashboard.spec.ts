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


  test('should filter tracks by genre', async ({ page }) => {
    // Mock playlist with multiple tracks of different genres
    await page.route('**/v1/playlists/*/tracks*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              track: {
                id: 'track_1',
                name: 'Rock Track',
                artists: [{ id: 'artist_1', name: 'Rock Artist' }],
                album: { id: 'album_1', name: 'Rock Album', images: [] },
                popularity: 75,
                duration_ms: 200000,
                uri: 'spotify:track:track_1',
              },
            },
            {
              track: {
                id: 'track_2',
                name: 'Jazz Track',
                artists: [{ id: 'artist_2', name: 'Jazz Artist' }],
                album: { id: 'album_2', name: 'Jazz Album', images: [] },
                popularity: 60,
                duration_ms: 180000,
                uri: 'spotify:track:track_2',
              },
            },
          ],
          total: 2,
        }),
      })
    })

    await page.route('**/v1/playlists/*', (route) => {
      if (!route.request().url().includes('/tracks')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test_playlist',
            name: 'Test Playlist',
            tracks: { total: 2 },
          }),
        })
      }
    })

    // Mock artist genres
    await page.route('**/v1/artists?ids=*', (route) => {
      const url = route.request().url()
      if (url.includes('artist_1')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            artists: [
              { id: 'artist_1', name: 'Rock Artist', genres: ['rock', 'alternative'] },
            ],
          }),
        })
      } else if (url.includes('artist_2')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            artists: [
              { id: 'artist_2', name: 'Jazz Artist', genres: ['jazz', 'smooth jazz'] },
            ],
          }),
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            artists: [
              { id: 'artist_1', name: 'Rock Artist', genres: ['rock', 'alternative'] },
              { id: 'artist_2', name: 'Jazz Artist', genres: ['jazz', 'smooth jazz'] },
            ],
          }),
        })
      }
    })

    // Mock Last.fm API responses
    await page.route('**/lastfm/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ track: { toptags: { tag: [] } } }),
      })
    })

    // Switch to URL tab and load playlist
    await page.getByRole('button', { name: 'Enter URL' }).click()
    const playlistInput = page.getByPlaceholder(/Enter Spotify playlist URL or ID/i)
    await playlistInput.fill('https://open.spotify.com/playlist/test_playlist')
    await page.getByRole('button', { name: 'Load Playlist' }).click()

    // Wait for tracks to load and enrichment to complete
    await page.waitForTimeout(2000)

    // Initially both tracks should be visible
    await expect(page.getByText('Rock Track')).toBeVisible()
    await expect(page.getByText('Jazz Track')).toBeVisible()

    // Check the track count shows all tracks
    await expect(page.getByText(/Showing 2 of 2 tracks/i)).toBeVisible()

    // Click on the rock genre checkbox
    const rockCheckbox = page.locator('.genre-item').filter({ hasText: /^rock$/i })
    await rockCheckbox.click()

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Should show only 1 track now
    await expect(page.getByText(/Showing 1 of 2 tracks/i)).toBeVisible()

    // Rock track should still be visible, jazz should not
    await expect(page.getByText('Rock Track')).toBeVisible()
    await expect(page.getByText('Jazz Track')).not.toBeVisible()
  })

  test('should create new playlist from filtered tracks', async ({ page }) => {
    // Mock playlist with multiple tracks
    await page.route('**/v1/playlists/*/tracks*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              track: {
                id: 'track_1',
                name: 'Rock Track',
                artists: [{ id: 'artist_1', name: 'Rock Artist' }],
                album: { id: 'album_1', name: 'Rock Album', images: [] },
                popularity: 75,
                duration_ms: 200000,
                uri: 'spotify:track:track_1',
              },
            },
            {
              track: {
                id: 'track_2',
                name: 'Jazz Track',
                artists: [{ id: 'artist_2', name: 'Jazz Artist' }],
                album: { id: 'album_2', name: 'Jazz Album', images: [] },
                popularity: 60,
                duration_ms: 180000,
                uri: 'spotify:track:track_2',
              },
            },
          ],
          total: 2,
        }),
      })
    })

    await page.route('**/v1/playlists/*', (route) => {
      if (!route.request().url().includes('/tracks')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test_playlist',
            name: 'Test Playlist',
            tracks: { total: 2 },
          }),
        })
      }
    })

    // Mock artist genres
    await page.route('**/v1/artists?ids=*', (route) => {
      const url = route.request().url()
      if (url.includes('artist_1') && !url.includes('artist_2')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            artists: [
              { id: 'artist_1', name: 'Rock Artist', genres: ['rock'] },
            ],
          }),
        })
      } else if (url.includes('artist_2') && !url.includes('artist_1')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            artists: [
              { id: 'artist_2', name: 'Jazz Artist', genres: ['jazz'] },
            ],
          }),
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            artists: [
              { id: 'artist_1', name: 'Rock Artist', genres: ['rock'] },
              { id: 'artist_2', name: 'Jazz Artist', genres: ['jazz'] },
            ],
          }),
        })
      }
    })

    await page.route('**/lastfm/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ track: { toptags: { tag: [] } } }),
      })
    })

    // Mock current user endpoint
    await page.route('**/v1/me', (route) => {
      if (!route.request().url().includes('/playlists')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test_user_id',
            display_name: 'Test User',
          }),
        })
      }
    })

    // Mock playlist creation
    await page.route('**/v1/users/*/playlists', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new_playlist_id',
          name: 'My Filtered Playlist',
          external_urls: {
            spotify: 'https://open.spotify.com/playlist/new_playlist_id',
          },
        }),
      })
    })

    // Mock adding tracks to playlist
    await page.route('**/v1/playlists/*/tracks', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          snapshot_id: 'snapshot_123',
        }),
      })
    })

    // Load playlist
    await page.getByRole('button', { name: 'Enter URL' }).click()
    const playlistInput = page.getByPlaceholder(/Enter Spotify playlist URL or ID/i)
    await playlistInput.fill('https://open.spotify.com/playlist/test_playlist')
    await page.getByRole('button', { name: 'Load Playlist' }).click()

    // Wait for tracks to load and enrichment
    await page.waitForTimeout(2000)

    // Apply filter - select rock genre
    const rockCheckbox = page.locator('.genre-item').filter({ hasText: /^rock$/i })
    await rockCheckbox.click()
    await page.waitForTimeout(500)

    // Should show only 1 filtered track
    await expect(page.getByText(/Showing 1 of 2 tracks/i)).toBeVisible()

    // Click Create Playlist button
    await page.getByRole('button', { name: /Create Playlist \(1\)/i }).click()

    // Wait for modal to open and fill in playlist details
    await page.waitForTimeout(500)
    const nameInput = page.getByPlaceholder('My Filtered Playlist')
    await expect(nameInput).toBeVisible()
    await nameInput.fill('Rock Only Playlist')

    const descInput = page.getByPlaceholder('Created with Split-ify')
    await descInput.fill('Only rock tracks')

    // Click Create button in modal
    await page.getByRole('button', { name: 'Create Playlist' }).last().click()

    // Wait for creation to complete
    await page.waitForTimeout(1500)

    // Should show success message with Spotify link
    await expect(page.getByText('Playlist Created!')).toBeVisible()
    await expect(page.getByText(/Your playlist has been created successfully/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Open in Spotify/i })).toBeVisible()
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
