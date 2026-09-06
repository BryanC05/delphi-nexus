import React from 'react';

type DocModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DOC_SECTIONS = [
  {
    title: 'Linguistic Dialects Terminal',
    description: 'Standalone translation engine and untranslatable dictionary browser.',
    apis: [
      { name: 'DataMuse Words API', url: 'https://api.datamuse.com/words', purpose: 'Fetches contextually rich science, nature, and technology nouns.' },
      { name: 'MyMemory Translation API', url: 'https://api.mymemory.translated.net/get', purpose: 'Converts English nouns or user-typed text into Spanish, French, German, Italian, Japanese, Chinese, or Korean.' }
    ],
    resources: 'Offline curated dictionary database of deep cultural terms (e.g. Komorebi, Schadenfreude, Saudade, Meraki) detailing native scripts (Kanji, Greek letters), phonetics, and extended contextual meanings.'
  },
  {
    title: 'Daily Intel Vault',
    description: 'Unified academic logs, net profiles, and trivia feeds.',
    apis: [
      { name: 'GitHub Profiles API', url: 'https://api.github.com/users/', purpose: 'Retrieves public user profile statistics, avatars, and registration history.' },
      { name: 'Discord Lanyard API', url: 'https://api.lanyard.rest/v1/users/', purpose: 'Fetches live Discord presence telemetry (Spotify status, active apps).' },
      { name: 'Useless Facts API', url: 'https://uselessfacts.jsph.pl/api/v2/facts/random', purpose: 'Pulls random general knowledge trivia.' },
      { name: 'Cat Facts API', url: 'https://catfact.ninja/fact', purpose: 'Fetches random scientific and historical cat trivia.' },
      { name: 'Advice Slip API', url: 'https://api.adviceslip.com/advice', purpose: 'Retrieves daily life advices and directives.' }
    ],
    resources: 'Local Academic Vault containing: Science (atomic elements registry), History (cryptographic cipher machines, WWII Enigma/Lorenz breakdowns), and Humanities (Ancient Roman/Greek philosophical quotes).'
  },
  {
    title: 'Morse Code Station',
    description: 'Interactive synthesizer and tapping decoder station.',
    apis: [
      { name: 'Web Audio API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API', purpose: 'Native synthesizer oscillator nodes generating click-free 600Hz sine waves for Morse transmissions.' }
    ],
    resources: 'English-to-Morse mapping dictionary and a live spacebar/pointer-press time interval decoder converting signal durations into characters.'
  },
  {
    title: 'Cyber Pulse Monitor',
    description: 'BOINC Grid simulator and DNS diagnostics.',
    apis: [
      { name: 'Cloudflare DNS-over-HTTPS Resolver', url: 'https://cloudflare-dns.com/dns-query', purpose: 'Issues secure encrypted DNS resolution requests (A, AAAA, TXT, CNAME, MX) directly from the client.' }
    ],
    resources: 'BOINC Distributed Computing grid simulation tracker.'
  },
  {
    title: 'Zero-Day Zero-Hour Monitor',
    description: 'International financial and legal sanctions lookup.',
    apis: [
      { name: 'OpenSanctions Search API', url: 'https://api.opensanctions.org/search/default', purpose: 'Searches global watchlists, PEPs, and corporate registries.' }
    ],
    resources: 'Global sanctions registries and watchlist database mappings.'
  },
  {
    title: 'Bio-Hazard Taxonomy',
    description: 'Catalogue of Life taxonomy tree browser.',
    apis: [
      { name: 'Catalogue of Life Suggestion API', url: 'https://api.catalogueoflife.org/nameusage/suggest', purpose: 'Queries the global taxonomic database for species classifications.' }
    ],
    resources: 'Local taxonomic list containing scientific names, families, and vernacular species classifications.'
  },
  {
    title: 'Weather Terminal',
    description: 'Forecast engine utilizing client coordinate tracking.',
    apis: [
      { name: 'Open-Meteo Weather API', url: 'https://api.open-meteo.com/v1/forecast', purpose: 'Fetches real-time temperature, wind speeds, UV indexing, and forecast statuses.' },
      { name: 'W3C Geolocation API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API', purpose: 'Tracks client coordinates; falls back to default coordinates on blocking.' }
    ],
    resources: 'Local weather weather-code mapping charts (WMO weather codes).'
  },
  {
    title: 'Otaku Station',
    description: 'Random anime profiles and recommendations.',
    apis: [
      { name: 'Jikan MyAnimeList API', url: 'https://api.jikan.moe/v4/random/anime', purpose: 'Fetches randomized anime entries, summaries, ratings, and artwork.' }
    ],
    resources: 'Curated backup anime database (e.g. Neon Genesis Evangelion, Cowboy Bebop, Akira) for offline/rate-limit fallback cases.'
  },
  {
    title: 'Space Launch Radar & Solar Wind Tracker',
    description: 'Aerospace events and space weather monitoring.',
    apis: [
      { name: 'Space Dev Launch API', url: 'https://lldev.thespacedevs.com/2.2.0/launch/upcoming/', purpose: 'Tracks upcoming global rocket launches and payloads.' },
      { name: 'NASA DONKI Solar API', url: 'https://api.nasa.gov/DONKI/CME', purpose: 'Streams coronal mass ejections telemetry.' }
    ],
    resources: 'Local orbital launch schedule tables.'
  }
];

const DocModal: React.FC<DocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="doc-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(8, 10, 14, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="doc-modal-container"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 22, 31, 0.98) 0%, rgba(10, 13, 18, 0.99) 100%)',
          border: '1px solid var(--brass-border)',
          borderTop: '3px solid var(--accent-color)',
          borderBottom: '3px solid var(--accent-color)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 32px rgba(197, 160, 89, 0.15)',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="doc-modal-header"
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--brass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(197, 160, 89, 0.05)',
          }}
        >
          <div>
            <h2
              id="doc-modal-title"
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '2px',
                color: 'var(--text-main)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              ◈ TIMEKEEPER ARCHIVES // CLASSIFIED DOSSIERS
            </h2>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--accent-color)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '1px',
                fontWeight: 'bold',
              }}
            >
              CHRONOLOGICAL DOSSIER REGISTRY // INDEX 19.99
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="r1999-btn"
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            DISMISS [ESC] ×
          </button>
        </div>

        {/* Content Body */}
        <div 
          className="doc-modal-body"
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            fontFamily: 'var(--font-tech)'
          }}
        >
          {DOC_SECTIONS.map((sec, idx) => (
            <div key={idx} style={{
              borderBottom: idx === DOC_SECTIONS.length - 1 ? 'none' : '1px dashed rgba(0, 163, 224, 0.15)',
              paddingBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--p3r-cyan)', fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>
                {sec.title}
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {sec.description}
              </p>

              {/* APIs list */}
              {sec.apis && sec.apis.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>API CONNECTORS:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sec.apis.map((api, aIdx) => (
                      <div key={aIdx} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 12px', borderLeft: '2px solid var(--accent-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{api.name}</span>
                          <a href={api.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: 'var(--p3r-cyan)', textDecoration: 'none' }}>
                            {api.url}
                          </a>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {api.purpose}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources list */}
              {sec.resources && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>LOCAL RESOURCES & MAPPINGS:</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', fontStyle: 'italic' }}>
                    {sec.resources}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(0, 163, 224, 0.15)',
          background: 'rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-tech)'
        }}>
          System Manual is compiled dynamically. All interfaces and sub-engines are fully operational.
        </div>
      </div>
    </div>
  );
};

export default DocModal;
