import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import WeatherWidget from './WeatherWidget';
import WorldClockWidget from './WorldClockWidget';
import SystemStatusWidget from './SystemStatusWidget';
import RadarWidget from './RadarWidget';
import BootSequence from './BootSequence';
import AITerminalWidget from './AITerminalWidget';
import ThreatMonitorWidget from './ThreatMonitorWidget';
import MediaRadarWidget from './MediaRadarWidget';
import NewsFeed from './NewsFeed';
import { playHoverSound, playClickSound, toggleSound, isSoundEnabled } from './soundUtils';

const App: React.FC = () => {
  // Boot Sequence State (Tracks if the user has already seen the boot sequence this session)
  const [isBooting, setIsBooting] = useState<boolean>(() => !sessionStorage.getItem('booted'));

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [countryCode, setCountryCode] = useState<string>('us'); // default fallback
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  
  // Drag and Drop Widget Ordering State
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    const saved = JSON.parse(localStorage.getItem('widgetOrder') || '["weather", "clock"]');
    // Ensure the new radar widget gets injected for existing users!
    if (!saved.includes('radar')) saved.push('radar');
    // Inject the new threat monitor widget!
    if (!saved.includes('threats')) saved.push('threats');
    // Inject the new media radar widget!
    if (!saved.includes('media')) saved.push('media');
    // Filter out the exchange and system widgets if they exist from previous saves
    return saved.filter((id: string) => id !== 'exchange' && id !== 'system');
  });

  // Settings & Theme State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);
  const [activeTheme, setActiveTheme] = useState<string>(() => localStorage.getItem('activeTheme') || 'Neon Cyan');
  const [showAI, setShowAI] = useState<boolean>(false);
  const [newsContext, setNewsContext] = useState<string>('');
  const [poisContext, setPoisContext] = useState<string>('');
  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem('collapsedWidgets') || '{}'));

  const THEMES = [
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
    localStorage.setItem('activeTheme', activeTheme);
  }, [activeTheme]);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    const draggedIdx = parseInt(e.dataTransfer.getData('index'));
    if (draggedIdx === index) return;
    
    const newOrder = [...widgetOrder];
    const [draggedWidget] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, draggedWidget);
    
    setWidgetOrder(newOrder);
    localStorage.setItem('widgetOrder', JSON.stringify(newOrder));
    playClickSound();
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

  const handlePoisUpdate = useCallback((pois: any[]) => {
    setPoisContext(pois.slice(0, 10).map(p => p.tags?.name || p.tags?.amenity || p.tags?.shop).filter(Boolean).join(', '));
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsedWidgets(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('collapsedWidgets', JSON.stringify(next));
      return next;
    });
    playClickSound();
  };

  if (isBooting) return <BootSequence onComplete={handleBootComplete} />;

  return (
    <>
      <div className="dashboard">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
        <div>
          <h1 style={{ textAlign: 'left' }}>Delphi Nexus</h1>
          {isLocating && <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Detecting your location...</p>}
        </div>
        <SystemStatusWidget />
      </header>

      {!isLocating && (
        <main>
          <section className="widgets-container">
              {widgetOrder.map((widgetId, index) => (
                <div 
                  key={widgetId} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className="draggable-wrapper"
                  onMouseEnter={playHoverSound}
                >
                  <div className="drag-handle">≡</div>
                  {widgetId === 'weather' && <WeatherWidget location={location} isCollapsed={collapsedWidgets['weather']} onToggleCollapse={() => toggleCollapse('weather')} />}
                  {widgetId === 'clock' && <WorldClockWidget isCollapsed={collapsedWidgets['clock']} onToggleCollapse={() => toggleCollapse('clock')} />}
                  {widgetId === 'radar' && <RadarWidget location={location} onPoisUpdate={handlePoisUpdate} isCollapsed={collapsedWidgets['radar']} onToggleCollapse={() => toggleCollapse('radar')} />}
                  {widgetId === 'threats' && <ThreatMonitorWidget isCollapsed={collapsedWidgets['threats']} onToggleCollapse={() => toggleCollapse('threats')} />}
                  {widgetId === 'media' && <MediaRadarWidget isCollapsed={collapsedWidgets['media']} onToggleCollapse={() => toggleCollapse('media')} />}
                </div>
              ))}
          </section>
          <NewsFeed countryCode={countryCode} onNewsUpdate={handleNewsUpdate} />
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
                    onClick={() => { setActiveTheme(theme.name); playClickSound(); }}
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

      <AITerminalWidget isOpen={showAI} onClose={() => setShowAI(false)} contextData={`Top Headlines: ${newsContext}. Nearby Places: ${poisContext}.`} />
    </div>
    </>
  );
};

export default App;