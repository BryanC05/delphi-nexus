import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WidgetShell from '@/components/WidgetShell';

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

  const widgetStatus = isLoading ? 'loading' : kIndex !== null ? 'online' : 'offline';

  return (
    <WidgetShell
      title="SOLAR TELEMETRY"
      status={widgetStatus}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onRemove={onRemove}
    >
      {isLoading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Measuring solar radiation...</div>
      ) : kIndex !== null ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.25)', padding: '14px 18px', borderLeft: `4px solid ${getStatus(kIndex).color}` }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: getStatus(kIndex).color, textShadow: `0 0 10px ${getStatus(kIndex).color}80` }}>Kp {kIndex}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>PLANETARY K-INDEX</span>
            <span style={{ fontSize: '1rem', color: getStatus(kIndex).color, fontWeight: 'bold', fontFamily: 'var(--font-tech)' }}>{getStatus(kIndex).text}</span>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Solar telemetry offline.</div>
      )}
    </WidgetShell>
  );
};
export default SolarWeatherWidget;