import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { NewsArticle } from '@/shared/types';
import { playHoverSound, playClickSound } from '@/shared/soundUtils';

type NewsFeedProps = {
  countryCode: string;
  onNewsUpdate?: (articles: NewsArticle[]) => void;
  searchTrigger?: { query: string; ts: number } | null;
};

const NewsFeed: React.FC<NewsFeedProps> = ({ countryCode, onNewsUpdate, searchTrigger }) => {
  const newsHeaderRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasKeys, setHasKeys] = useState<boolean>(true);
  
  // Basic Cache to avoid 429s
  const lastFetchRef = useRef<{ key: string; timestamp: number } | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Persistent Search & Category from LocalStorage
  const [activeQuery, setActiveQuery] = useState<string>(() => localStorage.getItem('newsQuery') || '');
  const [queryInput, setQueryInput] = useState<string>(activeQuery);
  const [category, setCategory] = useState<string>(() => localStorage.getItem('newsCategory') || 'general');
  
  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>(() => JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');
  const [newsMode, setNewsMode] = useState<'global' | 'indonesia'>(() => (localStorage.getItem('newsMode') as any) || 'global');

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const fallbackCountryRef = useRef<string | null>(null);
  const [prevCountryCode, setPrevCountryCode] = useState<string>(countryCode);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Derived state pattern: Reset pagination if the country location prop changes
  if (countryCode !== prevCountryCode) {
    setPrevCountryCode(countryCode);
    setPage(1);
    fallbackCountryRef.current = null;
  }

  // Save preferences to localStorage
  useEffect(() => { localStorage.setItem('newsCategory', category); }, [category]);
  useEffect(() => { 
    localStorage.setItem('newsQuery', activeQuery); 
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('newsMode', newsMode);
  }, [activeQuery, bookmarks, newsMode]);

  useEffect(() => {
    if (searchTrigger) {
      setQueryInput(searchTrigger.query);
      setActiveQuery(searchTrigger.query);
      setPage(1);
      fallbackCountryRef.current = null;
      setActiveTab('feed');
    }
  }, [searchTrigger]);

  const categories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'];

  useEffect(() => {
    const fetchNews = async () => {
      const fetchKey = `${countryCode}-${category}-${activeQuery}-${page}-${newsMode}`;
      // Avoid fetching if same request was made in the last 10 seconds
      if (lastFetchRef.current?.key === fetchKey && Date.now() - lastFetchRef.current.timestamp < 10000) {
        return;
      }

      setIsLoading(true);
      try {
        if (!import.meta.env.VITE_NEWSAPI_API_KEY && !import.meta.env.VITE_MEDIASTACK_API_KEY) {
          setHasKeys(false);
          setIsLoading(false);
          return;
        } else {
          setHasKeys(true);
        }

        const fetchArticlesForCountry = async (country: string) => {
          const newsApiParams: any = { apiKey: import.meta.env.VITE_NEWSAPI_API_KEY, country, category, page, pageSize: 20 };
          if (activeQuery) newsApiParams.q = activeQuery;

          const isProd = import.meta.env.PROD;
          const newsApiBaseUrl = isProd ? '/api/newsapi' : 'https://newsapi.org/v2';
          const mediastackBaseUrl = isProd ? '/api/mediastack' : 'http://api.mediastack.com/v1';

          const newsApiPromise = import.meta.env.VITE_NEWSAPI_API_KEY
            ? axios.get(`${newsApiBaseUrl}/top-headlines`, {
                params: newsApiParams,
              })
            : Promise.resolve({ data: { articles: [] } });

          const mediastackParams: any = { access_key: import.meta.env.VITE_MEDIASTACK_API_KEY, countries: country, categories: category, offset: (page - 1) * 20, limit: 20 };
          if (activeQuery) mediastackParams.keywords = activeQuery;

          const mediastackPromise = import.meta.env.VITE_MEDIASTACK_API_KEY
            ? axios.get(`${mediastackBaseUrl}/news`, {
                params: mediastackParams,
              })
            : Promise.resolve({ data: { data: [] } });

          const [newsApiResponse, mediastackResponse] = await Promise.all([
            newsApiPromise.catch(e => { console.error('NewsAPI Error', e.response?.data || e.message); return { data: { articles: [] } }; }),
            mediastackPromise.catch(e => { console.error('Mediastack Error', e.response?.data || e.message); return { data: { data: [] } }; }),
          ]);

          const newsApiArticles: NewsArticle[] = (newsApiResponse.data.articles || []).map((a: any) => ({
            title: a.title,
            description: a.description,
            url: a.url,
            imageUrl: a.urlToImage,
            publishedAt: a.publishedAt,
            sourceName: a.source?.name || 'NewsAPI',
          }));

          const mediastackArticles: NewsArticle[] = (mediastackResponse.data.data || []).map((a: any) => ({
            title: a.title,
            description: a.description,
            url: a.url,
            imageUrl: a.image,
            publishedAt: a.published_at,
            sourceName: a.source || 'Mediastack',
          }));

          return [...newsApiArticles, ...mediastackArticles].filter(a => a.title && a.url);
        };

        const fetchIndonesianNews = async () => {
          try {
            const isProd = import.meta.env.PROD;
            const base = isProd ? '/api/berita-indo' : 'https://berita-indo-api.vercel.app/v1';
            
            const endpoints = [
              { url: `${base}/cnn-news`, name: 'CNN Indonesia' },
              { url: `${base}/cnbc-news`, name: 'CNBC Indonesia' },
              { url: `${base}/republika-news`, name: 'Republika News' },
              { url: `${base}/tempo-news`, name: 'Tempo News' }
            ];
            
            const responses = await Promise.all(
              endpoints.map(ep => 
                axios.get(ep.url)
                  .then(res => ({ ...res, sourceName: ep.name }))
                  .catch(err => {
                    console.error(`IND_API_ERR [${ep.name}]:`, err.message);
                    return { data: { data: [] }, sourceName: ep.name };
                  })
              )
            );

            const allArticles: NewsArticle[] = [];
            
            responses.forEach((res) => {
              const data = res.data?.data || [];
              data.forEach((a: any) => {
                allArticles.push({
                  title: a.title,
                  description: a.contentSnippet || a.content,
                  url: a.link,
                  imageUrl: a.image?.small || a.image?.large,
                  publishedAt: a.isoDate,
                  sourceName: (res as any).sourceName
                });
              });
            });
            return allArticles;
          } catch (e) {
            console.error('Berita Indo API Total Failure', e);
            return [];
          }
        };

        const searchCountry = fallbackCountryRef.current || countryCode;
        let combined: NewsArticle[] = [];

        console.log(`FETCH_INIT: country=${searchCountry}, query=${activeQuery}, mode=${newsMode}`);

        // If in Indonesia mode, exclusively fetch Indo news from local APIs.
        if (newsMode === 'indonesia') {
          console.log('FETCH_ID: Fetching exclusively from Berita Indo API...');
          const indoNews = await fetchIndonesianNews();
          console.log(`FETCH_ID_DONE: Found ${indoNews.length} articles`);
          combined = [...indoNews];
        }

        // If in Global mode, fetch standard global APIs.
        if (newsMode === 'global') {
          const standardNews = await fetchArticlesForCountry(searchCountry);
          console.log(`FETCH_STD: Found ${standardNews.length} articles for ${searchCountry}`);
          combined = [...standardNews];
        }

        // Final fallback to 'us' top headlines if absolutely nothing is found on page 1
        if (combined.length === 0 && searchCountry !== 'us' && page === 1 && !activeQuery) {
          const fallbackNews = await fetchArticlesForCountry('us');
          combined = [...fallbackNews];
          if (combined.length > 0) {
            fallbackCountryRef.current = 'us';
          }
        }

        combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        lastFetchRef.current = { key: fetchKey, timestamp: Date.now() };

        if (combined.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (page === 1) {
          setArticles(combined);
        } else {
          setArticles(prev => {
            const existingUrls = new Set(prev.map(a => a.url));
            const newArticles = combined.filter(a => !existingUrls.has(a.url));
            return [...prev, ...newArticles];
          });
        }
      } catch (error) {
        console.error('Error fetching combined news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [countryCode, category, activeQuery, page, newsMode]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading && activeTab === 'feed') {
          playClickSound();
          setPage(p => p + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [hasMore, isLoading, activeTab]);

  useEffect(() => {
    if (onNewsUpdate) onNewsUpdate(articles);
  }, [articles, onNewsUpdate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setActiveQuery(queryInput);
    setPage(1);
    fallbackCountryRef.current = null;
  };

  const toggleBookmark = (article: NewsArticle, e: React.MouseEvent) => {
    e.preventDefault();
    playClickSound();
    setBookmarks(prev => {
      const exists = prev.find(b => b.url === article.url);
      if (exists) return prev.filter(b => b.url !== article.url);
      return [article, ...prev];
    });
  };

  const displayArticles = activeTab === 'saved' ? bookmarks : articles;

  return (
    <>
      <div ref={newsHeaderRef} className="news-header">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <h2 
              className={`section-title tab ${activeTab === 'feed' ? 'active' : ''}`} 
              onClick={() => { playClickSound(); setActiveTab('feed'); }}
              onMouseEnter={playHoverSound}
              style={{
                background: activeTab === 'feed' ? 'linear-gradient(135deg, var(--gold-light), var(--accent-color))' : 'rgba(18, 22, 31, 0.8)',
                color: activeTab === 'feed' ? '#0d1017' : 'var(--text-main)',
                padding: '8px 24px',
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '1.5px',
                border: '1px solid var(--brass-border)',
                textDecoration: 'none',
                cursor: 'pointer',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
                boxShadow: activeTab === 'feed' ? '0 0 12px rgba(197, 160, 89, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              DISPATCH // I
            </h2>
            <h2
              className={`section-title tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => { playClickSound(); setActiveTab('saved'); }}
              onMouseEnter={playHoverSound}
              style={{
                background: activeTab === 'saved' ? 'linear-gradient(135deg, var(--gold-light), var(--accent-color))' : 'rgba(18, 22, 31, 0.8)',
                color: activeTab === 'saved' ? '#0d1017' : 'var(--text-main)',
                padding: '8px 24px',
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '1.5px',
                border: '1px solid var(--brass-border)',
                textDecoration: 'none',
                cursor: 'pointer',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
                boxShadow: activeTab === 'saved' ? '0 0 12px rgba(197, 160, 89, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              ARCHIVE // II ({bookmarks.length})
            </h2>
          </div>

          <div style={{ display: 'flex', background: 'rgba(13, 16, 23, 0.85)', padding: '3px', border: '1px solid var(--brass-border)', clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
            <button
              onClick={() => { playClickSound(); setNewsMode('global'); setPage(1); setQueryInput(''); setActiveQuery(''); newsHeaderRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
              onMouseEnter={playHoverSound}
              style={{
                background: newsMode === 'global' ? 'var(--accent-color)' : 'transparent',
                color: newsMode === 'global' ? '#0d1017' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 16px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
                transition: 'all 0.2s ease',
              }}
            >
              GLOBAL
            </button>
            <button
              onClick={() => { playClickSound(); setNewsMode('indonesia'); setPage(1); setQueryInput(''); setActiveQuery(''); newsHeaderRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
              onMouseEnter={playHoverSound}
              style={{
                background: newsMode === 'indonesia' ? 'var(--accent-color)' : 'transparent',
                color: newsMode === 'indonesia' ? '#0d1017' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 16px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
                transition: 'all 0.2s ease',
              }}
            >
              INDONESIA
            </button>
          </div>
        </div>
        
        {activeTab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <form className="news-controls" onSubmit={handleSearch}>
              <div ref={dropdownRef} className="custom-dropdown">
                <button
                  type="button"
                  className="custom-dropdown-trigger"
                  onClick={() => { playClickSound(); setDropdownOpen(!dropdownOpen); }}
                  onMouseEnter={playHoverSound}
                >
                  <span className="custom-dropdown-value">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className={`custom-dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                {dropdownOpen && (
                  <ul className="custom-dropdown-menu">
                    {categories.map(cat => (
                      <li
                        key={cat}
                        className={`custom-dropdown-item ${category === cat ? 'active' : ''}`}
                        onClick={() => {
                          playClickSound();
                          setCategory(cat);
                          setPage(1);
                          fallbackCountryRef.current = null;
                          setDropdownOpen(false);
                        }}
                        onMouseEnter={playHoverSound}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="news-search-wrapper">
                  <input type="text" className="news-search-input" placeholder="Search keywords..." value={queryInput} onChange={(e) => setQueryInput(e.target.value)} onMouseEnter={playHoverSound} />
                  <button type="submit" className="news-search-button" onMouseEnter={playHoverSound}>Search</button>
              </div>
            </form>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CHRONO-LINKS:</span>
              {(newsMode === 'global' ? ['Cybercrime', 'Cybersecurity', 'Artificial Intelligence', 'Space Exploration'] : ['Politik', 'Ekonomi', 'Olahraga', 'Teknologi']).map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setQueryInput(topic);
                    setActiveQuery(topic);
                    setPage(1);
                    fallbackCountryRef.current = null;
                  }}
                  onMouseEnter={playHoverSound}
                  style={{
                    background: activeQuery === topic ? 'linear-gradient(135deg, var(--gold-light), var(--accent-color))' : 'rgba(18, 22, 31, 0.85)',
                    color: activeQuery === topic ? '#0d1017' : 'var(--text-main)',
                    border: '1px solid var(--brass-border)',
                    padding: '5px 14px',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
                    boxShadow: activeQuery === topic ? '0 0 10px rgba(197, 160, 89, 0.35)' : 'none'
                  }}
                >
                  {topic}
                </button>
              ))}
              {activeQuery && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setQueryInput('');
                    setActiveQuery('');
                    setPage(1);
                    fallbackCountryRef.current = null;
                  }}
                  onMouseEnter={playHoverSound}
                  style={{ background: 'transparent', border: 'none', color: '#fc8181', fontSize: '0.75rem', fontFamily: 'var(--font-tech)', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  [CLEAR]
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isLoading && page === 1 && activeTab === 'feed' ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading top headlines...</p>
      ) : !hasKeys ? (
        <div style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>Missing API Keys!</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Please add <code>VITE_NEWSAPI_API_KEY</code> or <code>VITE_MEDIASTACK_API_KEY</code> to your .env file and restart the dev server.</p>
        </div>
      ) : displayArticles.length === 0 ? (
        <div style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: 'var(--radius)', color: 'var(--text-main)' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{activeTab === 'saved' ? 'No saved articles yet.' : 'No headlines found.'}</p>
        </div>
      ) : (
      <>
        <div className="news-grid">
          {displayArticles.map((article, index) => {
            const isSaved = bookmarks.some(b => b.url === article.url);
            return (
              <div key={index} className="news-card-wrapper">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-card" onMouseEnter={playHoverSound}>
                  {article.imageUrl && (
                    <div className="news-image-container">
                      <img src={article.imageUrl} alt="News thumbnail" className="news-image" />
                    </div>
                  )}
                  <div className="news-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <h3 className="news-title">{article.title}</h3>
                      <button className={`bookmark-btn ${isSaved ? 'saved' : ''}`} onClick={(e) => toggleBookmark(article, e)}>
                        {isSaved ? '★' : '☆'}
                      </button>
                    </div>
                    <p className="news-desc">{article.description}</p>
                    <div className="news-meta">
                      <span className="news-source">{article.sourceName}</span>
                      <span className="news-date">
                        {new Date(article.publishedAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
        
        {hasMore && activeTab === 'feed' && (
          <div ref={observerTarget} style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-color)' }}>
            {isLoading ? 'Fetching Datastreams...' : 'Scroll for more'}
          </div>
        )}
      </>
      )}
    </>
  );
};

export default NewsFeed;