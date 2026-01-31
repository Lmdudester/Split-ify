import * as Slider from '@radix-ui/react-slider';
import { useAppStore } from '../../stores/app-store';

export function PopularityFilter() {
  const { filters, setPopularityRange } = useAppStore();

  return (
    <div className="popularity-filter">
      <h3>Popularity</h3>

      <div className="popularity-values">
        <span className="popularity-min">{filters.popularityRange[0]}</span>
        <span className="popularity-max">{filters.popularityRange[1]}</span>
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
