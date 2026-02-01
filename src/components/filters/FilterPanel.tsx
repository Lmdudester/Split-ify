import { useState } from 'react';
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
  const { showTrackNumbers, showPopularity } = useAppStore(state => state.uiSettings);
  const filters = useAppStore(state => state.filters);
  const [displayOptionsExpanded, setDisplayOptionsExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const hasActiveDisplaySettings = showTrackNumbers || showPopularity;
  const getDisplaySettingsSummary = () => {
    const settings = [];
    if (showTrackNumbers) settings.push('Track numbers');
    if (showPopularity) settings.push('Popularity');
    return settings.join(', ');
  };

  const hasActiveFilters =
    filters.popularityRange[0] !== 0 ||
    filters.popularityRange[1] !== 100 ||
    (filters.selectedGenres?.length ?? 0) > 0;

  const getFiltersSummary = () => {
    const parts = [];

    if (filters.popularityRange[0] !== 0 || filters.popularityRange[1] !== 100) {
      parts.push(`Popularity: ${filters.popularityRange[0]}-${filters.popularityRange[1]}`);
    }

    if (filters.selectedGenres && filters.selectedGenres.length > 0) {
      const maxGenresToShow = 3;
      const genreText =
        filters.selectedGenres.length <= maxGenresToShow
          ? filters.selectedGenres.join(', ')
          : `${filters.selectedGenres.slice(0, maxGenresToShow).join(', ')} +${filters.selectedGenres.length - maxGenresToShow} more`;
      parts.push(`Genres: ${genreText}`);
    }

    return parts.join(' • ');
  };

  return (
    <div className="filter-panel">
      {/* Display Options Section */}
      <div className="display-settings-section">
        <div className="display-settings-header">
          <h2
            onClick={() => setDisplayOptionsExpanded(!displayOptionsExpanded)}
            className="collapsible-header"
          >
            <span className={`collapse-icon ${displayOptionsExpanded ? 'expanded' : ''}`}>▶</span>
            Display Options
          </h2>
          <button onClick={resetUISettings} className="reset-button">
            Clear All
          </button>
        </div>
        {!displayOptionsExpanded && hasActiveDisplaySettings && (
          <div className="display-settings-summary">
            {getDisplaySettingsSummary()}
          </div>
        )}
        {displayOptionsExpanded && (
          <div className="display-settings-content">
            <DisplaySettings />
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-header">
          <h2
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="collapsible-header"
          >
            <span className={`collapse-icon ${filtersExpanded ? 'expanded' : ''}`}>▶</span>
            Filters
          </h2>
          <button onClick={resetFilters} className="reset-button">
            Reset All
          </button>
        </div>
        {!filtersExpanded && hasActiveFilters && (
          <div className="filters-summary">
            {getFiltersSummary()}
          </div>
        )}
        {filtersExpanded && (
          <div className="filter-content">
            <PopularityFilter />
            <GenreFilter genres={allGenres} />
          </div>
        )}
      </div>
    </div>
  );
}
