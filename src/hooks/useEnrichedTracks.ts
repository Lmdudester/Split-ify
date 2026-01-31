import { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { getPlaylist, getPlaylistTracks } from '../services/playlist';
import { getTracksGenresBatch, getArtistGenres } from '../services/lastfm';
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

      // Step 1: Fetch playlist metadata and tracks
      const playlist = await getPlaylist(playlistInput);
      setPlaylistInfo(playlist.id, playlist.name);

      const playlistTracks = await getPlaylistTracks(playlist.id, (loaded, total) => {
        setLoading({
          progress: (loaded / total) * 30,  // 0-30%
          message: `Loading tracks (${loaded}/${total})...`
        });
      });

      if (playlistTracks.length === 0) {
        setLoading({ isLoading: false, stage: 'complete', message: 'Playlist is empty' });
        setTracks([]);
        return;
      }

      // Step 2: Try Last.fm track tags for ALL tracks
      setLoading({
        stage: 'genres',
        progress: 30,
        message: 'Fetching track-level genres...'
      });

      const tracksForLastFm = playlistTracks.map(item => ({
        trackName: item.track.name,
        artistName: item.track.artists[0]?.name || 'Unknown',
        artistId: item.track.artists[0]?.id || ''
      }));

      const lastfmTrackGenresMap = await getTracksGenresBatch(
        tracksForLastFm,
        (current, total) => {
          setLoading({
            progress: 30 + (current / total) * 30,  // 30-60%
            message: `Fetching track genres (${current}/${total})...`
          });
        }
      );

      // Step 3: Identify tracks with no Last.fm track tags
      const tracksNeedingArtistTags = new Map<string, string>();  // artistName → artistId
      tracksForLastFm.forEach(({ trackName, artistName, artistId }) => {
        const key = `${trackName}::${artistName}`;
        const genres = lastfmTrackGenresMap.get(key) || [];
        if (genres.length === 0) {
          tracksNeedingArtistTags.set(artistName, artistId);
        }
      });

      console.log(`Tracks without Last.fm track tags: ${tracksNeedingArtistTags.size} unique artists`);

      // Step 4: Fetch Last.fm artist tags for artists with missing track tags
      const lastfmArtistGenresMap = new Map<string, string[]>();
      if (tracksNeedingArtistTags.size > 0) {
        setLoading({
          progress: 60,
          message: `Fetching artist-level genres for ${tracksNeedingArtistTags.size} artists...`
        });

        const artistNames = Array.from(tracksNeedingArtistTags.keys());
        let processedCount = 0;

        for (const artistName of artistNames) {
          const genres = await getArtistGenres(artistName);
          lastfmArtistGenresMap.set(artistName, genres);
          processedCount++;

          setLoading({
            progress: 60 + (processedCount / artistNames.length) * 20,  // 60-80%
            message: `Fetching artist genres (${processedCount}/${artistNames.length})...`
          });

          // Rate limiting
          if (processedCount < artistNames.length) {
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        }
      }

      // Step 5: Identify tracks STILL needing genres (Last.fm artist tags were empty)
      const artistIdsNeedingSpotify = new Set<string>();
      tracksForLastFm.forEach(({ trackName, artistName, artistId }) => {
        const trackKey = `${trackName}::${artistName}`;
        const trackGenres = lastfmTrackGenresMap.get(trackKey) || [];
        const artistGenres = lastfmArtistGenresMap.get(artistName) || [];

        if (trackGenres.length === 0 && artistGenres.length === 0 && artistId) {
          artistIdsNeedingSpotify.add(artistId);
        }
      });

      console.log(`Artists still needing genres (Spotify fallback): ${artistIdsNeedingSpotify.size}`);

      // Step 6: Fetch Spotify artist genres as final fallback
      const spotifyArtistGenresMap = new Map<string, string[]>();
      if (artistIdsNeedingSpotify.size > 0) {
        setLoading({
          progress: 80,
          message: `Fetching Spotify genres for ${artistIdsNeedingSpotify.size} artists...`
        });

        const artistIdsArray = Array.from(artistIdsNeedingSpotify);
        const spotifyGenres = await getArtistsGenres(artistIdsArray, (loaded, total) => {
          setLoading({
            progress: 80 + (loaded / total) * 15,  // 80-95%
            message: `Fetching Spotify genres (${loaded}/${total})...`
          });
        });

        // Copy to map
        spotifyGenres.forEach((genres, artistId) => {
          spotifyArtistGenresMap.set(artistId, genres);
        });
      }

      // Step 7: Build enriched tracks with hybrid genres
      const enrichedTracks: EnrichedTrack[] = playlistTracks.map(item => {
        const trackName = item.track.name;
        const artistName = item.track.artists[0]?.name || 'Unknown';
        const artistId = item.track.artists[0]?.id || '';
        const trackKey = `${trackName}::${artistName}`;

        // Fallback chain: Last.fm track → Last.fm artist → Spotify artist
        let genres: string[] = [];

        genres = lastfmTrackGenresMap.get(trackKey) || [];
        if (genres.length === 0) {
          genres = lastfmArtistGenresMap.get(artistName) || [];
        }
        if (genres.length === 0) {
          genres = spotifyArtistGenresMap.get(artistId) || [];
        }

        return {
          track: item.track,
          allGenres: genres,
          addedAt: item.added_at
        };
      });

      // Calculate coverage statistics for logging
      const trackTagCount = enrichedTracks.filter(t => {
        const key = `${t.track.name}::${t.track.artists[0]?.name || 'Unknown'}`;
        return (lastfmTrackGenresMap.get(key) || []).length > 0;
      }).length;

      const artistTagCount = enrichedTracks.filter(t => {
        const key = `${t.track.name}::${t.track.artists[0]?.name || 'Unknown'}`;
        const trackGenres = lastfmTrackGenresMap.get(key) || [];
        const artistGenres = lastfmArtistGenresMap.get(t.track.artists[0]?.name || 'Unknown') || [];
        return trackGenres.length === 0 && artistGenres.length > 0;
      }).length;

      const spotifyGenreCount = enrichedTracks.filter(t => {
        const key = `${t.track.name}::${t.track.artists[0]?.name || 'Unknown'}`;
        const trackGenres = lastfmTrackGenresMap.get(key) || [];
        const artistGenres = lastfmArtistGenresMap.get(t.track.artists[0]?.name || 'Unknown') || [];
        const spotifyGenres = spotifyArtistGenresMap.get(t.track.artists[0]?.id || '') || [];
        return trackGenres.length === 0 && artistGenres.length === 0 && spotifyGenres.length > 0;
      }).length;

      console.log(`Genre source breakdown:
  Last.fm track tags: ${trackTagCount}
  Last.fm artist tags: ${artistTagCount}
  Spotify artist genres: ${spotifyGenreCount}
  No genres: ${enrichedTracks.length - trackTagCount - artistTagCount - spotifyGenreCount}
`);

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
