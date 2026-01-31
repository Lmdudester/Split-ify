import { SpotifyTrack, AudioFeatures } from './spotify';

export interface EnrichedTrack {
  track: SpotifyTrack;
  allGenres: string[];
  audioFeatures: AudioFeatures | null;
  addedAt: string;
}

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  stage: 'idle' | 'tracks' | 'artists' | 'features' | 'complete';
  message: string;
}
