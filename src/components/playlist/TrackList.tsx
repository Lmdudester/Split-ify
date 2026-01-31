import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { EnrichedTrack } from '../../types/app';
import { TrackRow } from './TrackRow';

interface TrackListProps {
  tracks: EnrichedTrack[];
}

export function TrackList({ tracks }: TrackListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  });

  if (tracks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tracks match your filters</p>
      </div>
    );
  }

  return (
    <div className="track-list-wrapper">
      <div className="track-list-header">
        <div className="header-track">Track</div>
        <div className="header-genres">Genres</div>
        <div className="header-popularity">Popularity</div>
        <div className="header-duration">Duration</div>
      </div>
      <div ref={parentRef} className="track-list-container">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <TrackRow track={tracks[virtualRow.index]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
