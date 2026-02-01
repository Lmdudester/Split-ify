/**
 * Genre Enrichment Orchestrator
 *
 * Manages concurrent genre enrichment from multiple sources:
 * - Last.fm track tags
 * - Last.fm artist tags
 * - Spotify artist genres
 *
 * Accumulates ALL genres from all sources (no fallback logic)
 */

import { RateLimitedQueue } from '../utils/RateLimitedQueue';
import { getTrackGenres, getArtistGenres } from './lastfm';
import { getArtistsGenres } from './artists';
import { LASTFM_CONFIG } from '../config/lastfm';
import { SpotifyTrack } from '../types/spotify';
import { EnrichedTrack } from '../types/app';

export interface GenreEnrichmentCallbacks {
  onLastfmTrackProgress?: (completed: number, total: number, averageTimeMs?: number) => void;
  onLastfmArtistProgress?: (completed: number, total: number, averageTimeMs?: number) => void;
  onSpotifyArtistProgress?: (completed: number, total: number) => void;
  onTrackUpdate?: (trackId: string, update: Partial<EnrichedTrack>) => void;
  onBatchUpdate?: (updates: Map<string, Partial<EnrichedTrack>>) => void;
}

interface TrackGenreData {
  trackId: string;
  trackName: string;
  artistName: string;
  artistIds: string[];
}

export interface EnrichmentOptions {
  useLastfmTrackTags?: boolean;
  useLastfmArtistTags?: boolean;
}

/**
 * Common non-genre tags to filter out
 */
const NON_GENRE_TAGS = new Set([
  'seen live',
  'favorites',
  'favourite',
  'favorite',
  'love',
  'loved',
  'beautiful',
  'awesome',
  'chill',
  'relax',
  'party',
  'workout',
  'study',
  'sleep',
  'energetic',
  'sad',
  'happy',
  'angry',
  'calm',
]);

/**
 * Check if a string is a specific year (not a decade)
 * Specific years: 2014, 2015, etc.
 * Decades (keep): 2010, 2010s, 70s, 80s, etc.
 */
function isSpecificYear(str: string): boolean {
  // Match 4-digit years
  const yearMatch = str.match(/^(\d{4})$/);
  if (!yearMatch) {
    return false;
  }

  const year = parseInt(yearMatch[1], 10);

  // If it's between 1950-2030 and NOT a decade (ends in 0), it's a specific year
  if (year >= 1950 && year <= 2030) {
    // Decades end in 0 (1970, 1980, 2010, etc.) - keep these
    if (year % 10 === 0) {
      return false; // It's a decade, not a specific year
    }
    return true; // It's a specific year like 2014
  }

  return false;
}

/**
 * Normalize and filter genre strings
 */
function normalizeGenre(genre: string, artistName?: string): string | null {
  const normalized = genre.toLowerCase().trim();

  // Filter out non-genre tags
  if (NON_GENRE_TAGS.has(normalized)) {
    return null;
  }

  // Filter out very short tags (likely not genres)
  if (normalized.length < 3) {
    return null;
  }

  // Filter out artist name if provided
  if (artistName && normalized === artistName.toLowerCase().trim()) {
    return null;
  }

  // Filter out specific years (but keep decades like "2010", "70s", "2010s")
  if (isSpecificYear(normalized)) {
    return null;
  }

  // Also check for decade formats like "70s", "80s", "2010s" - these are OK
  // (already handled by not being caught by isSpecificYear)

  return normalized;
}

/**
 * Merge and deduplicate genres from multiple sources
 */
