import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playClickSound, playHoverSound } from './soundUtils';

type MediaItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  summary: string;
  date: string;
};

type MediaRadarProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const MediaRadarWidget: React.FC<MediaRadarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [anime, setAnime] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'anime' | 'tv'>('anime');

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        // Fetch Anime (Jikan API)
        axios.get('https://api.jikan.moe/v4/seasons/upcoming?limit=12').then(res => {
          const animeData = res.data.data.filter((item: any) => item.images?.jpg?.image_url).map((item: any) => ({
            id: item.mal_id,
            title: item.title,
            imageUrl: item.images.jpg.image_url,
            summary: item.synopsis || 'No database entry available.',
            date: item.aired?.string || 'Upcoming',
          }));
          setAnime(animeData);
        }).catch(e => console.error('Anime API Error:', e));

        // Fetch General TV Shows (TVMaze API - US Schedule for Today)
        axios.get('https://api.tvmaze.com/schedule?country=US').then(res => {
          const tvData = res.data.filter((item: any) => item.show && item.show.image).map((item: any) => ({
            id: item.id,
            title: item.show.name,
            subtitle: item.name, // Episode name
            imageUrl: item.show.image?.medium || item.show.image?.original,
            summary: item.show.summary?.replace(/<[^>]+>/g, '') || 'No database entry available.', // Strip HTML tags
            date: `Today at ${item.airtime}`,
          }));
          setTvShows(tvData);
        }).catch(e => console.error('TVMaze API Error:', e));

      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const displayData = activeTab === 'anime' ? anime : tvShows;

  return (
    <>
      {/* Dashboard Widget View */}
      <div className="widget media-widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', overflow: 'hidden' }}>
        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
          <span>Media Radar</span>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
        </h3>
        
        {!isCollapsed && (
          <div className="widget-content">
            {isLoading && anime.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>Scanning frequencies...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {anime[0] && <img src={anime[0].imageUrl} alt="poster" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-color)' }} />}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)' }}>UPCOMING ANIME</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{anime[0]?.title}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {tvShows[0] && <img src={tvShows[0].imageUrl} alt="poster" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-color)' }} />}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)' }}>AIRING TODAY</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{tvShows[0]?.title}</div>
                  </div>
                </div>
                <button 
                  className="news-search-button" 
                  style={{ width: '100%', marginTop: '8px' }} 
                  onClick={() => { playClickSound(); setIsOverlayOpen(true); }}
                  onMouseEnter={playHoverSound}
                >
                  [ OPEN DATABASE ]
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pop-out Overlay Modal View */}
      {isOverlayOpen && (
        <div className="settings-overlay" onClick={() => setIsOverlayOpen(false)}>
          <div className="settings-panel media-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', textTransform: 'uppercase', letterSpacing: '2px' }}>Entertainment Databanks</h2>
              <button onClick={() => { playClickSound(); setIsOverlayOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--card-border)' }}>
              <h3 className={`tab ${activeTab === 'anime' ? 'active' : ''}`} onClick={() => { playClickSound(); setActiveTab('anime'); }} onMouseEnter={playHoverSound}>Upcoming Anime</h3>
              <h3 className={`tab ${activeTab === 'tv' ? 'active' : ''}`} onClick={() => { playClickSound(); setActiveTab('tv'); }} onMouseEnter={playHoverSound}>Airing TV Shows</h3>
            </div>

            <div className="media-grid">
              {displayData.map(item => (
                <div key={item.id} className="media-card" onMouseEnter={playHoverSound}>
                  <img src={item.imageUrl} alt={item.title} className="media-poster" />
                  <div className="media-info">
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h4>
                    {item.subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '4px', opacity: 0.8 }}>Eps: {item.subtitle}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', marginBottom: '8px' }}>{item.date}</div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default MediaRadarWidget;