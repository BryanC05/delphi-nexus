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
  type: 'anime' | 'tv' | 'movie';
};

type MediaRadarProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const MediaRadarWidget: React.FC<MediaRadarProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [anime, setAnime] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'anime' | 'tv' | 'movies'>('anime');

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      let pendingRequests = 2; // Anime and TV are default
      try {
        // Fetch Anime (Jikan API)
        axios.get('https://api.jikan.moe/v4/seasons/upcoming?limit=12').then(res => {
          const animeData = res.data.data.filter((item: any) => item.images?.jpg?.image_url).map((item: any) => ({
            id: item.mal_id,
            title: item.title,
            imageUrl: item.images.jpg.image_url,
            summary: item.synopsis || 'No database entry available.',
            date: item.aired?.string || 'Upcoming',
            type: 'anime',
          }));
          setAnime(animeData);
        }).catch(e => console.error('Anime API Error:', e));

        // Fetch Popular TV Shows & Upcoming Movies (TMDB API)
        const tmdbToken = process.env.REACT_APP_TMDB_ACCESSTOKEN;
        const tmdbKey = process.env.REACT_APP_TMDB_API_KEY;
        
        if (tmdbToken || tmdbKey) {
          const headers = tmdbToken ? { Authorization: `Bearer ${tmdbToken}` } : {};
          const params = tmdbKey ? { api_key: tmdbKey } : {};
          
          axios.get('https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1', { headers, params })
            .then(res => {
              const movieData = res.data.results.filter((item: any) => item.poster_path).map((item: any) => ({
                id: item.id,
                title: item.title,
                imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                summary: item.overview || 'No database entry available.',
                date: `Releasing: ${item.release_date}`,
                type: 'movie',
              }));
              setMovies(movieData.slice(0, 12));
            })
            .catch(e => console.error('TMDB API Error:', e));

          axios.get('https://api.themoviedb.org/3/tv/popular?language=en-US&page=1', { headers, params })
            .then(res => {
              const tvData = res.data.results.filter((item: any) => item.poster_path).map((item: any) => ({
                id: item.id,
                title: item.name,
                imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                summary: item.overview || 'No database entry available.',
                date: `Rating: ${item.vote_average}/10`,
                type: 'tv',
              }));
              setTvShows(tvData.slice(0, 12));
            })
            .catch(e => console.error('TMDB TV API Error:', e));
        }

      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const displayData = activeTab === 'anime' ? anime : activeTab === 'tv' ? tvShows : movies;

  return (
    <>
      {/* Dashboard Widget View */}
      <div className="widget media-widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', overflow: 'hidden' }}>
        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)', paddingBottom: isCollapsed ? 0 : '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>Media Radar</span>
            {!isLoading && <span className="api-indicator">API ONLINE</span>}
          </div>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
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
                {movies.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={movies[0].imageUrl} alt="poster" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-color)' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)' }}>UPCOMING MOVIE</div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{movies[0]?.title}</div>
                    </div>
                  </div>
                )}
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
              <h3 className={`tab ${activeTab === 'tv' ? 'active' : ''}`} onClick={() => { playClickSound(); setActiveTab('tv'); }} onMouseEnter={playHoverSound}>Popular TV</h3>
              {movies.length > 0 && <h3 className={`tab ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => { playClickSound(); setActiveTab('movies'); }} onMouseEnter={playHoverSound}>Upcoming Movies</h3>}
            </div>

            <div className="media-grid">
              {displayData.map(item => (
                <div key={item.id} className="media-card" onMouseEnter={playHoverSound}>
                  <img src={item.imageUrl} alt={item.title} className="media-poster" />
                  <div className="media-info">
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h4>
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