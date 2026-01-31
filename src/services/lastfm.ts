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
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data: LastFmTopTagsResponse = await response.json();

    // Debug logging
    console.log(`Last.fm response for "${trackName}" by ${artistName}:`, data);

    // Handle case where tag might be a single object instead of array
    let tags = data.toptags?.tag || [];
    if (!Array.isArray(tags)) {
      tags = tags ? [tags] : [];
    }

    console.log(`  Raw tags (${tags.length}):`, tags);

    // Filter tags by relevance and normalize names
    const genres = tags
      .filter(tag => tag.count >= minRelevance)
      .map(tag => tag.name.toLowerCase())
      .slice(0, 5); // Limit to top 5 most relevant genres

    console.log(`  Filtered genres (min relevance ${minRelevance}):`, genres);

    return genres;
  } catch (error) {
    console.warn(`Failed to fetch Last.fm genres for "${trackName}" by ${artistName}:`, error);
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
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data: LastFmTopTagsResponse = await response.json();

    console.log(`Last.fm artist tags for ${artistName}:`, data);

    let tags = data.toptags?.tag || [];
    if (!Array.isArray(tags)) {
      tags = tags ? [tags] : [];
    }

    const genres = tags
      .filter(tag => tag.count >= minRelevance)
      .map(tag => tag.name.toLowerCase())
      .slice(0, 5);

    console.log(`  Filtered artist genres (min relevance ${minRelevance}):`, genres);

    return genres;
  } catch (error) {
    console.warn(`Failed to fetch Last.fm artist genres for ${artistName}:`, error);
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
