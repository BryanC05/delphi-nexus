import React, { useState, useEffect, useRef } from 'react';
import WidgetShell from '@/components/WidgetShell';

type MorseProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
};

const MORSE_MAP: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
  ' ': ' '
};

// Reverse map for decoding
const REVERSE_MORSE: { [key: string]: string } = {};
Object.entries(MORSE_MAP).forEach(([char, code]) => {
  if (code !== ' ') REVERSE_MORSE[code] = char;
});

const MorseWidget: React.FC<MorseProps> = ({ isCollapsed, onToggleCollapse, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  
  // Encoder State
  const [textToEncode, setTextToEncode] = useState('HELLO DELPHI');
  const [morseEncoded, setMorseEncoded] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Decoder State
  const [morseInput, setMorseInput] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [currentPattern, setCurrentPattern] = useState('');
  
  const pressStartTime = useRef<number>(0);
  const lastReleaseTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Translate text to morse
  useEffect(() => {
    const upperText = textToEncode.toUpperCase();
    const result = upperText.split('')
      .map(char => MORSE_MAP[char] || '?')
      .join(' ');
    setMorseEncoded(result);
  }, [textToEncode]);

  // Handle live tap timing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (pressStartTime.current === 0) {
        pressStartTime.current = Date.now();
        playBeep(600);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      stopBeep();
      const duration = Date.now() - pressStartTime.current;
      pressStartTime.current = 0;
      
      const symbol = duration < 200 ? '.' : '-';
      setCurrentPattern(prev => prev + symbol);
      lastReleaseTime.current = Date.now();

      // Trigger letters or word boundary checks
      resetDecodingTimer();
    }
  };

  const handlePointerDown = () => {
    if (pressStartTime.current === 0) {
      pressStartTime.current = Date.now();
      playBeep(600);
    }
  };

  const handlePointerUp = () => {
    stopBeep();
    const duration = Date.now() - pressStartTime.current;
    pressStartTime.current = 0;
    
    const symbol = duration < 200 ? '.' : '-';
    setCurrentPattern(prev => prev + symbol);
    lastReleaseTime.current = Date.now();

    resetDecodingTimer();
  };

  const resetDecodingTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      // User paused, translate current dots/dashes pattern to letter
      setCurrentPattern(pattern => {
        if (pattern) {
          const letter = REVERSE_MORSE[pattern] || '?';
          setDecodedText(prev => prev + letter);
          setMorseInput(prev => prev + pattern + ' ');
        }
        return '';
      });
    }, 600); // 600ms boundary between letters
  };

  // Beep generator helpers
  const playBeep = (freq: number, duration?: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);

      if (duration) {
        osc.stop(ctx.currentTime + duration);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      } else {
        (window as any).activeOscillator = osc;
        (window as any).activeGain = gain;
      }
    } catch (e) {
      console.warn('Audio Context failed to play beep.', e);
    }
  };

  const stopBeep = () => {
    const osc = (window as any).activeOscillator;
    const gain = (window as any).activeGain;
    if (osc && gain && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.stop(ctx.currentTime + 0.05);
      (window as any).activeOscillator = null;
      (window as any).activeGain = null;
    }
  };

  const playEncodedAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    const dotDuration = 0.08;
    const dashDuration = dotDuration * 3;
    const elementPause = dotDuration;
    const letterPause = dotDuration * 3;
    const wordPause = dotDuration * 7;

    const playSymbol = (symbol: string) => {
      return new Promise<void>(resolve => {
        const duration = symbol === '.' ? dotDuration : dashDuration;
        playBeep(600, duration);
        setTimeout(resolve, (duration + elementPause) * 1000);
      });
    };

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Split words
    const words = textToEncode.toUpperCase().split(' ');
    for (let wIdx = 0; wIdx < words.length; wIdx++) {
      const word = words[wIdx];
      for (let cIdx = 0; cIdx < word.length; cIdx++) {
        const char = word[cIdx];
        const morseCode = MORSE_MAP[char];
        if (morseCode) {
          for (let sIdx = 0; sIdx < morseCode.length; sIdx++) {
            await playSymbol(morseCode[sIdx]);
          }
          await sleep(letterPause * 1000);
        }
      }
      if (wIdx < words.length - 1) {
        await sleep(wordPause * 1000);
      }
    }

    setIsPlaying(false);
  };

  const handleClearDecoder = () => {
    setMorseInput('');
    setDecodedText('');
    setCurrentPattern('');
  };

  return (
    <WidgetShell
      title="MORSE CODE TRANSMITTER"
      status="online"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onRemove={onRemove}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tab Selection */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 163, 224, 0.2)', paddingBottom: '8px', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('encode')}
              style={{
                background: activeTab === 'encode' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'encode' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              ENCODER
            </button>
            <button 
              onClick={() => setActiveTab('decode')}
              style={{
                background: activeTab === 'decode' ? 'var(--p3r-blue-light)' : 'transparent',
                color: activeTab === 'decode' ? '#000' : 'var(--text-muted)',
                border: '1px solid rgba(0, 163, 224, 0.3)',
                padding: '6px 12px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-p3r)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              TAP DECODER
            </button>
          </div>

          {/* Encoder Tab */}
          {activeTab === 'encode' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>INPUT SIGNAL TEXT</span>
                <input 
                  type="text" 
                  value={textToEncode} 
                  onChange={(e) => setTextToEncode(e.target.value)} 
                  style={{
                    background: '#000',
                    border: '1px solid rgba(0, 163, 224, 0.3)',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-tech)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>MORSE CODE OUTPUT</span>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(0, 163, 224, 0.1)',
                  padding: '10px 12px',
                  color: 'var(--p3r-blue-light)',
                  fontFamily: 'var(--font-tech)',
                  fontSize: '0.9rem',
                  letterSpacing: '2px',
                  minHeight: '40px',
                  wordBreak: 'break-all'
                }}>
                  {morseEncoded}
                </div>
              </div>

              <button 
                onClick={playEncodedAudio}
                disabled={isPlaying}
                style={{
                  background: isPlaying ? 'rgba(0, 163, 224, 0.1)' : 'rgba(0, 45, 98, 0.4)',
                  color: isPlaying ? 'var(--text-muted)' : 'var(--p3r-blue-light)',
                  border: '1px solid var(--p3r-blue-light)',
                  padding: '8px 16px',
                  fontFamily: 'var(--font-tech)',
                  fontWeight: 'bold',
                  cursor: isPlaying ? 'not-allowed' : 'pointer'
                }}
              >
                {isPlaying ? 'TRANSMITTING...' : 'PLAY SIGNAL BEEP'}
              </button>
            </div>
          )}

          {/* Decoder Tab */}
          {activeTab === 'decode' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>INPUT PATTERN</span>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', minHeight: '40px', color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-tech)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {morseInput} <span style={{ color: '#fff', borderBottom: '2px solid #fff' }}>{currentPattern}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DECRYPTED TRANSLATION</span>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', minHeight: '40px', color: '#fff', fontFamily: 'var(--font-tech)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {decodedText || 'Tapping logs blank...'}
                  </div>
                </div>
              </div>

              {/* Tap Keypad */}
              <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                style={{
                  background: 'rgba(0, 45, 98, 0.3)',
                  border: '2px dashed var(--p3r-blue-light)',
                  color: '#fff',
                  height: '100px',
                  fontFamily: 'var(--font-tech)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🎛</span>
                <span>TAP AND HOLD KEYPAD</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>(Or click here and hold Spacebar)</span>
              </button>

              <button 
                onClick={handleClearDecoder}
                style={{
                  background: 'transparent',
                  color: '#fc8181',
                  border: '1px solid rgba(252, 129, 129, 0.4)',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-tech)',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                RESET TRANSCRIPTER
              </button>
            </div>
          )}
        </div>
    </WidgetShell>
  );
};

export default MorseWidget;
