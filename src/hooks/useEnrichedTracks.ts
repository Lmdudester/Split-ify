import { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { getPlaylist, getPlaylistTracks } from '../services/playlist';
import { getArtistsGenres } from '../services/artists';
import { EnrichedTrack } from '../types/app';

export function useEnrichedTracks() {
  const [error, setError] = useState<string | null>(null);
  const { setTracks, setPlaylistInfo, setLoading, resetLoading } = useAppStore();

  const loadPlaylist = async (playlistInput: string) => {
    try {
      setError(null);
      resetLoading();
      setLoading({ isLoading: true, stage: 'tracks', message: 'Loading playlist...', progress: 0 });

      // Fetch playlist metadata
      const playlist = await getPlaylist(playlistInput);
      setPlaylistInfo(playlist.id, playlist.name);

      // Fetch all tracks with pagination
      const playlistTracks = await getPlaylistTracks(playlist.id, (loaded, total) => {
        setLoading({
          progress: (loaded / total) * 50,
          message: `Loading tracks (${loaded}/${total})...`
        });
      });

      if (playlistTracks.length === 0) {
        setLoading({ isLoading: false, stage: 'complete', message: 'Playlist is empty' });
        setTracks([]);
        return;
      }

      // Extract unique artist IDs
      setLoading({ stage: 'artists', message: 'Loading artist genres...', progress: 50 });
      const artistIds = playlistTracks.flatMap(item =>
        item.track.artists.map(artist => artist.id)
      );

      // Fetch artist genres
      const artistGenresMap = await getArtistsGenres(artistIds, (loaded, total) => {
        setLoading({
          progress: 50 + (loaded / total) * 50,
          message: `Loading genres (${loaded}/${total} artists)...`
        });
      });

      // Enrich tracks with genres
      const enrichedTracks: EnrichedTrack[] = playlistTracks.map(item => {
        const allGenres = item.track.artists
          .flatMap(artist => artistGenresMap.get(artist.id) || [])
          .filter((genre, index, self) => self.indexOf(genre) === index);

        return {
          track: item.track,
          allGenres,
          addedAt: item.added_at
        };
      });

      setTracks(enrichedTracks);
      setLoading({
        isLoading: false,
        stage: 'complete',
        message: `Loaded ${enrichedTracks.length} tracks`,
        progress: 100
      });
    } catch (err) {
      console.error('Failed to load playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
      setLoading({ isLoading: false, stage: 'idle', message: '', progress: 0 });
    }
  };

  return {
    loadPlaylist,
    error
  };
}
