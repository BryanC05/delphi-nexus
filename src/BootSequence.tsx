import React, { useState, useEffect } from 'react';

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const sequence = [
      "INITIALIZING SYSTEM KERNEL...",
      "ESTABLISHING SECURE UPLINK... [OK]",
      "LOADING SATELLITE IMAGERY... [OK]",
      "BYPASSING MAINFRAME ENCRYPTION... [OK]",
      "DECRYPTING DATASTREAMS...",
      "ACCESS GRANTED. WELCOME."
    ];

    let delay = 0;
    sequence.forEach((line, index) => {
      delay += 300 + Math.random() * 400; // Random delay for hacker feel
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (index === sequence.length - 1) {
          setTimeout(onComplete, 800); // Wait a brief moment before completing
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="boot-sequence">
      <div className="boot-terminal">
        {lines.map((line, i) => (
          <div key={i} className="boot-line">{`> ${line}`}</div>
        ))}
        <div className="boot-cursor" />
      </div>
    </div>
  );
};

export default BootSequence;