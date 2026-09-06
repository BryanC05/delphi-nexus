import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const SystemStatusWidget: React.FC = () => {
  const [pingData, setPingData] = useState<{ time: string; ping: number }[]>([]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Generate initial flatline data
    const initialData = Array.from({ length: 20 }).map((_, i) => ({ time: `${i}`, ping: 0 }));
    setPingData(initialData);

    const checkPing = () => {
      const start = performance.now();
           const img = new Image();

           const handleResult = (pingValue: number) => {
        if (isMounted) {
          setPingData(prev => [...prev.slice(1), { time: Date.now().toString(), ping: pingValue }]);
          timeoutId = setTimeout(checkPing, 4000); // Check every 4 seconds to save CPU/Network
        }
        // Clear handlers so the image gets Garbage Collected from memory instantly
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => handleResult(Math.floor(performance.now() - start));
      img.onerror = () => handleResult(999);
      
      // Load a tiny, highly-available image to check connection speed bypassing CORS/Adblockers
      img.src = `https://www.google.com/favicon.ico?nocache=${start}`;
    };

    checkPing();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const currentPing = pingData.length > 0 ? pingData[pingData.length - 1].ping : 0;

  return (
    <div className="system-status-widget r1999-telemetry-widget">
      <div className="r1999-telemetry-meta">
        <span className="r1999-telemetry-indicator" />
        <span className="system-status-label r1999-telemetry-title">RESONANCE</span>
      </div>
      <div className="system-status-chart" style={{ width: '75px', height: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pingData}>
            <YAxis domain={[0, 100]} hide />
            <Area
              type="monotone"
              dataKey="ping"
              stroke="var(--accent-color)"
              fill="var(--accent-color)"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <span
        className="system-status-ping r1999-telemetry-val"
        style={{
          color: currentPing > 100 ? '#e06c75' : 'var(--accent-color)',
        }}
      >
        {currentPing}
        <small>ms</small>
      </span>
    </div>
  );
};

export default SystemStatusWidget;