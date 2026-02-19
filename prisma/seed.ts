import { PrismaClient, AssetType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed sectors
  const sectors = [
    { name: 'Technology', description: 'Technology sector' },
    { name: 'Healthcare', description: 'Healthcare sector' },
    { name: 'Financials', description: 'Financial services' },
    { name: 'Energy', description: 'Energy sector' },
    { name: 'Consumer Discretionary', description: 'Consumer discretionary' },
    { name: 'Industrials', description: 'Industrial sector' },
    { name: 'Materials', description: 'Materials sector' },
    { name: 'Real Estate', description: 'Real estate' },
    { name: 'Communication Services', description: 'Communication services' },
    { name: 'Utilities', description: 'Utilities sector' },
    { name: 'Crypto/Blockchain', description: 'Cryptocurrency and blockchain' },
  ];

  for (const sector of sectors) {
    await prisma.sector.upsert({
      where: { name: sector.name },
      update: {},
      create: sector,
    });
  }

  // 2. Seed countries
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'NO', name: 'Norway' },
    { code: 'SE', name: 'Sweden' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DE', name: 'Germany' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'CA', name: 'Canada' },
    { code: 'GLOBAL', name: 'Global' },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }

  // 3. Seed common tickers
  const techSector = await prisma.sector.findUnique({ where: { name: 'Technology' } });
  const financeSector = await prisma.sector.findUnique({ where: { name: 'Financials' } });
  const cryptoSector = await prisma.sector.findUnique({ where: { name: 'Crypto/Blockchain' } });

  const tickers = [
    { symbol: 'AAPL', name: 'Apple Inc.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'MSFT', name: 'Microsoft Corp.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'TSLA', name: 'Tesla Inc.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'JPM', name: 'JPMorgan Chase', assetType: AssetType.EQUITY, sectorId: financeSector?.id },
    { symbol: 'BTC', name: 'Bitcoin', assetType: AssetType.CRYPTO, sectorId: cryptoSector?.id },
    { symbol: 'ETH', name: 'Ethereum', assetType: AssetType.CRYPTO, sectorId: cryptoSector?.id },
    { symbol: 'OBX', name: 'OBX Index', assetType: AssetType.EQUITY },
  ];

  for (const ticker of tickers) {
    await prisma.ticker.upsert({
      where: { symbol: ticker.symbol },
      update: {},
      create: ticker,
    });
  }

  // 4. Seed RSS sources
  const rssSources = [
    { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/marketwatch', assetType: AssetType.MACRO },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', assetType: AssetType.MACRO },
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', assetType: AssetType.CRYPTO },
    { name: 'Bloomberg Markets', url: 'https://feeds.bloomberg.com/markets/news.rss', assetType: AssetType.MACRO },
  ];

  for (const source of rssSources) {
    await prisma.rssSource.upsert({
      where: { url: source.url },
      update: {},
      create: source,
    });
  }

  // 5. Seed sample news items
  const sampleNews = [
    {
      hash: 'sample-1',
      title: 'Fed Signals Potential Rate Cuts in 2024',
      summary: 'Federal Reserve officials indicated they may begin cutting interest rates next year as inflation shows signs of cooling.',
      url: 'https://example.com/fed-rates-1',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      assetType: AssetType.MACRO,
      language: 'en',
      sentiment: 0.3,
      relevance: 0.9,
    },
    {
      hash: 'sample-2',
      title: 'Bitcoin Surges Past $45,000 on ETF Optimism',
      summary: 'Bitcoin price jumped to its highest level since April 2022 as investors bet on SEC approval of spot Bitcoin ETFs.',
      url: 'https://example.com/btc-etf-1',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      assetType: AssetType.CRYPTO,
      language: 'en',
      sentiment: 0.8,
      relevance: 0.95,
    },
    {
      hash: 'sample-3',
      title: 'Apple Reports Strong iPhone 15 Sales',
      summary: 'Apple announced better-than-expected iPhone 15 sales in its latest quarterly earnings report.',
      url: 'https://example.com/aapl-earnings-1',
      source: 'Yahoo Finance',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      assetType: AssetType.EQUITY,
      language: 'en',
      sentiment: 0.6,
      relevance: 0.75,
    },
    {
      hash: 'sample-4',
      title: 'European Energy Crisis Deepens as Winter Approaches',
      summary: 'Natural gas prices in Europe hit new highs as cold weather forecasts intensify supply concerns.',
      url: 'https://example.com/eu-energy-1',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      assetType: AssetType.GEOPOLITICS,
      language: 'en',
      sentiment: -0.5,
      relevance: 0.85,
    },
    {
      hash: 'sample-5',
      title: 'Norwegian Oil Fund Returns 8% in Q3',
      summary: "Norway's sovereign wealth fund reported strong returns driven by technology stocks and energy investments.",
      url: 'https://example.com/norway-fund-1',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      assetType: AssetType.FUND,
      language: 'en',
      sentiment: 0.7,
      relevance: 0.8,
    },
  ];

  for (const news of sampleNews) {
    const tickerSymbols = [];
    if (news.title.includes('Bitcoin') || news.title.includes('BTC')) tickerSymbols.push('BTC');
    if (news.title.includes('Apple') || news.title.includes('AAPL')) tickerSymbols.push('AAPL');
    if (news.title.includes('Norwegian')) tickerSymbols.push('OBX');

    const tickersForNews = await prisma.ticker.findMany({
      where: { symbol: { in: tickerSymbols } },
    });

    await prisma.newsItem.upsert({
      where: { hash: news.hash },
      update: {},
      create: {
        ...news,
        tickers: { connect: tickersForNews.map(t => ({ id: t.id })) },
      },
    });
  }

  // 6. Seed sample quiz
  const quizSet = await prisma.quizSet.create({
    data: {
      title: 'Finansnyheter Quiz - Desember 2024',
      description: 'Test kunnskapen din om siste finansnyheter!',
      type: 'MULTIPLE_CHOICE',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24),
      dateTo: new Date(),
      assetTypes: [AssetType.MACRO, AssetType.CRYPTO, AssetType.EQUITY],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: quizSet.id,
        question: 'Hva signaliserte Federal Reserve nylig om rentene?',
        options: JSON.stringify(['Øke rentene umiddelbart', 'Potensielle rentekutt i 2024', 'Fryse rentene permanent', 'Senke rentene med 2%']),
        correct: 1,
        order: 0,
      },
      {
        quizSetId: quizSet.id,
        question: 'Hva drev Bitcoin-prisen over $45,000?',
        options: JSON.stringify(['Kinas krypto-forbud', 'ETF-optimalisme', 'Tesla-kjøp', 'Fed renteøkning']),
        correct: 1,
        order: 1,
      },
      {
        quizSetId: quizSet.id,
        question: 'Hvilken sektor drev den norske oljefondets avkastning?',
        options: JSON.stringify(['Teknologi og energi', 'Kun helsetjenester', 'Kun eiendom', 'Kun bank']),
        correct: 0,
        order: 2,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
