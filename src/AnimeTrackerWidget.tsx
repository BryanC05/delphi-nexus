import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { playHoverSound } from './soundUtils';

type AnimeMedia = {
  id: number;
  title: {
    romaji: string;
    english: string;
  };
  coverImage: {
    large: string;
  };
  episodes: number | null;
  format: string;
  status: string;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
  };
};

type AnimeTrackerWidgetProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const AnimeTrackerWidget: React.FC<AnimeTrackerWidgetProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [animeList, setAnimeList] = useState<AnimeMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to determine the "Next" season based on current date
  const getNextSeason = () => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    
    if (currentMonth >= 1 && currentMonth <= 3) return { season: 'SPRING', year: currentYear };
    if (currentMonth >= 4 && currentMonth <= 6) return { season: 'SUMMER', year: currentYear };
    if (currentMonth >= 7 && currentMonth <= 9) return { season: 'FALL', year: currentYear };
    return { season: 'WINTER', year: currentYear + 1 };
  };

  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);
      const { season, year } = getNextSeason();

      // AniList GraphQL Query
      const query = `
        query ($season: MediaSeason, $year: Int) {
          Page(page: 1, perPage: 12) {
            media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
              }
              episodes
              format
              status
              nextAiringEpisode {
                airingAt
                episode
              }
            }
          }
        }
      `;

      const variables = {
        season: season,
        year: year
      };

      try {
        const response = await axios.post('https://graphql.anilist.co', {
          query,
          variables
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        setAnimeList(response.data.data.Page.media);
      } catch (error) {
        console.error('Error fetching from AniList API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, []);

  const formatCountdown = (timestamp: number) => {
    const diff = timestamp * 1000 - Date.now();
    if (diff <= 0) return 'Aired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days`;
    
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${hours} hrs`;
  };

  const { season, year } = getNextSeason();

  return (
    <div className="widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: 0, borderBottom: isCollapsed ? 'none' : '2px solid var(--accent-color)', paddingBottom: isCollapsed ? 0 : '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>{season} {year} ANIME</span>
          <span className="api-indicator" style={{ background: 'var(--p3r-blue-light)', color: '#000', border: 'none' }}>ANILIST LINK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse} onMouseEnter={playHoverSound}>
            {isCollapsed ? '+' : '-'}
          </button>
          <button className="remove-btn" onClick={onRemove} onMouseEnter={playHoverSound}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
        <div className="widget-content" style={{ marginTop: '16px', flexGrow: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading AniList Data...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
              {animeList.map(anime => (
                <a 
                  key={anime.id} 
                  href={`https://anilist.co/anime/${anime.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
                  onMouseEnter={playHoverSound}
                >
                  <div style={{ position: 'relative', width: '100%', paddingTop: '140%', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                    <img 
                      src={anime.coverImage.large} 
                      alt={anime.title.english || anime.title.romaji} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {anime.nextAiringEpisode && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0, 45, 98, 0.9)', color: '#fff', fontSize: '0.7rem', padding: '4px', textAlign: 'center', fontFamily: 'var(--font-tech)', borderTop: '1px solid var(--p3r-blue-light)' }}>
                        Ep {anime.nextAiringEpisode.episode} in {formatCountdown(anime.nextAiringEpisode.airingAt)}
                      </div>
                    )}
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.85rem', fontFamily: 'var(--font-tech)', fontWeight: 'bold', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {anime.title.english || anime.title.romaji}
                  </div>
                  <div style={{ color: 'var(--p3r-blue-light)', fontSize: '0.7rem', fontFamily: 'var(--font-tech)', textTransform: 'uppercase' }}>
                    {anime.format} • {anime.episodes ? `${anime.episodes} EPS` : 'TBA'}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeTrackerWidget;