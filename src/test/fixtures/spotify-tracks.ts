/**
 * Mock data for Spotify tracks and artists
 */

export const mockArtist = {
  id: 'artist_1',
  name: 'Test Artist',
  genres: ['rock', 'indie', 'alternative'],
  popularity: 75,
  images: [
    {
      url: 'https://example.com/artist.jpg',
      height: 640,
      width: 640,
    },
  ],
  external_urls: {
    spotify: 'https://open.spotify.com/artist/artist_1',
  },
  uri: 'spotify:artist:artist_1',
}

export const mockTrack = {
  id: 'track_1',
  name: 'Test Song',
  artists: [
    {
      id: 'artist_1',
      name: 'Test Artist',
      uri: 'spotify:artist:artist_1',
    },
  ],
  album: {
    id: 'album_1',
    name: 'Test Album',
    images: [
      {
        url: 'https://example.com/album.jpg',
        height: 640,
        width: 640,
      },
    ],
    release_date: '2024-01-01',
  },
  popularity: 80,
  duration_ms: 210000,
  uri: 'spotify:track:track_1',
  external_urls: {
    spotify: 'https://open.spotify.com/track/track_1',
  },
}

export const mockPlaylistTracks = {
  items: [
    {
      track: {
        id: 'track_1',
        name: 'Rock Song 1',
        artists: [{ id: 'artist_1', name: 'Rock Artist', uri: 'spotify:artist:artist_1' }],
        album: {
          id: 'album_1',
          name: 'Rock Album',
          images: [{ url: 'https://example.com/rock-album.jpg' }],
        },
        popularity: 85,
        duration_ms: 220000,
        uri: 'spotify:track:track_1',
      },
    },
    {
      track: {
        id: 'track_2',
        name: 'Electronic Beat',
        artists: [{ id: 'artist_2', name: 'EDM Producer', uri: 'spotify:artist:artist_2' }],
        album: {
          id: 'album_2',
          name: 'Electronic EP',
          images: [{ url: 'https://example.com/edm-album.jpg' }],
        },
        popularity: 70,
        duration_ms: 180000,
        uri: 'spotify:track:track_2',
      },
    },
    {
      track: {
        id: 'track_3',
        name: 'Indie Tune',
        artists: [{ id: 'artist_3', name: 'Indie Band', uri: 'spotify:artist:artist_3' }],
        album: {
          id: 'album_3',
          name: 'Indie Collection',
          images: [{ url: 'https://example.com/indie-album.jpg' }],
        },
        popularity: 60,
        duration_ms: 195000,
        uri: 'spotify:track:track_3',
      },
    },
    {
      track: {
        id: 'track_4',
        name: 'Jazz Standard',
        artists: [{ id: 'artist_4', name: 'Jazz Quartet', uri: 'spotify:artist:artist_4' }],
        album: {
          id: 'album_4',
          name: 'Jazz Classics',
          images: [{ url: 'https://example.com/jazz-album.jpg' }],
        },
        popularity: 55,
        duration_ms: 240000,
        uri: 'spotify:track:track_4',
      },
    },
    {
      track: {
        id: 'track_5',
        name: 'Pop Hit',
        artists: [{ id: 'artist_5', name: 'Pop Star', uri: 'spotify:artist:artist_5' }],
        album: {
          id: 'album_5',
          name: 'Pop Album',
          images: [{ url: 'https://example.com/pop-album.jpg' }],
        },
        popularity: 95,
        duration_ms: 200000,
        uri: 'spotify:track:track_5',
      },
    },
  ],
  total: 5,
  limit: 50,
  offset: 0,
  next: null,
}

export const mockArtists = {
  artists: [
    {
      id: 'artist_1',
      name: 'Rock Artist',
      genres: ['rock', 'classic rock', 'hard rock'],
      popularity: 85,
      images: [],
    },
    {
      id: 'artist_2',
      name: 'EDM Producer',
      genres: ['electronic', 'house', 'techno'],
      popularity: 80,
      images: [],
    },
    {
      id: 'artist_3',
      name: 'Indie Band',
      genres: ['indie', 'indie rock', 'alternative'],
      popularity: 65,
      images: [],
    },
    {
      id: 'artist_4',
      name: 'Jazz Quartet',
      genres: ['jazz', 'bebop', 'swing'],
      popularity: 60,
      images: [],
    },
    {
      id: 'artist_5',
      name: 'Pop Star',
      genres: ['pop', 'dance pop'],
      popularity: 95,
      images: [],
    },
  ],
}

/**
 * Generate a mock track with customizable properties
 */
export function createMockTrack(overrides: Partial<typeof mockTrack> = {}) {
  return {
    ...mockTrack,
    ...overrides,
  }
}

/**
 * Generate multiple mock tracks for testing pagination
 */
export function createMockTracks(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    track: {
      id: `track_${i}`,
      name: `Test Track ${i}`,
      artists: [{ id: `artist_${i}`, name: `Artist ${i}`, uri: `spotify:artist:artist_${i}` }],
      album: {
        id: `album_${i}`,
        name: `Album ${i}`,
        images: [{ url: `https://example.com/album_${i}.jpg` }],
      },
      popularity: 50 + (i % 50),
      duration_ms: 180000 + i * 1000,
      uri: `spotify:track:track_${i}`,
    },
  }))
}
