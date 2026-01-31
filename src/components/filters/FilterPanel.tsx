import { GenreFilter } from './GenreFilter';
import { useAppStore } from '../../stores/app-store';

interface FilterPanelProps {
  allGenres: string[];
}

export function FilterPanel({ allGenres }: FilterPanelProps) {
  const resetFilters = useAppStore(state => state.resetFilters);

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        <button onClick={resetFilters} className="reset-button">
          Reset All
        </button>
      </div>

      <div className="filter-content">
        <GenreFilter genres={allGenres} />

        <div className="info-message" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--spotify-gray)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--spotify-light-gray)' }}>
          <strong>Note:</strong> Audio features filtering is disabled. It requires Spotify Extended Quota Mode approval.
        </div>
      </div>
    </div>
  );
}
