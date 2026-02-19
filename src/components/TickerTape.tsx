'use client';

import { useEffect, useState } from 'react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const mockTickers: TickerItem[] = [
  { symbol: 'OBX', price: 1324.56, change: 12.34, changePercent: 0.94 },
  { symbol: 'AAPL', price: 195.89, change: -2.15, changePercent: -1.09 },
  { symbol: 'TSLA', price: 248.42, change: 5.67, changePercent: 2.34 },
  { symbol: 'BTC', price: 43521.00, change: 1250.00, changePercent: 2.96 },
  { symbol: 'ETH', price: 2287.45, change: 45.23, changePercent: 2.02 },
  { symbol: 'SPX', price: 4783.35, change: -12.44, changePercent: -0.26 },
  { symbol: 'EUR/NOK', price: 11.45, change: 0.02, changePercent: 0.18 },
  { symbol: 'USD/NOK', price: 10.52, change: -0.03, changePercent: -0.28 },
  { symbol: 'GOOGL', price: 142.65, change: 1.23, changePercent: 0.87 },
  { symbol: 'NVDA', price: 495.22, change: -8.45, changePercent: -1.68 },
  { symbol: 'MSFT', price: 374.58, change: 2.34, changePercent: 0.63 },
  { symbol: 'AMZN', price: 153.42, change: -1.12, changePercent: -0.73 },
];

export function TickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>(mockTickers);

  useEffect(() => {
    // Simulate live price updates
    const interval = setInterval(() => {
      setTickers(prev => prev.map(ticker => {
        const change = (Math.random() - 0.5) * 0.5;
        const newPrice = ticker.price * (1 + change / 100);
        const newChange = ticker.change + change;
        return {
          ...ticker,
          price: newPrice,
          change: newChange,
          changePercent: (newChange / (ticker.price - ticker.change)) * 100,
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price >= 1000 
      ? price.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : price.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const duplicatedTickers = [...tickers, ...tickers, ...tickers];

  return (
    <div className="bg-terminal-card border-b border-terminal-border overflow-hidden h-8 flex items-center">
      <div className="flex animate-ticker">
        {duplicatedTickers.map((ticker, idx) => (
          <div 
            key={`${ticker.symbol}-${idx}`}
            className="flex items-center px-4 border-r border-terminal-border whitespace-nowrap"
          >
            <span className="font-mono text-xs font-semibold text-terminal-text mr-2">
              {ticker.symbol}
            </span>
            <span className="font-mono text-xs text-terminal-muted mr-2">
              {formatPrice(ticker.price)}
            </span>
            <span className={`font-mono text-xs ${ticker.change >= 0 ? 'text-market-up' : 'text-market-down'}`}>
              {ticker.change >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
