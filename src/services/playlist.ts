import { spotifyFetch, delay } from './spotify-api';
import { PlaylistResponse, PlaylistTrack, UserPlaylistItem } from '../types/spotify';
import { API_LIMITS } from '../config/spotify';

/**
 * Extract playlist ID from URL or return as-is if already an ID
 */
export function extractPlaylistId(input: string): string {
  const urlPattern = /playlist\/([a-zA-Z0-9]+)/;
  const match = input.match(urlPattern);
  return match ? match[1] : input;
}

/**
 * Fetch all tracks from a playlist (handles pagination)
 */
export async function getPlaylistTracks(
  playlistId: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<PlaylistTrack[]> {
  const id = extractPlaylistId(playlistId);
  const allTracks: PlaylistTrack[] = [];

  let url: string | null = `/playlists/${id}/tracks?limit=${API_LIMITS.TRACKS_PER_REQUEST}`;
  let total = 0;

  while (url) {
    const response: {
      items: PlaylistTrack[];
      next: string | null;
      total: number;
    } = await spotifyFetch<{
      items: PlaylistTrack[];
      next: string | null;
      total: number;
    }>(url);

    if (total === 0) {
      total = response.total;
    }

    allTracks.push(...response.items.filter((item: PlaylistTrack) => item.track !== null));
    onProgress?.(allTracks.length, total);

    url = response.next;
    if (url) {
      await delay(API_LIMITS.BATCH_DELAY_MS);
    }
  }

  return allTracks;
}

/**
 * Fetch playlist tracks with streaming (calls onBatch for each page)
 * Enables enrichment to start before all tracks are loaded
 */
export async function getPlaylistTracksStreaming(
  playlistId: string,
  onBatch: (tracks: PlaylistTrack[], loaded: number, total: number) => void
): Promise<PlaylistTrack[]> {
  const id = extractPlaylistId(playlistId);
  const allTracks: PlaylistTrack[] = [];

  let url: string | null = `/playlists/${id}/tracks?limit=${API_LIMITS.TRACKS_PER_REQUEST}`;
  let total = 0;

  while (url) {
    const response: {
      items: PlaylistTrack[];
      next: string | null;
      total: number;
    } = await spotifyFetch<{
      items: PlaylistTrack[];
      next: string | null;
      total: number;
    }>(url);

    if (total === 0) {
      total = response.total;
    }

    const validTracks = response.items.filter((item: PlaylistTrack) => item.track !== null);
    allTracks.push(...validTracks);

    // Call batch callback immediately with this batch
    onBatch(validTracks, allTracks.length, total);

    url = response.next;
    if (url) {
      await delay(API_LIMITS.BATCH_DELAY_MS);
    }
  }

  return allTracks;
}

/**
 * Get playlist metadata
 */
export async function getPlaylist(playlistId: string): Promise<PlaylistResponse> {
  const id = extractPlaylistId(playlistId);
  return spotifyFetch<PlaylistResponse>(`/playlists/${id}`);
}

/**
 * Create a new playlist
 */
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
  isPublic = true
): Promise<{ id: string; external_urls: { spotify: string } }> {
  return spotifyFetch<{ id: string; external_urls: { spotify: string } }>(
    `/users/${userId}/playlists`,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: isPublic
      })
    }
  );
}

/**
 * Add tracks to a playlist (handles batching)
 */
export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const batchSize = 100;

  for (let i = 0; i < trackUris.length; i += batchSize) {
    const batch = trackUris.slice(i, i + batchSize);

    await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        uris: batch
      })
    });

    if (i + batchSize < trackUris.length) {
      await delay(API_LIMITS.BATCH_DELAY_MS);
    }
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<{ id: string; display_name: string }> {
  return spotifyFetch<{ id: string; display_name: string }>('/me');
}

/**
 * Fetch all user playlists (handles pagination automatically)
 */
export async function getAllUserPlaylists(): Promise<UserPlaylistItem[]> {
  const allPlaylists: UserPlaylistItem[] = [];
  let url: string | null = `/me/playlists?limit=${API_LIMITS.TRACKS_PER_REQUEST}`;

  while (url) {
    const response: {
      items: UserPlaylistItem[];
      next: string | null;
    } = await spotifyFetch<{
      items: UserPlaylistItem[];
      next: string | null;
    }>(url);

    allPlaylists.push(...response.items);
    url = response.next;

    if (url) {
      await delay(API_LIMITS.BATCH_DELAY_MS);
    }
  }

  return allPlaylists;
}
