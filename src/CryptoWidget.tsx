import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CryptoData } from './types';

const CryptoWidget: React.FC = () => {
  const [crypto, setCrypto] = useState<CryptoData | null>(null);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
          params: {
            ids: 'bitcoin,ethereum',
            vs_currencies: 'usd',
          },
        });
        setCrypto(response.data);
      } catch (error) {
        console.error('Error fetching crypto:', error);
      }
    };
    fetchCrypto();
  }, []);

  if (!crypto) return null;

  return (
    <div className="ticker-container">
      <div className="ticker-content">
        {/* Repeat items a few times to create a seamless infinite scroll loop */}
        {[...Array(6)].map((_, i) => (
          <React.Fragment key={i}>
            <span className="ticker-item">
              <span className="ticker-label">BTC/USD</span>
              <span className="ticker-value">${crypto.bitcoin.usd.toLocaleString()}</span>
            </span>
            <span className="ticker-item">
              <span className="ticker-label">ETH/USD</span>
              <span className="ticker-value">${crypto.ethereum.usd.toLocaleString()}</span>
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CryptoWidget;