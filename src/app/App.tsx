import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import '@/app/App.css';
import BootSequence from '@/components/BootSequence';
import HeaderClock from '@/components/HeaderClock';
import SystemStatusWidget from '@/components/SystemStatusWidget';
import AITerminalWidget from '@/components/AITerminalWidget';
import NewsFeed from '@/components/NewsFeed';
import DocModal from '@/components/DocModal';
import WidgetErrorBoundary from '@/components/WidgetErrorBoundary';
import WidgetSkeleton from '@/components/WidgetSkeleton';
import { WIDGET_REGISTRY, type WidgetId } from '@/config/widgetRegistry';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTheme, useUiMode } from '@/hooks/useTheme';
import { useWidgetLayout } from '@/hooks/useWidgetLayout';
import { playClickSound, playHoverSound, isSoundEnabled, setSoundEnabled } from '@/shared/soundUtils';
import { auth, googleProvider } from '@/services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

export default function App() {
  const [isBooting, setIsBooting] = useState(() => !sessionStorage.getItem('booted'));
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [newsContext, setNewsContext] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockInput, setUnlockInput] = useState('');
  const [newsSearchTrigger, setNewsSearchTrigger] = useState<{ query: string; ts: number } | null>(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { location, countryCode, isLocating, geolocationDenied } = useGeolocation();
  const { activeTheme, setActiveTheme, themes, resolveThemeName } = useTheme();
  const { uiMode, setUiMode } = useUiMode();
  const {
    activeWidgets,
    collapsedWidgets,
    user,
    widgetOptions,
    toggleCollapse,
    toggleWidgetActive,
    reorderWidgets,
    syncToCloud,
  } = useWidgetLayout(geolocationDenied, ({ activeTheme: cloudTheme }) => {
    if (cloudTheme) setActiveTheme(cloudTheme);
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDocModal(false);
        setShowSettings(false);
        setShowAI(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem('booted', 'true');
    setIsBooting(false);
  };

  const handleNewsUpdate = useCallback((articles: { title: string }[]) => {
    setNewsContext(articles.slice(0, 5).map((a) => a.title).join(' | '));
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    const draggedIdx = parseInt(e.dataTransfer.getData('index'), 10);
    if (Number.isNaN(draggedIdx)) return;
    reorderWidgets(draggedIdx, index);
  };

  const handleTerminalCommand = (cmd: string, arg: string) => {
    if (cmd === '/theme') {
      const mappedTheme = resolveThemeName(arg);
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

  const toggleSoundSetting = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    playClickSound();
  };

  if (isBooting) return <BootSequence onComplete={handleBootComplete} />;

  if (isLocked) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#fc8181', fontFamily: 'var(--font-tech)', fontSize: '3rem', marginBottom: '24px' }}>SYSTEM LOCKED</h1>
        <form onSubmit={(e) => { e.preventDefault(); if (unlockInput === 'admin') { setIsLocked(false); playClickSound(); } setUnlockInput(''); }}>
          <input type="password" value={unlockInput} onChange={(e) => setUnlockInput(e.target.value)} placeholder="ENTER OVERRIDE CODE" autoFocus aria-label="System unlock code" style={{ background: 'transparent', border: '1px solid #fc8181', color: '#fc8181', padding: '12px 24px', fontSize: '1.2rem', textAlign: 'center' }} />
        </form>
      </div>
    );
  }

  return (
    <div className="dashboard r1999-dashboard">
      <div className="header-wrapper">
        <header className="header r1999-header">
          <div className="r1999-header-brand">
            <div className="r1999-brand-sub">ST. PAVLOV FOUNDATION // TEMPORAL DOSSIER</div>
            <h1 className="r1999-brand-title">
              <span className="r1999-brand-mark">◈</span> DELPHI NEXUS
            </h1>
            {isLocating && <p className="r1999-locating-msg">CALIBRATING SPATIAL COORDINATES...</p>}
          </div>
          <div className="r1999-header-controls">
          <button
            type="button"
            className="r1999-btn"
            onClick={() => {
              playClickSound();
              setShowDocModal(true);
            }}
            onMouseEnter={playHoverSound}
            aria-label="Open resources documentation"
          >
            <span className="r1999-btn-ornament">◇</span> ARCHIVE
          </button>
          <HeaderClock />
          <SystemStatusWidget />
        </div>
      </header>
    </div>

      <main>
        <section className="widgets-container">
          <div className="widgets-grid">
            {activeWidgets.map((widgetId, index) => {
              const def = WIDGET_REGISTRY[widgetId as WidgetId];
              if (!def) return null;
              const Component = def.Component;
              return (
                <div
                  key={widgetId}
                  draggable={!isMobile}
                  onDragStart={isMobile ? undefined : (e) => handleDragStart(e, index)}
                  onDragOver={isMobile ? undefined : (e) => e.preventDefault()}
                  onDrop={isMobile ? undefined : (e) => handleDrop(e, index)}
                  className={`draggable-wrapper ${def.fullWidth ? 'full-width' : ''}`}
                  onMouseEnter={playHoverSound}
                  aria-disabled={isMobile}
                >
                  <WidgetErrorBoundary widgetId={widgetId}>
                    <Suspense fallback={<WidgetSkeleton title={def.label} />}>
                      <Component
                        location={location}
                        isCollapsed={collapsedWidgets[widgetId]}
                        onToggleCollapse={() => toggleCollapse(widgetId)}
                        onRemove={() => toggleWidgetActive(widgetId)}
                      />
                    </Suspense>
                  </WidgetErrorBoundary>
                </div>
              );
            })}
          </div>
        </section>
        <NewsFeed countryCode={countryCode} onNewsUpdate={handleNewsUpdate} searchTrigger={newsSearchTrigger} />
      </main>

      {showBackToTop && (
        <button type="button" className="back-to-top-button" onClick={() => { playClickSound(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onMouseEnter={playHoverSound} aria-label="Scroll to top">
          ↑ TOP
        </button>
      )}

      <button type="button" className="settings-btn" onClick={() => { playClickSound(); setShowSettings(true); }} onMouseEnter={playHoverSound} aria-label="Open settings">
        ⚙
      </button>

      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)} role="presentation">
          <div ref={settingsRef} className="settings-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="settings-header">
              <h2 id="settings-title" className="settings-title">System Config</h2>
              <button type="button" onClick={() => { playClickSound(); setShowSettings(false); }} className="settings-close-btn" aria-label="Close settings">×</button>
            </div>
            <div className="settings-section">
              <h4 className="settings-section-title">Cloud Uplink (Firebase)</h4>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="settings-auth-status">Authenticated as: {user.email}</div>
                  <button type="button" className="settings-logout-btn" onClick={() => { playClickSound(); signOut(auth!); }} onMouseEnter={playHoverSound}>DISCONNECT (LOGOUT)</button>
                </div>
              ) : (
                <button type="button" className="news-search-button" onClick={() => { playClickSound(); signInWithPopup(auth!, googleProvider!); }} onMouseEnter={playHoverSound}>ESTABLISH UPLINK (GOOGLE LOGIN)</button>
              )}
            </div>
            <div className="settings-section">
              <h4 className="settings-section-title">Active Modules</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {widgetOptions.map((opt) => (
                  <label key={opt.id} className="settings-checkbox-label">
                    <input type="checkbox" checked={activeWidgets.includes(opt.id as WidgetId)} onChange={() => toggleWidgetActive(opt.id)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="settings-section">
              <h4 className="settings-section-title">UI Color Protocol</h4>
              <div className="theme-grid">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    className={`theme-swatch ${activeTheme === theme.name ? 'active' : ''}`}
                    style={{ backgroundColor: theme.hex }}
                    onClick={() => { setActiveTheme(theme.name); syncToCloud({ activeTheme: theme.name }); playClickSound(); }}
                    onMouseEnter={playHoverSound}
                    title={theme.name}
                    aria-label={`Apply ${theme.name} theme`}
                  />
                ))}
              </div>
            </div>
            <div className="settings-section">
              <h4 className="settings-section-title">Audio Feedback</h4>
              <label className="settings-checkbox-label">
                <input type="checkbox" checked={soundOn} onChange={toggleSoundSetting} />
                Enable interface sounds
              </label>
            </div>
          </div>
        </div>
      )}

      <button type="button" className="ai-toggle-btn" onClick={() => { playClickSound(); setShowAI(true); }} onMouseEnter={playHoverSound} aria-label="Open AI terminal">
        AI
      </button>

      <AITerminalWidget isOpen={showAI} onClose={() => setShowAI(false)} contextData={`Top Headlines: ${newsContext}.`} onCommand={handleTerminalCommand} />
      <DocModal isOpen={showDocModal} onClose={() => setShowDocModal(false)} />
    </div>
  );
}
