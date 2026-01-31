export const LASTFM_CONFIG = {
  apiKey: import.meta.env.VITE_LASTFM_API_KEY,
  baseUrl: 'https://ws.audioscrobbler.com/2.0/',
  endpoints: {
    trackGetTopTags: 'track.getTopTags',
    artistGetTopTags: 'artist.getTopTags'
  },
  rateLimits: {
    requestsPerSecond: 4, // Conservative limit (< 5/sec)
    minDelayMs: 250 // 4 requests/sec
  }
};
