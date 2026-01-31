import { SPOTIFY_CONFIG } from '../config/spotify';
import { getAccessToken } from './auth';

export class SpotifyAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SpotifyAPIError';
  }
}

/**
 * Make an authenticated request to the Spotify API with retry logic
 */
export async function spotifyFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new SpotifyAPIError('No access token available');
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${SPOTIFY_CONFIG.apiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  // Handle rate limiting with exponential backoff
  if (response.status === 429 && retries > 0) {
    const retryAfter = response.headers.get('Retry-After');
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, 4 - retries) * 1000;

    await new Promise(resolve => setTimeout(resolve, delay));
    return spotifyFetch<T>(endpoint, options, retries - 1);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new SpotifyAPIError(
      error.error?.message || `Request failed with status ${response.status}`,
      response.status,
      error
    );
  }

  return response.json();
}

/**
 * Delay utility for batch requests
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
