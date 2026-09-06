import React, { useState, useEffect } from 'react';

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequence = [
      'CALIBRATING CHRONOLOGICAL REELS...',
      'MONITORING TEMPORAL RESONANCE TELEMETRY...',
      'DECRYPTING CLASSIFIED DOSSIER ARCHIVES...',
      'ALIGNING CELESTIAL AND GEOGRAPHIC MATRIX...',
      'TEMPORAL REEL SYNCHRONIZED // SYSTEM STABLE.',
    ];

    let delay = 0;
    sequence.forEach((line, index) => {
      delay += 380 + Math.random() * 260;
      setTimeout(() => {
        setLines((prev) => [...prev, line]);
        setProgress(((index + 1) / sequence.length) * 100);
        if (index === sequence.length - 1) {
          setTimeout(onComplete, 1100);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="boot-sequence r1999-boot">
      <div className="r1999-boot-emblem">
        <div className="r1999-boot-ring" />
        <div className="r1999-boot-inner-ring" />
        <span className="r1999-boot-year" aria-hidden="true">◈</span>
      </div>

      <div className="r1999-boot-subtitle">CLASSIFIED ARCHIVAL SYSTEM // CHRONO-REEL</div>
      <h1 className="r1999-boot-title">DELPHI // NEXUS</h1>

      <div className="boot-terminal r1999-boot-terminal">
        {lines.map((line, i) => (
          <div key={i} className="r1999-boot-line">
            <span className="r1999-bullet">◇</span> {line}
          </div>
        ))}
      </div>

      <div className="r1999-boot-bar-wrap">
        <div className="r1999-boot-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="r1999-boot-footer">
        TEMPORAL TELEMETRY INTERFACE &bull; ARCHIVE INDEX 19.99
      </div>
    </div>
  );
};

export default BootSequence;
