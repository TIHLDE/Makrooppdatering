/**
 * Shared constants for the application
 * Consolidates duplicate data from multiple files
 */

export interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export const TICKER_DATA: TickerData[] = [
  { symbol: 'SPX', name: 'S&P 500', price: 4783.35, change: -12.44, changePercent: -0.26 },
  { symbol: 'NDX', name: 'NASDAQ 100', price: 16832.41, change: 45.23, changePercent: 0.27 },
  { symbol: 'DJI', name: 'Dow Jones', price: 37468.61, change: -94.45, changePercent: -0.25 },
  { symbol: 'RUT', name: 'Russell 2000', price: 1965.21, change: 8.92, changePercent: 0.46 },
  { symbol: 'EUR', name: 'EUR/USD', price: 1.0845, change: 0.0023, changePercent: 0.21 },
  { symbol: 'GBP', name: 'GBP/USD', price: 1.2654, change: -0.0012, changePercent: -0.09 },
  { symbol: 'JPY', name: 'USD/JPY', price: 148.32, change: 0.45, changePercent: 0.30 },
  { symbol: 'BTC', name: 'Bitcoin', price: 52134.00, change: 1240.00, changePercent: 2.44 },
  { symbol: 'ETH', name: 'Ethereum', price: 2897.45, change: 45.50, changePercent: 1.60 },
  { symbol: 'XAU', name: 'Gold', price: 2034.20, change: 12.40, changePercent: 0.61 },
  { symbol: 'OIL', name: 'WTI Crude', price: 78.45, change: -0.82, changePercent: -1.04 },
  { symbol: 'NAT', name: 'Natural Gas', price: 2.89, change: -0.05, changePercent: -1.70 },
  { symbol: 'AAPL', name: 'Apple', price: 195.89, change: -2.15, changePercent: -1.09 },
  { symbol: 'MSFT', name: 'Microsoft', price: 412.34, change: 5.67, changePercent: 1.39 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 721.45, change: 23.12, changePercent: 3.31 },
  { symbol: 'TSLA', name: 'Tesla', price: 248.42, change: -8.23, changePercent: -3.21 },
  { symbol: 'AMZN', name: 'Amazon', price: 178.23, change: 2.45, changePercent: 1.39 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 142.65, change: 1.23, changePercent: 0.87 },
  { symbol: 'OBX', name: 'OBX Index', price: 1324.56, change: 12.34, changePercent: 0.94 },
  { symbol: 'EQNR', name: 'Equinor', price: 285.40, change: 3.20, changePercent: 1.13 },
];

// Common time formatter used across pages
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTimeWithDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
