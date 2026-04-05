import { useEffect, useMemo, useState } from 'react';
import '@/app/styles/shell.css';
import { APP_TITLE } from '@/app/config/appMeta';
import { selectPreferences, useAppStore } from '@/store';
import { CenterWorkspaceFrame } from '@/shell/components/CenterWorkspaceFrame';
import { LeftNavigationFrame } from '@/shell/components/LeftNavigationFrame';
import { RightInspectorFrame } from '@/shell/components/RightInspectorFrame';
import { TopBarFrame } from '@/shell/components/TopBarFrame';

export function App() {
  const preferences = useAppStore(selectPreferences);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const resolvedThemeMode = useMemo(() => {
    return preferences.themeMode === 'system' ? systemTheme : preferences.themeMode;
  }, [preferences.themeMode, systemTheme]);

  return (
    <div
      className="app-shell"
      data-app-title={APP_TITLE}
      data-theme={resolvedThemeMode}
      data-accent={preferences.accentPreference}
      data-backdrop={preferences.backgroundPreference}
      data-density={preferences.densityMode ?? 'comfortable'}
    >
      <TopBarFrame />
      <LeftNavigationFrame />
      <CenterWorkspaceFrame />
      <RightInspectorFrame />
    </div>
  );
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
