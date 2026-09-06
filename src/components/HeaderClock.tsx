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
    <div className="header-clock r1999-chronograph">
      <div className="r1999-chrono-icon-wrap" title="Chronograph Telemetry">
        <span className="r1999-chrono-glyph">⧗</span>
      </div>

      {isEditing ? (
        <div className="header-clock-cities editing">
          {cities.map((tz, idx) => (
            <select
              key={idx}
              value={tz}
              onChange={(e) => handleCityChange(idx, e.target.value)}
              onMouseEnter={playHoverSound}
              className="r1999-select"
            >
              {UNIQUE_TIMEZONES.map((opt) => (
                <option key={opt} value={opt}>
                  {formatName(opt)}
                </option>
              ))}
            </select>
          ))}
        </div>
      ) : (
        <div className="header-clock-cities">
          {cities.map((tz, idx) => (
            <div key={idx} className="header-clock-city r1999-chrono-cell">
              <span className="r1999-chrono-label">{formatName(tz)}</span>
              <span className="r1999-chrono-time">{getTime(tz)}</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          playClickSound();
          setIsEditing(!isEditing);
        }}
        onMouseEnter={playHoverSound}
        className="r1999-btn-icon r1999-chrono-edit"
        title={isEditing ? 'Save Chronograph Configuration' : 'Adjust Chronograph Dials'}
      >
        {isEditing ? '✓' : '⚙'}
      </button>
    </div>
  );
};

export default HeaderClock;

