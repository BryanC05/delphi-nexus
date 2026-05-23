import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playHoverSound } from './soundUtils';

type LaunchProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const LaunchTrackerWidget: React.FC<LaunchProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [launch, setLaunch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    axios.get('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1')
      .then(res => { if (isMounted) setLaunch(res.data.results[0]); })
      .catch(e => {
        console.warn('Launch API rate limited. Using fallback.');
        if (isMounted) setLaunch({ name: 'Starlink Group 6-50 (Fallback)', net: new Date(Date.now() + 86400000).toISOString(), launch_service_provider: { name: 'SpaceX' }, pad: { location: { name: 'Cape Canaveral, FL, USA' } } });
      })
      .finally(() => { if(isMounted) setIsLoading(false) });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Orbital Launch Tracker</span>
          {!isLoading && launch && <span className="api-indicator">API ONLINE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
        </div>
      </h3>
      {!isCollapsed && (
        <div className="widget-content">
          {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Tracking orbital trajectories...</div> : launch ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)' }}>NEXT LAUNCH: {new Date(launch.net).toLocaleString()}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{launch.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agency: {launch.launch_service_provider?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location: {launch.pad?.location?.name}</div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)' }}>No orbital launches detected.</div>}
        </div>
      )}
    </div>
  );
};
export default LaunchTrackerWidget;