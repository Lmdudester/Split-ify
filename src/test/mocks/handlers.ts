import { http, HttpResponse } from 'msw'

/**
 * MSW request handlers for mocking Spotify and Last.fm API calls
 * These handlers will be used in tests to intercept and mock API responses
 */

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0'
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com'

export const handlers = [
  // Spotify OAuth - Token endpoint
  http.post(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, () => {
    return HttpResponse.json({
      access_token: 'mock_access_token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token',
      scope: 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-private',
    })
  }),

  // Spotify - Get current user profile
  http.get(`${SPOTIFY_API_BASE}/me`, () => {
    return HttpResponse.json({
      id: 'test_user',
      display_name: 'Test User',
      email: 'test@example.com',
      images: [],
      type: 'user',
      uri: 'spotify:user:test_user',
    })
  }),

  // Spotify - Get user's playlists
  http.get(`${SPOTIFY_API_BASE}/me/playlists`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'playlist_1',
          name: 'Test Playlist 1',
          description: 'A test playlist',
          images: [{ url: 'https://example.com/image.jpg' }],
          tracks: { total: 50 },
          owner: { id: 'test_user', display_name: 'Test User' },
          public: true,
          collaborative: false,
        },
        {
          id: 'playlist_2',
          name: 'Test Playlist 2',
          description: 'Another test playlist',
          images: [],
          tracks: { total: 100 },
          owner: { id: 'test_user', display_name: 'Test User' },
          public: false,
          collaborative: false,
        },
      ],
      total: 2,
      limit: 50,
      offset: 0,
    })
  }),

  // Spotify - Get playlist details
  http.get(`${SPOTIFY_API_BASE}/playlists/:playlistId`, ({ params }) => {
    const { playlistId } = params
    return HttpResponse.json({
      id: playlistId,
      name: 'Test Playlist',
      description: 'A test playlist',
      images: [{ url: 'https://example.com/image.jpg' }],
      tracks: { total: 10 },
      owner: { id: 'test_user', display_name: 'Test User' },
      public: true,
      collaborative: false,
    })
  }),

  // Spotify - Get playlist tracks
  http.get(`${SPOTIFY_API_BASE}/playlists/:playlistId/tracks`, ({ request }) => {
    const url = new URL(request.url)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Generate mock tracks
    const mockTracks = Array.from({ length: Math.min(limit, 10 - offset) }, (_, i) => ({
      track: {
        id: `track_${offset + i}`,
        name: `Test Track ${offset + i}`,
        artists: [
          {
            id: `artist_${offset + i}`,
            name: `Test Artist ${offset + i}`,
            genres: [],
          },
        ],
        album: {
          id: `album_${offset + i}`,
          name: `Test Album ${offset + i}`,
          images: [{ url: 'https://example.com/album.jpg' }],
        },
        popularity: 50 + (offset + i) % 50,
        duration_ms: 200000,
        uri: `spotify:track:track_${offset + i}`,
      },
    }))

    return HttpResponse.json({
      items: mockTracks,
      total: 10,
      limit,
      offset,
      next: offset + limit < 10 ? `${SPOTIFY_API_BASE}/playlists/test/tracks?offset=${offset + limit}&limit=${limit}` : null,
    })
  }),

  // Spotify - Get artists (batch)
  http.get(`${SPOTIFY_API_BASE}/artists`, ({ request }) => {
    const url = new URL(request.url)
    const ids = url.searchParams.get('ids')?.split(',') || []

    const artists = ids.map((id, index) => ({
      id,
      name: `Artist ${index}`,
      genres: ['rock', 'indie', 'alternative'],
      popularity: 70,
      images: [],
    }))

    return HttpResponse.json({ artists })
  }),

  // Spotify - Create playlist
  http.post(`${SPOTIFY_API_BASE}/users/:userId/playlists`, async ({ request }) => {
    const body = await request.json() as { name: string; description?: string; public?: boolean }
    return HttpResponse.json({
      id: 'new_playlist_id',
      name: body.name,
      description: body.description || '',
      public: body.public ?? true,
      tracks: { total: 0 },
      owner: { id: 'test_user', display_name: 'Test User' },
      uri: 'spotify:playlist:new_playlist_id',
    })
  }),

  // Spotify - Add tracks to playlist
  http.post(`${SPOTIFY_API_BASE}/playlists/:playlistId/tracks`, () => {
    return HttpResponse.json({
      snapshot_id: 'snapshot_123',
    })
  }),

  // Last.fm - Get track top tags
  http.get(LASTFM_API_BASE, ({ request }) => {
    const url = new URL(request.url)
    const method = url.searchParams.get('method')

    if (method === 'track.getTopTags') {
      return HttpResponse.json({
        toptags: {
          tag: [
            { name: 'rock', count: 100 },
            { name: 'indie', count: 80 },
            { name: 'alternative', count: 60 },
          ],
        },
      })
    }

    if (method === 'artist.getTopTags') {
      return HttpResponse.json({
        toptags: {
          tag: [
            { name: 'electronic', count: 100 },
            { name: 'dance', count: 90 },
            { name: 'house', count: 70 },
          ],
        },
      })
    }

    return HttpResponse.json({ error: 'Unknown method' }, { status: 400 })
  }),
]
