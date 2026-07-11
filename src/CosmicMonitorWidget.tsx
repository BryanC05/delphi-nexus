import React, { useEffect, useState } from 'react';
import axios from 'axios';

type CosmicProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

type ISSData = {
  lat: string;
  lon: string;
  velocity: number;
  altitude: number;
};

type APODData = {
  title: string;
  url: string;
  explanation: string;
  media_type: string;
};

const CosmicMonitorWidget: React.FC<CosmicProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'launches' | 'iss' | 'apod'>('launches');
  
  // Launches State
  const [launch, setLaunch] = useState<any>(null);
  const [launchesLoading, setLaunchesLoading] = useState(true);

  // ISS State
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [issLoading, setIssLoading] = useState(true);

  // APOD State
  const [apodData, setAPODData] = useState<APODData | null>(null);
  const [apodLoading, setAPODLoading] = useState(true);

  // 1. Fetch upcoming launch
  useEffect(() => {
    let isMounted = true;
    axios.get('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1')
      .then(res => { if (isMounted) setLaunch(res.data.results[0]); })
      .catch(e => {
        console.warn('Launch API rate limited. Using fallback.');
        if (isMounted) setLaunch({ name: 'Starlink Group 10-3 (SpaceX)', net: new Date(Date.now() + 86400000).toISOString(), launch_service_provider: { name: 'SpaceX' }, pad: { location: { name: 'Cape Canaveral, FL, USA' } } });
      })
      .finally(() => { if (isMounted) setLaunchesLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch ISS coordinates (poll every 6 seconds when tab is active)
  useEffect(() => {
    if (activeTab !== 'iss') return;
    
    let isMounted = true;
    const getISS = () => {
      axios.get('https://api.wheretheiss.at/v1/satellites/25544')
        .then(res => {
          if (isMounted) {
            setIssData({
              lat: res.data.latitude.toFixed(4),
              lon: res.data.longitude.toFixed(4),
              velocity: Math.round(res.data.velocity),
              altitude: Math.round(res.data.altitude),
            });
            setIssLoading(false);
          }
        })
        .catch(err => {
          console.error('Error getting ISS position:', err);
          if (isMounted) {
            // Fallback coordinates if API fails
            setIssData({ lat: '51.5074', lon: '-0.1278', velocity: 27600, altitude: 420 });
            setIssLoading(false);
          }
        });
    };

    getISS();
    const interval = setInterval(getISS, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeTab]);

  // 3. Fetch APOD
  useEffect(() => {
    if (activeTab !== 'apod' || apodData) return; // Fetch once when tab is viewed

    let isMounted = true;
    axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
      .then(res => { if (isMounted) setAPODData(res.data); })
      .catch(e => {
        console.error('Error fetching NASA APOD:', e);
        if (isMounted) setAPODData({
          title: 'The Great Nebula in Orion (APOD Fallback)',
          url: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~thumb.jpg',
          explanation: 'The Orion Nebula is a diffuse nebula situated in the Milky Way, being south of Orions Belt in the constellation of Orion. It is one of the brightest nebulae and is visible to the naked eye.',
          media_type: 'image'
        });
      })
      .finally(() => { if (isMounted) setAPODLoading(false); });
    return () => { isMounted = false; };
  }, [activeTab, apodData]);

  return (
    <div className="widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--accent-color)', paddingBottom: isCollapsed ? 0 : '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>COSMIC MONITOR</span>
          <span className="api-indicator" style={{ background: 'var(--p3r-blue-light)', color: '#000', border: 'none' }}>ORBITAL SECURE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
        <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tab Selection Row */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 163, 224, 0.2)', paddingBottom: '8px', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('launches')}
              style={{
                background: activeTab === 'launches' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'launches' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              LAUNCHES
            </button>
            <button 
              onClick={() => setActiveTab('iss')}
              style={{
                background: activeTab === 'iss' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'iss' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              ISS TRACKER
            </button>
            <button 
              onClick={() => setActiveTab('apod')}
              style={{
                background: activeTab === 'apod' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'apod' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              NASA APOD
            </button>
          </div>

          {/* Launches Tab */}
          {activeTab === 'launches' && (
            <div>
              {launchesLoading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tracking orbital trajectories...</div>
              ) : launch ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-tech)' }}>
                    T-MINUS UPCOMING: {new Date(launch.net).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-tech)' }}>
                    {launch.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Agency: <span style={{ color: '#fff' }}>{launch.launch_service_provider?.name}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Launch Pad: <span style={{ color: '#fff' }}>{launch.pad?.location?.name}</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No launches detected.</div>
              )}
            </div>
          )}

          {/* ISS Tracker Tab */}
          {activeTab === 'iss' && (
            <div>
              {issLoading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Syncing orbital lock on ISS-25544...</div>
              ) : issData ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', background: 'rgba(0, 45, 98, 0.15)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LATITUDE</span>
                    <span style={{ fontSize: '1rem', color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{issData.lat}° N/S</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', background: 'rgba(0, 45, 98, 0.15)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LONGITUDE</span>
                    <span style={{ fontSize: '1rem', color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{issData.lon}° E/W</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', background: 'rgba(0, 45, 98, 0.15)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VELOCITY</span>
                    <span style={{ fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{issData.velocity.toLocaleString()} km/h</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', background: 'rgba(0, 45, 98, 0.15)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ALTITUDE</span>
                    <span style={{ fontSize: '1rem', color: '#fff', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{issData.altitude} km</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Failed to capture telemetry.</div>
              )}
            </div>
          )}

          {/* NASA APOD Tab */}
          {activeTab === 'apod' && (
            <div>
              {apodLoading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Downloading astronomical telemetry...</div>
              ) : apodData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {apodData.media_type === 'image' && (
                    <div style={{ width: '100%', height: '140px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                      <img 
                        src={apodData.url} 
                        alt={apodData.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-tech)' }}>
                    {apodData.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', maxHeight: '110px', overflowY: 'auto', paddingRight: '4px' }}>
                    {apodData.explanation}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Telemetry unavailable.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CosmicMonitorWidget;