function mergeGenres(
  lastfmTrack: string[],
  lastfmArtist: string[],
  spotifyArtist: string[],
  artistName?: string
): { allGenres: string[]; genreSources: EnrichedTrack['genreSources'] } {
  // Normalize all genres (filter out artist name and specific years)
  const normalizedLastfmTrack = lastfmTrack
    .map(g => normalizeGenre(g, artistName))
    .filter((g): g is string => g !== null);

  const normalizedLastfmArtist = lastfmArtist
    .map(g => normalizeGenre(g, artistName))
    .filter((g): g is string => g !== null);

  const normalizedSpotifyArtist = spotifyArtist
    .map(g => normalizeGenre(g, artistName))
    .filter((g): g is string => g !== null);

  // Combine all genres and deduplicate
  const allGenresSet = new Set([
    ...normalizedLastfmTrack,
    ...normalizedLastfmArtist,
    ...normalizedSpotifyArtist,
  ]);

  return {
    allGenres: Array.from(allGenresSet),
    genreSources: {
      lastfmTrack: normalizedLastfmTrack,
      lastfmArtist: normalizedLastfmArtist,
      spotifyArtist: normalizedSpotifyArtist,
    },
  };
}

export class GenreEnrichmentQueue {
  private lastfmQueue: RateLimitedQueue<string[]>;
  private callbacks: GenreEnrichmentCallbacks;
  private options: EnrichmentOptions;

  // Track genre data storage
  private trackGenres = new Map<string, string[]>();
  private artistGenres = new Map<string, string[]>();
  private spotifyGenres = new Map<string, string[]>();

  // Track metadata
  private trackData = new Map<string, TrackGenreData>();

  // Artist deduplication
  private artistsQueued = new Set<string>();

  // Progress tracking
  private trackTagsCompleted = 0;
  private trackTagsTotal = 0;
  private artistTagsCompleted = 0;
  private artistTagsTotal = 0;

  // Spotify artist batching
  private spotifyArtistIds = new Set<string>();
  private spotifyBatchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly SPOTIFY_BATCH_DELAY_MS = 1000;

  // Cancellation flag for graceful shutdown
  private isCancelled = false;

  constructor(callbacks: GenreEnrichmentCallbacks = {}, options: EnrichmentOptions = {}) {
    this.callbacks = callbacks;
    this.options = {
      useLastfmTrackTags: options.useLastfmTrackTags ?? true,
      useLastfmArtistTags: options.useLastfmArtistTags ?? true,
    };

    // Create rate-limited queue for Last.fm
    this.lastfmQueue = new RateLimitedQueue({
      requestsPerSecond: LASTFM_CONFIG.rateLimits.requestsPerSecond,
      maxConcurrent: LASTFM_CONFIG.rateLimits.maxConcurrent,
      minDelayMs: LASTFM_CONFIG.rateLimits.minDelayMs,
    });

    // Progress tracking is handled in individual enqueue methods
  }

  /**
   * Enqueue tracks for enrichment from all 3 sources
   */
  async enqueueTracks(tracks: SpotifyTrack[]): Promise<void> {
    const updates = new Map<string, Partial<EnrichedTrack>>();

    for (const track of tracks) {
      const trackId = track.id;
      const trackName = track.name;
      const artistName = track.artists[0]?.name || 'Unknown Artist';
      const artistIds = track.artists.map(a => a.id);

      // Skip tracks with invalid data
      if (!trackId || !trackName || trackName.trim() === '') {
        console.warn(`Skipping track with invalid data:`, track);
        continue;
      }

      // Store track data
      this.trackData.set(trackId, {
        trackId,
        trackName,
        artistName,
        artistIds,
      });

      // Mark as enriching
      updates.set(trackId, {
        enrichmentStatus: 'enriching',
      });

      // 1. Enqueue Last.fm track tags (only if enabled and valid track name and artist)
      if (this.options.useLastfmTrackTags && trackName && trackName.trim() !== '' && artistName && artistName !== 'Unknown Artist') {
        this.enqueueLastfmTrack(trackId, trackName, artistName);
      }

      // 2. Enqueue Last.fm artist tags (only if enabled, deduplicated, and valid artist)
      if (this.options.useLastfmArtistTags && artistName && artistName !== 'Unknown Artist') {
        this.enqueueLastfmArtist(trackId, artistName);
      }

      // 3. Collect Spotify artist IDs for batching
      artistIds.forEach(id => {
        if (id) {
          this.spotifyArtistIds.add(id);
        }
      });
    }

    // Trigger batch update
    if (updates.size > 0 && this.callbacks.onBatchUpdate) {
      this.callbacks.onBatchUpdate(updates);
    }

    // Schedule Spotify batch fetch
    this.scheduleSpotifyBatch();
  }

