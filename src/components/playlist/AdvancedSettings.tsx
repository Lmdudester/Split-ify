import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import { useAppStore } from '../../stores/app-store';

export function AdvancedSettings() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { useLastfmTrackTags, useLastfmArtistTags } = useAppStore((state) => state.enrichmentSettings);
  const setUseLastfmTrackTags = useAppStore((state) => state.setUseLastfmTrackTags);
  const setUseLastfmArtistTags = useAppStore((state) => state.setUseLastfmArtistTags);

  return (
    <div className="advanced-settings">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="advanced-settings-toggle"
      >
        <span>Advanced Settings</span>
        <svg
          className={`chevron ${isExpanded ? 'expanded' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="advanced-settings-content">
          <p className="advanced-settings-description">
            Enable additional genre sources. Note: Last.fm API calls can be slow and may significantly increase loading time.
          </p>

          <div className="settings-item">
            <Checkbox.Root
              id="use-lastfm-track-tags"
              checked={useLastfmTrackTags}
              onCheckedChange={setUseLastfmTrackTags}
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
            <Label.Root htmlFor="use-lastfm-track-tags" className="genre-label">
              Use Last.fm track tags
            </Label.Root>
          </div>

          <div className="settings-item">
            <Checkbox.Root
              id="use-lastfm-artist-tags"
              checked={useLastfmArtistTags}
              onCheckedChange={setUseLastfmArtistTags}
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
            <Label.Root htmlFor="use-lastfm-artist-tags" className="genre-label">
              Use Last.fm artist tags
            </Label.Root>
          </div>
        </div>
      )}
    </div>
  );
}
