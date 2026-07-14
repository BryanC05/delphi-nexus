import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import WeatherWidget from './WeatherWidget';
import HeaderClock from './HeaderClock';
import SystemStatusWidget from './SystemStatusWidget';
import BootSequence from './BootSequence';
import AITerminalWidget from './AITerminalWidget';
import ThreatMonitorWidget from './ThreatMonitorWidget';
import AnimeTrackerWidget from './AnimeTrackerWidget';
import IntelWidget from './IntelWidget';
import BioHazardWidget from './BioHazardWidget';
import SolarWeatherWidget from './SolarWeatherWidget';
import CosmicMonitorWidget from './CosmicMonitorWidget';
import CyberPulseWidget from './CyberPulseWidget';
import NewsFeed from './NewsFeed';
import MorseWidget from './MorseWidget';
import LanguageWidget from './LanguageWidget';
import DocModal from './DocModal';
import { playHoverSound, playClickSound } from './soundUtils';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const enforceTopWidgets = (widgets: string[]): string[] => {
  const sorted = [...widgets];
  const weatherIdx = sorted.indexOf('weather');
  if (weatherIdx !== -1) {
    sorted.splice(weatherIdx, 1);
    sorted.splice(0, 0, 'weather');
  }
  const animeIdx = sorted.indexOf('anime');
  if (animeIdx !== -1) {
    sorted.splice(animeIdx, 1);
    const targetPos = sorted.includes('weather') ? 1 : 0;
    sorted.splice(targetPos, 0, 'anime');
  }
  return sorted;
};

