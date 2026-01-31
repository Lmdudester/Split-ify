import { EnrichedTrack } from '../../types/app';

interface TrackRowProps {
  track: EnrichedTrack;
}

export function TrackRow({ track }: TrackRowProps) {
  const { track: spotifyTrack, allGenres } = track;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPopularityLevel = (popularity: number): 'high' | 'medium' | 'low' => {
    if (popularity >= 70) return 'high';
    if (popularity >= 40) return 'medium';
    return 'low';
  };

  return (
    <div className="track-row">
      <div className="track-info">
        {spotifyTrack.album.images[0] && (
          <img
            src={spotifyTrack.album.images[spotifyTrack.album.images.length - 1].url}
            alt={spotifyTrack.album.name}
            className="track-image"
          />
        )}
        <div className="track-details">
          <div className="track-name">{spotifyTrack.name}</div>
          <div className="track-artist">
            {spotifyTrack.artists.map(a => a.name).join(', ')}
          </div>
        </div>
      </div>

      <div
        className="track-genres"
        title={allGenres.length > 0 ? allGenres.join(', ') : 'No genres'}
      >
        {allGenres.length > 0 && (
          <>
            {allGenres.slice(0, 3).map((genre, i) => (
              <span key={i} className="genre-tag">{genre}</span>
            ))}
            {allGenres.length > 3 && (
              <span className="genre-tag">+{allGenres.length - 3}</span>
            )}
          </>
        )}
      </div>

      <div className="track-popularity">
        <div
          className="popularity-meter"
          data-level={getPopularityLevel(spotifyTrack.popularity)}
          aria-label={`Popularity: ${spotifyTrack.popularity} out of 100`}
        >
          <div
            className="popularity-fill"
            style={{ width: `${spotifyTrack.popularity}%` }}
          />
          <span className="popularity-value">{spotifyTrack.popularity}</span>
        </div>
      </div>

      <div className="track-duration">{formatDuration(spotifyTrack.duration_ms)}</div>
    </div>
  );
}
