import React, { useEffect, useState } from 'react';
import axios from 'axios';

type IntelProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

type Glyph = {
  symbol: string;
  name: string;
  tag: string;
  desc: string;
};

type GitHubUser = {
  login: string;
  avatar_url: string;
  name: string;
  company: string;
  bio: string;
  public_repos: number;
  followers: number;
};

type LanyardData = {
  discord_user: {
    username: string;
    discriminator: string;
    avatar: string;
    id: string;
  };
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: {
    name: string;
    state?: string;
    details?: string;
    timestamps?: { start: number };
  }[];
  spotify?: {
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
  };
  listening_to_spotify: boolean;
};

type ElementInfo = {
  symbol: string;
  name: string;
  number: number;
  weight: string;
  group: string;
  desc: string;
};

type CipherMachine = {
  name: string;
  country: string;
  year: string;
  type: string;
  desc: string;
};

type PhilosophySchool = {
  school: string;
  core: string;
  thinkers: string;
  quote: string;
};

const GLYPH_DATABASE: Glyph[] = [
  { symbol: '☣', name: 'BIO-HAZARD PROTOCOL', tag: 'HAZARD', desc: 'Indicates active biological hazard or genetic threat vectors in the vicinity.' },
  { symbol: '☢', name: 'RADIATION EMISSION', tag: 'HAZARD', desc: 'Critical radioactive isotope leaks or background radiation spike detected.' },
  { symbol: '☠', name: 'TARGET DESTROYED', tag: 'COMBAT', desc: 'Indicates system deletion or confirmation of target removal.' },
  { symbol: '☯', name: 'NODE BALANCING', tag: 'NETWORK', desc: 'Symmetrical channel load balance. Safe operational flow.' },
  { symbol: '⚙', name: 'PROCESS CORE', tag: 'SYSTEM', desc: 'Core execution thread running under standard processor load.' },
  { symbol: '⚛', name: 'QUANTUM ENCRYPT', tag: 'SECURITY', desc: 'Quantum particle state encryption active on network channel.' },
  { symbol: '✦', name: 'INTEL SOURCE', tag: 'INTEL', desc: 'Newly registered metadata node added to surveillance registry.' },
  { symbol: '⚔', name: 'COMBAT PROTOCOL', tag: 'COMBAT', desc: 'Tactical subsystem active. Firewall weapons fully loaded.' },
  { symbol: '🛡', name: 'SECURE SHELL', tag: 'SECURITY', desc: 'AES-256 encrypted shell shield preventing incoming injections.' },
  { symbol: '🔑', name: 'CRYPTO KEY', tag: 'SECURITY', desc: 'Public/private key pair verified for channel handshake.' },
  { symbol: '👁', name: 'SURVEILLANCE NODE', tag: 'WATCHER', desc: 'Sub-orbital camera array tracking target telemetry.' },
  { symbol: '🛸', name: 'UNIDENTIFIED OBJECT', tag: 'SPACE', desc: 'Orbital velocity telemetry of unknown aerospace signature.' },
  { symbol: 'Ω', name: 'OMEGA TERMINAL', tag: 'SYSTEM', desc: 'Final execution thread boundary. Recursion loop safe.' },
  { symbol: 'Ψ', name: 'NEURAL HANDSHAKE', tag: 'NEURAL', desc: 'Synaptic link established with user neural deck.' },
  { symbol: 'Φ', name: 'GOLDEN RATIO', tag: 'MATH', desc: 'Layout optimization formula applied. Maximum aesthetics.' },
  { symbol: 'λ', name: 'LAMBDA ROUTER', tag: 'NETWORK', desc: 'Serverless request execution router handling gateway requests.' },
  { symbol: '∞', name: 'RECURSION POINT', tag: 'MATH', desc: 'Infinite loop buffer allocated. Thread overflow protected.' }
];