const App: React.FC = () => {
  // Boot Sequence State (Tracks if the user has already seen the boot sequence this session)
  const [isBooting, setIsBooting] = useState<boolean>(() => !sessionStorage.getItem('booted'));

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [countryCode, setCountryCode] = useState<string>('us'); // default fallback
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Settings & Theme State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<string>(() => localStorage.getItem('activeTheme') || 'Delphi Blue');
  const [showAI, setShowAI] = useState<boolean>(false);
  const [newsContext, setNewsContext] = useState<string>('');
  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem('collapsedWidgets') || '{}'));
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [unlockInput, setUnlockInput] = useState<string>('');
  const [newsSearchTrigger, setNewsSearchTrigger] = useState<{ query: string; ts: number } | null>(null);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('activeWidgets');
    if (saved) {
      let parsed = JSON.parse(saved);
      // Migrate old 'media' widget to new 'anime' widget for existing users
      if (parsed.includes('media')) {
        parsed = parsed.map((w: string) => w === 'media' ? 'anime' : w);
      }
      // Remove radar and clock
      parsed = parsed.filter((w: string) => w !== 'radar' && w !== 'clock');
      
      // Deduplicate to prevent double widgets if 'media' and 'anime' were both present
      parsed = Array.from(new Set(parsed));
      
      const enforced = enforceTopWidgets(parsed);
      localStorage.setItem('activeWidgets', JSON.stringify(enforced));
      return enforced;
    }
    return ['weather', 'anime', 'bio', 'solar', 'launch', 'cyber', 'threats', 'intel', 'morse', 'language'];
  });
  const [user, setUser] = useState<any>(null);
  const [showDocModal, setShowDocModal] = useState(false);

  const THEMES = [
    {
      name: 'Delphi Blue',
      hex: '#00A3E0',
      rgb: '0, 163, 224',
      bgColor: '#000c1d',
      cardBg: 'rgba(0, 45, 98, 0.7)',
      cardBorder: '#00A3E0',
      textMuted: '#b0d4ff',
      blueDark: '#002D62',
      blueLight: '#00A3E0',
      cyan: '#00e5ff'
    },
    {
      name: 'Neon Cyan',
      hex: '#00f0ff',
      rgb: '0, 240, 255',
      bgColor: '#001015',
      cardBg: 'rgba(0, 30, 40, 0.7)',
      cardBorder: '#00f0ff',
      textMuted: '#80f8ff',
      blueDark: '#001e28',
      blueLight: '#00f0ff',
      cyan: '#00a3e0'
    },
    {
      name: 'Matrix Green',
      hex: '#00ff41',
      rgb: '0, 255, 65',
      bgColor: '#001202',
      cardBg: 'rgba(0, 38, 8, 0.7)',
      cardBorder: '#00ff41',
      textMuted: '#80ff9a',
      blueDark: '#002608',
      blueLight: '#00ff41',
      cyan: '#58ff00'
    },
    {
      name: 'Alert Red',
      hex: '#ff003c',
      rgb: '255, 0, 60',
      bgColor: '#170005',
      cardBg: 'rgba(60, 0, 15, 0.7)',
      cardBorder: '#ff003c',
      textMuted: '#ffb0c1',
      blueDark: '#3c000f',
      blueLight: '#ff003c',
      cyan: '#ff5c8a'
    },
    {
      name: 'Deep Purple',
      hex: '#b026ff',
      rgb: '176, 38, 255',
      bgColor: '#0c0017',
      cardBg: 'rgba(38, 0, 60, 0.7)',
      cardBorder: '#b026ff',
      textMuted: '#ebc8ff',
      blueDark: '#26003c',
      blueLight: '#b026ff',
      cyan: '#df80ff'
    }
  ];

  const [uiMode, setUiMode] = useState<'p3r' | 'classic'>(() => {
    return (localStorage.getItem('uiMode') as 'p3r' | 'classic') || 'p3r';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-mode', uiMode);
    localStorage.setItem('uiMode', uiMode);
  }, [uiMode]);

  const handleBootComplete = () => {
    sessionStorage.setItem('booted', 'true');
    setIsBooting(false);
  };

  useEffect(() => {
    const theme = THEMES.find(t => t.name === activeTheme) || THEMES[0];
    document.documentElement.style.setProperty('--accent-color', theme.hex);
    document.documentElement.style.setProperty('--accent-glow', `0 0 10px rgba(${theme.rgb}, 0.3), inset 0 0 10px rgba(${theme.rgb}, 0.05)`);
    document.documentElement.style.setProperty('--bg-color', theme.bgColor);
    document.documentElement.style.setProperty('--card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--card-border', theme.cardBorder);
    document.documentElement.style.setProperty('--text-muted', theme.textMuted);
    document.documentElement.style.setProperty('--p3r-blue-dark', theme.blueDark);
    document.documentElement.style.setProperty('--p3r-blue-light', theme.blueLight);
    document.documentElement.style.setProperty('--p3r-cyan', theme.cyan);
    document.documentElement.style.setProperty('--bg-pattern-color', `rgba(${theme.rgb}, 0.05)`);

    localStorage.setItem('activeTheme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDocModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.activeWidgets) {
              const enforced = enforceTopWidgets(data.activeWidgets);
              setActiveWidgets(enforced);
              localStorage.setItem('activeWidgets', JSON.stringify(enforced));
            }
            if (data.collapsedWidgets) {
              setCollapsedWidgets(data.collapsedWidgets);
              localStorage.setItem('collapsedWidgets', JSON.stringify(data.collapsedWidgets));
            }
            if (data.activeTheme) {
              setActiveTheme(data.activeTheme);
              localStorage.setItem('activeTheme', data.activeTheme);
            }
          }
        } catch (e) {
          console.error('Error fetching layout:', e);
        }
      }
    });
    return unsubscribe;
  }, []);

  const syncToCloud = async (updates: any) => {
    if (!auth?.currentUser) return;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error("Cloud sync failed:", e);
    }
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });

          try {
            // Free client-side reverse geocoding to get the user's country code
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            if (data.countryCode) {
              setCountryCode(data.countryCode.toLowerCase());
            }
          } catch (error) {
            console.error('Error fetching country code:', error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          setIsLocating(false); // Fall back to defaults on denial/error
          setActiveWidgets(prev => {
            const next = enforceTopWidgets(prev.filter(w => w !== 'bio' && w !== 'solar'));
            localStorage.setItem('activeWidgets', JSON.stringify(next));
            return next;
          });
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 }
      );
    } else {
      setIsLocating(false);
      setActiveWidgets(prev => {
        const next = enforceTopWidgets(prev.filter(w => w !== 'bio' && w !== 'solar'));
        localStorage.setItem('activeWidgets', JSON.stringify(next));
        return next;
      });
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowBackToTop(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add { passive: true } to tell the browser this event won't prevent scrolling,
    // which heavily optimizes scroll performance!
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsUpdate = useCallback((articles: any[]) => {
    setNewsContext(articles.slice(0, 5).map(a => a.title).join(' | '));
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsedWidgets(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('collapsedWidgets', JSON.stringify(next));
      syncToCloud({ collapsedWidgets: next });
      return next;
    });
    playClickSound();
  };

  const toggleWidgetActive = (id: string) => {
    setActiveWidgets(prev => {
      const newWidgets = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      const enforced = enforceTopWidgets(newWidgets);
      localStorage.setItem('activeWidgets', JSON.stringify(enforced));
      syncToCloud({ activeWidgets: enforced });
      return enforced;
    });
    playClickSound();
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    const draggedIdx = parseInt(e.dataTransfer.getData('index'));
    if (draggedIdx === index || isNaN(draggedIdx)) return;
    
    const newOrder = [...activeWidgets];
    const [draggedWidget] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, draggedWidget);
    
    const enforced = enforceTopWidgets(newOrder);
    setActiveWidgets(enforced);
    localStorage.setItem('activeWidgets', JSON.stringify(enforced));
    playClickSound();
  };

  const WIDGET_OPTIONS = [
    { id: 'weather', label: 'Weather' },
    { id: 'anime', label: 'Anime Tracker (Next Season)' },
    { id: 'bio', label: 'Bio-Hazard Monitor' },
    { id: 'solar', label: 'Solar Weather' },
    { id: 'launch', label: 'Cosmic Monitor' },
    { id: 'cyber', label: 'Cyber Pulse' },
    { id: 'threats', label: 'Zero-Day Monitor' },
    { id: 'intel', label: 'Daily Intel' },
    { id: 'morse', label: 'Morse Code Station' },
    { id: 'language', label: 'Linguistic Dialects' }
  ];

  const handleTerminalCommand = (cmd: string, arg: string) => {
    if (cmd === '/theme') {
      const themeMap: Record<string, string> = {
        'matrix': 'Matrix Green',
        'neon': 'Neon Cyan',
        'alert': 'Alert Red',
        'purple': 'Deep Purple'
      };
      const mappedTheme = themeMap[arg] || THEMES.find(t => t.name.toLowerCase().includes(arg))?.name;
      if (mappedTheme) {
        setActiveTheme(mappedTheme);
        syncToCloud({ activeTheme: mappedTheme });
        return true;
      }
      return false;
    }
    if (cmd === '/lock') {
      setIsLocked(true);
      return true;
    }
    if (cmd === '/search') {
      if (arg.trim()) {
        setNewsSearchTrigger({ query: arg.trim(), ts: Date.now() });
        return true;
      }
      return false;
    }
    return false;
  };

  if (isBooting) return <BootSequence onComplete={handleBootComplete} />;

  if (isLocked) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#fc8181', fontFamily: 'var(--font-tech)', fontSize: '3rem', letterSpacing: '4px', marginBottom: '24px', textShadow: '0 0 15px rgba(252, 129, 129, 0.5)' }}>SYSTEM LOCKED</h1>
        <form onSubmit={e => { e.preventDefault(); if (unlockInput === 'admin') { setIsLocked(false); playClickSound(); } setUnlockInput(''); }}>
          <input 
            type="password" 
            value={unlockInput} 
            onChange={e => setUnlockInput(e.target.value)} 
            placeholder="ENTER OVERRIDE CODE" 
            autoFocus 
            style={{ background: 'transparent', border: '1px solid #fc8181', color: '#fc8181', padding: '12px 24px', fontSize: '1.2rem', fontFamily: 'var(--font-tech)', textAlign: 'center', outline: 'none', borderRadius: '4px', letterSpacing: '2px' }} 
          />
        </form>
        <div style={{ marginTop: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.8rem' }}>Hint: override code is "admin"</div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard">
      <header className="header">
        <div>
          <h1>Delphi Nexus</h1>
          {isLocating && <p style={{ color: '#fff', margin: '8px 0 0 0', opacity: 0.7, fontFamily: 'var(--font-tech)' }}>LOCATING GEOGRAPHIC COORDINATES...</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => { playClickSound(); setUiMode(uiMode === 'p3r' ? 'classic' : 'p3r'); }}
            style={{
              background: 'transparent',
              color: 'var(--accent-color)',
              border: '1px solid var(--accent-color)',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-p3r)',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={playHoverSound}
          >
            🖥️ Style: {uiMode === 'p3r' ? 'Stylized P3R' : 'Classic Delphi'}
          </button>
          <button 
            onClick={() => { playClickSound(); setShowDocModal(true); }}
            style={{
              background: 'transparent',
              color: 'var(--p3r-blue-light)',
              border: '1px solid var(--p3r-blue-light)',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-p3r)',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '0 0 8px rgba(0, 163, 224, 0.2)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={playHoverSound}
          >
            📋 Resources
          </button>
          <HeaderClock />
          <SystemStatusWidget />
        </div>
      </header>

      <main>
        <section className="widgets-container">
          <div className="widgets-grid">
            {activeWidgets.map((widgetId, index) => (
              <div 
                key={widgetId} 
                draggable={!isMobile} 
                onDragStart={isMobile ? undefined : (e) => handleDragStart(e, index)}
                onDragOver={isMobile ? undefined : (e) => e.preventDefault()}
                onDrop={isMobile ? undefined : (e) => handleDrop(e, index)}
                className={`draggable-wrapper ${widgetId === 'anime' ? 'full-width' : ''}`}
                onMouseEnter={playHoverSound}
              >
                {widgetId === 'weather' && <WeatherWidget location={location} isCollapsed={collapsedWidgets['weather']} onToggleCollapse={() => toggleCollapse('weather')} onRemove={() => toggleWidgetActive('weather')} />}
                {widgetId === 'anime' && <AnimeTrackerWidget isCollapsed={collapsedWidgets['anime']} onToggleCollapse={() => toggleCollapse('anime')} onRemove={() => toggleWidgetActive('anime')} />}
                {widgetId === 'bio' && <BioHazardWidget location={location} isCollapsed={collapsedWidgets['bio']} onToggleCollapse={() => toggleCollapse('bio')} onRemove={() => toggleWidgetActive('bio')} />}
                {widgetId === 'solar' && <SolarWeatherWidget isCollapsed={collapsedWidgets['solar']} onToggleCollapse={() => toggleCollapse('solar')} onRemove={() => toggleWidgetActive('solar')} />}
                {widgetId === 'launch' && <CosmicMonitorWidget isCollapsed={collapsedWidgets['launch']} onToggleCollapse={() => toggleCollapse('launch')} onRemove={() => toggleWidgetActive('launch')} />}
                {widgetId === 'cyber' && <CyberPulseWidget isCollapsed={collapsedWidgets['cyber']} onToggleCollapse={() => toggleCollapse('cyber')} onRemove={() => toggleWidgetActive('cyber')} />}
                {widgetId === 'threats' && <ThreatMonitorWidget isCollapsed={collapsedWidgets['threats']} onToggleCollapse={() => toggleCollapse('threats')} onRemove={() => toggleWidgetActive('threats')} />}
                {widgetId === 'intel' && <IntelWidget isCollapsed={collapsedWidgets['intel']} onToggleCollapse={() => toggleCollapse('intel')} onRemove={() => toggleWidgetActive('intel')} />}
                {widgetId === 'morse' && <MorseWidget isCollapsed={collapsedWidgets['morse']} onToggleCollapse={() => toggleCollapse('morse')} onRemove={() => toggleWidgetActive('morse')} />}
                {widgetId === 'language' && <LanguageWidget isCollapsed={collapsedWidgets['language']} onToggleCollapse={() => toggleCollapse('language')} onRemove={() => toggleWidgetActive('language')} />}
              </div>
            ))}
          </div>
        </section>
        <NewsFeed countryCode={countryCode} onNewsUpdate={handleNewsUpdate} searchTrigger={newsSearchTrigger} />
      </main>

      {showBackToTop && (
          <button className="back-to-top-button" onClick={scrollToTop} onMouseEnter={playHoverSound}>
          ↑ TOP
        </button>
      )}

      <button className="settings-btn" onClick={() => { playClickSound(); setShowSettings(true); }} onMouseEnter={playHoverSound}>
        ⚙
      </button>

      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h2 className="settings-title">System Config</h2>
              <button onClick={() => { playClickSound(); setShowSettings(false); }} className="settings-close-btn">×</button>
            </div>

            <div className="settings-section">
              <h4 className="settings-section-title">Cloud Uplink (Firebase)</h4>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="settings-auth-status">Authenticated as: {user.email}</div>
                  <button className="settings-logout-btn" onClick={() => { playClickSound(); signOut(auth); }} onMouseEnter={playHoverSound}>DISCONNECT (LOGOUT)</button>
                </div>
              ) : (
                <button className="news-search-button" onClick={() => { playClickSound(); signInWithPopup(auth, googleProvider); }} onMouseEnter={playHoverSound}>ESTABLISH UPLINK (GOOGLE LOGIN)</button>
              )}
            </div>
            
            <div className="settings-section">
              <h4 className="settings-section-title">Active Modules</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {WIDGET_OPTIONS.map(opt => (
                  <label key={opt.id} className="settings-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={activeWidgets.includes(opt.id)} 
                      onChange={() => toggleWidgetActive(opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h4 className="settings-section-title">UI Color Protocol</h4>
              <div className="theme-grid">
                {THEMES.map(theme => (
                  <div 
                    key={theme.name}
                    className={`theme-swatch ${activeTheme === theme.name ? 'active' : ''}`}
                    style={{ backgroundColor: theme.hex }}
                    onClick={() => { setActiveTheme(theme.name); syncToCloud({ activeTheme: theme.name }); playClickSound(); }}
                    onMouseEnter={playHoverSound}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="ai-toggle-btn" onClick={() => { playClickSound(); setShowAI(true); }} onMouseEnter={playHoverSound}>
        AI
      </button>

      <AITerminalWidget isOpen={showAI} onClose={() => setShowAI(false)} contextData={`Top Headlines: ${newsContext}.`} onCommand={handleTerminalCommand} />
      <DocModal isOpen={showDocModal} onClose={() => setShowDocModal(false)} />
    </div>
    </>
  );
};

export default App;