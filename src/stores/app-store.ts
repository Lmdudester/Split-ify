import { create } from 'zustand';
import { EnrichedTrack, LoadingState } from '../types/app';

interface FilterState {
  selectedGenres: string[];
  popularityRange: [number, number];
}

interface AppState {
  // Data
  tracks: EnrichedTrack[];
  playlistName: string;
  playlistId: string;

  // Loading
  loading: LoadingState;

  // Filters
  filters: FilterState;

  // Actions
  setTracks: (tracks: EnrichedTrack[]) => void;
  addTracks: (tracks: EnrichedTrack[]) => void;
  updateTrackGenres: (trackId: string, update: Partial<EnrichedTrack>) => void;
  updateMultipleTrackGenres: (updates: Map<string, Partial<EnrichedTrack>>) => void;
  setPlaylistInfo: (id: string, name: string) => void;
  setLoading: (loading: Partial<LoadingState>) => void;
  resetLoading: () => void;

  // Filter actions
  setSelectedGenres: (genres: string[]) => void;
  toggleGenre: (genre: string) => void;
  setPopularityRange: (range: [number, number]) => void;
  resetFilters: () => void;
  clearTracks: () => void;
}

const initialLoadingState: LoadingState = {
  isLoading: false,
  stage: 'idle',
  message: '',
  spotifyTracks: {
    loaded: 0,
    total: 0,
  },
  lastfmTrackTags: {
    completed: 0,
    total: 0,
  },
  lastfmArtistTags: {
    completed: 0,
    total: 0,
  },
  spotifyArtistGenres: {
    completed: 0,
    total: 0,
  },
};

const initialFilterState: FilterState = {
  selectedGenres: [],
  popularityRange: [0, 100]
};

export const useAppStore = create<AppState>((set) => ({
  tracks: [],
  playlistName: '',
  playlistId: '',
  loading: initialLoadingState,
  filters: initialFilterState,

  setTracks: (tracks) => set({ tracks }),

  addTracks: (tracks) =>
    set((state) => ({
      tracks: [...state.tracks, ...tracks]
    })),

  updateTrackGenres: (trackId, update) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.track.id === trackId
          ? { ...track, ...update }
          : track
      )
    })),

  updateMultipleTrackGenres: (updates) =>
    set((state) => ({
      tracks: state.tracks.map((track) => {
        const update = updates.get(track.track.id);
        return update ? { ...track, ...update } : track;
      })
    })),

  setPlaylistInfo: (id, name) =>
    set({ playlistId: id, playlistName: name }),

  setLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, ...loading }
    })),

  resetLoading: () => set({ loading: initialLoadingState }),

  setSelectedGenres: (genres) =>
    set((state) => ({
      filters: { ...state.filters, selectedGenres: genres }
    })),

  toggleGenre: (genre) =>
    set((state) => {
      const selectedGenres = state.filters.selectedGenres.includes(genre)
        ? state.filters.selectedGenres.filter((g) => g !== genre)
        : [...state.filters.selectedGenres, genre];
      return {
        filters: { ...state.filters, selectedGenres }
      };
    }),

  setPopularityRange: (range) =>
    set((state) => ({
      filters: { ...state.filters, popularityRange: range }
    })),

  resetFilters: () =>
    set({ filters: initialFilterState }),

  clearTracks: () =>
    set({
      tracks: [],
      playlistName: '',
      playlistId: '',
      filters: initialFilterState
    })
}));
