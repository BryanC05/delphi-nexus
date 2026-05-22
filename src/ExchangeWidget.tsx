import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ExchangeRateHistory } from './types';

type ExchangeWidgetProps = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const ExchangeWidget: React.FC<ExchangeWidgetProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [history, setHistory] = useState<ExchangeRateHistory[]>([]);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [isRealTime, setIsRealTime] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchRates = async () => {
      setIsLoading(true);
      setIsMockData(false);

      // Fallback function to generate realistic random data if the API is unavailable
      const generateMockData = () => {
        if (!isMounted) return;
        setIsMockData(true);
        const mockData: ExchangeRateHistory[] = [];
        let currentMockRate = 17696; // Updated to match current approximate rate
        for (let i = 30; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          currentMockRate += Math.random() * 100 - 50; // Random daily fluctuation
          mockData.push({
            date: d.toISOString().split('T')[0],
            rate: Math.round(currentMockRate),
          });
        }
        setHistory(mockData);
        setCurrentRate(mockData[mockData.length - 1].rate);
      };

      try {
        // Use 'from' and 'to' as per Frankfurter's official documentation
        const latestRes = await axios.get(`https://api.frankfurter.app/latest?from=USD&to=IDR`);
        const latestDateStr = latestRes.data.date;

        const end = new Date(latestDateStr);
        const start = new Date(latestDateStr);
        start.setDate(end.getDate() - 30); // Calculate 30 days before the *actual* latest available date

        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        const response = await axios.get(
          `https://api.frankfurter.app/${formatDate(start)}..${latestDateStr}?from=USD&to=IDR`
        );

        const rates = response.data.rates || {};
        const chartData = Object.keys(rates).map((date) => ({
          date,
          rate: rates[date].IDR,
        }));

        if (chartData.length > 0 && isMounted) {
          setHistory(chartData);
          setCurrentRate(chartData[chartData.length - 1].rate);
        } else {
          generateMockData();
        }
      } catch (error) {
        console.error('Error fetching exchange rates, using mock data:', error);
        generateMockData();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const fetchLiveRate = async () => {
      if (!process.env.REACT_APP_POLYGON_API_KEY) {
        // Silently skip live fetching if no key is present, gracefully falling back to Frankfurter
        return;
      }
      try {
        const res = await axios.get(`https://api.polygon.io/v1/conversion/USD/IDR`, {
          params: { amount: 1, apiKey: process.env.REACT_APP_POLYGON_API_KEY }
        });
        if (res.data && res.data.converted && isMounted) {
          setCurrentRate(res.data.converted);
          setIsRealTime(true);
          setLiveError(null);
        }
      } catch (error: any) {
        console.error('Real-time API error:', error);
        if (error.response?.status === 401) {
          setLiveError('Invalid Polygon Key');
        } else if (error.response?.status === 403) {
          setLiveError('Polygon Premium Required');
        } else if (error.response?.status === 429) {
          setLiveError('Rate Limit Reached');
        } else if (error.response?.data?.error) {
          // Extract Polygon's exact error message (e.g. "Not subscribed to this market")
          setLiveError(error.response.data.error);
        } else {
          // Extract the browser's exact network error
          setLiveError(error.message || 'Live Data Failed');
        }
      }
    };

    // Fetch historical chart first, then fetch live data and start the 60-second polling timer
    fetchRates().then(() => {
      fetchLiveRate();
      if (process.env.REACT_APP_POLYGON_API_KEY) {
        intervalId = setInterval(fetchLiveRate, 60000);
      }
    });

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="widget exchange-widget">
        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)' }}>
          <span>USD to IDR (30 Days)</span>
          <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
        </h3>
        {!isCollapsed && <div className="widget-content" style={{ color: 'var(--text-muted)' }}>Loading exchange rates...</div>}
      </div>
    );
  }

  if (!currentRate) {
    return (
      <div className="widget exchange-widget">
        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)' }}>
          <span>USD to IDR (30 Days)</span>
          <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
        </h3>
        {!isCollapsed && <div className="widget-content" style={{ color: 'var(--text-muted)' }}>Exchange rate data currently unavailable.</div>}
      </div>
    );
  }

  return (
    <div className="widget exchange-widget">
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : '16px', borderBottom: isCollapsed ? 'none' : '1px solid var(--card-border)' }}>
        <span>
          USD to IDR (30 Days)
          {isRealTime ? (
            <span style={{ fontSize: '0.8rem', color: '#48bb78', marginLeft: '8px', fontWeight: 'bold' }}>
              🔴 Live
            </span>
          ) : liveError ? (
            <span style={{ fontSize: '0.8rem', color: '#fc8181', marginLeft: '8px', fontWeight: 'normal' }}>
              ({liveError})
            </span>
          ) : isMockData && (
            <span style={{ fontSize: '0.8rem', color: '#fc8181', marginLeft: '8px', fontWeight: 'normal' }}>
              (Mock Data)
            </span>
          )}
        </span>
        <button className="collapse-btn" onClick={onToggleCollapse}>{isCollapsed ? '+' : '-'}</button>
      </h3>
      {!isCollapsed && (
        <div className="widget-content">
          <div className="exchange-current">
            <span className="exchange-label">1 USD =</span>
            <span className="exchange-rate">Rp {currentRate.toLocaleString('id-ID')}</span>
          </div>
          <div className="chart-container" style={{ height: '120px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid #4a5568', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--accent-color)' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Rate']}
                  labelStyle={{ color: 'var(--text-muted)' }}
                />
                <Line type="monotone" dataKey="rate" stroke="var(--accent-color)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeWidget;