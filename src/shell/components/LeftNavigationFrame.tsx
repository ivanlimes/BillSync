import { APP_DESTINATIONS } from '@/app/config/appMeta';
import type { AppDestination } from '@/app/routing/destinations';
import { appActions, selectActiveDestination, useAppDispatch, useAppStore } from '@/store';

export function LeftNavigationFrame() {
  const activeDestination = useAppStore(selectActiveDestination);
  const dispatch = useAppDispatch();

  const handleNavigate = (destination: AppDestination) => {
    dispatch(appActions.setActiveDestination(destination));
  };

  return (
    <aside className="shell-left-navigation" aria-label="Primary navigation">
      <div className="shell-left-navigation__header">
        <h2 className="shell-pane-title">Destinations</h2>
        <p className="shell-pane-caption">Top-level switching only. No screen-specific tools belong here.</p>
      </div>

      <ul className="shell-nav-list">
        {APP_DESTINATIONS.map((destination) => (
          <li key={destination.id}>
            <button
              className="shell-nav-button"
              data-active={String(activeDestination === destination.id)}
              onClick={() => handleNavigate(destination.id)}
              type="button"
            >
              <span className="shell-nav-button__label">{destination.label}</span>
              <span className="shell-nav-button__meta">{destination.ownership}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