const ELEMENT_DB: ElementInfo[] = [
  { symbol: 'H', name: 'Hydrogen', number: 1, weight: '1.008', group: 'Reactive Nonmetal', desc: 'Most abundant chemical substance in the Universe. Discovered by Henry Cavendish in 1766.' },
  { symbol: 'He', name: 'Helium', number: 2, weight: '4.0026', group: 'Noble Gas', desc: 'Light, odorless gas used in cryogenics. Discovered in 1868 by Janssen and Lockyer in the solar spectrum.' },
  { symbol: 'Li', name: 'Lithium', number: 3, weight: '6.94', group: 'Alkali Metal', desc: 'Lightest solid element. Highly reactive, used in modern energy cells. Discovered by Arfwedson in 1817.' },
  { symbol: 'C', name: 'Carbon', number: 6, weight: '12.011', group: 'Reactive Nonmetal', desc: 'Tetravalent nonmetal that forms the chemical basis for all known organic life. Key component of steel.' },
  { symbol: 'O', name: 'Oxygen', number: 8, weight: '15.999', group: 'Reactive Nonmetal', desc: 'Highly reactive nonmetal and oxidizing agent. Discovered independently by Scheele (1773) and Priestley (1774).' },
  { symbol: 'Fe', name: 'Iron', number: 26, weight: '55.845', group: 'Transition Metal', desc: 'Core metal of Earth\'s outer and inner core. Essential for human oxygen transport (hemoglobin).' },
  { symbol: 'Au', name: 'Gold', number: 79, weight: '196.97', group: 'Transition Metal', desc: 'Dense, soft, malleable, and ductile transition metal with a bright yellow color. Highly valued historically.' },
  { symbol: 'U', name: 'Uranium', number: 92, weight: '238.03', group: 'Actinide', desc: 'Weakly radioactive metal. Fissionable isotope U-235 is the primary fuel for nuclear reactors.' }
];

const CIPHER_DB: CipherMachine[] = [
  { name: 'Enigma Machine', country: 'Germany', year: '1918', type: 'Rotor Electro-mechanical', desc: 'Used by the German military in WWII. Famously decrypted by Alan Turing\'s team at Bletchley Park using the Bombe machine.' },
  { name: 'Lorenz SZ42', country: 'Germany', year: '1940', type: 'Teleprinter Cipher Attachment', desc: 'Used for high-level strategic communication. Cracked by Bill Tutte using statistical analysis, leading to the Colossus computer.' },
  { name: 'SIGABA (M-134-C)', country: 'USA', year: '1938', type: 'Rotor Electro-mechanical', desc: 'Used by the US during WWII. It was never broken by enemy cryptanalysts during its entire service life.' },
  { name: 'Typex Mark XXII', country: 'UK', year: '1937', type: 'Rotor Electro-mechanical', desc: 'British rotor cipher machine adapted from commercial Enigma designs, with major security improvements.' },
  { name: 'Jefferson Wheel Cipher', country: 'USA', year: '1795', type: 'Mechanical Wheel Cylinders', desc: 'Invented by Thomas Jefferson. Decrypts messages using 36 rotating wooden wheels. Later re-invented as US Army M-94.' }
];

