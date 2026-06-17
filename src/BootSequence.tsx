import React, { useState, useEffect } from 'react';

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequence = [
      "CONNECTING TO DATA CHANNELS...",
      "SUMMONING DATA STREAMS...",
      "CALIBRATING SYSTEM INTERFACE...",
      "SYNCHRONIZING SYSTEM TIME...",
      "DATA NETWORK ONLINE."
    ];

    let delay = 0;
    sequence.forEach((line, index) => {
      delay += 400 + Math.random() * 300;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        setProgress(((index + 1) / sequence.length) * 100);
        if (index === sequence.length - 1) {
          setTimeout(onComplete, 1200);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="boot-sequence" style={{ 
      background: 'radial-gradient(circle, #002D62 0%, #000 100%)', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      color: '#fff',
      fontFamily: '"Impact", sans-serif'
    }}>
      <div style={{ 
        fontSize: '4rem', 
        marginBottom: '40px', 
        textShadow: '0 0 20px rgba(0, 163, 224, 0.8)',
        letterSpacing: '5px'
      }}>
        LOADING...
      </div>
      
      <div className="boot-terminal" style={{ 
        width: '400px', 
        height: 'auto', 
        border: 'none', 
        background: 'transparent',
        textAlign: 'center',
        fontFamily: '"Helvetica Neue", sans-serif',
        fontSize: '1rem',
        letterSpacing: '2px',
        color: 'var(--p3r-blue-light)'
      }}>
        {lines.map((line, i) => (
          <div key={i} className="boot-line" style={{ marginBottom: '8px', opacity: 0.8 }}>{line}</div>
        ))}
      </div>

      <div style={{ 
        width: '300px', 
        height: '4px', 
        background: 'rgba(255,255,255,0.1)', 
        marginTop: '20px',
        position: 'relative'
      }}>
        <div style={{ 
          width: `${progress}%`, 
          height: '100%', 
          background: 'var(--p3r-blue-light)',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 10px var(--p3r-blue-light)'
        }} />
      </div>
    </div>
  );
};

export default BootSequence;