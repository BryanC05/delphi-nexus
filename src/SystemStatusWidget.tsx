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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--p3r-blue-dark)', padding: '10px 20px', borderRadius: '0', borderLeft: '4px solid var(--p3r-blue-light)', boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
      <span style={{ color: '#fff', fontFamily: 'var(--font-p3r)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>LINK_STABILITY</span>
      <div style={{ width: '80px', height: '28px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pingData}>
            <YAxis domain={[0, 100]} hide />
            <Area type="monotone" dataKey="ping" stroke="#fff" fill="var(--p3r-blue-light)" fillOpacity={0.4} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <span style={{ color: currentPing > 60 ? '#fc8181' : '#fff', fontFamily: 'var(--font-p3r)', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '55px', textAlign: 'right' }}>{currentPing}ms</span>
    </div>
  );
};

export default SystemStatusWidget;