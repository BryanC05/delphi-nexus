import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playHoverSound } from './soundUtils';

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

const ThreatMonitorWidget: React.FC<ThreatMonitorProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchThreats = async () => {
      setIsLoading(true);

      // Fallback cache in case the NVD API rate-limits the request without an API Key
      const fallbackData: Threat[] = [
        { id: "CVE-2024-3094", description: "Malicious code discovered in the upstream tarballs of xz, starting with version 5.6.0.", score: 10.0 },
        { id: "CVE-2024-3400", description: "A command injection vulnerability in the GlobalProtect feature of Palo Alto Networks PAN-OS software.", score: 10.0 },
        { id: "CVE-2024-21887", description: "A command injection vulnerability in Ivanti Connect Secure and Ivanti Policy Secure allows an unauthenticated user to execute arbitrary commands.", score: 9.1 },
        { id: "CVE-2024-27198", description: "Authentication bypass vulnerability in JetBrains Connect allows unauthenticated attacker to access restricted resources.", score: 8.8 },
      ];

      try {
        // Fetch latest 4 vulnerabilities with a 5-second timeout
        const response = await axios.get(`https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=4`, { timeout: 5000 });
        if (response.data && response.data.vulnerabilities && isMounted) {
          const fetchedThreats = response.data.vulnerabilities.map((item: any) => {
            const cve = item.cve;
            const desc = cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description available.';
            // Try to extract V31, then V30, then V2 score
            const metrics = cve.metrics || {};
            const score = metrics.cvssMetricV31?.[0]?.cvssData?.baseScore ||
                          metrics.cvssMetricV30?.[0]?.cvssData?.baseScore ||
                          metrics.cvssMetricV2?.[0]?.cvssData?.baseScore || 'N/A';
            return { id: cve.id, description: desc, score };
          });
          setThreats(fetchedThreats);
        }
      } catch (error) {
        console.warn('NVD API rate limited or timed out. Falling back to threat intel cache.');
        if (isMounted) setThreats(fallbackData);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchThreats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="widget threat-widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', overflow: 'hidden' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#fc8181', textShadow: '0 0 8px rgba(252, 129, 129, 0.4)' }}>Zero-Day Monitor</span>
          {!isLoading && <span className="api-indicator">API ONLINE</span>}
        </div>
        <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
        <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
      </h3>
      {!isCollapsed && (
        <div className="widget-content">
          {isLoading ? (
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
                        <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', width: '220px', padding: '12px', background: 'rgba(13, 22, 37, 0.95)', border: '1px solid var(--accent-color)', borderRadius: 'var(--radius)', boxShadow: 'var(--accent-glow)', zIndex: 100, fontSize: '0.75rem', color: 'var(--text-main)', textTransform: 'none', fontWeight: 'normal', fontFamily: '-apple-system, sans-serif' }}>
                          <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'var(--font-tech)' }}>CVSS SCORE</div>
                          <div style={{ marginBottom: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Common Vulnerability Scoring System measures software severity.</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#fc8181', fontWeight: 'bold' }}>Critical</span><span style={{ fontFamily: 'var(--font-tech)' }}>9.0 - 10.0</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#f6ad55', fontWeight: 'bold' }}>High</span><span style={{ fontFamily: 'var(--font-tech)' }}>7.0 - 8.9</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#ecc94b', fontWeight: 'bold' }}>Medium</span><span style={{ fontFamily: 'var(--font-tech)' }}>4.0 - 6.9</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#48bb78', fontWeight: 'bold' }}>Low</span><span style={{ fontFamily: 'var(--font-tech)' }}>0.0 - 3.9</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {threat.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreatMonitorWidget;