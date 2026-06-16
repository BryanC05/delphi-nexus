import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import WeatherWidget from './WeatherWidget';
import WorldClockWidget from './WorldClockWidget';
import SystemStatusWidget from './SystemStatusWidget';
import BootSequence from './BootSequence';
import AITerminalWidget from './AITerminalWidget';
import ThreatMonitorWidget from './ThreatMonitorWidget';
import AnimeTrackerWidget from './AnimeTrackerWidget';
import IntelWidget from './IntelWidget';
import BioHazardWidget from './BioHazardWidget';
import SolarWeatherWidget from './SolarWeatherWidget';
import LaunchTrackerWidget from './LaunchTrackerWidget';
import CyberPulseWidget from './CyberPulseWidget';
import NewsFeed from './NewsFeed';
import { playHoverSound, playClickSound, toggleSound, isSoundEnabled } from './soundUtils';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  // Boot Sequence State (Tracks if the user has already seen the boot sequence this session)
  const [isBooting, setIsBooting] = useState<boolean>(() => !sessionStorage.getItem('booted'));

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [countryCode, setCountryCode] = useState<string>('us'); // default fallback
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  
  // Settings & Theme State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);
  const [activeTheme, setActiveTheme] = useState<string>(() => localStorage.getItem('activeTheme') || 'P3 Reload');
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
      // Remove radar
      parsed = parsed.filter((w: string) => w !== 'radar');
      
      // Ensure anime is right after clock if not already there, to fulfill layout request
      // But we are mainly relying on CSS grid to position it.
      
      localStorage.setItem('activeWidgets', JSON.stringify(parsed));
      return parsed;
    }
    return ['weather', 'clock', 'anime', 'bio', 'solar', 'launch', 'cyber', 'threats', 'intel'];
  });
  const [user, setUser] = useState<any>(null);

  const THEMES = [
    { name: 'P3 Reload', hex: '#00A3E0', rgb: '0, 163, 224' },
    { name: 'Neon Cyan', hex: '#00f0ff', rgb: '0, 240, 255' },
    { name: 'Matrix Green', hex: '#00ff41', rgb: '0, 255, 65' },
    { name: 'Alert Red', hex: '#ff003c', rgb: '255, 0, 60' },
    { name: 'Deep Purple', hex: '#b026ff', rgb: '176, 38, 255' },
  ];

  const handleBootComplete = () => {
    sessionStorage.setItem('booted', 'true');
    setIsBooting(false);
  };

  useEffect(() => {
    const theme = THEMES.find(t => t.name === activeTheme) || THEMES[0];
    document.documentElement.style.setProperty('--accent-color', theme.hex);
    document.documentElement.style.setProperty('--accent-glow', `0 0 10px rgba(${theme.rgb}, 0.3), inset 0 0 10px rgba(${theme.rgb}, 0.05)`);
    
    // Add P3R specific variables if theme is P3 Reload
    if (activeTheme === 'P3 Reload') {
      document.documentElement.style.setProperty('--bg-color', '#000c1d');
      document.documentElement.style.setProperty('--card-bg', 'rgba(0, 45, 98, 0.7)');
    } else {
      document.documentElement.style.setProperty('--bg-color', '#050b14');
      document.documentElement.style.setProperty('--card-bg', 'rgba(13, 22, 37, 0.85)');
    }

    localStorage.setItem('activeTheme', activeTheme);
  }, [activeTheme]);

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
              setActiveWidgets(data.activeWidgets);
              localStorage.setItem('activeWidgets', JSON.stringify(data.activeWidgets));
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
        }
      );
    } else {
      setIsLocating(false);
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

  const handleSoundToggle = () => {
    const newVal = !soundOn;
    setSoundOn(newVal);
    toggleSound(newVal);
    if (newVal) playClickSound();
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
      localStorage.setItem('activeWidgets', JSON.stringify(newWidgets));
      syncToCloud({ activeWidgets: newWidgets });
      return newWidgets;
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
    
    setActiveWidgets(newOrder);
    localStorage.setItem('activeWidgets', JSON.stringify(newOrder));
    playClickSound();
  };

  const WIDGET_OPTIONS = [
    { id: 'weather', label: 'Weather' },
    { id: 'clock', label: 'Global TimeSync' },
    { id: 'anime', label: 'Anime Tracker (Next Season)' },
    { id: 'bio', label: 'Bio-Hazard Monitor' },
    { id: 'solar', label: 'Solar Weather' },
    { id: 'launch', label: 'Orbital Launch Tracker' },
    { id: 'cyber', label: 'Cyber Pulse' },
    { id: 'threats', label: 'Zero-Day Monitor' },
    { id: 'intel', label: 'Daily Intel' }
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
        <div>
          <SystemStatusWidget />
        </div>
      </header>

      {!isLocating && (
        <main>
          <section className="widgets-container">
            <div className="widgets-grid">
              {activeWidgets.map((widgetId, index) => (
                <div 
                  key={widgetId} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`draggable-wrapper ${widgetId === 'anime' ? 'full-width' : ''}`}
                  onMouseEnter={playHoverSound}
                >
                  {widgetId === 'weather' && <WeatherWidget location={location} isCollapsed={collapsedWidgets['weather']} onToggleCollapse={() => toggleCollapse('weather')} onRemove={() => toggleWidgetActive('weather')} />}
                  {widgetId === 'clock' && <WorldClockWidget isCollapsed={collapsedWidgets['clock']} onToggleCollapse={() => toggleCollapse('clock')} onRemove={() => toggleWidgetActive('clock')} />}
                  {widgetId === 'anime' && <AnimeTrackerWidget isCollapsed={collapsedWidgets['anime']} onToggleCollapse={() => toggleCollapse('anime')} onRemove={() => toggleWidgetActive('anime')} />}
                  {widgetId === 'bio' && <BioHazardWidget location={location} isCollapsed={collapsedWidgets['bio']} onToggleCollapse={() => toggleCollapse('bio')} onRemove={() => toggleWidgetActive('bio')} />}
                  {widgetId === 'solar' && <SolarWeatherWidget isCollapsed={collapsedWidgets['solar']} onToggleCollapse={() => toggleCollapse('solar')} onRemove={() => toggleWidgetActive('solar')} />}
                  {widgetId === 'launch' && <LaunchTrackerWidget isCollapsed={collapsedWidgets['launch']} onToggleCollapse={() => toggleCollapse('launch')} onRemove={() => toggleWidgetActive('launch')} />}
                  {widgetId === 'cyber' && <CyberPulseWidget isCollapsed={collapsedWidgets['cyber']} onToggleCollapse={() => toggleCollapse('cyber')} onRemove={() => toggleWidgetActive('cyber')} />}
                  {widgetId === 'threats' && <ThreatMonitorWidget isCollapsed={collapsedWidgets['threats']} onToggleCollapse={() => toggleCollapse('threats')} onRemove={() => toggleWidgetActive('threats')} />}
                  {widgetId === 'intel' && <IntelWidget isCollapsed={collapsedWidgets['intel']} onToggleCollapse={() => toggleCollapse('intel')} onRemove={() => toggleWidgetActive('intel')} />}
                </div>
              ))}
            </div>
          </section>
          <NewsFeed countryCode={countryCode} onNewsUpdate={handleNewsUpdate} searchTrigger={newsSearchTrigger} />
        </main>
      )}

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', textTransform: 'uppercase', letterSpacing: '2px' }}>System Config</h2>
              <button onClick={() => { playClickSound(); setShowSettings(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div className="settings-section">
              <h4 style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', marginBottom: '12px' }}>Cloud Uplink (Firebase)</h4>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontFamily: 'var(--font-tech)' }}>Authenticated as: {user.email}</div>
                  <button className="news-search-button" onClick={() => { playClickSound(); signOut(auth); }} onMouseEnter={playHoverSound} style={{ width: '100%', borderColor: '#fc8181', color: '#fc8181' }}>DISCONNECT (LOGOUT)</button>
                </div>
              ) : (
                <button className="news-search-button" onClick={() => { playClickSound(); signInWithPopup(auth, googleProvider); }} onMouseEnter={playHoverSound} style={{ width: '100%' }}>ESTABLISH UPLINK (GOOGLE LOGIN)</button>
              )}
            </div>
            
            <div className="settings-section">
              <h4 style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', marginBottom: '12px' }}>Active Modules</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {WIDGET_OPTIONS.map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={activeWidgets.includes(opt.id)} 
                      onChange={() => toggleWidgetActive(opt.id)}
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h4 style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', marginBottom: '12px' }}>Audio Feedback</h4>
              <button className={`sound-toggle ${soundOn ? 'active' : ''}`} onClick={handleSoundToggle} onMouseEnter={playHoverSound}>
                {soundOn ? 'SOUND: ON' : 'SOUND: OFF'}
              </button>
            </div>

            <div className="settings-section">
              <h4 style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', marginBottom: '12px' }}>UI Color Protocol</h4>
              <div className="theme-grid">
                {THEMES.map(theme => (
                  <div 
                    key={theme.name}
                    className={`theme-swatch ${activeTheme === theme.name ? 'active' : ''}`}
                    style={{ backgroundColor: theme.hex, boxShadow: activeTheme === theme.name ? `0 0 15px ${theme.hex}` : 'none' }}
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
    </div>
    </>
  );
};

export default App;