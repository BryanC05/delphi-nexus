import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WidgetShell from '@/components/WidgetShell';

type BioHazardProps = {
  location: { lat: number; lon: number } | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

type TaxonSuggestion = {
  id: string;
  name: string;
  rank: string;
  html: string;
};

const BioHazardWidget: React.FC<BioHazardProps> = ({ location, isCollapsed, onToggleCollapse, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'aqi' | 'bioscan'>('aqi');
  
  // AQI State
  const [aqi, setAqi] = useState<any>(null);
  const [aqiLoading, setAqiLoading] = useState(true);

  // Bio-Scanner State
  const [searchQuery, setSearchQuery] = useState('');
  const [taxonList, setTaxonList] = useState<TaxonSuggestion[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  // Fetch Air Pollution AQI
  useEffect(() => {
    const fetchAqi = async () => {
      setAqiLoading(true);
      if (!location || !import.meta.env.VITE_OPENWEATHER_API_KEY) {
        setAqiLoading(false);
        return;
      }
      try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${location.lat}&lon=${location.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`);
        setAqi(res.data.list[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setAqiLoading(false);
      }
    };
    fetchAqi();
  }, [location]);

  // Search species suggest on Catalogue of Life
  const handleBioSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setScanLoading(true);
    setScanError('');
    try {
      // Query Suggestion API from Catalogue of Life
      const response = await axios.get(`https://api.catalogueoflife.org/dataset/3LR/taxon/suggest?q=${encodeURIComponent(searchQuery)}`);
      setTaxonList(response.data.suggestions || response.data || []);
    } catch (err) {
      console.error('CoL API error:', err);
      setScanError('Failed to query Catalogue of Life registry.');
    } finally {
      setScanLoading(false);
    }
  };

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
    <WidgetShell
      title="BIO-HAZARD MONITOR"
      status={aqiLoading ? 'loading' : 'online'}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onRemove={onRemove}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 163, 224, 0.2)', paddingBottom: '8px', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('aqi')}
              style={{
                background: activeTab === 'aqi' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'aqi' ? '#000' : 'var(--text-muted)',
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
              ATMOSPHERE
            </button>
            <button 
              onClick={() => setActiveTab('bioscan')}
              style={{
                background: activeTab === 'bioscan' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'bioscan' ? '#000' : 'var(--text-muted)',
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
              BIO SCANNER (CoL)
            </button>
          </div>

          {/* AQI Tab */}
          {activeTab === 'aqi' && (
            <div>
              {aqiLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Scanning atmosphere...</div>
              ) : aqi ? (
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
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Atmospheric data offline (Location Coordinates Required).</div>
              )}
            </div>
          )}

          {/* BIO SCANNER Tab */}
          {activeTab === 'bioscan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <form onSubmit={handleBioSearch} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Taxon / Genus (e.g. Felis, Canis)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flexGrow: 1,
                    background: '#000',
                    border: '1px solid rgba(0, 163, 224, 0.3)',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-tech)',
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit"
                  style={{
                    background: 'rgba(0, 45, 98, 0.5)',
                    color: 'var(--p3r-blue-light)',
                    border: '1px solid var(--p3r-blue-light)',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-tech)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  SCAN
                </button>
              </form>

              {scanLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Accessing Catalogue of Life Node Registry...</div>}
              {scanError && <div style={{ color: '#fc8181', fontSize: '0.85rem' }}>{scanError}</div>}

              {!scanLoading && !scanError && taxonList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {taxonList.slice(0, 10).map((t, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(0, 45, 98, 0.2)',
                        borderLeft: '3px solid var(--p3r-blue-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontStyle: 'italic', fontWeight: 'bold' }}>
                        {t.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Rank: <span style={{ color: 'var(--p3r-blue-light)' }}>{t.rank}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!scanLoading && !scanError && searchQuery && taxonList.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No matching biological records detected.</div>
              )}
            </div>
          )}
        </div>
    </WidgetShell>
  );
};

export default BioHazardWidget;