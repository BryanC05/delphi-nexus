import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

type LanguageProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

type ForeignWord = {
  word: string;
  nativeScript: string;
  language: string;
  pronunciation: string;
  translation: string;
  meaning: string;
};

const FOREIGN_WORDS: ForeignWord[] = [
  // Japanese
  { word: 'Komorebi', nativeScript: '木漏れ日', language: 'Japanese', pronunciation: 'koh-moh-reh-bee', translation: 'Sunlight filtering through trees', meaning: 'The beautiful interplay of light and leaves when sunlight shines through forest branches.' },
  { word: 'Ikigai', nativeScript: '生き甲斐', language: 'Japanese', pronunciation: 'ee-kee-guy', translation: 'A reason for being', meaning: 'The intersection of what you love, what you are good at, what the world needs, and what you can get paid for.' },
  { word: 'Wabi-Sabi', nativeScript: '侘寂', language: 'Japanese', pronunciation: 'wah-bee-sah-bee', translation: 'Imperfect beauty', meaning: 'A worldview centered on the acceptance of transience, imperfection, and finding beauty in the natural cycle of growth and decay.' },
  { word: 'Shinrin-Yoku', nativeScript: '森林浴', language: 'Japanese', pronunciation: 'sheen-reen-yoh-koo', translation: 'Forest bathing', meaning: 'Spending time in a forest to absorb its therapeutic atmosphere, reducing stress and restoring mental health.' },
  { word: 'Mono No Aware', nativeScript: '物の哀れ', language: 'Japanese', pronunciation: 'moh-noh noh ah-wah-reh', translation: 'The pathos of things', meaning: 'A gentle, empathetic sadness at the transience and impermanence of beautiful things and life itself.' },

  // German
  { word: 'Schadenfreude', nativeScript: 'Schadenfreude', language: 'German', pronunciation: 'shah-den-froy-deh', translation: 'Harm-joy / Malicious joy', meaning: 'Pleasure or satisfaction derived by someone from another person\'s misfortune.' },
  { word: 'Fernweh', nativeScript: 'Fernweh', language: 'German', pronunciation: 'fehrn-vey', translation: 'Farsickness', meaning: 'An intense ache or longing for distant, unknown places; the exact opposite of homesickness.' },
  { word: 'Waldeinsamkeit', nativeScript: 'Waldeinsamkeit', language: 'German', pronunciation: 'vahld-yn-zahm-kyt', translation: 'Forest solitude', meaning: 'The meditative feeling of solitude, peace, and deep connectedness to nature when being alone in the woods.' },
  { word: 'Kummerspeck', nativeScript: 'Kummerspeck', language: 'German', pronunciation: 'koo-mer-shpek', translation: 'Grief-bacon', meaning: 'The physical weight gained from emotional overeating or stress-induced eating (literally translates to "grief-bacon").' },

  // French
  { word: 'Dépaysement', nativeScript: 'Dépaysement', language: 'French', pronunciation: 'day-pay-eez-mah', translation: 'Disorientation abroad', meaning: 'The feeling of disorientation or displacement that comes from being in a foreign country; feeling like an outsider.' },
  { word: 'Flâneur', nativeScript: 'Flâneur', language: 'French', pronunciation: 'flah-nuer', translation: 'Stroller / Passionate wanderer', meaning: 'An observer of society who strolls city streets aimlessly, experiencing and contemplating the urban environment.' },
  { word: 'Retrouvailles', nativeScript: 'Retrouvailles', language: 'French', pronunciation: 'ruh-troo-vy', translation: 'Joy of rediscovery', meaning: 'The warm, euphoric feeling of reuniting with someone you love after a long separation.' },

  // Spanish
  { word: 'Sobremesa', nativeScript: 'Sobremesa', language: 'Spanish', pronunciation: 'soh-breh-meh-sah', translation: 'Post-meal table talk', meaning: 'The time spent lingering around the table after a meal, sharing conversations, stories, and laughter.' },
  { word: 'Estrenar', nativeScript: 'Estrenar', language: 'Spanish', pronunciation: 'es-treh-nar', translation: 'To debut / Wear for the first time', meaning: 'The act of using or wearing something new (like a clothing item, car, or tool) for the very first time.' },
  { word: 'Querencia', nativeScript: 'Querencia', language: 'Spanish', pronunciation: 'keh-ren-thyah', translation: 'Safe haven / Draw strength', meaning: 'A place where one feels safe and at home; the spot where you draw your greatest strength and sense of self.' },

  // Portuguese
  { word: 'Saudade', nativeScript: 'Saudade', language: 'Portuguese', pronunciation: 'sow-dah-deh', translation: 'Longing / Melancholy yearning', meaning: 'A deep emotional state of melancholic longing for an absent person or thing that is loved, often accompanied by the knowledge that it may never return.' },
  { word: 'Cafuné', nativeScript: 'Cafuné', language: 'Portuguese', pronunciation: 'cah-foo-neh', translation: 'Caressing hair', meaning: 'The tender act of running your fingers through a loved one\'s hair to soothe or show affection.' },
  { word: 'Desbundar', nativeScript: 'Desbundar', language: 'Portuguese', pronunciation: 'dez-boon-dar', translation: 'Shedding inhibitions', meaning: 'Losing one\'s fears and inhibitions to fully let loose, go wild, and enjoy yourself in a moment.' },

  // Greek
  { word: 'Meraki', nativeScript: 'μεράκι', language: 'Greek', pronunciation: 'may-rah-kee', translation: 'Soul, love, or creativity', meaning: 'Putting absolute soul, creativity, or love into whatever you do; leaving a piece of yourself in your work.' },
  { word: 'Filotimo', nativeScript: 'φιλότιμο', language: 'Greek', pronunciation: 'fee-loh-tee-moh', translation: 'Love of honor / Altruism', meaning: 'A complex array of virtues including respect, duty, pride, dignity, and acting selflessly for the good of others.' },

  // Dutch
  { word: 'Gezellig', nativeScript: 'Gezellig', language: 'Dutch', pronunciation: 'kheh-zel-ikh', translation: 'Cozy social warmth', meaning: 'A feeling of coziness, comfort, and togetherness; time spent with loved ones in a warm atmosphere.' },
  { word: 'Uitwaaien', nativeScript: 'Uitwaaien', language: 'Dutch', pronunciation: 'out-way-en', translation: 'To blow out / Walk in wind', meaning: 'To walk or run outdoors in the wind to clear your mind, refresh your body, and blow away stress.' }
];

const FALLBACK_ENGLISH_WORDS = [
  'universe', 'solitude', 'adventure', 'discovery', 'courage',
  'freedom', 'whisper', 'shadow', 'aurora', 'nebula',
  'destiny', 'journey', 'horizon', 'mirage', 'gravity',
  'oasis', 'echo', 'harmony', 'paradox', 'velocity',
  'legend', 'enigma', 'summit', 'ocean', 'forest'
];

const LanguageWidget: React.FC<LanguageProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [subTab, setSubTab] = useState<'archive' | 'translator'>('archive');
  
  // Archive States
  const [selectedWord, setSelectedWord] = useState<ForeignWord>(FOREIGN_WORDS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Translator States
  const [inputWord, setInputWord] = useState('');
  const [targetLang, setTargetLang] = useState<'es' | 'fr' | 'de' | 'it' | 'ja' | 'zh' | 'ko'>('es');
  const [translationResult, setTranslationResult] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Archive Randomize
  const handleRandomize = () => {
    let randWord;
    do {
      randWord = FOREIGN_WORDS[Math.floor(Math.random() * FOREIGN_WORDS.length)];
    } while (randWord.word === selectedWord.word && FOREIGN_WORDS.length > 1);
    setSelectedWord(randWord);
  };

  const filteredWords = FOREIGN_WORDS.filter(w =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.nativeScript.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Live Translator API call
  const translateWord = async (word: string, langCode: string) => {
    if (!word.trim()) return;
    setTranslationLoading(true);
    setTranslationError('');
    setTranslationResult('');
    try {
      const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word.trim())}&langpair=en|${langCode}`);
      if (res.data && res.data.responseData) {
        setTranslationResult(res.data.responseData.translatedText);
      } else {
        setTranslationError('Unable to extract translation data.');
      }
    } catch (err) {
      console.error(err);
      setTranslationError('Translation API request failed.');
    } finally {
      setTranslationLoading(false);
    }
  };

  // Live Translator Random Word + API Translation call (with DataMuse high-availability API)
  const fetchRandomAndTranslate = async (langCode: string) => {
    setTranslationLoading(true);
    setTranslationError('');
    setTranslationResult('');
    let randWord = '';
    
    try {
      const wordRes = await axios.get('https://api.datamuse.com/words?topics=science,nature,technology&max=100');
      if (wordRes.data && wordRes.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * wordRes.data.length);
        randWord = wordRes.data[randomIndex].word;
      }
    } catch (err) {
      console.warn('DataMuse word API failed, using local fallback word list.');
      randWord = FALLBACK_ENGLISH_WORDS[Math.floor(Math.random() * FALLBACK_ENGLISH_WORDS.length)];
    }

    if (!randWord) {
      randWord = FALLBACK_ENGLISH_WORDS[Math.floor(Math.random() * FALLBACK_ENGLISH_WORDS.length)];
    }

    setInputWord(randWord);

    try {
      const transRes = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(randWord)}&langpair=en|${langCode}`);
      if (transRes.data && transRes.data.responseData) {
        setTranslationResult(transRes.data.responseData.translatedText);
      } else {
        setTranslationError('Unable to translate random word.');
      }
    } catch (err) {
      console.error(err);
      setTranslationError('Translation API request failed.');
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <div className="widget" style={isCollapsed ? { padding: '24px', overflow: 'hidden' } : { padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--accent-color)', paddingBottom: isCollapsed ? 0 : '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>LINGUISTIC DIALECTS</span>
          <span className="api-indicator">DB ONLINE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
          <button className="remove-btn" onClick={onRemove}>×</button>
        </div>
      </h3>

      {!isCollapsed && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(0, 163, 224, 0.15)', paddingBottom: '10px', marginBottom: '12px' }}>
          <button
            onClick={() => setSubTab('archive')}
            style={{
              background: subTab === 'archive' ? 'var(--p3r-blue-light)' : 'transparent',
              color: subTab === 'archive' ? '#000' : 'var(--text-muted)',
              border: '1px solid rgba(0, 163, 224, 0.3)',
              padding: '4px 10px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-p3r)',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease'
            }}
          >
            DIALECT ARCHIVE
          </button>
          <button
            onClick={() => setSubTab('translator')}
            style={{
              background: subTab === 'translator' ? 'var(--p3r-blue-light)' : 'transparent',
              color: subTab === 'translator' ? '#000' : 'var(--text-muted)',
              border: '1px solid rgba(0, 163, 224, 0.3)',
              padding: '4px 10px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-p3r)',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease'
            }}
          >
            API TRANSLATOR
          </button>
        </div>
      )}

      {!isCollapsed && subTab === 'archive' && (
        <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Dropdown Selector */}
            <div ref={dropdownRef} className="custom-dropdown" style={{ flexGrow: 1, minWidth: '150px', zIndex: dropdownOpen ? 1002 : 1 }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="custom-dropdown-trigger"
                style={{ fontSize: '0.75rem', padding: '8px 12px' }}
              >
                <span className="custom-dropdown-value">{selectedWord.word} ({selectedWord.language})</span>
                <span className={`custom-dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              {dropdownOpen && (
                <ul className="custom-dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, listStyle: 'none', padding: 0, margin: 0, background: '#000', border: '1px solid var(--p3r-blue-light)', maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredWords.map(w => (
                    <li key={w.word}>
                      <button 
                        onClick={() => { setSelectedWord(w); setDropdownOpen(false); }} 
                        className={`custom-dropdown-item ${selectedWord.word === w.word ? 'active' : ''}`}
                        style={{ width: '100%', border: 'none', textAlign: 'left', fontSize: '0.75rem', padding: '8px 12px', background: 'transparent', cursor: 'pointer', color: '#fff' }}
                      >
                        {w.word} ({w.language})
                      </button>
                    </li>
                  ))}
                  {filteredWords.length === 0 && (
                    <li style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No matches found.
                    </li>
                  )}
                </ul>
              )}
            </div>

            <button 
              onClick={handleRandomize}
              style={{
                background: 'rgba(0, 45, 98, 0.4)',
                color: 'var(--p3r-blue-light)',
                border: '1px solid var(--p3r-blue-light)',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-tech)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎲 RANDOM
            </button>
          </div>

          {/* Search bar inside widget */}
          <input 
            type="text" 
            placeholder="Search dialect meaning or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: '#000',
              border: '1px solid rgba(0, 163, 224, 0.2)',
              color: '#fff',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-tech)',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />

          {/* Display Card */}
          <div style={{ padding: '16px', background: 'rgba(0, 45, 98, 0.15)', borderLeft: '4px solid var(--accent-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Native script (large Kanji/letters) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0, 163, 224, 0.15)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-tech)', lineHeight: '1.1', textShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}>
                  {selectedWord.nativeScript}
                </span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {selectedWord.word}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(0, 163, 224, 0.2)', color: 'var(--p3r-cyan)', padding: '4px 8px', fontWeight: 'bold', fontFamily: 'var(--font-tech)', textTransform: 'uppercase' }}>
                {selectedWord.language}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              PRONUNCIATION: /{selectedWord.pronunciation}/
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              TRANSLATION: {selectedWord.translation}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {selectedWord.meaning}
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && subTab === 'translator' && (
        <div className="widget-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as any)}
              style={{
                flexGrow: 1,
                background: '#000',
                border: '1px solid var(--p3r-blue-light)',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none'
              }}
            >
              <option value="es">Spanish (es)</option>
              <option value="fr">French (fr)</option>
              <option value="de">German (de)</option>
              <option value="it">Italian (it)</option>
              <option value="ja">Japanese (ja)</option>
              <option value="zh">Chinese (zh)</option>
              <option value="ko">Korean (ko)</option>
            </select>

            <button 
              onClick={() => fetchRandomAndTranslate(targetLang)}
              disabled={translationLoading}
              style={{
                background: 'rgba(0, 45, 98, 0.4)',
                color: 'var(--p3r-blue-light)',
                border: '1px solid var(--p3r-blue-light)',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-tech)',
                cursor: translationLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎲 RANDOM WORD
            </button>
          </div>

          {/* Form to submit translation query */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              translateWord(inputWord, targetLang);
            }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input 
              type="text" 
              placeholder="Type English word to translate..."
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              style={{
                flexGrow: 1,
                background: '#000',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-tech)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={translationLoading}
              style={{
                background: 'var(--p3r-blue-light)',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-tech)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              TRANSLATE
            </button>
          </form>

          {/* Results display */}
          <div style={{ padding: '16px', background: 'rgba(0, 45, 98, 0.15)', borderLeft: '4px solid var(--accent-color)', minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {translationLoading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Running lookup query through MyMemory API...</div>
            ) : translationError ? (
              <div style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>Error: {translationError}</div>
            ) : translationResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--p3r-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  MYMEMORY TRANSLATION DATA
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-tech)' }}>
                    {translationResult}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    (from: "{inputWord}")
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px' }}>
                  Target Language: {targetLang.toUpperCase()}
                </span>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center' }}>
                Enter an English word and translate, or click "Random Word" to test the API translation streams.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageWidget;
