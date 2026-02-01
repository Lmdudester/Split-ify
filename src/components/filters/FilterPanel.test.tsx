import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';
import { useAppStore } from '../../stores/app-store';

describe('FilterPanel', () => {
  const mockGenres = ['rock', 'pop', 'jazz', 'classical', 'electronic'];

  beforeEach(() => {
    // Reset store to initial state before each test
    useAppStore.setState({
      filters: {
        popularityRange: [0, 100],
        selectedGenres: [],
      },
      uiSettings: {
        showTrackNumbers: false,
        showPopularity: false,
      },
    });
  });

  describe('Display Options Section', () => {
    it('renders collapsed by default', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      expect(screen.getByText('Display Options')).toBeInTheDocument();
      // DisplaySettings component content should not be visible
      expect(screen.queryByText('Show track numbers')).not.toBeInTheDocument();
    });

    it('expands when header is clicked', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      const header = screen.getByText('Display Options');
      fireEvent.click(header);

      // DisplaySettings component content should now be visible
      expect(screen.getByText('Show track numbers')).toBeInTheDocument();
      expect(screen.getByText('Show popularity')).toBeInTheDocument();
    });

    it('collapses when header is clicked again', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      const header = screen.getByText('Display Options');
      fireEvent.click(header);
      expect(screen.getByText('Show track numbers')).toBeInTheDocument();

      fireEvent.click(header);
      expect(screen.queryByText('Show track numbers')).not.toBeInTheDocument();
    });

    it('does not show summary when collapsed with no active settings', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      // Should not show any summary text
      const summaryElements = screen.queryAllByText(/Track numbers|Popularity/);
      const summaryText = summaryElements.filter(
        (el) => el.className === 'display-settings-summary'
      );
      expect(summaryText).toHaveLength(0);
    });

    it('shows summary when collapsed with active settings', () => {
      useAppStore.setState({
        uiSettings: {
          showTrackNumbers: true,
          showPopularity: false,
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Should show summary text
      expect(screen.getByText('Track numbers')).toBeInTheDocument();
    });

    it('shows multiple active settings in summary', () => {
      useAppStore.setState({
        uiSettings: {
          showTrackNumbers: true,
          showPopularity: true,
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Should show both settings in summary
      expect(screen.getByText('Track numbers, Popularity')).toBeInTheDocument();
    });

    it('hides summary when expanded', () => {
      useAppStore.setState({
        uiSettings: {
          showTrackNumbers: true,
          showPopularity: false,
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Expand the section
      const header = screen.getByText('Display Options');
      fireEvent.click(header);

      // Summary should not be visible when expanded
      const summaryElements = screen.queryAllByText('Track numbers');
      const summaryText = summaryElements.filter(
        (el) => el.className === 'display-settings-summary'
      );
      expect(summaryText).toHaveLength(0);
    });
  });

  describe('Filters Section', () => {
    it('renders expanded by default', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
      // PopularityFilter component content should be visible
      expect(screen.getByText('Popularity')).toBeInTheDocument();
    });

    it('collapses when header is clicked', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      const header = screen.getByText('Filters');
      fireEvent.click(header);

      // PopularityFilter component content should not be visible
      expect(screen.queryByText('Popularity')).not.toBeInTheDocument();
    });

    it('expands when header is clicked again', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      const header = screen.getByText('Filters');
      fireEvent.click(header);
      fireEvent.click(header);

      // PopularityFilter component content should be visible again
      expect(screen.getByText('Popularity')).toBeInTheDocument();
    });

    it('does not show summary when collapsed with no active filters', () => {
      render(<FilterPanel allGenres={mockGenres} />);

      // Collapse the section
      const header = screen.getByText('Filters');
      fireEvent.click(header);

      // Should not show any summary text
      const container = screen.queryByText(/Popularity:|Genres:/);
      expect(container).not.toBeInTheDocument();
    });

    it('shows popularity summary when collapsed with modified popularity range', () => {
      useAppStore.setState({
        filters: {
          popularityRange: [30, 80],
          selectedGenres: [],
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Collapse the section
      const header = screen.getByText('Filters');
      fireEvent.click(header);

      // Should show popularity summary
      expect(screen.getByText('Popularity: 30-80')).toBeInTheDocument();
    });

    it('shows genre summary when collapsed with one genre selected', () => {
      useAppStore.setState({
        filters: {
          popularityRange: [0, 100],
          selectedGenres: ['rock'],
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Collapse the section
      const header = screen.getByText('Filters');
      fireEvent.click(header);

      // Should show genre summary
      expect(screen.getByText('Genres: rock')).toBeInTheDocument();
    });

    it('shows genre summary when collapsed with multiple genres selected', () => {
      useAppStore.setState({
        filters: {
          popularityRange: [0, 100],
          selectedGenres: ['rock', 'pop', 'jazz'],
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Collapse the section
      const header = screen.getByText('Filters');
      fireEvent.click(header);

      // Should show all genre names when 3 or fewer
      expect(screen.getByText('Genres: rock, pop, jazz')).toBeInTheDocument();
    });

    it('shows genre summary with "+X more" when collapsed with many genres selected', () => {
      useAppStore.setState({
        filters: {
          popularityRange: [0, 100],
          selectedGenres: ['rock', 'pop', 'jazz', 'classical', 'electronic'],
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Collapse the section
      const header = screen.getByText('Filters');
      fireEvent.click(header);

      // Should show first 3 genres + count
      expect(screen.getByText('Genres: rock, pop, jazz +2 more')).toBeInTheDocument();
    });

    it('shows combined summary when collapsed with multiple active filters', () => {
      useAppStore.setState({
        filters: {
          popularityRange: [30, 80],
          selectedGenres: ['rock', 'pop'],
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Collapse the section
      const header = screen.getByText('Filters');
      fireEvent.click(header);

      // Should show both popularity and genre summaries
      expect(screen.getByText('Popularity: 30-80 • Genres: rock, pop')).toBeInTheDocument();
    });

    it('hides summary when expanded', () => {
      useAppStore.setState({
        filters: {
          popularityRange: [30, 80],
          selectedGenres: ['rock'],
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      // Section is expanded by default, summary should not be visible
      expect(screen.queryByText('Popularity: 30-80')).not.toBeInTheDocument();
    });
  });

  describe('Reset Buttons', () => {
    it('clears display options when Clear All is clicked', () => {
      useAppStore.setState({
        uiSettings: {
          showTrackNumbers: true,
          showPopularity: true,
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      const state = useAppStore.getState();
      expect(state.uiSettings.showTrackNumbers).toBe(false);
      expect(state.uiSettings.showPopularity).toBe(false);
    });

    it('resets filters when Reset All is clicked', () => {
      useAppStore.setState({
        filters: {
          popularityRange: [30, 80],
          selectedGenres: ['rock', 'pop'],
        },
      });

      render(<FilterPanel allGenres={mockGenres} />);

      const resetButton = screen.getByText('Reset All');
      fireEvent.click(resetButton);

      const state = useAppStore.getState();
      expect(state.filters.popularityRange).toEqual([0, 100]);
      expect(state.filters.selectedGenres).toEqual([]);
    });
  });
});
