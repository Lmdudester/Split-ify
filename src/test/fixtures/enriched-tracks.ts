/**
 * Mock data for enriched tracks (tracks with genre data from multiple sources)
 */

import { EnrichedTrack, LoadingState, UISettings, EnrichmentSettings } from '@/types/app'

export const mockEnrichedTrack: EnrichedTrack = {
  track: {
    id: 'track_1',
    name: 'Test Rock Song',
    artists: [
      {
        id: 'artist_1',
        name: 'Rock Band',
        uri: 'spotify:artist:artist_1',
      },
    ],
    album: {
      id: 'album_1',
      name: 'Rock Album',
      images: [
        {
          url: 'https://example.com/album.jpg',
          height: 640,
          width: 640,
        },
      ],
      release_date: '2024-01-01',
    },
    popularity: 85,
    duration_ms: 220000,
    uri: 'spotify:track:track_1',
    external_urls: {
      spotify: 'https://open.spotify.com/track/track_1',
    },
  },
  allGenres: ['rock', 'indie', 'alternative', 'indie rock'],
  genreSources: {
    lastfmTrack: ['rock', 'indie'],
    lastfmArtist: ['alternative rock'],
    spotifyArtist: ['indie rock', 'alternative'],
  },
  enrichmentStatus: 'complete',
  addedAt: '2024-01-01T00:00:00Z',
  originalPosition: 0,
}

export const mockEnrichedTrackPending: EnrichedTrack = {
  track: {
    id: 'track_2',
    name: 'Pending Track',
    artists: [{ id: 'artist_2', name: 'Artist 2', uri: 'spotify:artist:artist_2' }],
    album: {
      id: 'album_2',
      name: 'Album 2',
      images: [],
      release_date: '2024-01-01',
    },
    popularity: 50,
    duration_ms: 180000,
    uri: 'spotify:track:track_2',
    external_urls: { spotify: 'https://open.spotify.com/track/track_2' },
  },
  allGenres: [],
  genreSources: {
    lastfmTrack: [],
    lastfmArtist: [],
    spotifyArtist: [],
  },
  enrichmentStatus: 'pending',
  addedAt: '2024-01-01T00:00:00Z',
  originalPosition: 1,
}

export const mockEnrichedTrackEnriching: EnrichedTrack = {
  track: {
    id: 'track_3',
    name: 'Enriching Track',
    artists: [{ id: 'artist_3', name: 'Artist 3', uri: 'spotify:artist:artist_3' }],
    album: {
      id: 'album_3',
      name: 'Album 3',
      images: [],
      release_date: '2024-01-01',
    },
    popularity: 60,
    duration_ms: 200000,
    uri: 'spotify:track:track_3',
    external_urls: { spotify: 'https://open.spotify.com/track/track_3' },
  },
  allGenres: ['electronic'],
  genreSources: {
    lastfmTrack: [],
    lastfmArtist: [],
    spotifyArtist: ['electronic'],
  },
  enrichmentStatus: 'enriching',
  addedAt: '2024-01-01T00:00:00Z',
  originalPosition: 2,
}

export const mockEnrichedTracks: EnrichedTrack[] = [
  {
    ...mockEnrichedTrack,
    originalPosition: 0,
  },
  {
    track: {
      id: 'track_2',
      name: 'Electronic Song',
      artists: [{ id: 'artist_2', name: 'EDM Artist', uri: 'spotify:artist:artist_2' }],
      album: {
        id: 'album_2',
        name: 'Electronic EP',
        images: [{ url: 'https://example.com/edm.jpg', height: 640, width: 640 }],
        release_date: '2024-02-01',
      },
      popularity: 70,
      duration_ms: 180000,
      uri: 'spotify:track:track_2',
      external_urls: { spotify: 'https://open.spotify.com/track/track_2' },
    },
    allGenres: ['electronic', 'house', 'techno', 'dance'],
    genreSources: {
      lastfmTrack: ['electronic', 'house'],
      lastfmArtist: ['techno'],
      spotifyArtist: ['dance', 'electronic'],
    },
    enrichmentStatus: 'complete',
    addedAt: '2024-01-02T00:00:00Z',
    originalPosition: 1,
  },
  {
    track: {
      id: 'track_3',
      name: 'Jazz Standard',
      artists: [{ id: 'artist_3', name: 'Jazz Band', uri: 'spotify:artist:artist_3' }],
      album: {
        id: 'album_3',
        name: 'Jazz Classics',
        images: [],
        release_date: '2024-03-01',
      },
      popularity: 55,
      duration_ms: 240000,
      uri: 'spotify:track:track_3',
      external_urls: { spotify: 'https://open.spotify.com/track/track_3' },
    },
    allGenres: ['jazz', 'bebop', 'swing'],
    genreSources: {
      lastfmTrack: ['jazz', 'swing'],
      lastfmArtist: ['bebop'],
      spotifyArtist: ['jazz'],
    },
    enrichmentStatus: 'complete',
    addedAt: '2024-01-03T00:00:00Z',
    originalPosition: 2,
  },
]

