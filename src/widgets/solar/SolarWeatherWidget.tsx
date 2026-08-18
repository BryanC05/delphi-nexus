import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playHoverSound } from '@/shared/soundUtils';

type SolarProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const SolarWeatherWidget: React.FC<SolarProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [kIndex, setKIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    axios.get('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')
      .then(res => {
        if (isMounted && res.data && res.data.length > 1) {
          // Search backwards to find the most recent valid K-index, skipping empty/invalid entries
          for (let i = res.data.length - 1; i > 0; i--) {
            const parsedK = parseFloat(res.data[i][1]);
            if (!isNaN(parsedK)) {
              setKIndex(parsedK);
              break;
            }
          }
        }
      })
      .catch(e => console.error(e))
      .finally(() => { if(isMounted) setIsLoading(false) });
    return () => { isMounted = false; };
  }, []);

  const getStatus = (k: number) => {
    if (k < 4) return { text: 'NORMAL', color: '#48bb78' };
    if (k === 4) return { text: 'ACTIVE', color: '#ecc94b' };
    return { text: 'GEOMAGNETIC STORM', color: '#fc8181' };
  };

  return (
    <div className="widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Solar Weather</span>
          {!isLoading && kIndex !== null && <span className="api-indicator">API ONLINE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
        </div>
      </h3>
      {!isCollapsed && (
        <div className="widget-content">
          {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Measuring solar radiation...</div> : kIndex !== null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px', borderLeft: `4px solid ${getStatus(kIndex).color}` }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'var(--font-tech)', color: getStatus(kIndex).color, textShadow: `0 0 10px ${getStatus(kIndex).color}80` }}>Kp {kIndex}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-tech)' }}>PLANETARY K-INDEX</span><span style={{ fontSize: '1rem', color: getStatus(kIndex).color, fontWeight: 'bold' }}>{getStatus(kIndex).text}</span></div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)' }}>Solar telemetry offline.</div>}
        </div>
      )}
    </div>
  );
};
export default SolarWeatherWidget;