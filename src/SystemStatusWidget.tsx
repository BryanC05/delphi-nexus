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
          timeoutId = setTimeout(checkPing, 1500);
        }
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(13, 22, 37, 0.7)', padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(4px)' }}>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Uplink</span>
      <div style={{ width: '60px', height: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pingData}>
            <YAxis domain={[0, 100]} hide />
            <Area type="step" dataKey="ping" stroke="var(--accent-color)" fill="rgba(0, 240, 255, 0.2)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <span style={{ color: currentPing > 40 ? '#fc8181' : '#48bb78', fontFamily: 'var(--font-tech)', fontWeight: 'bold', fontSize: '1rem', minWidth: '45px', textAlign: 'right' }}>{currentPing}ms</span>
    </div>
  );
};

export default SystemStatusWidget;