import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WeatherData, ForecastItem } from './types';

type WeatherWidgetProps = {
  location: { lat: number; lon: number } | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, isCollapsed, onToggleCollapse }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!process.env.REACT_APP_OPENWEATHER_API_KEY) return;

        const params: any = {
          appid: process.env.REACT_APP_OPENWEATHER_API_KEY,
          units: 'metric',
        };

        if (location) {
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
  }, [location]);

  if (!weather) return null;

  return (
    <div className="widget weather-widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)' }}>
        <span>Weather ({weather.name})</span>
        <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
      </h3>

      {!isCollapsed && (
        <>
          <div className="widget-content">
            <div className="weather-temp-container">
              {weather.weather[0]?.icon && (
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                  alt="weather icon" 
                  className="weather-icon-large" 
                />
              )}
              <span className="temp">{Math.round(weather.main.temp)}°C</span>
            </div>
            <span className="desc">{weather.weather[0]?.description}</span>
          </div>

          {forecast.length > 0 && (
            <div className="forecast-container">
              <h4 className="forecast-title">Upcoming (12 Hrs)</h4>
              <div className="forecast-list">
                {forecast.map((item, index) => {
                  const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={index} className="forecast-item">
                      <span className="forecast-time">{time}</span>
                      <span className="forecast-desc">
                        {item.weather[0]?.icon && (
                          <img 
                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
                            alt="forecast icon" 
                            className="weather-icon-small" 
                          />
                        )}
                        {item.weather[0]?.main}
                      </span>
                      <span className="forecast-temp">{Math.round(item.main.temp)}°C</span>
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