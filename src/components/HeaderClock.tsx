import React, { useEffect, useState } from 'react';
import { playClickSound, playHoverSound } from '@/shared/soundUtils';

const POPULAR_TIMEZONES = [
  Intl.DateTimeFormat().resolvedOptions().timeZone,
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Seoul',
  'Australia/Sydney', 'Pacific/Auckland', 'Africa/Cairo', 'Africa/Johannesburg'
];

const UNIQUE_TIMEZONES = Array.from(new Set(POPULAR_TIMEZONES));

const HeaderClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  
  const [cities, setCities] = useState<string[]>(() => {
    const saved = localStorage.getItem('headerClockCities');
    if (saved) return JSON.parse(saved);
    return Array.from(new Set([
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      'America/New_York', 'Asia/Tokyo'
    ])).slice(0, 3); // Default 3 slots
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTime = (zone: string) => {
    try {
      return time.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch {
      return '--:--:--';
    }
  };
  
  const formatName = (tz: string) => {
    if (tz === Intl.DateTimeFormat().resolvedOptions().timeZone) return 'LOCAL';
    const parts = tz.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ').toUpperCase();
  };

  const handleCityChange = (index: number, newTz: string) => {
    const newCities = [...cities];
    newCities[index] = newTz;
    setCities(newCities);
    localStorage.setItem('headerClockCities', JSON.stringify(newCities));
    playClickSound();
  };

  return (
    <div className="header-clock" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--p3r-blue-dark)', padding: '10px 20px', borderLeft: '4px solid var(--p3r-blue-light)', boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
      {isEditing ? (
        <div className="header-clock-cities editing" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {cities.map((tz, idx) => (
            <select 
              key={idx} 
              value={tz} 
              onChange={e => handleCityChange(idx, e.target.value)} 
              onMouseEnter={playHoverSound}
              className="header-clock-city-select"
              style={{
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                border: '1px solid var(--p3r-blue-light)',
                padding: '4px 8px',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              {UNIQUE_TIMEZONES.map(opt => <option key={opt} value={opt} style={{ background: '#002D62', color: '#fff' }}>{formatName(opt)}</option>)}
            </select>
          ))}
        </div>
      ) : (
        <div className="header-clock-cities" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {cities.map((tz, idx) => (
            <div key={idx} className="header-clock-city" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--p3r-cyan)', fontSize: '0.65rem', fontFamily: 'var(--font-p3r)', textTransform: 'uppercase', letterSpacing: '1px' }}>{formatName(tz)}</span>
              <span style={{ color: '#fff', fontSize: '1.1rem', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{getTime(tz)}</span>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={() => { playClickSound(); setIsEditing(!isEditing); }}
        onMouseEnter={playHoverSound}
        style={{
          background: 'transparent',
          border: 'none',
          color: isEditing ? 'var(--p3r-cyan)' : 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          marginLeft: '8px'
        }}
        title="Edit Timezones"
      >
        {isEditing ? '✓' : '⚙'}
      </button>
    </div>
  );
};

export default HeaderClock;

