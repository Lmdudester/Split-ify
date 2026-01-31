import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import { useAppStore } from '../../stores/app-store';

interface GenreFilterProps {
  genres: string[];
}

export function GenreFilter({ genres }: GenreFilterProps) {
  const [search, setSearch] = useState('');
  const { filters, toggleGenre } = useAppStore();

  const filteredGenres = genres.filter(genre =>
    genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="genre-filter">
      <h3>Genres</h3>

      <input
        type="text"
        placeholder="Search genres..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="genre-search"
      />

      <div className="genre-list">
        {filteredGenres.length === 0 && (
          <p className="empty-message">No genres found</p>
        )}

        {filteredGenres.map(genre => (
          <div key={genre} className="genre-item">
            <Checkbox.Root
              id={`genre-${genre}`}
              checked={filters.selectedGenres.includes(genre)}
              onCheckedChange={() => toggleGenre(genre)}
              className="checkbox"
            >
              <Checkbox.Indicator>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Checkbox.Indicator>
            </Checkbox.Root>
            <Label.Root htmlFor={`genre-${genre}`} className="genre-label">
              {genre}
            </Label.Root>
          </div>
        ))}
      </div>
    </div>
  );
}
