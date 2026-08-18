import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

type Story = {
  id: number;
  title: string;
  score: number;
  url: string;
};

type CyberPulseProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

type GridTask = {
  project: string;
  task: string;
  progress: number;
  status: string;
  eta: string;
};

type DNSAnswer = {
  name: string;
  type: number;
  TTL: number;
  data: string;
};

const CyberPulseWidget: React.FC<CyberPulseProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'grid' | 'dns'>('news');
  
  // Hacker News State
  const [stories, setStories] = useState<Story[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // BOINC Grid Simulation State
  const [gridSpeed, setGridSpeed] = useState(142.8);
  const [activeNodes, setActiveNodes] = useState(184204);
  const [gridTasks, setGridTasks] = useState<GridTask[]>([
    { project: 'Rosetta@Home', task: 'COVID-19 Spike Protein Docking', progress: 64.2, status: 'RUNNING', eta: '02h 14m' },
    { project: 'Einstein@Home', task: 'Pulsar Search in Gamma-ray Data', progress: 28.9, status: 'RUNNING', eta: '05h 41m' },
    { project: 'LHC@Home', task: 'SixTrack Simulation in Accelerator', progress: 91.5, status: 'UPLOADING', eta: '00h 02m' },
    { project: 'World Community Grid', task: 'Cancer Markers Mapping', progress: 0.0, status: 'WAITING', eta: '08h 10m' }
  ]);

  // DNS Resolver State
  const [domainQuery, setDomainQuery] = useState('');
  const [dnsType, setDnsType] = useState('A');
  const [dnsTypeDropdownOpen, setDnsTypeDropdownOpen] = useState(false);
  const dnsTypeRef = useRef<HTMLDivElement>(null);
  const [dnsAnswers, setDnsAnswers] = useState<DNSAnswer[]>([]);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState('');

  // Fetch Hacker News
  useEffect(() => {
    let isMounted = true;
    const fetchHN = async () => {
      setNewsLoading(true);
      try {
        const res = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topIds = res.data.slice(0, 5);
        const storyPromises = topIds.map((id: number) => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`));
        const storyRes = await Promise.all(storyPromises);
        if (isMounted) setStories(storyRes.map(r => r.data));
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setNewsLoading(false);
      }
    };
    fetchHN();
    return () => { isMounted = false; };
  }, []);

  // Update BOINC tasks progress
  useEffect(() => {
    if (activeTab !== 'grid') return;
    
    const interval = setInterval(() => {
      setGridSpeed(prev => parseFloat((prev + (Math.random() * 0.4 - 0.2)).toFixed(2)));
      setActiveNodes(prev => prev + Math.floor(Math.random() * 11 - 5));

      setGridTasks(prev => 
        prev.map(task => {
          if (task.status === 'RUNNING') {
            const nextProgress = parseFloat((task.progress + Math.random() * 0.5).toFixed(1));
            if (nextProgress >= 100) {
              return { ...task, progress: 100, status: 'COMPLETED', eta: '00h 00m' };
            }
            return { ...task, progress: nextProgress };
          }
          return task;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Click outside for DNS type dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dnsTypeRef.current && !dnsTypeRef.current.contains(event.target as Node)) {
        setDnsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Query Cloudflare DoH JSON API
  const handleDNSResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainQuery.trim()) return;

    setDnsLoading(true);
    setDnsError('');
    setDnsAnswers([]);

    try {
      const res = await axios.get(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domainQuery)}&type=${dnsType}`,
        {
          headers: {
            'Accept': 'application/dns-json'
          }
        }
      );
      if (res.data.Answer) {
        setDnsAnswers(res.data.Answer);
      } else {
        setDnsError('No records found for the specified domain/type.');
      }
    } catch (err) {
      console.error('DNS query error:', err);
      setDnsError('Failed to contact secure DNS resolver.');
    } finally {
      setDnsLoading(false);
    }
  };

  return (
    <div className="widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--accent-color)', paddingBottom: isCollapsed ? 0 : '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>CYBER PULSE</span>
          {!newsLoading && activeTab === 'news' && <span className="api-indicator">API ONLINE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
        <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 163, 224, 0.2)', paddingBottom: '8px', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('news')}
              style={{
                background: activeTab === 'news' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'news' ? '#000' : 'var(--text-muted)',
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
              NEWS FEED
            </button>
            <button 
              onClick={() => setActiveTab('grid')}
              style={{
                background: activeTab === 'grid' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'grid' ? '#000' : 'var(--text-muted)',
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
              GRID MONITOR
            </button>
            <button 
              onClick={() => setActiveTab('dns')}
              style={{
                background: activeTab === 'dns' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'dns' ? '#000' : 'var(--text-muted)',
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
              DNS RESOLVER
            </button>
          </div>

          {/* Hacker News Tab */}
          {activeTab === 'news' && (
            <div>
              {newsLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Tapping into the mainframe...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stories.map(story => (
                    <a 
                      key={story.id} 
                      href={story.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ textDecoration: 'none', display: 'flex', gap: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px solid transparent', transition: 'all 0.2s ease', alignItems: 'center' }}
                    >
                      <span style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', fontSize: '0.8rem', minWidth: '40px', textAlign: 'right' }}>^{story.score}</span>
                      <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.3' }}>{story.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOINC Grid Telemetry Tab */}
          {activeTab === 'grid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(0, 45, 98, 0.15)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GLOBAL COMPUTING POWER</div>
                  <div style={{ fontSize: '1.1rem', color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{gridSpeed} PetaFLOPS</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(0, 45, 98, 0.15)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ACTIVE COMPUTE NODES</div>
                  <div style={{ fontSize: '1.1rem', color: '#fff', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>{activeNodes.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', borderBottom: '1px solid rgba(0, 163, 224, 0.1)', paddingBottom: '4px' }}>
                  ACTIVE BOINC WORKUNITS
                </div>
                {gridTasks.map((t, idx) => (
                  <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '8px', borderLeft: `3px solid ${t.status === 'RUNNING' ? 'var(--p3r-blue-light)' : 'var(--text-muted)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>
                      <span>{t.project}</span>
                      <span style={{ fontSize: '0.7rem', color: t.status === 'RUNNING' ? 'var(--p3r-blue-light)' : 'var(--text-muted)' }}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 6px 0' }}>Task: {t.task}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flexGrow: 1, height: '4px', background: '#000', border: '1px solid rgba(0, 163, 224, 0.2)' }}>
                        <div style={{ width: `${t.progress}%`, height: '100%', background: 'var(--p3r-blue-light)', boxShadow: '0 0 6px var(--p3r-blue-light)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#fff', fontFamily: 'var(--font-tech)', minWidth: '35px', textAlign: 'right' }}>{t.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cloudflare DoH DNS Resolver Tab */}
          {activeTab === 'dns' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <form onSubmit={handleDNSResolve} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Enter domain (e.g. google.com)..."
                  value={domainQuery}
                  onChange={(e) => setDomainQuery(e.target.value)}
                  style={{
                    flexGrow: 1,
                    background: '#000',
                    border: '1px solid rgba(0, 163, 224, 0.3)',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-tech)',
                    outline: 'none',
                    minWidth: '150px'
                  }}
                />

                {/* Record Type Dropdown */}
                <div ref={dnsTypeRef} className="custom-dropdown" style={{ minWidth: '90px', zIndex: dnsTypeDropdownOpen ? 1001 : 1 }}>
                  <button 
                    type="button"
                    onClick={() => setDnsTypeDropdownOpen(!dnsTypeDropdownOpen)} 
                    className="custom-dropdown-trigger"
                    style={{ fontSize: '0.75rem', padding: '8px 12px', height: '100%', boxSizing: 'border-box' }}
                  >
                    <span className="custom-dropdown-value">{dnsType}</span>
                    <span className={`custom-dropdown-arrow ${dnsTypeDropdownOpen ? 'open' : ''}`}>▼</span>
                  </button>
                  {dnsTypeDropdownOpen && (
                    <ul className="custom-dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 1000, listStyle: 'none', padding: 0, margin: 0, background: '#000', border: '1px solid var(--p3r-blue-light)' }}>
                      {['A', 'AAAA', 'TXT', 'MX', 'CNAME'].map(type => (
                        <li key={type}>
                          <button 
                            type="button"
                            onClick={() => { setDnsType(type); setDnsTypeDropdownOpen(false); }} 
                            className={`custom-dropdown-item ${dnsType === type ? 'active' : ''}`}
                            style={{ width: '100%', border: 'none', textAlign: 'left', fontSize: '0.75rem', padding: '8px 12px', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                          >
                            {type}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

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
                  DIG
                </button>
              </form>

              {dnsLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Routing query through secure Cloudflare DNS-over-HTTPS...</div>}
              {dnsError && <div style={{ color: '#fc8181', fontSize: '0.85rem' }}>{dnsError}</div>}

              {!dnsLoading && !dnsError && dnsAnswers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', borderBottom: '1px solid rgba(0, 163, 224, 0.1)', paddingBottom: '4px' }}>
                    RESOLVED RECORD SET
                  </div>
                  {dnsAnswers.map((answer, idx) => (
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
                      <span style={{ fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all', fontFamily: 'var(--font-tech)' }}>
                        {answer.data}
                      </span>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        <span>NAME: <span style={{ color: 'var(--text-main)' }}>{answer.name}</span></span>
                        <span>TTL: <span style={{ color: 'var(--text-main)' }}>{answer.TTL}s</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CyberPulseWidget;