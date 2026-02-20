import { prisma } from './prisma';

const CRYPTO_COMPARE_API_KEY = process.env.CRYPTO_COMPARE_API_KEY;

interface CryptoQuote {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  lastUpdated: Date;
}

/**
 * Fetch crypto prices from Crypto Compare (batch API)
 */
export async function fetchCryptoPrices(symbols: string[]): Promise<CryptoQuote[]> {
  if (!CRYPTO_COMPARE_API_KEY || symbols.length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbols.join(',')}&tsyms=USD&api_key=${CRYPTO_COMPARE_API_KEY}`
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
          symbol,
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
 * Update market data in database
 * Only updates crypto (stocks require paid APIs with strict rate limits)
 */
export async function updateMarketData(): Promise<void> {
  console.log('Updating market data...');
  
  // Crypto symbols to track
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'];
  
  // Fetch all crypto prices in one batch API call
  const quotes = await fetchCryptoPrices(cryptoSymbols);
  
  // Update database
  for (const quote of quotes) {
    await prisma.marketData.upsert({
      where: { tickerId: quote.symbol },
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
