import { spotifyFetch, delay } from './spotify-api';
import { AudioFeatures } from '../types/spotify';
import { API_LIMITS } from '../config/spotify';

/**
 * Fetch audio features in batches and return a map of track ID to features
 */
export async function getAudioFeatures(
  trackIds: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, AudioFeatures>> {
  const featuresMap = new Map<string, AudioFeatures>();
  const batchSize = API_LIMITS.AUDIO_FEATURES_PER_REQUEST;

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batch = trackIds.slice(i, i + batchSize);
    const ids = batch.join(',');

    const response = await spotifyFetch<{ audio_features: (AudioFeatures | null)[] }>(
      `/audio-features?ids=${ids}`
    );

    response.audio_features.forEach(features => {
      if (features) {
        featuresMap.set(features.id, features);
      }
    });

    onProgress?.(Math.min(i + batchSize, trackIds.length), trackIds.length);

    if (i + batchSize < trackIds.length) {
      await delay(API_LIMITS.BATCH_DELAY_MS);
    }
  }

  return featuresMap;
}
