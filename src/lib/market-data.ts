import { prisma } from './prisma';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const CRYPTO_COMPARE_API_KEY = process.env.CRYPTO_COMPARE_API_KEY;

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: Date;
}

interface CryptoQuote {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  lastUpdated: Date;
}

/**
 * Fetch real-time stock quotes from Alpha Vantage
 */
export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) {
      console.warn(`No data found for symbol: ${symbol}`);
      return null;
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      lastUpdated: new Date(quote['07. latest trading day']),
    };
  } catch (error) {
    console.error(`Failed to fetch stock quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch multiple stock quotes
 */
export async function fetchMultipleStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];
  
  // Alpha Vantage has rate limits, so we fetch sequentially with delay
  for (const symbol of symbols) {
    const quote = await fetchStockQuote(symbol);
    if (quote) {
      quotes.push(quote);
    }
    // Small delay to respect rate limits (5 calls per minute for free tier)
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  
  return quotes;
}

/**
 * Fetch crypto prices from Crypto Compare
 */
export async function fetchCryptoPrice(symbol: string): Promise<CryptoQuote | null> {
  if (!CRYPTO_COMPARE_API_KEY) {
    console.warn('Crypto Compare API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbol}&tsyms=USD&api_key=${CRYPTO_COMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Crypto Compare API error: ${response.status}`);
    }

    const data = await response.json();
    const coinData = data.RAW?.[symbol]?.USD;

    if (!coinData) {
      console.warn(`No crypto data found for symbol: ${symbol}`);
      return null;
    }

    return {
      symbol: symbol,
      price: coinData.PRICE,
      change24h: coinData.CHANGE24HOUR,
      changePercent24h: coinData.CHANGEPCT24HOUR,
      marketCap: coinData.MKTCAP,
      lastUpdated: new Date(coinData.LASTUPDATE * 1000),
    };
  } catch (error) {
    console.error(`Failed to fetch crypto price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch multiple crypto prices
 */
export async function fetchMultipleCryptoPrices(symbols: string[]): Promise<CryptoQuote[]> {
  if (!CRYPTO_COMPARE_API_KEY) {
    console.warn('Crypto Compare API key not configured');
    return [];
  }

  try {
    const symbolsParam = symbols.join(',');
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbolsParam}&tsyms=USD&api_key=${CRYPTO_COMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Crypto Compare API error: ${response.status}`);
    }

    const data = await response.json();
    const quotes: CryptoQuote[] = [];

    for (const symbol of symbols) {
      const coinData = data.RAW?.[symbol]?.USD;
      if (coinData) {
        quotes.push({
          symbol: symbol,
          price: coinData.PRICE,
          change24h: coinData.CHANGE24HOUR,
          changePercent24h: coinData.CHANGEPCT24HOUR,
          marketCap: coinData.MKTCAP,
          lastUpdated: new Date(coinData.LASTUPDATE * 1000),
        });
      }
    }

    return quotes;
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
    return [];
  }
}

/**
 * Update ticker data in database with real prices
 */
export async function updateMarketData(): Promise<void> {
  console.log('Updating market data...');
  
  // Stock symbols to track
  const stockSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'NFLX'];
  
  // Crypto symbols to track
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'];
  
  // Fetch stock prices (with delays for rate limiting)
  for (const symbol of stockSymbols) {
    const quote = await fetchStockQuote(symbol);
    if (quote) {
      await prisma.marketData.upsert({
        where: {
          tickerId: symbol,
        },
        update: {
          price: quote.price,
          priceChange: quote.change,
          priceChangePercent: quote.changePercent,
          updatedAt: new Date(),
        },
        create: {
          tickerId: symbol,
          price: quote.price,
          priceChange: quote.change,
          priceChangePercent: quote.changePercent,
        },
      });
      console.log(`Updated ${symbol}: $${quote.price} (${quote.changePercent}%)`);
    }
    // Wait 15 seconds between requests (free tier: 5 calls per minute)
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  
  // Fetch crypto prices (can do batch)
  const cryptoQuotes = await fetchMultipleCryptoPrices(cryptoSymbols);
  for (const quote of cryptoQuotes) {
    await prisma.marketData.upsert({
      where: {
        tickerId: quote.symbol,
      },
      update: {
        price: quote.price,
        priceChange: quote.change24h,
        priceChangePercent: quote.changePercent24h,
        updatedAt: new Date(),
      },
      create: {
        tickerId: quote.symbol,
        price: quote.price,
        priceChange: quote.change24h,
        priceChangePercent: quote.changePercent24h,
      },
    });
    console.log(`Updated ${quote.symbol}: $${quote.price.toFixed(2)} (${quote.changePercent24h.toFixed(2)}%)`);
  }
  
  console.log('Market data update complete');
}
