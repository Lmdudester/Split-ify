/**
 * Multi-bar Loading Progress Component
 *
 * Displays 4 independent progress bars for concurrent enrichment:
 * - Spotify Tracks
 * - Last.fm Track Tags
 * - Last.fm Artist Tags
 * - Spotify Artist Genres
 */

import { LoadingState } from '../types/app';

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
}

/**
 * Calculate progress bar color: Red (0%) → Yellow (50%) → Green (100%)
 */
function getProgressColor(percentage: number): string {
  if (percentage <= 50) {
    // Red to Yellow (0-50%)
    const ratio = percentage / 50;
    const red = 213; // #d51007 red component
    const green = Math.round(16 + (237 * ratio)); // 16 → 253 (yellow)
    const blue = 7;
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Yellow to Green (50-100%)
    const ratio = (percentage - 50) / 50;
    const red = Math.round(213 - (184 * ratio)); // 213 → 29 (green)
    const green = Math.round(253 - (68 * ratio)); // 253 → 185 (green)
    const blue = Math.round(7 + (77 * ratio)); // 7 → 84 (green)
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

function ProgressBar({ label, current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const color = getProgressColor(percentage);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <span className="progress-bar-label">{label}</span>
        <span className="progress-bar-stats">
          {current}/{total} ({percentage}%)
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

interface LoadingProgressProps {
  loading: LoadingState;
}

export function LoadingProgress({ loading }: LoadingProgressProps) {
  if (!loading.isLoading) {
    return null;
  }

  return (
    <div className="loading-progress">
      <div className="loading-progress-message">{loading.message}</div>

      <div className="progress-bars">
        <ProgressBar
          label="Spotify Tracks"
          current={loading.spotifyTracks.loaded}
          total={loading.spotifyTracks.total}
        />

        <ProgressBar
          label="Last.fm Track Tags"
          current={loading.lastfmTrackTags.completed}
          total={loading.lastfmTrackTags.total}
        />

        <ProgressBar
          label="Last.fm Artist Tags"
          current={loading.lastfmArtistTags.completed}
          total={loading.lastfmArtistTags.total}
        />

        <ProgressBar
          label="Spotify Artist Genres"
          current={loading.spotifyArtistGenres.completed}
          total={loading.spotifyArtistGenres.total}
        />
      </div>
    </div>
  );
}
