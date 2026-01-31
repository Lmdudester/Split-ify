import { GenreFilter } from './GenreFilter';
import { PopularityFilter } from './PopularityFilter';
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
        <PopularityFilter />
        <GenreFilter genres={allGenres} />
      </div>
    </div>
  );
}
