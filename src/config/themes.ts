export type Theme = {
  name: string;
  hex: string;
  rgb: string;
  bgColor: string;
  cardBg: string;
  cardBorder: string;
  textMuted: string;
  blueDark: string;
  blueLight: string;
  cyan: string;
};

export const THEMES: Theme[] = [
  {
    name: 'Delphi Blue',
    hex: '#00A3E0',
    rgb: '0, 163, 224',
    bgColor: '#000c1d',
    cardBg: 'rgba(0, 45, 98, 0.7)',
    cardBorder: '#00A3E0',
    textMuted: '#b0d4ff',
    blueDark: '#002D62',
    blueLight: '#00A3E0',
    cyan: '#00e5ff',
  },
  {
    name: 'Neon Cyan',
    hex: '#00f0ff',
    rgb: '0, 240, 255',
    bgColor: '#001015',
    cardBg: 'rgba(0, 30, 40, 0.7)',
    cardBorder: '#00f0ff',
    textMuted: '#80f8ff',
    blueDark: '#001e28',
    blueLight: '#00f0ff',
    cyan: '#00a3e0',
  },
  {
    name: 'Matrix Green',
    hex: '#00ff41',
    rgb: '0, 255, 65',
    bgColor: '#001202',
    cardBg: 'rgba(0, 38, 8, 0.7)',
    cardBorder: '#00ff41',
    textMuted: '#80ff9a',
    blueDark: '#002608',
    blueLight: '#00ff41',
    cyan: '#58ff00',
  },
  {
    name: 'Alert Red',
    hex: '#ff003c',
    rgb: '255, 0, 60',
    bgColor: '#170005',
    cardBg: 'rgba(60, 0, 15, 0.7)',
    cardBorder: '#ff003c',
    textMuted: '#ffb0c1',
    blueDark: '#3c000f',
    blueLight: '#ff003c',
    cyan: '#ff5c8a',
  },
  {
    name: 'Deep Purple',
    hex: '#b026ff',
    rgb: '176, 38, 255',
    bgColor: '#0c0017',
    cardBg: 'rgba(38, 0, 60, 0.7)',
    cardBorder: '#b026ff',
    textMuted: '#ebc8ff',
    blueDark: '#26003c',
    blueLight: '#b026ff',
    cyan: '#df80ff',
  },
];

export const DEFAULT_THEME = 'Delphi Blue';

export function applyTheme(themeName: string): void {
  const theme = THEMES.find((t) => t.name === themeName) || THEMES[0];
  document.documentElement.style.setProperty('--accent-color', theme.hex);
  document.documentElement.style.setProperty(
    '--accent-glow',
    `0 0 10px rgba(${theme.rgb}, 0.3), inset 0 0 10px rgba(${theme.rgb}, 0.05)`
  );
  document.documentElement.style.setProperty('--bg-color', theme.bgColor);
  document.documentElement.style.setProperty('--card-bg', theme.cardBg);
  document.documentElement.style.setProperty('--card-border', theme.cardBorder);
  document.documentElement.style.setProperty('--text-muted', theme.textMuted);
  document.documentElement.style.setProperty('--p3r-blue-dark', theme.blueDark);
  document.documentElement.style.setProperty('--p3r-blue-light', theme.blueLight);
  document.documentElement.style.setProperty('--p3r-cyan', theme.cyan);
  document.documentElement.style.setProperty('--bg-pattern-color', `rgba(${theme.rgb}, 0.05)`);
}
