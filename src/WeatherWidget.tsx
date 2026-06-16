import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WeatherData, ForecastItem } from './types';
import { playClickSound, playHoverSound } from './soundUtils';

type WeatherWidgetProps = {
  location: { lat: number; lon: number } | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, isCollapsed, onToggleCollapse, onRemove }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  
  const refreshInterval = parseInt(localStorage.getItem('weatherRefreshInterval') || '60', 10);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!process.env.REACT_APP_OPENWEATHER_API_KEY) return;

        const params: any = {
          appid: process.env.REACT_APP_OPENWEATHER_API_KEY,
          units: 'metric',
        };

        if (activeLocation) {
          params.q = activeLocation;
        } else if (location) {
          params.lat = location.lat;
          params.lon = location.lon;
        } else {
          params.q = 'New York'; // fallback
        }

        // Fetch both current weather and the 5-day/3-hour forecast concurrently
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather`, { params }),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast`, { params }),
        ]);

        setWeather(weatherRes.data);
        setForecast(forecastRes.data.list.slice(0, 4)); // Grab the next 12 hours (4 * 3-hour intervals)
      } catch (error) {
        console.error('Error fetching weather:', error);
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

  if (!weather) return null;

  return (
    <div className="widget weather-widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '2px solid var(--accent-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>WEATHER ({weather.name})</span>
          <span className="api-indicator" style={{ background: 'var(--p3r-blue-light)', color: '#000', border: 'none' }}>ONLINE</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
          <>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ENTER LOCATION..."
                style={{
                  flexGrow: 1,
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  borderLeft: '4px solid var(--p3r-blue-light)',
                  color: '#fff',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-tech)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <button 
                type="submit"
                onMouseEnter={playHoverSound}
                style={{
                  background: 'var(--p3r-blue-dark)',
                  color: '#fff',
                  border: 'none',
                  borderLeft: '4px solid var(--p3r-blue-light)',
                  padding: '8px 15px',
                  fontFamily: 'var(--font-p3r)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                SEARCH
              </button>
              {activeLocation && (
                <button 
                  type="button"
                  onClick={resetLocation}
                  onMouseEnter={playHoverSound}
                  style={{
                    background: 'transparent',
                    color: '#fc8181',
                    border: '1px solid #fc8181',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-p3r)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  RESET
                </button>
              )}
            </form>

            <div className="widget-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--p3r-blue-dark)', padding: '20px', borderLeft: '8px solid var(--p3r-blue-light)', boxShadow: '4px 4px 0px rgba(0,0,0,0.3)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {weather.weather[0]?.icon && (
                    <img 
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                      alt="weather icon" 
                      style={{ width: '70px', height: '70px', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))' }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '700', fontFamily: 'var(--font-tech)', color: 'var(--accent-color)', lineHeight: '1', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>{Math.round(weather.main.temp)}°C</span>
                    <span style={{ textTransform: 'uppercase', color: 'var(--text-main)', letterSpacing: '1px', fontSize: '1rem', marginTop: '8px' }}>{weather.weather[0]?.description}</span>
                  </div>
                </div>
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
                          <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt="forecast icon" style={{ width: '50px', height: '50px' }} />
                        )}
                        <span className="forecast-temp">{Math.round(item.main.temp)}°C</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{item.weather[0]?.main}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
      )}
    </div>
  );
};

export default WeatherWidget;