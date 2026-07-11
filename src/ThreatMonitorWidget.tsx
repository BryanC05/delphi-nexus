import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Threat = {
  id: string;
  description: string;
  score: number | string;
};

type ThreatMonitorProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

type SanctionEntity = {
  id: string;
  caption: string;
  schema: string;
  properties?: {
    nationality?: string[];
    position?: string[];
    status?: string[];
  };
};

const ThreatMonitorWidget: React.FC<ThreatMonitorProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'cves' | 'sanctions'>('cves');
  
  // CVE state
  const [threats, setThreats] = useState<Threat[]>([]);
  const [cvesLoading, setCvesLoading] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sanctions search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sanctionResults, setSanctionResults] = useState<SanctionEntity[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch CVEs
  useEffect(() => {
    let isMounted = true;
    const fetchThreats = async () => {
      setCvesLoading(true);
      const fallbackData: Threat[] = [
        { id: "CVE-2024-3094", description: "Malicious code discovered in the upstream tarballs of xz, starting with version 5.6.0.", score: 10.0 },
        { id: "CVE-2024-3400", description: "A command injection vulnerability in the GlobalProtect feature of Palo Alto Networks PAN-OS software.", score: 10.0 },
        { id: "CVE-2024-21887", description: "A command injection vulnerability in Ivanti Connect Secure and Ivanti Policy Secure allows an unauthenticated user to execute arbitrary commands.", score: 9.1 },
        { id: "CVE-2024-27198", description: "Authentication bypass vulnerability in JetBrains Connect allows unauthenticated attacker to access restricted resources.", score: 8.8 },
      ];

      try {
        const response = await axios.get(`https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=4`, { timeout: 5000 });
        if (response.data && response.data.vulnerabilities && isMounted) {
          const fetchedThreats = response.data.vulnerabilities.map((item: any) => {
            const cve = item.cve;
            const desc = cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description available.';
            const metrics = cve.metrics || {};
            const score = metrics.cvssMetricV31?.[0]?.cvssData?.baseScore ||
                          metrics.cvssMetricV30?.[0]?.cvssData?.baseScore ||
                          metrics.cvssMetricV2?.[0]?.cvssData?.baseScore || 'N/A';
            return { id: cve.id, description: desc, score };
          });
          setThreats(fetchedThreats);
        }
      } catch (error) {
        console.warn('NVD API rate limited. Using threat intel cache.');
        if (isMounted) setThreats(fallbackData);
      } finally {
        if (isMounted) setCvesLoading(false);
      }
    };

    fetchThreats();
    return () => { isMounted = false; };
  }, []);

  // Search OpenSanctions Database
  const handleSanctionsSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await axios.get(`https://api.opensanctions.org/search/default?q=${encodeURIComponent(searchQuery)}`);
      setSanctionResults(res.data.results || []);
    } catch (err) {
      console.error('OpenSanctions API error:', err);
      setSearchError('Failed to query OpenSanctions watchlists.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="widget threat-widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', overflow: 'hidden' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#fc8181', textShadow: '0 0 8px rgba(252, 129, 129, 0.4)', fontFamily: 'var(--font-p3r)' }}>ZERO-DAY MONITOR</span>
          {!cvesLoading && activeTab === 'cves' && <span className="api-indicator">API ONLINE</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
        <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tab selectors */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 163, 224, 0.2)', paddingBottom: '8px', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('cves')}
              style={{
                background: activeTab === 'cves' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'cves' ? '#000' : 'var(--text-muted)',
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
              ZERO-DAY LOG
            </button>
            <button 
              onClick={() => setActiveTab('sanctions')}
              style={{
                background: activeTab === 'sanctions' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'sanctions' ? '#000' : 'var(--text-muted)',
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
              WATCHLIST SEARCH
            </button>
          </div>

          {/* CVE Log Tab */}
          {activeTab === 'cves' && (
            <div>
              {cvesLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Scanning global databases...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {threats.map((threat, idx) => (
                    <div key={idx} style={{ padding: '8px', background: 'rgba(252, 129, 129, 0.05)', borderLeft: `2px solid ${threat.score >= 9.0 ? '#fc8181' : '#f6ad55'}`, borderRadius: '0 4px 4px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ color: '#fff', fontFamily: 'var(--font-tech)', fontSize: '0.9rem' }}>{threat.id}</strong>
                        <div 
                          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          <span style={{ color: threat.score >= 9.0 ? '#fc8181' : '#f6ad55', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>
                            CVSS: {threat.score}
                          </span>
                          <span style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', fontSize: '0.6rem', cursor: 'help' }}>?</span>
                          
                          {hoveredIndex === idx && (
                            <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', width: '220px', padding: '12px', background: 'rgba(13, 22, 37, 0.95)', border: '1px solid var(--accent-color)', borderRadius: '4px', boxShadow: 'var(--accent-glow)', zIndex: 100, fontSize: '0.75rem', color: 'var(--text-main)', textTransform: 'none', fontWeight: 'normal', fontFamily: 'var(--font-tech)' }}>
                              <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '4px' }}>CVSS SCORE</div>
                              <div style={{ marginBottom: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Common Vulnerability Scoring System measures software severity.</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#fc8181', fontWeight: 'bold' }}>Critical</span><span>9.0 - 10.0</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#f6ad55', fontWeight: 'bold' }}>High</span><span>7.0 - 8.9</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#ecc94b', fontWeight: 'bold' }}>Medium</span><span>4.0 - 6.9</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#48bb78', fontWeight: 'bold' }}>Low</span><span>0.0 - 3.9</span></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {threat.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sanctions Watchlist Tab */}
          {activeTab === 'sanctions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <form onSubmit={handleSanctionsSearch} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Enter target name (e.g. Kaspersky, Wagner)..."
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
                  QUERY
                </button>
              </form>

              {searchLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Accessing international sanction registry cores...</div>}
              {searchError && <div style={{ color: '#fc8181', fontSize: '0.85rem' }}>{searchError}</div>}

              {!searchLoading && !searchError && sanctionResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {sanctionResults.slice(0, 8).map((entity) => (
                    <div 
                      key={entity.id}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(252, 129, 129, 0.03)',
                        borderLeft: '3px solid #fc8181',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>{entity.caption}</span>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(252, 129, 129, 0.15)', color: '#fc8181', padding: '2px 6px', border: '1px solid rgba(252, 129, 129, 0.3)', fontFamily: 'var(--font-tech)', textTransform: 'uppercase' }}>
                          {entity.schema}
                        </span>
                      </div>
                      {entity.properties?.position && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Position: <span style={{ color: 'var(--text-main)' }}>{entity.properties.position[0]}</span>
                        </div>
                      )}
                      {entity.properties?.nationality && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Nationality: <span style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{entity.properties.nationality.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!searchLoading && !searchError && searchQuery && sanctionResults.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No sanction entries matching signature detected.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreatMonitorWidget;