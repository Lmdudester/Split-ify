import * as Dialog from '@radix-ui/react-dialog';
import { FilterPanel } from './FilterPanel';

interface MobileFilterDrawerProps {
  allGenres: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileFilterDrawer({ allGenres, open, onOpenChange }: MobileFilterDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="mobile-filter-content">
          <div className="mobile-filter-header">
            <Dialog.Title className="dialog-title">Filters</Dialog.Title>
            <Dialog.Close className="mobile-filter-close">✕</Dialog.Close>
          </div>
          <div className="mobile-filter-body">
            <FilterPanel allGenres={allGenres} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
