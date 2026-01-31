export const SPOTIFY_CONFIG = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
  apiBaseUrl: 'https://api.spotify.com/v1',
  scopes: [
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private'
  ]
};

export const API_LIMITS = {
  TRACKS_PER_REQUEST: 50,
  ARTISTS_PER_REQUEST: 50,
  BATCH_DELAY_MS: 150
};
