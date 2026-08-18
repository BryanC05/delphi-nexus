import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

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
  season: string;
  seasonYear: number;
  startDate?: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
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

const TRACKING_DATABASES = [
  { name: 'MyAnimeList (MAL)', url: 'https://myanimelist.net/', desc: 'Anime Ratings & Reviews' },
  { name: 'AniList', url: 'https://anilist.co/', desc: 'Sleek Anime Ratings & Reviews' },
  { name: 'Kitsu', url: 'https://kitsu.io/', desc: 'Modern Anime Tracking Platform' },
  { name: 'Anime-Planet', url: 'https://www.anime-planet.com/', desc: 'Anime & Manga database' },
  { name: 'Taiga', url: 'https://taiga.moe/', desc: 'Desktop Anime Tracking Program' },
  { name: 'Kuroiru', url: 'https://kuroiru.co/', desc: 'Anime Catalog & Hub' },
  { name: 'Anisearch', url: 'https://www.anisearch.com/', desc: 'Detailed Anime Info' },
  { name: 'AniDB', url: 'https://anidb.net/', desc: 'Anime Database for fans' },
  { name: 'ACDB', url: 'https://www.animecharactersdatabase.com/', desc: 'Anime Characters Database' }
];

const AnimeTrackerWidget: React.FC<AnimeTrackerWidgetProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  // Helper to determine the "Next" season based on current date
  const getNextSeason = () => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    
    if (currentMonth >= 1 && currentMonth <= 3) return { season: 'SPRING', year: currentYear };
    if (currentMonth >= 4 && currentMonth <= 6) return { season: 'SUMMER', year: currentYear };
    if (currentMonth >= 7 && currentMonth <= 9) return { season: 'FALL', year: currentYear };
    return { season: 'WINTER', year: currentYear + 1 };
  };

  const { season: defaultSeason, year: defaultYear } = getNextSeason();
  const [season, setSeason] = useState<string>(defaultSeason);
  const [year, setYear] = useState<number>(defaultYear);
  const [animeList, setAnimeList] = useState<AnimeMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const seasonDropdownRef = useRef<HTMLDivElement>(null);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(target)) {
        setSeasonDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(target)) {
        setYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);

      // AniList GraphQL Query
      const query = `
        query ($season: MediaSeason, $year: Int) {
          Page(page: 1, perPage: 50) {
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
              season
              seasonYear
              startDate {
                year
                month
                day
              }
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

        const rawMedia = response.data.data.Page.media || [];
        // Filter strictly to match the requested season and year, ensuring confirmed season release
        const filtered = rawMedia
          .filter((anime: any) => anime.season === season && anime.seasonYear === year)
          .slice(0, 30);
        setAnimeList(filtered);
      } catch (error) {
        console.error('Error fetching from AniList API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, [season, year]);

  const formatCountdown = (timestamp: number) => {
    const diff = timestamp * 1000 - Date.now();
    if (diff <= 0) return 'Aired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days`;
    
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${hours} hrs`;
  };

  const formatStartDate = (startDate: { year: number | null; month: number | null; day: number | null }) => {
    if (!startDate.year) return 'Date TBA';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (startDate.month && startDate.day) {
      return `Starts ${monthNames[startDate.month - 1]} ${startDate.day}, ${startDate.year}`;
    }
    if (startDate.month) {
      return `Starts ${monthNames[startDate.month - 1]} ${startDate.year}`;
    }
    return `Starts ${startDate.year}`;
  };

  return (
    <div className="widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: 0, borderBottom: isCollapsed ? 'none' : '2px solid var(--accent-color)', paddingBottom: isCollapsed ? 0 : '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>{season} {year} ANIME</span>
          <div ref={dropdownRef} className="custom-dropdown" style={{ minWidth: '180px', position: 'relative', zIndex: dropdownOpen ? 1002 : 1 }}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="custom-dropdown-trigger"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              <span className="custom-dropdown-value">TRACKING PROTOCOLS</span>
              <span className={`custom-dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
            </button>
            {dropdownOpen && (
              <ul className="custom-dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', zIndex: 1000, listStyle: 'none', padding: 0, margin: 0, background: '#000', border: '1px solid var(--p3r-blue-light)' }}>
                {TRACKING_DATABASES.map(db => (
                  <li 
                    key={db.name}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setHoveredDesc(db.desc)}
                    onMouseLeave={() => setHoveredDesc(null)}
                  >
                    <a 
                      href={db.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="custom-dropdown-item"
                      style={{ fontSize: '0.75rem', padding: '8px 12px', textDecoration: 'none', display: 'block', color: '#fff' }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {db.name}
                    </a>
                    
                    {/* Tooltip Popup description */}
                    {hoveredDesc === db.desc && (
                      <div style={{
                        position: 'absolute',
                        left: '105%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 15, 38, 0.98)',
                        border: '1px solid var(--p3r-blue-light)',
                        padding: '8px 12px',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-tech)',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 10px rgba(0, 163, 224, 0.4)',
                        zIndex: 99999,
                        pointerEvents: 'none'
                      }}>
                        {db.desc}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse}>
            {isCollapsed ? '+' : '-'}
          </button>
          <button className="remove-btn" onClick={onRemove}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
        <div className="widget-content" style={{ marginTop: '16px', flexGrow: 1 }}>
          
          {/* Controls Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(0, 163, 224, 0.1)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>SEASON:</span>
            
            {/* Custom Season Dropdown */}
            <div ref={seasonDropdownRef} className="custom-dropdown" style={{ minWidth: '130px', zIndex: seasonDropdownOpen ? 1001 : 1 }}>
              <button 
                onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)} 
                className="custom-dropdown-trigger"
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                <span className="custom-dropdown-value">{season}</span>
                <span className={`custom-dropdown-arrow ${seasonDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              {seasonDropdownOpen && (
                <ul className="custom-dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', zIndex: 1000, listStyle: 'none', padding: 0, margin: 0, background: '#000', border: '1px solid var(--p3r-blue-light)' }}>
                  {['WINTER', 'SPRING', 'SUMMER', 'FALL'].map(s => (
                    <li key={s}>
                      <button 
                        onClick={() => { setSeason(s); setSeasonDropdownOpen(false); }} 
                        className={`custom-dropdown-item ${season === s ? 'active' : ''}`}
                        style={{ width: '100%', border: 'none', textAlign: 'left', fontSize: '0.75rem', padding: '8px 12px', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>YEAR:</span>

            {/* Custom Year Dropdown */}
            <div ref={yearDropdownRef} className="custom-dropdown" style={{ minWidth: '100px', zIndex: yearDropdownOpen ? 1001 : 1 }}>
              <button 
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)} 
                className="custom-dropdown-trigger"
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                <span className="custom-dropdown-value">{year}</span>
                <span className={`custom-dropdown-arrow ${yearDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              {yearDropdownOpen && (
                <ul className="custom-dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', zIndex: 1000, listStyle: 'none', padding: 0, margin: 0, background: '#000', border: '1px solid var(--p3r-blue-light)' }}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                    <li key={y}>
                      <button 
                        onClick={() => { setYear(y); setYearDropdownOpen(false); }} 
                        className={`custom-dropdown-item ${year === y ? 'active' : ''}`}
                        style={{ width: '100%', border: 'none', textAlign: 'left', fontSize: '0.75rem', padding: '8px 12px', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                      >
                        {y}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {isLoading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading AniList Data...</div>
          ) : animeList.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontFamily: 'var(--font-tech)' }}>
              No confirmed anime schedule found for {season} {year}.
            </div>
          ) : (
            <div className="anime-scroll-container">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                {animeList.map(anime => (
                  <a 
                    key={anime.id} 
                    href={`https://anilist.co/anime/${anime.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative', width: '100%', paddingTop: '140%', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                      <img 
                        src={anime.coverImage.large} 
                        alt={anime.title.english || anime.title.romaji} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {anime.nextAiringEpisode ? (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0, 45, 98, 0.9)', color: '#fff', fontSize: '0.7rem', padding: '4px', textAlign: 'center', fontFamily: 'var(--font-tech)', borderTop: '1px solid var(--p3r-blue-light)' }}>
                          Ep {anime.nextAiringEpisode.episode} in {formatCountdown(anime.nextAiringEpisode.airingAt)}
                        </div>
                      ) : anime.startDate && anime.startDate.year ? (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0, 45, 98, 0.9)', color: '#fff', fontSize: '0.7rem', padding: '4px', textAlign: 'center', fontFamily: 'var(--font-tech)', borderTop: '1px solid var(--p3r-blue-light)' }}>
                          {formatStartDate(anime.startDate)}
                        </div>
                      ) : null}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeTrackerWidget;