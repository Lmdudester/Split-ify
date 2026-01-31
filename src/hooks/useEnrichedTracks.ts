import { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { getPlaylist, getPlaylistTracksStreaming } from '../services/playlist';
import { GenreEnrichmentQueue } from '../services/genreEnrichment';
import { EnrichedTrack } from '../types/app';

export function useEnrichedTracks() {
  const [error, setError] = useState<string | null>(null);
  const {
    setTracks,
    addTracks,
    updateMultipleTrackGenres,
    setPlaylistInfo,
    setLoading,
    resetLoading,
  } = useAppStore();

  const loadPlaylist = async (playlistInput: string) => {
    try {
      setError(null);
      resetLoading();
      setTracks([]); // Clear existing tracks
      setLoading({
        isLoading: true,
        stage: 'loading',
        message: 'Loading playlist...',
      });

      // Step 1: Fetch playlist metadata
      const playlist = await getPlaylist(playlistInput);
      setPlaylistInfo(playlist.id, playlist.name);

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

      // Step 3: Stream tracks and start enrichment immediately
      await getPlaylistTracksStreaming(playlist.id, (batch, loaded, total) => {
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

      // Update message once tracks are loaded
      setLoading({
        message: 'Enriching genres from multiple sources...',
      });

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
    error
  };
}
