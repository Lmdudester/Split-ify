export const LASTFM_CONFIG = {
  apiKey: import.meta.env.VITE_LASTFM_API_KEY,
  baseUrl: 'https://ws.audioscrobbler.com/2.0/',
  endpoints: {
    trackGetTopTags: 'track.getTopTags',
    artistGetTopTags: 'artist.getTopTags'
  },
  rateLimits: {
    requestsPerSecond: 5, // Full speed (Last.fm allows 5/sec)
    minDelayMs: 200, // 5 requests/sec
    maxConcurrent: 5 // Allow 5 simultaneous requests for maximum speed
  }
};