export const mockLoadingStateIdle: LoadingState = {
  isLoading: false,
  stage: 'idle',
  message: '',
  spotifyTracks: { loaded: 0, total: 0 },
  lastfmTrackTags: { completed: 0, total: 0 },
  lastfmArtistTags: { completed: 0, total: 0 },
  spotifyArtistGenres: { completed: 0, total: 0 },
}

export const mockLoadingStateLoading: LoadingState = {
  isLoading: true,
  stage: 'loading',
  message: 'Loading playlist tracks...',
  spotifyTracks: { loaded: 25, total: 100 },
  lastfmTrackTags: { completed: 10, total: 100, averageTimeMs: 150 },
  lastfmArtistTags: { completed: 5, total: 50, averageTimeMs: 200 },
  spotifyArtistGenres: { completed: 15, total: 50, averageTimeMs: 100 },
}

export const mockLoadingStateComplete: LoadingState = {
  isLoading: false,
  stage: 'complete',
  message: 'Playlist loaded successfully',
  spotifyTracks: { loaded: 100, total: 100 },
  lastfmTrackTags: { completed: 100, total: 100, averageTimeMs: 150 },
  lastfmArtistTags: { completed: 50, total: 50, averageTimeMs: 200 },
  spotifyArtistGenres: { completed: 50, total: 50, averageTimeMs: 100 },
}

export const mockUISettingsDefault: UISettings = {
  showTrackNumbers: true,
  showPopularity: true,
}

export const mockUISettingsMinimal: UISettings = {
  showTrackNumbers: false,
  showPopularity: false,
}

export const mockEnrichmentSettingsDefault: EnrichmentSettings = {
  useLastfmTrackTags: true,
  useLastfmArtistTags: true,
}

export const mockEnrichmentSettingsSpotifyOnly: EnrichmentSettings = {
  useLastfmTrackTags: false,
  useLastfmArtistTags: false,
}

/**
 * Generate multiple enriched tracks for testing
 */
export function createMockEnrichedTracks(count: number): EnrichedTrack[] {
  const genres = [
    ['rock', 'indie', 'alternative'],
    ['electronic', 'house', 'techno'],
    ['jazz', 'bebop', 'swing'],
    ['pop', 'dance pop'],
    ['hip hop', 'rap', 'trap'],
  ]

  return Array.from({ length: count }, (_, i) => ({
    track: {
      id: `track_${i}`,
      name: `Test Track ${i}`,
      artists: [{ id: `artist_${i}`, name: `Artist ${i}`, uri: `spotify:artist:artist_${i}` }],
      album: {
        id: `album_${i}`,
        name: `Album ${i}`,
        images: [{ url: `https://example.com/album_${i}.jpg`, height: 640, width: 640 }],
        release_date: '2024-01-01',
      },
      popularity: 50 + (i % 50),
      duration_ms: 180000 + i * 1000,
      uri: `spotify:track:track_${i}`,
      external_urls: { spotify: `https://open.spotify.com/track/track_${i}` },
    },
    allGenres: genres[i % genres.length],
    genreSources: {
      lastfmTrack: genres[i % genres.length].slice(0, 1),
      lastfmArtist: genres[i % genres.length].slice(1, 2),
      spotifyArtist: genres[i % genres.length].slice(2),
    },
    enrichmentStatus: 'complete' as const,
    addedAt: `2024-01-0${(i % 9) + 1}T00:00:00Z`,
    originalPosition: i,
  }))
}