  /**
   * Enqueue Last.fm track tag request
   */
  private enqueueLastfmTrack(
    trackId: string,
    trackName: string,
    artistName: string
  ): void {
    const key = `track::${trackName}::${artistName}`;

    // Increment total
    this.trackTagsTotal++;

    this.lastfmQueue.enqueue(key, async () => {
      const genres = await getTrackGenres(trackName, artistName);
      this.trackGenres.set(trackId, genres);

      // Update progress
      this.trackTagsCompleted++;
      if (this.callbacks.onLastfmTrackProgress) {
        const averageTimeMs = this.lastfmQueue.getAverageRequestTime() ?? undefined;
        this.callbacks.onLastfmTrackProgress(
          this.trackTagsCompleted,
          this.trackTagsTotal,
          averageTimeMs
        );
      }

      // Merge and update track
      this.mergeAndUpdateTrack(trackId);

      return genres;
    });
  }

  /**
   * Enqueue Last.fm artist tag request (deduplicated)
   */
  private enqueueLastfmArtist(_trackId: string, artistName: string): void {
    const key = `artist::${artistName}`;

    // Skip if already queued
    if (this.artistsQueued.has(key)) {
      return;
    }

    this.artistsQueued.add(key);
    this.artistTagsTotal++;

    this.lastfmQueue.enqueue(key, async () => {
      const genres = await getArtistGenres(artistName);
      this.artistGenres.set(artistName, genres);

      // Update progress
      this.artistTagsCompleted++;
      if (this.callbacks.onLastfmArtistProgress) {
        const averageTimeMs = this.lastfmQueue.getAverageRequestTime() ?? undefined;
        this.callbacks.onLastfmArtistProgress(
          this.artistTagsCompleted,
          this.artistTagsTotal,
          averageTimeMs
        );
      }

      // Update all tracks by this artist
      this.updateTracksForArtist(artistName);

      return genres;
    });
  }

  /**
   * Schedule Spotify artist batch fetch
   */
  private scheduleSpotifyBatch(): void {
    // Clear existing timer
    if (this.spotifyBatchTimer) {
      clearTimeout(this.spotifyBatchTimer);
    }

    // Schedule batch fetch
    this.spotifyBatchTimer = setTimeout(() => {
      this.fetchSpotifyBatch();
    }, this.SPOTIFY_BATCH_DELAY_MS);
  }

  /**
   * Fetch Spotify artist genres in batches
   */
  private async fetchSpotifyBatch(): Promise<void> {
    const artistIds = Array.from(this.spotifyArtistIds);

    if (artistIds.length === 0) {
      return;
    }

    // Clear the set
    this.spotifyArtistIds.clear();

    // Fetch in batches of 50
    const genreMap = await getArtistsGenres(
      artistIds,
      (completed, total) => {
        if (this.callbacks.onSpotifyArtistProgress) {
          this.callbacks.onSpotifyArtistProgress(completed, total);
        }
      }
    );

    // Store genres
    genreMap.forEach((genres, artistId) => {
      this.spotifyGenres.set(artistId, genres);
    });

    // Update all tracks with these artists
    this.updateTracksForSpotifyArtists(artistIds);
  }

  /**
   * Update all tracks for a specific artist (Last.fm)
   */
  private updateTracksForArtist(artistName: string): void {
    const updates = new Map<string, Partial<EnrichedTrack>>();

    this.trackData.forEach((data) => {
      if (data.artistName === artistName) {
        const merged = this.mergeTrackGenres(data.trackId);
        if (merged) {
          updates.set(data.trackId, merged);
        }
      }
    });

    if (updates.size > 0 && this.callbacks.onBatchUpdate) {
      this.callbacks.onBatchUpdate(updates);
    }
  }

