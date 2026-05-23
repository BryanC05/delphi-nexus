import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playHoverSound } from './soundUtils';

type BioHazardProps = {
  location: { lat: number; lon: number } | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const BioHazardWidget: React.FC<BioHazardProps> = ({ location, isCollapsed, onToggleCollapse, onRemove }) => {
  const [aqi, setAqi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAqi = async () => {
      if (!location || !process.env.REACT_APP_OPENWEATHER_API_KEY) return;
      try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${location.lat}&lon=${location.lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`);
        setAqi(res.data.list[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAqi();
  }, [location]);

  const getAqiColor = (index: number) => {
    switch(index) {
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

  return (
    <div className="widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Bio-Hazard Monitor</span>
          {!isLoading && aqi && <span className="api-indicator">API ONLINE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
        </div>
      </h3>
      {!isCollapsed && (
        <div className="widget-content">
          {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Scanning atmosphere...</div> : aqi ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderLeft: `4px solid ${getAqiColor(aqi.main.aqi)}`, borderRadius: '4px' }}>
                <span style={{ fontFamily: 'var(--font-tech)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AIR QUALITY INDEX</span>
                <span style={{ fontFamily: 'var(--font-tech)', fontWeight: 'bold', color: getAqiColor(aqi.main.aqi), textShadow: `0 0 8px ${getAqiColor(aqi.main.aqi)}80` }}>{getAqiText(aqi.main.aqi)} ({aqi.main.aqi})</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-tech)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>CO:</span> <span style={{ color: 'var(--text-main)' }}>{aqi.components.co} μg/m3</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>O3:</span> <span style={{ color: 'var(--text-main)' }}>{aqi.components.o3} μg/m3</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>PM2.5:</span> <span style={{ color: 'var(--text-main)' }}>{aqi.components.pm2_5} μg/m3</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>NO2:</span> <span style={{ color: 'var(--text-main)' }}>{aqi.components.no2} μg/m3</span></div>
              </div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)' }}>Atmospheric data unavailable.</div>}
        </div>
      )}
    </div>
  );
};

export default BioHazardWidget;