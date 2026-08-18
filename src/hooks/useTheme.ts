import { useEffect, useState } from 'react';
import { applyTheme, DEFAULT_THEME, THEMES } from '@/config/themes';

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState(
    () => localStorage.getItem('activeTheme') || DEFAULT_THEME
  );

  useEffect(() => {
    applyTheme(activeTheme);
    localStorage.setItem('activeTheme', activeTheme);
  }, [activeTheme]);

  const resolveThemeName = (arg: string): string | undefined => {
    const themeMap: Record<string, string> = {
      matrix: 'Matrix Green',
      neon: 'Neon Cyan',
      alert: 'Alert Red',
      purple: 'Deep Purple',
    };
    return themeMap[arg] || THEMES.find((t) => t.name.toLowerCase().includes(arg))?.name;
  };

  return { activeTheme, setActiveTheme, themes: THEMES, resolveThemeName };
}

export function useUiMode() {
  const [uiMode, setUiMode] = useState<'p3r' | 'classic'>(() => {
    return (localStorage.getItem('uiMode') as 'p3r' | 'classic') || 'p3r';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-mode', uiMode);
    localStorage.setItem('uiMode', uiMode);
  }, [uiMode]);

  return { uiMode, setUiMode };
}
