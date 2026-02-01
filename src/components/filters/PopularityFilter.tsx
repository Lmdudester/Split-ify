import * as Slider from '@radix-ui/react-slider';
import { useAppStore } from '../../stores/app-store';
import { useState, useRef, useEffect } from 'react';

export function PopularityFilter() {
  const { filters, setPopularityRange } = useAppStore();
  const [editingMin, setEditingMin] = useState(false);
  const [editingMax, setEditingMax] = useState(false);
  const [minValue, setMinValue] = useState(filters.popularityRange[0].toString());
  const [maxValue, setMaxValue] = useState(filters.popularityRange[1].toString());
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingMin) {
      setMinValue(filters.popularityRange[0].toString());
    }
    if (!editingMax) {
      setMaxValue(filters.popularityRange[1].toString());
    }
  }, [filters.popularityRange, editingMin, editingMax]);

  useEffect(() => {
    if (editingMin && minInputRef.current) {
      minInputRef.current.focus();
      minInputRef.current.select();
    }
  }, [editingMin]);

  useEffect(() => {
    if (editingMax && maxInputRef.current) {
      maxInputRef.current.focus();
      maxInputRef.current.select();
    }
  }, [editingMax]);

  const handleMinBlur = () => {
    setEditingMin(false);
    const value = parseInt(minValue, 10);
    if (!isNaN(value)) {
      const clampedValue = Math.max(0, Math.min(100, value));
      const maxVal = filters.popularityRange[1];
      if (clampedValue <= maxVal) {
        setPopularityRange([clampedValue, maxVal]);
      } else {
        setMinValue(filters.popularityRange[0].toString());
      }
    } else {
      setMinValue(filters.popularityRange[0].toString());
    }
  };

  const handleMaxBlur = () => {
    setEditingMax(false);
    const value = parseInt(maxValue, 10);
    if (!isNaN(value)) {
      const clampedValue = Math.max(0, Math.min(100, value));
      const minVal = filters.popularityRange[0];
      if (clampedValue >= minVal) {
        setPopularityRange([minVal, clampedValue]);
      } else {
        setMaxValue(filters.popularityRange[1].toString());
      }
    } else {
      setMaxValue(filters.popularityRange[1].toString());
    }
  };

  const handleMinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMinBlur();
    } else if (e.key === 'Escape') {
      setMinValue(filters.popularityRange[0].toString());
      setEditingMin(false);
    }
  };

  const handleMaxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMaxBlur();
    } else if (e.key === 'Escape') {
      setMaxValue(filters.popularityRange[1].toString());
      setEditingMax(false);
    }
  };

  return (
    <div className="popularity-filter">
      <h3>Popularity</h3>

      <div className="popularity-values">
        {editingMin ? (
          <input
            ref={minInputRef}
            type="number"
            min={0}
            max={100}
            className="popularity-input popularity-min"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            onBlur={handleMinBlur}
            onKeyDown={handleMinKeyDown}
          />
        ) : (
          <span
            className="popularity-min editable"
            onClick={() => setEditingMin(true)}
            title="Click to edit"
          >
            {filters.popularityRange[0]}
          </span>
        )}
        {editingMax ? (
          <input
            ref={maxInputRef}
            type="number"
            min={0}
            max={100}
            className="popularity-input popularity-max"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            onBlur={handleMaxBlur}
            onKeyDown={handleMaxKeyDown}
          />
        ) : (
          <span
            className="popularity-max editable"
            onClick={() => setEditingMax(true)}
            title="Click to edit"
          >
            {filters.popularityRange[1]}
          </span>
        )}
      </div>

      <Slider.Root
        className="slider-root"
        value={filters.popularityRange}
        onValueChange={setPopularityRange}
        min={0}
        max={100}
        step={1}
        minStepsBetweenThumbs={1}
        aria-label="Popularity range"
      >
        <Slider.Track className="slider-track">
          <Slider.Range className="slider-range" />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" aria-label="Minimum popularity" />
        <Slider.Thumb className="slider-thumb" aria-label="Maximum popularity" />
      </Slider.Root>

      <div className="popularity-labels">
        <span>Less Popular</span>
        <span>More Popular</span>
      </div>
    </div>
  );
}
