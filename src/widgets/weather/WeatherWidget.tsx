import { useEffect, useState } from 'react';
import axios from 'axios';
import WidgetShell from '@/components/WidgetShell';
import './weather.css';
import type { AqiData, ForecastItem, WeatherData, WidgetShellProps } from '@/shared/types';
import { playClickSound, playHoverSound } from '@/shared/soundUtils';

const getAqiColor = (index: number) => {
  switch (index) {
    case 1: return '#48bb78'; // Green (Good)
    case 2: return '#ecc94b'; // Yellow (Fair)
    case 3: return '#ed8936'; // Orange (Moderate)
    case 4: return '#fc8181'; // Red (Poor)
    case 5: return '#9f7aea'; // Purple (Hazardous)
    default: return 'var(--text-muted)';
  }
};

const getAqiText = (index: number) => {
  return ['UNKNOWN', 'GOOD', 'FAIR', 'MODERATE', 'POOR', 'HAZARDOUS'][index] || 'UNKNOWN';
};

export default function WeatherWidget({
  location,
  isCollapsed,
  onToggleCollapse,
  onRemove,
}: WidgetShellProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [aqi, setAqi] = useState<AqiData | null>(null);
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

        const coord = weatherRes.data?.coord;
        if (coord && typeof coord.lat === 'number' && typeof coord.lon === 'number') {
          try {
            const aqiRes = await axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
              params: {
                lat: coord.lat,
                lon: coord.lon,
                appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
              },
            });
            setAqi(aqiRes.data?.list?.[0] || null);
          } catch (aqiErr) {
            console.error('Error fetching AQI:', aqiErr);
            setAqi(null);
          }
        } else {
          setAqi(null);
        }
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
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH SPATIAL COORDINATES..."
              aria-label="Search weather location"
              style={{
                flexGrow: 1,
                background: 'rgba(13, 16, 23, 0.85)',
                border: '1px solid var(--brass-border)',
                borderLeft: '3px solid var(--accent-color)',
                color: 'var(--text-main)',
                padding: '8px 14px',
                fontFamily: 'var(--font-serif)',
                outline: 'none',
                fontSize: '0.85rem',
                letterSpacing: '1px',
              }}
            />
            <button type="submit" onMouseEnter={playHoverSound} className="r1999-btn" style={{ padding: '8px 16px' }}>
              LOCATE
            </button>
            {activeLocation && (
              <button
                type="button"
                onClick={resetLocation}
                onMouseEnter={playHoverSound}
                className="r1999-btn-icon btn-remove"
                style={{ width: 'auto', padding: '0 12px', fontSize: '0.8rem' }}
                title="Reset to initial location"
              >
                RESET
              </button>
            )}
          </form>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              background: 'rgba(13, 16, 23, 0.75)',
              padding: '18px 20px',
              border: '1px solid var(--brass-border)',
              borderLeft: '4px solid var(--accent-color)',
              marginBottom: '16px',
            }}
          >
            {weather.weather[0]?.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt=""
                style={{ width: '64px', height: '64px', filter: 'sepia(30%)' }}
              />
            )}
            <div>
              <span style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--gold-light)', fontFamily: 'var(--font-mono)' }}>
                {Math.round(weather.main.temp)}°C
              </span>
              <div style={{ textTransform: 'uppercase', marginTop: '4px', fontFamily: 'var(--font-serif)', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                {weather.weather[0]?.description}
              </div>
            </div>
          </div>
          {aqi && (
            <div className="weather-aqi-container">
              <div className="weather-aqi-header">
                <div className="weather-aqi-label-wrap">
                  <span className="weather-aqi-title">Atmospheric AQI</span>
                  <span
                    className="weather-aqi-badge"
                    style={{
                      color: getAqiColor(aqi.main.aqi),
                      borderColor: getAqiColor(aqi.main.aqi),
                      boxShadow: `0 0 8px ${getAqiColor(aqi.main.aqi)}40`,
                    }}
                  >
                    {getAqiText(aqi.main.aqi)} ({aqi.main.aqi}/5)
                  </span>
                </div>
              </div>
              <div className="weather-aqi-metrics">
                <div className="weather-aqi-metric">
                  <span className="metric-name">PM2.5</span>
                  <span className="metric-val">
                    {aqi.components.pm2_5} <small>μg/m³</small>
                  </span>
                </div>
                <div className="weather-aqi-metric">
                  <span className="metric-name">PM10</span>
                  <span className="metric-val">
                    {aqi.components.pm10} <small>μg/m³</small>
                  </span>
                </div>
                <div className="weather-aqi-metric">
                  <span className="metric-name">O₃</span>
                  <span className="metric-val">
                    {aqi.components.o3} <small>μg/m³</small>
                  </span>
                </div>
                <div className="weather-aqi-metric">
                  <span className="metric-name">NO₂</span>
                  <span className="metric-val">
                    {aqi.components.no2} <small>μg/m³</small>
                  </span>
                </div>
              </div>
            </div>
          )}
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
