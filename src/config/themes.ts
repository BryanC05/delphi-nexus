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
    name: 'Storm',
    hex: '#c5a059',
    rgb: '197, 160, 89',
    bgColor: '#0d0f14',
    cardBg: 'rgba(18, 22, 31, 0.85)',
    cardBorder: 'rgba(197, 160, 89, 0.5)',
    textMuted: '#a8a090',
    blueDark: '#131824',
    blueLight: '#c5a059',
    cyan: '#e5c57b',
  },
  {
    name: 'St. Pavlov Foundation',
    hex: '#d4af37',
    rgb: '212, 175, 55',
    bgColor: '#091317',
    cardBg: 'rgba(12, 26, 32, 0.85)',
    cardBorder: 'rgba(212, 175, 55, 0.5)',
    textMuted: '#8ba8ad',
    blueDark: '#0e2329',
    blueLight: '#3ba39c',
    cyan: '#e2cb76',
  },
  {
    name: 'Manus Vindicta',
    hex: '#e5a970',
    rgb: '229, 169, 112',
    bgColor: '#14090b',
    cardBg: 'rgba(32, 12, 16, 0.85)',
    cardBorder: 'rgba(229, 169, 112, 0.5)',
    textMuted: '#d4a3a9',
    blueDark: '#280e14',
    blueLight: '#c93b48',
    cyan: '#f4b886',
  },
  {
    name: "Vertin's Suitcase",
    hex: '#d6a75c',
    rgb: '214, 167, 92',
    bgColor: '#15120e',
    cardBg: 'rgba(30, 24, 19, 0.85)',
    cardBorder: 'rgba(214, 167, 92, 0.5)',
    textMuted: '#bfae95',
    blueDark: '#231c15',
    blueLight: '#d6a75c',
    cyan: '#edd59e',
  },
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

export const DEFAULT_THEME = 'Storm';

export function applyTheme(themeName: string): void {
  const theme = THEMES.find((t) => t.name === themeName) || THEMES[0];
  document.documentElement.style.setProperty('--accent-color', theme.hex);
  document.documentElement.style.setProperty(
    '--accent-glow',
    `0 0 16px rgba(${theme.rgb}, 0.35), inset 0 0 10px rgba(${theme.rgb}, 0.08)`
  );
  document.documentElement.style.setProperty('--bg-color', theme.bgColor);
  document.documentElement.style.setProperty('--card-bg', theme.cardBg);
  document.documentElement.style.setProperty('--card-border', theme.cardBorder);
  document.documentElement.style.setProperty('--text-muted', theme.textMuted);
  document.documentElement.style.setProperty('--p3r-blue-dark', theme.blueDark);
  document.documentElement.style.setProperty('--p3r-blue-light', theme.blueLight);
  document.documentElement.style.setProperty('--p3r-cyan', theme.cyan);
  document.documentElement.style.setProperty('--bg-pattern-color', `rgba(${theme.rgb}, 0.06)`);
}
