import { useState, useRef } from 'react';
import { useAppStore } from '../stores/app-store';
import { getPlaylist, getPlaylistTracksStreaming } from '../services/playlist';
import { GenreEnrichmentQueue } from '../services/genreEnrichment';
import { EnrichedTrack } from '../types/app';

export function useEnrichedTracks() {
  const [error, setError] = useState<string | null>(null);
  const isCancelledRef = useRef(false);
  const enrichmentQueueRef = useRef<GenreEnrichmentQueue | null>(null);
  const {
    setTracks,
    addTracks,
    updateMultipleTrackGenres,
    setPlaylistInfo,
    setLoading,
    resetLoading,
    resetFilters,
    clearTracks,
  } = useAppStore();

  const cancelLoading = () => {
    isCancelledRef.current = true;

    // Cancel enrichment queue if it exists
    if (enrichmentQueueRef.current) {
      enrichmentQueueRef.current.cancel();
    }

    // Reset loading state
    setLoading({
      isLoading: false,
      stage: 'idle',
      message: 'Loading cancelled',
    });

    // Clear error
    setError(null);

    // Clear all playlist data (tracks, playlist info, filters)
    clearTracks();
  };

  const loadPlaylist = async (playlistInput: string) => {
    try {
      setError(null);
      isCancelledRef.current = false; // Reset cancellation flag
      resetLoading();
      resetFilters(); // Clear filters for new playlist
      setTracks([]); // Clear existing tracks
      setLoading({
        isLoading: true,
        stage: 'loading',
        message: 'Loading playlist...',
      });

      // Step 1: Fetch playlist metadata
      const playlist = await getPlaylist(playlistInput);
      setPlaylistInfo(playlist.id, playlist.name);

      // Check for cancellation
      if (isCancelledRef.current) return;

      // Step 2: Create genre enrichment queue with progress callbacks
      const enrichmentQueue = new GenreEnrichmentQueue({
        onLastfmTrackProgress: (completed, total, averageTimeMs) => {
          setLoading({
            lastfmTrackTags: { completed, total, averageTimeMs },
          });
        },
        onLastfmArtistProgress: (completed, total, averageTimeMs) => {
          setLoading({
            lastfmArtistTags: { completed, total, averageTimeMs },
          });
        },
        onSpotifyArtistProgress: (completed, total) => {
          setLoading({
            spotifyArtistGenres: { completed, total },
          });
        },
        onBatchUpdate: (updates) => {
          updateMultipleTrackGenres(updates);
        },
      });

      // Store enrichment queue in ref for cancellation
      enrichmentQueueRef.current = enrichmentQueue;

      // Step 3: Stream tracks and start enrichment immediately
      await getPlaylistTracksStreaming(playlist.id, (batch, loaded, total) => {
        // Check for cancellation before processing batch
        if (isCancelledRef.current) {
          return;
        }

        // Update Spotify tracks progress
        setLoading({
          spotifyTracks: { loaded, total },
          message: `Loading tracks (${loaded}/${total})...`,
        });

        // Convert batch to enriched tracks with pending status
        const enrichedBatch: EnrichedTrack[] = batch.map((item) => ({
          track: item.track,
          allGenres: [],
          genreSources: {
            lastfmTrack: [],
            lastfmArtist: [],
            spotifyArtist: [],
          },
          enrichmentStatus: 'pending',
          addedAt: item.added_at,
        }));

        // Add tracks to store
        addTracks(enrichedBatch);

        // Immediately enqueue for enrichment (all 3 sources)
        const spotifyTracks = batch.map((item) => item.track);
        enrichmentQueue.enqueueTracks(spotifyTracks);
      });

      // Check for cancellation after track streaming
      if (isCancelledRef.current) {
        enrichmentQueue.cancel();
        return;
      }

      // Update message once tracks are loaded
      setLoading({
        message: 'Enriching genres from multiple sources...',
      });

      // Check for cancellation before waiting
      if (isCancelledRef.current) {
        enrichmentQueue.cancel();
        return;
      }

      // Step 4: Wait for all enrichment to complete
      await enrichmentQueue.waitForCompletion();

      // Step 5: Complete
      setLoading({
        isLoading: false,
        stage: 'complete',
        message: 'Playlist loaded successfully',
      });
    } catch (err) {
      console.error('Failed to load playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
      setLoading({
        isLoading: false,
        stage: 'idle',
        message: '',
      });
    }
  };

  return {
    loadPlaylist,
    cancelLoading,
    error
  };
}
