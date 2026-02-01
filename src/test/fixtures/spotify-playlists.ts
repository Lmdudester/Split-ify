/**
 * Mock data for Spotify playlists
 */

export const mockPlaylist = {
  id: 'test_playlist_123',
  name: 'Test Playlist',
  description: 'A test playlist for unit tests',
  images: [
    {
      url: 'https://example.com/playlist-cover.jpg',
      height: 640,
      width: 640,
    },
  ],
  owner: {
    id: 'test_user_123',
    display_name: 'Test User',
  },
  public: true,
  collaborative: false,
  tracks: {
    total: 10,
  },
  uri: 'spotify:playlist:test_playlist_123',
  external_urls: {
    spotify: 'https://open.spotify.com/playlist/test_playlist_123',
  },
}

export const mockUserPlaylists = {
  items: [
    {
      id: 'playlist_1',
      name: 'Rock Classics',
      description: 'The best rock songs',
      images: [{ url: 'https://example.com/rock.jpg' }],
      owner: { id: 'test_user_123', display_name: 'Test User' },
      public: true,
      collaborative: false,
      tracks: { total: 50 },
      uri: 'spotify:playlist:playlist_1',
    },
    {
      id: 'playlist_2',
      name: 'Electronic Vibes',
      description: 'Best electronic music',
      images: [{ url: 'https://example.com/electronic.jpg' }],
      owner: { id: 'test_user_123', display_name: 'Test User' },
      public: false,
      collaborative: false,
      tracks: { total: 100 },
      uri: 'spotify:playlist:playlist_2',
    },
    {
      id: 'playlist_3',
      name: 'Indie Discoveries',
      description: 'Hidden indie gems',
      images: [],
      owner: { id: 'test_user_123', display_name: 'Test User' },
      public: true,
      collaborative: true,
      tracks: { total: 25 },
      uri: 'spotify:playlist:playlist_3',
    },
  ],
  total: 3,
  limit: 50,
  offset: 0,
}

export const mockEmptyPlaylist = {
  id: 'empty_playlist',
  name: 'Empty Playlist',
  description: 'No tracks here',
  images: [],
  owner: {
    id: 'test_user_123',
    display_name: 'Test User',
  },
  public: true,
  collaborative: false,
  tracks: {
    total: 0,
  },
  uri: 'spotify:playlist:empty_playlist',
}