const PHILOSOPHY_DB: PhilosophySchool[] = [
  { school: 'Stoicism', core: 'Virtue is the only good; focus on what is within control.', thinkers: 'Marcus Aurelius, Seneca, Epictetus', quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.' },
  { school: 'Epicureanism', core: 'Highest good is pleasure (absence of mental anxiety & physical pain).', thinkers: 'Epicurus, Lucretius', quote: 'Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.' },
  { school: 'Cynicism', core: 'Live in agreement with nature, free from societal conventions and wealth.', thinkers: 'Diogenes of Sinope, Antisthenes', quote: 'It is the privilege of the gods to want nothing, and of godlike men to want little.' },
  { school: 'Platonism', core: 'The material world is a shadow of the true world of perfect Ideas or Forms.', thinkers: 'Plato, Plotinus', quote: 'The heaviest penalty for declining to rule is to be ruled by one inferior to yourself.' },
  { school: 'Aristotelianism', core: 'Empirical observation and logic are the keys to understanding reality.', thinkers: 'Aristotle, Thomas Aquinas', quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.' }
];

const IntelWidget: React.FC<IntelProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'fact' | 'glyph' | 'dossier' | 'knowledge'>('fact');
  
  // Fact state
  const [uselessFact, setUselessFact] = useState<string>('');
  const [catFact, setCatFact] = useState<string>('');
  const [advice, setAdvice] = useState<string>('');
  const [factLoading, setFactLoading] = useState<boolean>(true);

  const fetchAllFacts = async () => {
    setFactLoading(true);
    setUselessFact('');
    setCatFact('');
    setAdvice('');
    try {
      const [uselessRes, catRes, adviceRes] = await Promise.allSettled([
        axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random'),
        axios.get('https://catfact.ninja/fact'),
        axios.get('https://api.adviceslip.com/advice')
      ]);

      if (uselessRes.status === 'fulfilled') {
        setUselessFact(uselessRes.value.data.text);
      } else {
        setUselessFact("Astronauts say that space smells like hot metal, seared steak, and welding fumes.");
      }

      if (catRes.status === 'fulfilled') {
        setCatFact(catRes.value.data.fact);
      } else {
        setCatFact("Cats have 32 muscles in each ear, allowing them to rotate their ears 180 degrees.");
      }

      if (adviceRes.status === 'fulfilled') {
        setAdvice(adviceRes.value.data.slip.advice);
      } else {
        setAdvice("If you don't want to play, don't start the game.");
      }
    } catch (error) {
      console.warn('Concerted Fact Fetching failed.', error);
    } finally {
      setFactLoading(false);
    }
  };

  // Fetch all facts on mount
  useEffect(() => {
    fetchAllFacts();
  }, []);

  // Glyph state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null);

  // Dossier state
  const [githubQuery, setGithubQuery] = useState('');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');

  const [discordId, setDiscordId] = useState('');
  const [lanyardUser, setLanyardUser] = useState<LanyardData | null>(null);
  const [lanyardLoading, setLanyardLoading] = useState(false);
  const [lanyardError, setLanyardError] = useState('');

  // Knowledge Archive state
  const [knowledgeSubTab, setKnowledgeSubTab] = useState<'science' | 'history' | 'humanities'>('science');
  const [selectedElement, setSelectedElement] = useState<ElementInfo>(ELEMENT_DB[0]);
  const [selectedCipher, setSelectedCipher] = useState<CipherMachine>(CIPHER_DB[0]);
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<PhilosophySchool>(PHILOSOPHY_DB[0]);

  // GitHub lookup
  const handleGithubSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubQuery.trim()) return;

    setGithubLoading(true);
    setGithubError('');
    setGithubUser(null);
    try {
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(githubQuery)}`);
      setGithubUser(res.data);
    } catch (err: any) {
      console.error('GitHub API error:', err);
      setGithubError(err.response?.status === 404 ? 'Netrunner profile not found.' : 'Failed to query GitHub registry.');
    } finally {
      setGithubLoading(false);
    }
  };

  // Discord Lanyard lookup
  const handleLanyardSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordId.trim()) return;

    setLanyardLoading(true);
    setLanyardError('');
    setLanyardUser(null);
    try {
      const res = await axios.get(`https://api.lanyard.rest/v1/users/${encodeURIComponent(discordId)}`);
      if (res.data.success && res.data.data) {
        setLanyardUser(res.data.data);
      } else {
        setLanyardError('No Rich Presence records captured for this ID.');
      }
    } catch (err: any) {
      console.error('Lanyard API error:', err);
      setLanyardError('Agent telemetry offline. (Verify ID or check if they are in a Lanyard-enabled Discord server).');
    } finally {
      setLanyardLoading(false);
    }
  };

  const getStatusColor = (status: 'online' | 'idle' | 'dnd' | 'offline') => {
    switch (status) {
      case 'online': return '#48bb78';
      case 'idle': return '#ecc94b';
      case 'dnd': return '#fc8181';
      default: return 'var(--text-muted)';
    }
  };

  // Filter glyph database based on search query
  const filteredGlyphs = GLYPH_DATABASE.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--accent-color)', paddingBottom: isCollapsed ? 0 : '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>DAILY INTEL</span>
          {!factLoading && activeTab === 'fact' && <span className="api-indicator">API ONLINE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse}>
            {isCollapsed ? '+' : '-'}
          </button>
          <button className="remove-btn" onClick={onRemove}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
        <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tab selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 163, 224, 0.2)', paddingBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('fact')}
              style={{
                background: activeTab === 'fact' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'fact' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              INTEL FACT
            </button>
            <button 
              onClick={() => setActiveTab('glyph')}
              style={{
                background: activeTab === 'glyph' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'glyph' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              GLYPH DECODER
            </button>
            <button 
              onClick={() => setActiveTab('dossier')}
              style={{
                background: activeTab === 'dossier' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'dossier' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              NET DOSSIER
            </button>
            <button 
              onClick={() => setActiveTab('knowledge')}
              style={{
                background: activeTab === 'knowledge' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'knowledge' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
            >
              KNOWLEDGE ARCHIVE
            </button>
          </div>

          {/* Daily Fact Tab */}
          {activeTab === 'fact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {factLoading ? (
                <div style={{ color: 'var(--text-muted)', padding: '12px', fontSize: '0.85rem' }}>Decrypting datastreams...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Useless Fact */}
                  {uselessFact && (
                    <div style={{ background: 'rgba(0, 240, 255, 0.03)', padding: '10px 12px', borderLeft: '3px solid var(--accent-color)', borderRadius: '0 4px 4px 0' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', marginBottom: '4px', fontWeight: 'bold' }}>
                        GENERAL INTEL FACT
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{uselessFact}</div>
                    </div>
                  )}

                  {/* Cat Fact */}
                  {catFact && (
                    <div style={{ background: 'rgba(0, 240, 255, 0.03)', padding: '10px 12px', borderLeft: '3px solid var(--p3r-cyan)', borderRadius: '0 4px 4px 0' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--p3r-cyan)', fontFamily: 'var(--font-tech)', marginBottom: '4px', fontWeight: 'bold' }}>
                        FELINE RESEARCH OBSERVATION
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{catFact}</div>
                    </div>
                  )}

                  {/* Advice Slip */}
                  {advice && (
                    <div style={{ background: 'rgba(72, 187, 120, 0.03)', padding: '10px 12px', borderLeft: '3px solid #48bb78', borderRadius: '0 4px 4px 0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#48bb78', fontFamily: 'var(--font-tech)', marginBottom: '4px', fontWeight: 'bold' }}>
                        TACTICAL ADVICE DIRECTIVE
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{advice}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Refresh button */}
              <button 
                onClick={fetchAllFacts}
                disabled={factLoading}
                style={{
                  alignSelf: 'flex-end',
                  background: 'transparent',
                  color: 'var(--p3r-blue-light)',
                  border: '1px solid var(--p3r-blue-light)',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-tech)',
                  cursor: factLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {factLoading ? 'LOADING...' : 'REFRESH ALL'}
              </button>
            </div>
          )}

          {/* Glyph Decoder Tab */}
          {activeTab === 'glyph' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Search glyph metadata (e.g. hazard, security)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: '#000',
                  border: '1px solid rgba(0, 163, 224, 0.3)',
                  color: '#fff',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-tech)',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {filteredGlyphs.map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGlyph(g)}
                    style={{
                      background: selectedGlyph?.symbol === g.symbol ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)',
                      color: selectedGlyph?.symbol === g.symbol ? '#000' : '#fff',
                      border: '1px solid rgba(0, 163, 224, 0.2)',
                      fontSize: '1.25rem',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    title={g.name}
                  >
                    {g.symbol}
                  </button>
                ))}
              </div>

              {selectedGlyph ? (
                <div style={{ padding: '10px 12px', background: 'rgba(0, 45, 98, 0.15)', borderLeft: '3px solid var(--p3r-blue-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-tech)' }}>
                      {selectedGlyph.symbol} {selectedGlyph.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0, 163, 224, 0.2)', color: 'var(--p3r-blue-light)', padding: '2px 6px', fontFamily: 'var(--font-tech)' }}>
                      {selectedGlyph.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {selectedGlyph.desc}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: '10px' }}>
                  Select a glyph to decode its system attributes.
                </div>
              )}
            </div>
          )}

          {/* Net Dossier (GitHub + Discord Lanyard) Tab */}
          {activeTab === 'dossier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* SECTION A: GitHub profile tracker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(0, 163, 224, 0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>
                  NETRUNNER PROFILE STALKER (GITHUB)
                </span>
                <form onSubmit={handleGithubSearch} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter GitHub handle..."
                    value={githubQuery}
                    onChange={(e) => setGithubQuery(e.target.value)}
                    style={{
                      flexGrow: 1,
                      background: '#000',
                      border: '1px solid rgba(0, 163, 224, 0.3)',
                      color: '#fff',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-tech)',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="submit"
                    style={{
                      background: 'rgba(0, 45, 98, 0.5)',
                      color: 'var(--p3r-blue-light)',
                      border: '1px solid var(--p3r-blue-light)',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-tech)',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    STALK
                  </button>
                </form>

                {githubLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Extracting code profile logs...</div>}
                {githubError && <div style={{ color: '#fc8181', fontSize: '0.75rem' }}>{githubError}</div>}

                {githubUser && (
                  <div style={{ display: 'flex', gap: '12px', padding: '8px', background: 'rgba(0, 45, 98, 0.1)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                    <img 
                      src={githubUser.avatar_url} 
                      alt={githubUser.login}
                      style={{ width: '48px', height: '48px', borderRadius: '4px', border: '1px solid var(--card-border)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>{githubUser.name || githubUser.login}</span>
                      {githubUser.bio && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{githubUser.bio}</span>}
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.65rem', color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-tech)', marginTop: '4px' }}>
                        <span>REPOS: {githubUser.public_repos}</span>
                        <span>FOLLOWERS: {githubUser.followers}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION B: Discord Lanyard presence tracker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>
                  AGENT PRESENCE UPLINK (DISCORD LANYARD)
                </span>
                <form onSubmit={handleLanyardSearch} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter Discord User ID..."
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                    style={{
                      flexGrow: 1,
                      background: '#000',
                      border: '1px solid rgba(0, 163, 224, 0.3)',
                      color: '#fff',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-tech)',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="submit"
                    style={{
                      background: 'rgba(0, 45, 98, 0.5)',
                      color: 'var(--p3r-blue-light)',
                      border: '1px solid var(--p3r-blue-light)',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-tech)',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    UPLINK
                  </button>
                </form>

                {lanyardLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Syncing orbital lock on Discord telemetry stream...</div>}
                {lanyardError && <div style={{ color: '#fc8181', fontSize: '0.75rem' }}>{lanyardError}</div>}

                {lanyardUser && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'rgba(0, 45, 98, 0.1)', border: '1px solid rgba(0, 163, 224, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>
                        {lanyardUser.discord_user.username}
                      </span>
                      <span 
                        style={{
                          fontSize: '0.65rem',
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: getStatusColor(lanyardUser.discord_status),
                          border: `1px solid ${getStatusColor(lanyardUser.discord_status)}`,
                          padding: '2px 6px',
                          fontFamily: 'var(--font-tech)',
                          textTransform: 'uppercase',
                          fontWeight: 'bold'
                        }}
                      >
                        {lanyardUser.discord_status}
                      </span>
                    </div>

                    {/* Spotify status */}
                    {lanyardUser.listening_to_spotify && lanyardUser.spotify && (
                      <div style={{ display: 'flex', gap: '8px', background: 'rgba(72, 187, 120, 0.05)', padding: '6px', border: '1px solid rgba(72, 187, 120, 0.2)' }}>
                        <img 
                          src={lanyardUser.spotify.album_art_url} 
                          alt="Album Art" 
                          style={{ width: '32px', height: '32px', borderRadius: '2px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.7rem', color: '#48bb78', fontWeight: 'bold' }}>LISTENING TO SPOTIFY</span>
                          <span style={{ fontSize: '0.75rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lanyardUser.spotify.song}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            by {lanyardUser.spotify.artist}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Discord activity */}
                    {lanyardUser.activities && lanyardUser.activities.filter(a => a.name !== 'Spotify').map((activity, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(0, 45, 98, 0.2)', padding: '6px', borderLeft: '2px solid var(--p3r-blue-light)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--p3r-blue-light)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          ACTIVE SOFTWARE
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 'bold' }}>{activity.name}</span>
                        {activity.details && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{activity.details}</span>}
                        {activity.state && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{activity.state}</span>}
                      </div>
                    ))}

                    {!lanyardUser.listening_to_spotify && (!lanyardUser.activities || lanyardUser.activities.length === 0) && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                        No active software runs detected.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Knowledge Archive Tab */}
          {activeTab === 'knowledge' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Category Subselector */}
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
                {(['science', 'history', 'humanities'] as const).map(sub => (
                  <button
                    key={sub}
                    onClick={() => setKnowledgeSubTab(sub)}
                    style={{
                      flexGrow: 1,
                      background: knowledgeSubTab === sub ? 'var(--p3r-blue-light)' : 'transparent',
                      color: knowledgeSubTab === sub ? '#000' : 'var(--text-muted)',
                      border: 'none',
                      padding: '4px 8px',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-tech)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      borderRadius: '2px'
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* SCIENCE/MATH SUB-TAB */}
              {knowledgeSubTab === 'science' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)' }}>
                    CHEMICAL ELEMENTS REGISTRY (SCIENCE/MATH)
                  </div>
                  {/* Grid of Element symbols */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {ELEMENT_DB.map(el => (
                      <button
                        key={el.symbol}
                        onClick={() => setSelectedElement(el)}
                        style={{
                          background: selectedElement.symbol === el.symbol ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)',
                          color: selectedElement.symbol === el.symbol ? '#000' : '#fff',
                          border: '1px solid rgba(0, 163, 224, 0.2)',
                          padding: '6px',
                          fontFamily: 'var(--font-tech)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {el.symbol}
                      </button>
                    ))}
                  </div>

                  {/* Element description details */}
                  <div style={{ padding: '10px', background: 'rgba(0, 45, 98, 0.1)', borderLeft: '3px solid var(--p3r-blue-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>
                      <span>{selectedElement.name} (Atomic #{selectedElement.number})</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--p3r-blue-light)' }}>{selectedElement.group}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      ATOMIC WEIGHT: <span style={{ color: '#fff' }}>{selectedElement.weight} u</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4', marginTop: '4px' }}>
                      {selectedElement.desc}
                    </div>
                  </div>
                </div>
              )}

              {/* HISTORY SUB-TAB */}
              {knowledgeSubTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)' }}>
                    HISTORIC CIPHER MACHINES (HISTORY / CRYPTO MUSEUM)
                  </div>
                  {/* Selector list */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {CIPHER_DB.map(cipher => (
                      <button
                        key={cipher.name}
                        onClick={() => setSelectedCipher(cipher)}
                        style={{
                          background: selectedCipher.name === cipher.name ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)',
                          color: selectedCipher.name === cipher.name ? '#000' : '#fff',
                          border: '1px solid rgba(0, 163, 224, 0.2)',
                          padding: '4px 8px',
                          fontFamily: 'var(--font-tech)',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                      >
                        {cipher.name}
                      </button>
                    ))}
                  </div>

                  {/* Cipher details */}
                  <div style={{ padding: '10px', background: 'rgba(0, 45, 98, 0.1)', borderLeft: '3px solid var(--p3r-blue-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>
                      <span>{selectedCipher.name} ({selectedCipher.year})</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--p3r-blue-light)' }}>{selectedCipher.country}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      CLASSIFICATION: <span style={{ color: '#fff' }}>{selectedCipher.type}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4', marginTop: '4px' }}>
                      {selectedCipher.desc}
                    </div>
                  </div>
                </div>
              )}

              {/* HUMANITIES SUB-TAB */}
              {knowledgeSubTab === 'humanities' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontFamily: 'var(--font-tech)' }}>
                    PHILOSOPHY SCHOOLS & TENETS (HUMANITIES)
                  </div>
                  {/* Selector list */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {PHILOSOPHY_DB.map(p => (
                      <button
                        key={p.school}
                        onClick={() => setSelectedPhilosophy(p)}
                        style={{
                          background: selectedPhilosophy.school === p.school ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)',
                          color: selectedPhilosophy.school === p.school ? '#000' : '#fff',
                          border: '1px solid rgba(0, 163, 224, 0.2)',
                          padding: '4px 8px',
                          fontFamily: 'var(--font-tech)',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                      >
                        {p.school}
                      </button>
                    ))}
                  </div>

                  {/* Philosophy details */}
                  <div style={{ padding: '10px', background: 'rgba(0, 45, 98, 0.1)', borderLeft: '3px solid var(--p3r-blue-light)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>
                      {selectedPhilosophy.school} School
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      CORE PRINCIPLE: <span style={{ color: '#fff' }}>{selectedPhilosophy.core}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      FAMOUS THINKERS: <span style={{ color: 'var(--p3r-blue-light)' }}>{selectedPhilosophy.thinkers}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontStyle: 'italic', borderTop: '1px dashed rgba(0, 163, 224, 0.1)', paddingTop: '6px', marginTop: '2px', lineHeight: '1.4' }}>
                      "{selectedPhilosophy.quote}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelWidget;