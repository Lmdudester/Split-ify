import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopularityFilter } from './PopularityFilter';
import { useAppStore } from '../../stores/app-store';

describe('PopularityFilter', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAppStore.setState({
      filters: {
        popularityRange: [0, 100],
        selectedGenres: [],
      },
    });
  });

  it('renders popularity filter with default values', () => {
    render(<PopularityFilter />);

    expect(screen.getByText('Popularity')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays current popularity range values', () => {
    useAppStore.setState({
      filters: {
        popularityRange: [30, 80],
        selectedGenres: [],
      },
    });

    render(<PopularityFilter />);

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('allows clicking on min value to edit it', () => {
    render(<PopularityFilter />);

    const minValue = screen.getByText('0');
    fireEvent.click(minValue);

    // Should now show an input field
    const input = screen.getByDisplayValue('0') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
  });

  it('allows clicking on max value to edit it', () => {
    render(<PopularityFilter />);

    const maxValue = screen.getByText('100');
    fireEvent.click(maxValue);

    // Should now show an input field
    const input = screen.getByDisplayValue('100') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
  });

  it('updates min value when input is changed and blurred', () => {
    render(<PopularityFilter />);

    const minValue = screen.getByText('0');
    fireEvent.click(minValue);

    const input = screen.getByDisplayValue('0') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.blur(input);

    // Check if the store was updated
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[0]).toBe(25);
  });

  it('updates max value when input is changed and blurred', () => {
    render(<PopularityFilter />);

    const maxValue = screen.getByText('100');
    fireEvent.click(maxValue);

    const input = screen.getByDisplayValue('100') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '75' } });
    fireEvent.blur(input);

    // Check if the store was updated
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[1]).toBe(75);
  });

  it('clamps min value to valid range (0-100)', () => {
    render(<PopularityFilter />);

    const minValue = screen.getByText('0');
    fireEvent.click(minValue);

    const input = screen.getByDisplayValue('0') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);

    // Should be clamped to 100
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[0]).toBe(100);
  });

  it('clamps max value to valid range (0-100)', () => {
    render(<PopularityFilter />);

    const maxValue = screen.getByText('100');
    fireEvent.click(maxValue);

    const input = screen.getByDisplayValue('100') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-10' } });
    fireEvent.blur(input);

    // Should be clamped to 0
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[1]).toBe(0);
  });

  it('prevents min value from exceeding max value', () => {
    useAppStore.setState({
      filters: {
        popularityRange: [30, 60],
        selectedGenres: [],
      },
    });

    render(<PopularityFilter />);

    const minValue = screen.getByText('30');
    fireEvent.click(minValue);

    const input = screen.getByDisplayValue('30') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '80' } });
    fireEvent.blur(input);

    // Should revert because 80 > 60 (max)
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[0]).toBe(30);
  });

  it('prevents max value from going below min value', () => {
    useAppStore.setState({
      filters: {
        popularityRange: [40, 70],
        selectedGenres: [],
      },
    });

    render(<PopularityFilter />);

    const maxValue = screen.getByText('70');
    fireEvent.click(maxValue);

    const input = screen.getByDisplayValue('70') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '20' } });
    fireEvent.blur(input);

    // Should revert because 20 < 40 (min)
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[1]).toBe(70);
  });

  it('confirms input on Enter key press', () => {
    render(<PopularityFilter />);

    const minValue = screen.getByText('0');
    fireEvent.click(minValue);

    const input = screen.getByDisplayValue('0') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Should update the value
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[0]).toBe(50);

    // Input should be removed
    expect(screen.queryByDisplayValue('50')).not.toBeInTheDocument();
  });

  it('cancels input on Escape key press', () => {
    render(<PopularityFilter />);

    const minValue = screen.getByText('0');
    fireEvent.click(minValue);

    const input = screen.getByDisplayValue('0') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // Should not update the value
    const state = useAppStore.getState();
    expect(state.filters.popularityRange[0]).toBe(0);

    // Input should be removed
    expect(screen.queryByDisplayValue('50')).not.toBeInTheDocument();
  });
});
