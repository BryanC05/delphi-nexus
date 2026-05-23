import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { NewsArticle } from './types';
import { playHoverSound, playClickSound } from './soundUtils';

type NewsFeedProps = {
  countryCode: string;
  onNewsUpdate?: (articles: NewsArticle[]) => void;
  searchTrigger?: { query: string; ts: number } | null;
};

const NewsFeed: React.FC<NewsFeedProps> = ({ countryCode, onNewsUpdate, searchTrigger }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasKeys, setHasKeys] = useState<boolean>(true);
  
  // Persistent Search & Category from LocalStorage
  const [activeQuery, setActiveQuery] = useState<string>(() => localStorage.getItem('newsQuery') || '');
  const [queryInput, setQueryInput] = useState<string>(activeQuery);
  const [category, setCategory] = useState<string>(() => localStorage.getItem('newsCategory') || 'general');
  
  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>(() => JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');

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
  useEffect(() => { localStorage.setItem('newsQuery', activeQuery); localStorage.setItem('bookmarks', JSON.stringify(bookmarks)); }, [activeQuery, bookmarks]);

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
      setIsLoading(true);
      try {
        if (!process.env.REACT_APP_NEWSAPI_API_KEY && !process.env.REACT_APP_MEDIASTACK_API_KEY) {
          setHasKeys(false);
          setIsLoading(false);
          return;
        } else {
          setHasKeys(true);
        }

        const fetchArticlesForCountry = async (country: string) => {
          const newsApiParams: any = { apiKey: process.env.REACT_APP_NEWSAPI_API_KEY, country, category, page, pageSize: 20 };
          if (activeQuery) newsApiParams.q = activeQuery;

          const isProd = process.env.NODE_ENV === 'production';
          const newsApiBaseUrl = isProd ? '/api/newsapi' : 'https://newsapi.org/v2';
          const mediastackBaseUrl = isProd ? '/api/mediastack' : 'http://api.mediastack.com/v1';

          const newsApiPromise = process.env.REACT_APP_NEWSAPI_API_KEY
            ? axios.get(`${newsApiBaseUrl}/top-headlines`, {
                params: newsApiParams,
              })
            : Promise.resolve({ data: { articles: [] } });

          const mediastackParams: any = { access_key: process.env.REACT_APP_MEDIASTACK_API_KEY, countries: country, categories: category, offset: (page - 1) * 20, limit: 20 };
          if (activeQuery) mediastackParams.keywords = activeQuery;

          const mediastackPromise = process.env.REACT_APP_MEDIASTACK_API_KEY
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

        const searchCountry = fallbackCountryRef.current || countryCode;
        let combined = await fetchArticlesForCountry(searchCountry);

        // Fallback to US news if local country returns no news
        if (combined.length === 0 && searchCountry !== 'us' && page === 1) {
          combined = await fetchArticlesForCountry('us');
          if (combined.length > 0) {
            fallbackCountryRef.current = 'us';
          }
        }

        combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
  }, [countryCode, category, activeQuery, page]);

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
      <div className="news-header">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 
            className={`section-title tab ${activeTab === 'feed' ? 'active' : ''}`} 
            onClick={() => { playClickSound(); setActiveTab('feed'); }}
            onMouseEnter={playHoverSound}
          >Feed</h2>
          <h2 
            className={`section-title tab ${activeTab === 'saved' ? 'active' : ''}`} 
            onClick={() => { playClickSound(); setActiveTab('saved'); }}
            onMouseEnter={playHoverSound}
          >Saved ({bookmarks.length})</h2>
          {!isLoading && hasKeys && <span className="api-indicator">API ONLINE</span>}
        </div>
        
        {activeTab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <form className="news-controls" onSubmit={handleSearch}>
              <select 
                className="news-category-select" 
                value={category} 
                onChange={(e) => {
                    playClickSound();
                  setCategory(e.target.value);
                  setPage(1);
                  fallbackCountryRef.current = null;
                }}
                  onMouseEnter={playHoverSound}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
              <div className="news-search-wrapper">
                  <input type="text" className="news-search-input" placeholder="Search keywords..." value={queryInput} onChange={(e) => setQueryInput(e.target.value)} onMouseEnter={playHoverSound}/>
                  <button type="submit" className="news-search-button" onMouseEnter={playHoverSound}>Search</button>
              </div>
            </form>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-tech)' }}>QUICK_LINKS:</span>
              {['Cybercrime', 'Cybersecurity', 'Artificial Intelligence', 'Space Exploration'].map(topic => (
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
                    background: activeQuery === topic ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                    border: `1px solid ${activeQuery === topic ? 'var(--accent-color)' : 'var(--card-border)'}`,
                    color: activeQuery === topic ? 'var(--accent-color)' : 'var(--text-muted)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-tech)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase'
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
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Please add <code>REACT_APP_NEWSAPI_API_KEY</code> or <code>REACT_APP_MEDIASTACK_API_KEY</code> to your .env file and restart the server.</p>
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
            <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="news-card" onMouseEnter={playHoverSound}>
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
            )
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