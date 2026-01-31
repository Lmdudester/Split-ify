import { LASTFM_CONFIG } from '../config/lastfm';

export interface LastFmTag {
  name: string;
  count: number;
}

export interface LastFmTopTagsResponse {
  toptags: {
    tag: LastFmTag[];
  };
}

/**
 * Retry a fetch request with exponential backoff for rate limit errors
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Don't set custom User-Agent to avoid CORS preflight issues
      // Browser will send its default User-Agent header automatically
      const response = await fetch(url);

      // Check for rate limit or server errors
      if (response.status === 429 || response.status === 502 || response.status === 503) {
        // Calculate backoff delay: 2s, 4s, 8s (longer delays for server errors)
        const delayMs = Math.min(2000 * Math.pow(2, attempt), 16000);

        if (attempt < maxRetries) {
          const errorType = response.status === 429 ? 'Rate limit' : 'Server error';
          console.warn(`Last.fm ${errorType} (${response.status}) for ${url.split('?')[0]}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        } else {
          console.warn(`Last.fm ${response.status} - Max retries exceeded, returning empty result`);
        }
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delayMs = Math.min(2000 * Math.pow(2, attempt), 16000);
        console.warn(`Last.fm network error, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.warn(`Last.fm network error - Max retries exceeded, returning empty result`);
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

/**
 * Fetches top genre tags for a track from Last.fm
 * @param trackName - Track name
 * @param artistName - Artist name
 * @param minRelevance - Minimum tag relevance score (0-100)
 * @returns Array of genre strings
 */
export async function getTrackGenres(
  trackName: string,
  artistName: string,
  minRelevance: number = 30
): Promise<string[]> {
  const params = new URLSearchParams({
    method: LASTFM_CONFIG.endpoints.trackGetTopTags,
    artist: artistName,
    track: trackName,
    api_key: LASTFM_CONFIG.apiKey,
    format: 'json',
    autocorrect: '1' // Auto-correct misspellings
  });

  const url = `${LASTFM_CONFIG.baseUrl}?${params}`;

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data: LastFmTopTagsResponse = await response.json();

    // Handle case where tag might be a single object instead of array
    let tags = data.toptags?.tag || [];
    if (!Array.isArray(tags)) {
      tags = tags ? [tags] : [];
    }

    // Filter tags by relevance and normalize names
    const genres = tags
      .filter(tag => tag.count >= minRelevance)
      .map(tag => tag.name.toLowerCase())
      .slice(0, 5); // Limit to top 5 most relevant genres

    return genres;
  } catch (error) {
    // Silent fail - app continues with empty genres (Last.fm issues are common)
    if (error instanceof Error && !error.message.includes('502')) {
      console.warn(`Last.fm track lookup failed for "${trackName}" by ${artistName} (continuing with empty genres)`);
    }
    return [];
  }
}

/**
 * Fetches top genre tags for an artist from Last.fm
 * @param artistName - Artist name
 * @param minRelevance - Minimum tag relevance score (0-100)
 * @returns Array of genre strings
 */
export async function getArtistGenres(
  artistName: string,
  minRelevance: number = 30
): Promise<string[]> {
  const params = new URLSearchParams({
    method: LASTFM_CONFIG.endpoints.artistGetTopTags,
    artist: artistName,
    api_key: LASTFM_CONFIG.apiKey,
    format: 'json',
    autocorrect: '1'
  });

  const url = `${LASTFM_CONFIG.baseUrl}?${params}`;

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data: LastFmTopTagsResponse = await response.json();

    let tags = data.toptags?.tag || [];
    if (!Array.isArray(tags)) {
      tags = tags ? [tags] : [];
    }

    const genres = tags
      .filter(tag => tag.count >= minRelevance)
      .map(tag => tag.name.toLowerCase())
      .slice(0, 5);

    return genres;
  } catch (error) {
    // Silent fail - app continues with empty genres (Last.fm issues are common)
    if (error instanceof Error && !error.message.includes('502')) {
      console.warn(`Last.fm artist lookup failed for ${artistName} (continuing with empty genres)`);
    }
    return [];
  }
}

/**
 * Fetches genres for multiple tracks with rate limiting
 * @param tracks - Array of { trackName, artistName } objects
 * @param onProgress - Progress callback
 * @returns Map of "trackName::artistName" to genres array
 */
export async function getTracksGenresBatch(
  tracks: Array<{ trackName: string; artistName: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string[]>> {
  const genresMap = new Map<string, string[]>();
  const delay = LASTFM_CONFIG.rateLimits.minDelayMs;

  for (let i = 0; i < tracks.length; i++) {
    const { trackName, artistName } = tracks[i];
    const key = `${trackName}::${artistName}`;

    const genres = await getTrackGenres(trackName, artistName);
    genresMap.set(key, genres);

    onProgress?.(i + 1, tracks.length);

    // Rate limiting delay (except for last request)
    if (i < tracks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return genresMap;
}
