import React, { useEffect, useState } from 'react';

const UNIQUE_TIMEZONES = Array.from(new Set([
  Intl.DateTimeFormat().resolvedOptions().timeZone,
  'America/New_York', 'Asia/Tokyo'
]));

const HeaderClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

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

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'var(--p3r-blue-dark)', padding: '10px 20px', borderLeft: '4px solid var(--p3r-blue-light)', boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
      {UNIQUE_TIMEZONES.map((tz, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--p3r-cyan)', fontSize: '0.65rem', fontFamily: 'var(--font-p3r)', textTransform: 'uppercase', letterSpacing: '1px' }}>{formatName(tz)}</span>
          <span style={{ color: '#fff', fontSize: '1.1rem', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{getTime(tz)}</span>
        </div>
      ))}
    </div>
  );
};

export default HeaderClock;
