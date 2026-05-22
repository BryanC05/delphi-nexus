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

export type ExchangeRateHistory = {
  date: string;
  rate: number;
};

export type CryptoData = {
  bitcoin: { usd: number };
  ethereum: { usd: number };
};