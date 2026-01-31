import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import { useAppStore } from '../../stores/app-store';

export function DisplaySettings() {
  const { showTrackNumbers, showPopularity } = useAppStore((state) => state.uiSettings);
  const setShowTrackNumbers = useAppStore((state) => state.setShowTrackNumbers);
  const setShowPopularity = useAppStore((state) => state.setShowPopularity);

  return (
    <div className="display-settings">
      <div className="settings-item">
        <Checkbox.Root
          id="show-track-numbers"
          checked={showTrackNumbers}
          onCheckedChange={setShowTrackNumbers}
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
        <Label.Root htmlFor="show-track-numbers" className="genre-label">
          Show track numbers
        </Label.Root>
      </div>

      <div className="settings-item">
        <Checkbox.Root
          id="show-popularity"
          checked={showPopularity}
          onCheckedChange={setShowPopularity}
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
        <Label.Root htmlFor="show-popularity" className="genre-label">
          Show popularity
        </Label.Root>
      </div>
    </div>
  );
}
