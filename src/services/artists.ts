import { spotifyFetch, delay } from './spotify-api';
import { SpotifyArtist } from '../types/spotify';
import { API_LIMITS } from '../config/spotify';

/**
 * Fetch artists in batches and return a map of artist ID to genres
 */
export async function getArtistsGenres(
  artistIds: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, string[]>> {
  const uniqueIds = [...new Set(artistIds)];
  const genreMap = new Map<string, string[]>();
  const batchSize = API_LIMITS.ARTISTS_PER_REQUEST;

  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    const ids = batch.join(',');

    const response = await spotifyFetch<{ artists: SpotifyArtist[] }>(
      `/artists?ids=${ids}`
    );

    response.artists.forEach(artist => {
      if (artist) {
        genreMap.set(artist.id, artist.genres);
      }
    });

    onProgress?.(Math.min(i + batchSize, uniqueIds.length), uniqueIds.length);

    if (i + batchSize < uniqueIds.length) {
      await delay(API_LIMITS.BATCH_DELAY_MS);
    }
  }

  return genreMap;
}
