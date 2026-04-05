import { selectActiveDestination, useAppStore } from '@/store';
import { BillsScreen } from '@/screens/bills/BillsScreen';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ForecastScreen } from '@/screens/forecast/ForecastScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

const DESTINATION_SCREEN_MAP = {
  dashboard: DashboardScreen,
  bills: BillsScreen,
  forecast: ForecastScreen,
  calendar: CalendarScreen,
  settings: SettingsScreen,
} as const;

export function CenterWorkspaceFrame() {
  const activeDestination = useAppStore(selectActiveDestination);
  const ActiveScreen = DESTINATION_SCREEN_MAP[activeDestination];

  return (
    <section className="shell-center-workspace" aria-label="Workspace">
      <div className="shell-center-workspace__inner">
        <ActiveScreen />
      </div>
    </section>
  );
}
