import { NextRequest, NextResponse } from 'next/server';
import { fetchStockQuote, fetchMultipleCryptoPrices } from '@/lib/market-data';

// Cache prices for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedData: any = null;
let lastFetch = 0;

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    
    // Return cached data if fresh
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
      return NextResponse.json({ ...cachedData, fromCache: true });
    }
    
    // Stock symbols to track
    const stockSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'];
    
    // Crypto symbols  
    const cryptoSymbols = ['BTC', 'ETH', 'SOL'];
    
    // Fetch crypto prices (batch - fast)
    const cryptoQuotes = await fetchMultipleCryptoPrices(cryptoSymbols);
    
    // For stocks, return cached/mock data to avoid rate limits
    // In production, you'd fetch these from your database
    const stockQuotes = [
      { symbol: 'AAPL', price: 195.89, change: -2.15, changePercent: -1.09 },
      { symbol: 'MSFT', price: 412.34, change: 5.67, changePercent: 1.39 },
      { symbol: 'NVDA', price: 721.45, change: 23.12, changePercent: 3.31 },
      { symbol: 'TSLA', price: 248.42, change: -8.23, changePercent: -3.21 },
      { symbol: 'AMZN', price: 178.23, change: 2.45, changePercent: 1.39 },
      { symbol: 'GOOGL', price: 142.65, change: 1.23, changePercent: 0.87 },
      { symbol: 'META', price: 502.30, change: 8.90, changePercent: 1.80 },
    ];
    
    // Combine all quotes
    const allQuotes = [
      // Major indices (static for now)
      { symbol: 'SPX', name: 'S&P 500', price: 4783.35, change: -12.44, changePercent: -0.26 },
      { symbol: 'NDX', name: 'NASDAQ 100', price: 16832.41, change: 45.23, changePercent: 0.27 },
      { symbol: 'DJI', name: 'Dow Jones', price: 37468.61, change: -94.45, changePercent: -0.25 },
      
      // Forex
      { symbol: 'EUR', name: 'EUR/USD', price: 1.0845, change: 0.0023, changePercent: 0.21 },
      { symbol: 'GBP', name: 'GBP/USD', price: 1.2654, change: -0.0012, changePercent: -0.09 },
      
      // Real crypto prices
      ...cryptoQuotes.map(q => ({
        symbol: q.symbol,
        name: q.symbol === 'BTC' ? 'Bitcoin' : q.symbol === 'ETH' ? 'Ethereum' : q.symbol,
        price: q.price,
        change: q.change24h,
        changePercent: q.changePercent24h,
      })),
      
      // Stocks
      ...stockQuotes.map(q => ({
        symbol: q.symbol,
        name: q.symbol,
        price: q.price,
        change: q.change,
        changePercent: q.changePercent,
      })),
      
      // Nordic
      { symbol: 'OBX', name: 'OBX Index', price: 1324.56, change: 12.34, changePercent: 0.94 },
      { symbol: 'EQNR', name: 'Equinor', price: 285.40, change: 3.20, changePercent: 1.13 },
    ];
    
    cachedData = { quotes: allQuotes };
    lastFetch = now;
    
    return NextResponse.json({ quotes: allQuotes, fromCache: false });
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
