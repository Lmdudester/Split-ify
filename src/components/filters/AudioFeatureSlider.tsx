import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useAppStore } from '../../stores/app-store';
import { AudioFeatureConfig } from '../../types/filters';

interface AudioFeatureSliderProps {
  config: AudioFeatureConfig;
}

export function AudioFeatureSlider({ config }: AudioFeatureSliderProps) {
  const { filters, setAudioFeatureRange } = useAppStore();
  const range = filters.audioFeatures[config.key];

  const handleChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setAudioFeatureRange(config.key, { min: value[0], max: value[1] });
    }
  };

  const formatValue = (value: number) => {
    if (config.format) {
      return config.format(value);
    }
    return value.toFixed(2);
  };

  return (
    <div className="audio-feature-slider">
      <div className="slider-header">
        <label className="slider-label">{config.label}</label>
        <span className="slider-value">
          {formatValue(range.min)} - {formatValue(range.max)}
        </span>
      </div>
      <p className="slider-description">{config.description}</p>
      <Slider
        range
        min={config.min}
        max={config.max}
        step={config.step}
        value={[range.min, range.max]}
        onChange={handleChange}
        className="slider"
      />
    </div>
  );
}
