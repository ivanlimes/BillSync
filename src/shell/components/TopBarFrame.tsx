import { APP_TITLE } from '@/app/config/appMeta';
import { useAppPersistenceStatus } from '@/persistence';
import { selectActiveDestination, useAppStore } from '@/store';
import { Button } from '@/ui/primitives';

const DESTINATION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  bills: 'Bills',
  forecast: 'Forecast',
  calendar: 'Calendar',
  settings: 'Settings',
};

export function TopBarFrame() {
  const activeDestination = useAppStore(selectActiveDestination);
  const persistenceStatus = useAppPersistenceStatus();
  const destinationTitle = DESTINATION_TITLES[activeDestination] ?? activeDestination;

  return (
    <header className="shell-top-bar">
      <div className="shell-top-bar__identity">
        <h1 className="shell-top-bar__title">
          {APP_TITLE} · {destinationTitle}
        </h1>
        <p className="shell-top-bar__subtitle">
          One frozen base, one controlled change layer. This workspace stays aligned to the locked family-bills implementation order.
        </p>
      </div>

      <div className="shell-top-bar__actions">
        <span className="shell-utility-text">
          {persistenceStatus.isHydrated ? 'Local state hydrated' : 'Hydrating local state'}
        </span>
        <Button variant="disabled" disabled aria-disabled="true">
          Add bill — Step 7
        </Button>
      </div>
    </header>
  );
}
