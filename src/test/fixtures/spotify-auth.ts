/**
 * Mock data for Spotify authentication flows
 */

export const mockAuthTokenResponse = {
  access_token: 'mock_access_token_12345',
  token_type: 'Bearer',
  expires_in: 3600,
  refresh_token: 'mock_refresh_token_67890',
  scope: 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-private',
}

export const mockRefreshTokenResponse = {
  access_token: 'new_mock_access_token_54321',
  token_type: 'Bearer',
  expires_in: 3600,
  scope: 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-private',
}

export const mockUserProfile = {
  id: 'test_user_123',
  display_name: 'Test User',
  email: 'test@example.com',
  images: [
    {
      url: 'https://example.com/avatar.jpg',
      height: 64,
      width: 64,
    },
  ],
  type: 'user',
  uri: 'spotify:user:test_user_123',
  external_urls: {
    spotify: 'https://open.spotify.com/user/test_user_123',
  },
  followers: {
    total: 42,
  },
}

export const mockCodeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
export const mockCodeChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