  /**
   * Update all tracks for Spotify artists
   */
  private updateTracksForSpotifyArtists(artistIds: string[]): void {
    const updates = new Map<string, Partial<EnrichedTrack>>();
    const artistIdSet = new Set(artistIds);

    this.trackData.forEach((data) => {
      const hasMatchingArtist = data.artistIds.some(id => artistIdSet.has(id));
      if (hasMatchingArtist) {
        const merged = this.mergeTrackGenres(data.trackId);
        if (merged) {
          updates.set(data.trackId, merged);
        }
      }
    });

    if (updates.size > 0 && this.callbacks.onBatchUpdate) {
      this.callbacks.onBatchUpdate(updates);
    }
  }

  /**
   * Merge and update a single track
   */
  private mergeAndUpdateTrack(trackId: string): void {
    const merged = this.mergeTrackGenres(trackId);

    if (merged && this.callbacks.onTrackUpdate) {
      this.callbacks.onTrackUpdate(trackId, merged);
    }
  }

  /**
   * Merge genres for a track from all available sources
   */
  private mergeTrackGenres(trackId: string): Partial<EnrichedTrack> | null {
    const data = this.trackData.get(trackId);
    if (!data) {
      return null;
    }

    // Get genres from all sources
    const lastfmTrack = this.trackGenres.get(trackId) || [];
    const lastfmArtist = this.artistGenres.get(data.artistName) || [];

    // Get Spotify genres from all artists
    const spotifyArtist = data.artistIds
      .flatMap(id => this.spotifyGenres.get(id) || []);

    // Merge all genres (filter out artist name and specific years)
    const merged = mergeGenres(lastfmTrack, lastfmArtist, spotifyArtist, data.artistName);

    // Determine if enrichment is complete
    // Only wait for enabled sources
    const hasLastfmTrack = !this.options.useLastfmTrackTags || this.trackGenres.has(trackId);
    const hasLastfmArtist = !this.options.useLastfmArtistTags || this.artistGenres.has(data.artistName);
    const hasSpotifyArtist = data.artistIds.every(id => this.spotifyGenres.has(id));

    const enrichmentStatus: EnrichedTrack['enrichmentStatus'] =
      hasLastfmTrack && hasLastfmArtist && hasSpotifyArtist
        ? 'complete'
        : 'enriching';

    return {
      allGenres: merged.allGenres,
      genreSources: merged.genreSources,
      enrichmentStatus,
    };
  }

  /**
   * Wait for all enrichment to complete
   */
  async waitForCompletion(): Promise<void> {
    // Check cancellation flag
    if (this.isCancelled) {
      return;
    }

    // Wait for Last.fm queue
    await this.lastfmQueue.waitForCompletion();

    // Check cancellation again before Spotify batch
    if (this.isCancelled) {
      return;
    }

    // Wait for any pending Spotify batches
    if (this.spotifyBatchTimer) {
      clearTimeout(this.spotifyBatchTimer);
      await this.fetchSpotifyBatch();
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.isCancelled = false; // Reset flag for next load
    this.lastfmQueue.clear();
    this.trackGenres.clear();
    this.artistGenres.clear();
    this.spotifyGenres.clear();
    this.trackData.clear();
    this.artistsQueued.clear();
    this.spotifyArtistIds.clear();

    // Reset progress counters
    this.trackTagsCompleted = 0;
    this.trackTagsTotal = 0;
    this.artistTagsCompleted = 0;
    this.artistTagsTotal = 0;

    if (this.spotifyBatchTimer) {
      clearTimeout(this.spotifyBatchTimer);
      this.spotifyBatchTimer = null;
    }
  }

  /**
   * Cancel enrichment (graceful - lets in-flight requests complete)
   */
  cancel(): void {
    this.isCancelled = true;
    this.lastfmQueue.clear();

    // Clear Spotify batch timer
    if (this.spotifyBatchTimer) {
      clearTimeout(this.spotifyBatchTimer);
      this.spotifyBatchTimer = null;
    }

    // Clear pending Spotify artist IDs
    this.spotifyArtistIds.clear();
  }
}
