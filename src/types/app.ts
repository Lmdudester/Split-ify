import { SpotifyTrack } from './spotify';

export interface EnrichedTrack {
  track: SpotifyTrack;
  allGenres: string[];
  genreSources: {
    lastfmTrack: string[];
    lastfmArtist: string[];
    spotifyArtist: string[];
  };
  enrichmentStatus: 'pending' | 'enriching' | 'complete';
  addedAt: string;
}

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface LoadingState {
  isLoading: boolean;
  stage: 'idle' | 'loading' | 'complete';
  message: string;
  spotifyTracks: {
    loaded: number;
    total: number;
  };
  lastfmTrackTags: {
    completed: number;
    total: number;
    averageTimeMs?: number;
  };
  lastfmArtistTags: {
    completed: number;
    total: number;
    averageTimeMs?: number;
  };
  spotifyArtistGenres: {
    completed: number;
    total: number;
    averageTimeMs?: number;
  };
}
