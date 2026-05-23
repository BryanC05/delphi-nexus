import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playHoverSound, playClickSound } from './soundUtils';

type ApodData = {
  title: string;
  explanation: string;
  url: string;
  media_type: string;
};

type IntelProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const IntelWidget: React.FC<IntelProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [data, setData] = useState<ApodData | null>(null);
  const [fact, setFact] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchIntel = async () => {
      setIsLoading(true);

      // Fallback data in case the free APIs fail or get rate-limited
      const fallbackFact = "Astronauts say that space smells like hot metal, seared steak, and welding fumes.";
      const fallbackNasa = {
        title: "The Carina Nebula",
        explanation: "The Carina Nebula is one of the largest and brightest nebulas in the sky, located approximately 7,500 light-years away in the southern constellation Carina. It is a massive stellar nursery where stars are born and die.",
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/The_Carina_Nebula_in_infrared_light.jpg/800px-The_Carina_Nebula_in_infrared_light.jpg",
        media_type: "image"
      };

      try {
        const nasaRes = await axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=1');
        if (isMounted) setData(nasaRes.data[0] || fallbackNasa);
      } catch (error) {
        console.warn('NASA API rate-limited or failed, using fallback.');
        if (isMounted) setData(fallbackNasa);
      }

      try {
        const factRes = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');
        if (isMounted) setFact(factRes.data.text);
      } catch (error) {
        console.warn('Fun Fact API failed, using fallback.');
        if (isMounted) setFact(fallbackFact);
      }

      if (isMounted) setIsLoading(false);
    };
    fetchIntel();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', overflow: 'hidden' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Daily Intel</span>
          {!isLoading && <span className="api-indicator">API ONLINE</span>}
        </div>
        <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
        <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
      </h3>
      {!isCollapsed && (
        <div className="widget-content">
          {isLoading ? (
            <div style={{ color: 'var(--text-muted)' }}>Decrypting datastreams...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {fact && (
                <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '12px', borderLeft: '2px solid var(--accent-color)', borderRadius: '0 4px 4px 0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', marginBottom: '4px' }}>DID YOU KNOW?</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{fact}</div>
                </div>
              )}
              {data && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', marginBottom: '8px', textTransform: 'uppercase' }}>DEEP SPACE FEED: {data.title}</div>
                  {data.media_type === 'image' ? (
                    <img src={data.url} alt={data.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--card-border)', marginBottom: '8px' }} />
                  ) : data.media_type === 'video' ? (
                    <iframe src={data.url} title={data.title} frameBorder="0" allowFullScreen style={{ width: '100%', height: '140px', borderRadius: '4px', border: '1px solid var(--card-border)', marginBottom: '8px' }} />
                  ) : null}
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? undefined : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', transition: 'all 0.3s ease' }}>
                    {data.explanation}
                  </p>
                  <button 
                    onClick={() => { playClickSound(); setIsExpanded(!isExpanded); }} 
                    onMouseEnter={playHoverSound} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontSize: '0.75rem', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-tech)', marginTop: '8px', textTransform: 'uppercase' }}
                  >
                    {isExpanded ? '[ READ LESS ]' : '[ READ MORE ]'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelWidget;