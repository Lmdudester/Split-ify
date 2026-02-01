/**
 * Testing mode configuration
 *
 * When VITE_TESTING_MODE is enabled, the app will:
 * - Use mock authentication tokens
 * - Intercept API calls with MSW
 * - Skip OAuth redirects
 *
 * This allows testing the full app flow without real Spotify/Last.fm APIs
 */

export const TESTING_MODE = import.meta.env.VITE_TESTING_MODE === 'true'

/**
 * Mock authentication state for testing mode
 * These values will be used instead of real OAuth tokens
 */
export const mockAuthState = {
  token: 'mock_access_token_12345',
  refreshToken: 'mock_refresh_token_67890',
  expiresAt: Date.now() + 3600000, // 1 hour from now
  userId: 'test_user_123',
}

/**
 * Check if we're in testing mode and log appropriately
 */
export function logTestingMode() {
  if (TESTING_MODE) {
    console.log(
      '%c[Testing Mode] %cAPI calls will be mocked with MSW',
      'color: #00ff00; font-weight: bold',
      'color: #00ff00'
    )
  }
}
