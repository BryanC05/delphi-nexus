import { useEffect, useState } from 'react';
import axios from 'axios';
import WidgetShell from '@/components/WidgetShell';
import './weather.css';
import type { ForecastItem, WeatherData, WidgetShellProps } from '@/shared/types';
import { playClickSound, playHoverSound } from '@/shared/soundUtils';

export default function WeatherWidget({
  location,
  isCollapsed,
  onToggleCollapse,
  onRemove,
}: WidgetShellProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const refreshInterval = parseInt(localStorage.getItem('weatherRefreshInterval') || '60', 10);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        if (!import.meta.env.VITE_OPENWEATHER_API_KEY) {
          setIsLoading(false);
          return;
        }

        const params: Record<string, string | number> = {
          appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
          units: 'metric',
        };

        if (activeLocation) {
          params.q = activeLocation;
        } else if (location) {
          params.lat = location.lat;
          params.lon = location.lon;
        } else {
          params.q = 'New York';
        }

        const [weatherRes, forecastRes] = await Promise.all([
          axios.get('https://api.openweathermap.org/data/2.5/weather', { params }),
          axios.get('https://api.openweathermap.org/data/2.5/forecast', { params }),
        ]);

        setWeather(weatherRes.data);
        setForecast(forecastRes.data.list.slice(0, 4));
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();

    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchWeather, refreshInterval * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [location, activeLocation, refreshInterval]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playClickSound();
      setActiveLocation(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const resetLocation = () => {
    playClickSound();
    setActiveLocation(null);
    setSearchQuery('');
  };

  const title = weather ? `Weather (${weather.name})` : 'Weather';

  return (
    <WidgetShell
      title={title}
      className="weather-widget"
      status={isLoading ? 'loading' : 'online'}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onRemove={onRemove}
    >
      {isLoading && !weather ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Syncing atmospheric telemetry...</div>
      ) : !weather ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Add <code>VITE_OPENWEATHER_API_KEY</code> to your .env file.
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ENTER LOCATION..."
              aria-label="Search weather location"
              style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: 'none', borderLeft: '4px solid var(--p3r-blue-light)', color: '#fff', padding: '8px 12px', fontFamily: 'var(--font-tech)', outline: 'none', fontSize: '0.9rem' }}
            />
            <button type="submit" onMouseEnter={playHoverSound} className="news-search-button" style={{ width: 'auto' }}>
              SEARCH
            </button>
            {activeLocation && (
              <button type="button" onClick={resetLocation} onMouseEnter={playHoverSound} style={{ background: 'transparent', color: '#fc8181', border: '1px solid #fc8181', padding: '8px 12px', cursor: 'pointer' }}>
                RESET
              </button>
            )}
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--p3r-blue-dark)', padding: '20px', borderLeft: '8px solid var(--p3r-blue-light)', marginBottom: '16px' }}>
            {weather.weather[0]?.icon && (
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} alt="" style={{ width: '70px', height: '70px' }} />
            )}
            <div>
              <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-color)' }}>{Math.round(weather.main.temp)}°C</span>
              <div style={{ textTransform: 'uppercase', marginTop: '8px' }}>{weather.weather[0]?.description}</div>
            </div>
          </div>
          {forecast.length > 0 && (
            <div className="forecast-container">
              <h4 className="forecast-title">Upcoming (12 Hrs)</h4>
              <div className="forecast-row">
                {forecast.map((item, index) => {
                  const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={index} className="forecast-card">
                      <span className="forecast-time">{time}</span>
                      {item.weather[0]?.icon && (
                        <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt="" style={{ width: '50px', height: '50px' }} />
                      )}
                      <span className="forecast-temp">{Math.round(item.main.temp)}°C</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </WidgetShell>
  );
}
