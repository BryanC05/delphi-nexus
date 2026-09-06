import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import WidgetShell from '@/components/WidgetShell';
import { playClickSound, playHoverSound } from '@/shared/soundUtils';

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

const ANILIST_GRAPHQL_QUERY = `
  query ($season: MediaSeason, $year: Int, $page: Int) {
    Page(page: $page, perPage: 28) {
      pageInfo {
        hasNextPage
        currentPage
        total
      }
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

const AnimeTrackerWidget: React.FC<AnimeTrackerWidgetProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const getNextSeason = () => {
    const currentMonth = new Date().getMonth() + 1;
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
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const seasonDropdownRef = useRef<HTMLDivElement>(null);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
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

  // Fetch page 1 whenever season or year changes
  useEffect(() => {
    let isCancelled = false;
    const fetchAnimeFirstPage = async () => {
      setIsLoading(true);
      setPage(1);
      try {
        const response = await axios.post(
          'https://graphql.anilist.co',
          {
            query: ANILIST_GRAPHQL_QUERY,
            variables: { season, year, page: 1 },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        if (isCancelled) return;
        const pageData = response.data?.data?.Page;
        const rawMedia: AnimeMedia[] = pageData?.media || [];
        setAnimeList(rawMedia);
        setHasMore(Boolean(pageData?.pageInfo?.hasNextPage && rawMedia.length >= 28));
      } catch (error) {
        console.error('Error fetching AniList seasonal data:', error);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchAnimeFirstPage();
    return () => {
      isCancelled = true;
    };
  }, [season, year]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    playClickSound();

    const nextPage = page + 1;
    try {
      const response = await axios.post(
        'https://graphql.anilist.co',
        {
          query: ANILIST_GRAPHQL_QUERY,
          variables: { season, year, page: nextPage },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const pageData = response.data?.data?.Page;
      const newMedia: AnimeMedia[] = pageData?.media || [];
      if (newMedia.length > 0) {
        setAnimeList((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const unique = newMedia.filter((a) => !existingIds.has(a.id));
          return [...prev, ...unique];
        });
        setPage(nextPage);
        setHasMore(Boolean(pageData?.pageInfo?.hasNextPage && newMedia.length >= 28));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more anime releases:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatCountdown = (timestamp: number) => {
    const diff = timestamp * 1000 - Date.now();
    if (diff <= 0) return 'Aired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d left`;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${hours}h left`;
  };

  const formatStartDate = (startDate: { year: number | null; month: number | null; day: number | null }) => {
    if (!startDate.year) return 'Date TBA';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (startDate.month && startDate.day) {
      return `${monthNames[startDate.month - 1]} ${startDate.day}, ${startDate.year}`;
    }
    if (startDate.month) {
      return `${monthNames[startDate.month - 1]} ${startDate.year}`;
    }
    return `${startDate.year}`;
  };

  const headerControls = (
    <div className="anime-header-selectors">
      {/* Season Selector */}
      <div ref={seasonDropdownRef} className="custom-dropdown anime-dropdown">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setSeasonDropdownOpen(!seasonDropdownOpen);
          }}
          onMouseEnter={playHoverSound}
          className="custom-dropdown-trigger anime-dropdown-trigger"
          aria-label="Select season"
        >
          <span className="custom-dropdown-value">{season}</span>
          <span className={`custom-dropdown-arrow ${seasonDropdownOpen ? 'open' : ''}`}>▼</span>
        </button>
        {seasonDropdownOpen && (
          <ul className="custom-dropdown-menu anime-dropdown-menu">
            {['WINTER', 'SPRING', 'SUMMER', 'FALL'].map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSeason(s);
                    setSeasonDropdownOpen(false);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`custom-dropdown-item ${season === s ? 'active' : ''}`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Year Selector */}
      <div ref={yearDropdownRef} className="custom-dropdown anime-dropdown anime-dropdown-year">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setYearDropdownOpen(!yearDropdownOpen);
          }}
          onMouseEnter={playHoverSound}
          className="custom-dropdown-trigger anime-dropdown-trigger"
          aria-label="Select year"
        >
          <span className="custom-dropdown-value">{year}</span>
          <span className={`custom-dropdown-arrow ${yearDropdownOpen ? 'open' : ''}`}>▼</span>
        </button>
        {yearDropdownOpen && (
          <ul className="custom-dropdown-menu anime-dropdown-menu">
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
              <li key={y}>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setYear(y);
                    setYearDropdownOpen(false);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`custom-dropdown-item ${year === y ? 'active' : ''}`}
                >
                  {y}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <WidgetShell
      title="SEASONAL ANIME"
      headerExtra={headerControls}
      status="online"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onRemove={onRemove}
    >
      <div className="anime-tracker-body">
        {isLoading ? (
          <div className="anime-loading-state">
            <span className="r1999-status-pulse" />
            SYNCHRONIZING ANILIST TELEMETRY...
          </div>
        ) : animeList.length === 0 ? (
          <div className="anime-empty-state">
            No confirmed anime broadcasts registered for {season} {year}.
          </div>
        ) : (
          <>
            <div className="anime-grid-4x7">
              {animeList.map((anime) => (
                <a
                  key={anime.id}
                  href={`https://anilist.co/anime/${anime.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anime-card"
                  onMouseEnter={playHoverSound}
                >
                  <div className="anime-cover-wrap">
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.english || anime.title.romaji}
                      className="anime-cover-img"
                      loading="lazy"
                    />
                    {anime.nextAiringEpisode ? (
                      <div className="anime-airing-badge">
                        EP {anime.nextAiringEpisode.episode} • {formatCountdown(anime.nextAiringEpisode.airingAt)}
                      </div>
                    ) : anime.startDate && anime.startDate.year ? (
                      <div className="anime-airing-badge">
                        {formatStartDate(anime.startDate)}
                      </div>
                    ) : (
                      <div className="anime-airing-badge">
                        {anime.status ? anime.status.replace(/_/g, ' ') : 'TBA'}
                      </div>
                    )}
                  </div>
                  <div className="anime-title" title={anime.title.english || anime.title.romaji}>
                    {anime.title.english || anime.title.romaji}
                  </div>
                  <div className="anime-meta">
                    {anime.format || 'TV'} • {anime.episodes ? `${anime.episodes} EPS` : 'TBA'}
                  </div>
                </a>
              ))}
            </div>

            {hasMore && (
              <div className="anime-load-more-wrap">
                <button
                  type="button"
                  className="anime-load-more-btn"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  onMouseEnter={playHoverSound}
                >
                  {isLoadingMore ? (
                    <>
                      <span className="r1999-status-pulse" />
                      LOADING NEXT BATCH...
                    </>
                  ) : (
                    <>
                      <span className="btn-ornament">◈</span>
                      LOAD MORE RELEASES (+28)
                      <span className="btn-ornament">◈</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </WidgetShell>
  );
};

export default AnimeTrackerWidget;