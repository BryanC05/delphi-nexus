export type NewsArticle = {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  sourceName: string;
};

export type WeatherData = {
  name: string;
  main: { temp: number };
  weather: { description: string; icon: string }[];
};

export type ForecastItem = {
  dt: number;
  main: { temp: number };
  weather: { description: string; main: string; icon: string }[];
  dt_txt: string;
};

export type GeoLocation = {
  lat: number;
  lon: number;
};

export type WidgetShellProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
  location?: GeoLocation | null;
};

export type WidgetStatus = 'online' | 'offline' | 'loading';
