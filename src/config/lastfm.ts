export const LASTFM_CONFIG = {
  apiKey: import.meta.env.VITE_LASTFM_API_KEY,
  baseUrl: 'https://ws.audioscrobbler.com/2.0/',
  endpoints: {
    trackGetTopTags: 'track.getTopTags',
    artistGetTopTags: 'artist.getTopTags'
  },
  rateLimits: {
    requestsPerSecond: 3, // Conservative rate (60% of Last.fm's 5/sec limit)
    minDelayMs: 334, // ~3 requests/sec
    maxConcurrent: 3 // Match concurrent limit to rate for consistent flow
  }
};
