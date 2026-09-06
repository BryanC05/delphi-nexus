import { useEffect, useState } from 'react';
import { applyTheme, DEFAULT_THEME, THEMES } from '@/config/themes';

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState(() => {
    const version = localStorage.getItem('themeVersion');
    if (version !== '1999') {
      localStorage.setItem('themeVersion', '1999');
      localStorage.setItem('activeTheme', DEFAULT_THEME);
      return DEFAULT_THEME;
    }
    return localStorage.getItem('activeTheme') || DEFAULT_THEME;
  });

  useEffect(() => {
    applyTheme(activeTheme);
    localStorage.setItem('activeTheme', activeTheme);
  }, [activeTheme]);

  const resolveThemeName = (arg: string): string | undefined => {
    const themeMap: Record<string, string> = {
      storm: 'Storm',
      pavlov: 'St. Pavlov Foundation',
      manus: 'Manus Vindicta',
      vertin: "Vertin's Suitcase",
      delphi: 'Delphi Blue',
      matrix: 'Matrix Green',
      neon: 'Neon Cyan',
      alert: 'Alert Red',
      purple: 'Deep Purple',
    };
    return themeMap[arg.toLowerCase()] || THEMES.find((t) => t.name.toLowerCase().includes(arg.toLowerCase()))?.name;
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
