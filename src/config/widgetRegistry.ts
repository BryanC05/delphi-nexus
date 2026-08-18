import { lazy, type LazyExoticComponent, type FC } from 'react';
import type { WidgetShellProps } from '@/shared/types';

export type WidgetId =
  | 'weather'
  | 'anime'
  | 'bio'
  | 'solar'
  | 'launch'
  | 'cyber'
  | 'threats'
  | 'intel'
  | 'morse'
  | 'language';

export type WidgetDefinition = {
  id: WidgetId;
  label: string;
  fullWidth?: boolean;
  requiresLocation?: boolean;
  Component: LazyExoticComponent<FC<WidgetShellProps>>;
};

export const WIDGET_REGISTRY: Record<WidgetId, WidgetDefinition> = {
  weather: {
    id: 'weather',
    label: 'Weather',
    requiresLocation: true,
    Component: lazy(() => import('@/widgets/weather/WeatherWidget')),
  },
  anime: {
    id: 'anime',
    label: 'Anime Tracker (Next Season)',
    fullWidth: true,
    Component: lazy(() => import('@/widgets/anime/AnimeTrackerWidget')),
  },
  bio: {
    id: 'bio',
    label: 'Bio-Hazard Monitor',
    requiresLocation: true,
    Component: lazy(() => import('@/widgets/bio/BioHazardWidget')),
  },
  solar: {
    id: 'solar',
    label: 'Solar Weather',
    Component: lazy(() => import('@/widgets/solar/SolarWeatherWidget')),
  },
  launch: {
    id: 'launch',
    label: 'Cosmic Monitor',
    Component: lazy(() => import('@/widgets/launch/CosmicMonitorWidget')),
  },
  cyber: {
    id: 'cyber',
    label: 'Cyber Pulse',
    Component: lazy(() => import('@/widgets/cyber/CyberPulseWidget')),
  },
  threats: {
    id: 'threats',
    label: 'Zero-Day Monitor',
    Component: lazy(() => import('@/widgets/threats/ThreatMonitorWidget')),
  },
  intel: {
    id: 'intel',
    label: 'Daily Intel',
    Component: lazy(() => import('@/widgets/intel/IntelWidget')),
  },
  morse: {
    id: 'morse',
    label: 'Morse Code Station',
    Component: lazy(() => import('@/widgets/morse/MorseWidget')),
  },
  language: {
    id: 'language',
    label: 'Linguistic Dialects',
    Component: lazy(() => import('@/widgets/language/LanguageWidget')),
  },
};

export const DEFAULT_WIDGETS: WidgetId[] = [
  'weather',
  'anime',
  'bio',
  'solar',
  'launch',
  'cyber',
  'threats',
  'intel',
  'morse',
  'language',
];

export const WIDGET_OPTIONS = DEFAULT_WIDGETS.map((id) => ({
  id,
  label: WIDGET_REGISTRY[id].label,
}));
