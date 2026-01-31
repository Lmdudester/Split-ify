import { useMemo } from 'react';
import { useAppStore } from '../stores/app-store';

export function useFilters() {
  const tracks = useAppStore((state) => state.tracks);
  const filters = useAppStore((state) => state.filters);

  // Get all unique genres from tracks
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    tracks.forEach(track => {
      track.allGenres.forEach(genre => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  }, [tracks]);

  // Filter tracks based on selected genres
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      // Genre filter
      if (filters.selectedGenres.length > 0) {
        const hasMatchingGenre = track.allGenres.some(genre =>
          filters.selectedGenres.includes(genre)
        );
        if (!hasMatchingGenre) return false;
      }

      return true;
    });
  }, [tracks, filters]);

  return {
    allGenres,
    filteredTracks,
    filters
  };
}
