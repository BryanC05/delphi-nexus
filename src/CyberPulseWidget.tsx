import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playHoverSound, playClickSound } from './soundUtils';

type Story = {
  id: number; title: string; score: number; url: string;
};

type CyberPulseProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const CyberPulseWidget: React.FC<CyberPulseProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHN = async () => {
      try {
        const res = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topIds = res.data.slice(0, 5);
        const storyPromises = topIds.map((id: number) => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`));
        const storyRes = await Promise.all(storyPromises);
        if (isMounted) setStories(storyRes.map(r => r.data));
      } catch (e) { console.error(e); } finally { if (isMounted) setIsLoading(false); }
    };
    fetchHN();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Cyber Pulse</span>
          {!isLoading && stories.length > 0 && <span className="api-indicator">API ONLINE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
        </div>
      </h3>
      {!isCollapsed && (
        <div className="widget-content">
          {isLoading ? <div style={{ color: 'var(--text-muted)' }}>Tapping into the mainframe...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stories.map(story => (
                <a key={story.id} href={story.url} target="_blank" rel="noreferrer" onClick={playClickSound} onMouseEnter={playHoverSound} style={{ textDecoration: 'none', display: 'flex', gap: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px solid transparent', transition: 'all 0.2s ease', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', fontSize: '0.8rem', minWidth: '40px', textAlign: 'right' }}>^{story.score}</span>
                  <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.3' }}>{story.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CyberPulseWidget;