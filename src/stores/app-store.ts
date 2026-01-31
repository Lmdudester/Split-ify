import { create } from 'zustand';
import { EnrichedTrack, LoadingState } from '../types/app';
import { FilterState, DEFAULT_AUDIO_FEATURES, AudioFeatureRange } from '../types/filters';

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
  setPlaylistInfo: (id: string, name: string) => void;
  setLoading: (loading: Partial<LoadingState>) => void;
  resetLoading: () => void;

  // Filter actions
  setSelectedGenres: (genres: string[]) => void;
  toggleGenre: (genre: string) => void;
  setAudioFeatureRange: (feature: keyof FilterState['audioFeatures'], range: AudioFeatureRange) => void;
  resetFilters: () => void;
  clearTracks: () => void;
}

const initialLoadingState: LoadingState = {
  isLoading: false,
  progress: 0,
  stage: 'idle',
  message: ''
};

const initialFilterState: FilterState = {
  selectedGenres: [],
  audioFeatures: DEFAULT_AUDIO_FEATURES
};

export const useAppStore = create<AppState>((set) => ({
  tracks: [],
  playlistName: '',
  playlistId: '',
  loading: initialLoadingState,
  filters: initialFilterState,

  setTracks: (tracks) => set({ tracks }),

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

  setAudioFeatureRange: (feature, range) =>
    set((state) => ({
      filters: {
        ...state.filters,
        audioFeatures: {
          ...state.filters.audioFeatures,
          [feature]: range
        }
      }
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
