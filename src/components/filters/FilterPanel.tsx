import { GenreFilter } from './GenreFilter';
import { PopularityFilter } from './PopularityFilter';
import { DisplaySettings } from './DisplaySettings';
import { useAppStore } from '../../stores/app-store';

interface FilterPanelProps {
  allGenres: string[];
}

export function FilterPanel({ allGenres }: FilterPanelProps) {
  const resetFilters = useAppStore(state => state.resetFilters);
  const resetUISettings = useAppStore(state => state.resetUISettings);

  return (
    <div className="filter-panel">
      {/* Display Options Section */}
      <div className="display-settings-header">
        <h2>Display Options</h2>
        <button onClick={resetUISettings} className="reset-button">
          Clear All
        </button>
      </div>
      <div className="display-settings-content">
        <DisplaySettings />
      </div>

      {/* Filters Section */}
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
