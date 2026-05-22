import React, { useEffect, useState } from 'react';
import { playClickSound, playHoverSound } from './soundUtils';

type ClockCity = { tz: string };

const POPULAR_TIMEZONES = [
  Intl.DateTimeFormat().resolvedOptions().timeZone,
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Seoul',
  'Australia/Sydney', 'Pacific/Auckland', 'Africa/Cairo', 'Africa/Johannesburg'
];

const UNIQUE_TIMEZONES = Array.from(new Set(POPULAR_TIMEZONES));

type WorldClockProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const WorldClockWidget: React.FC<WorldClockProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [time, setTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [cities, setCities] = useState<ClockCity[]>(() => 
    JSON.parse(localStorage.getItem('clockCities') || JSON.stringify([{ tz: UNIQUE_TIMEZONES[0] }, { tz: 'America/New_York' }, { tz: 'Europe/London' }, { tz: 'Asia/Tokyo' }]))
  );

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTime = (zone: string) => {
    return time.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatName = (tz: string) => {
    if (tz === Intl.DateTimeFormat().resolvedOptions().timeZone) return 'LOCAL';
    const parts = tz.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ').toUpperCase();
  };

  const handleCityChange = (index: number, newTz: string) => {
    const newCities = [...cities];
    newCities[index].tz = newTz;
    setCities(newCities);
    localStorage.setItem('clockCities', JSON.stringify(newCities));
    playClickSound();
  };

  return (
    <div className="widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)' }}>
        <span>Global TimeSync</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isCollapsed && (
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'var(--font-tech)' }}
              onClick={() => { playClickSound(); setIsEditing(!isEditing); }}
              onMouseEnter={playHoverSound}
            >
              {isEditing ? 'DONE' : 'EDIT'}
            </button>
          )}
          <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
        </div>
      </h3>
      {!isCollapsed && (
        isEditing ? (
          <div className="widget-content" style={{ gap: '12px' }}>
            {cities.map((city, idx) => (
              <select key={idx} value={city.tz} onChange={e => handleCityChange(idx, e.target.value)} className="news-category-select" onMouseEnter={playHoverSound}>
                {UNIQUE_TIMEZONES.map(tz => <option key={tz} value={tz}>{formatName(tz)}</option>)}
              </select>
            ))}
          </div>
        ) : (
          <div className="widget-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {cities.map((city, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-tech)', textTransform: 'uppercase' }}>{formatName(city.tz)}</span>
                <span style={{ color: 'var(--accent-color)', fontSize: '1.4rem', fontFamily: 'var(--font-tech)', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>
                  {getTime(city.tz)}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default WorldClockWidget;