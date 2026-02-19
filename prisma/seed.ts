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
    { code: 'FR', name: 'France' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'AU', name: 'Australia' },
    { code: 'SG', name: 'Singapore' },
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
  const energySector = await prisma.sector.findUnique({ where: { name: 'Energy' } });
  const healthcareSector = await prisma.sector.findUnique({ where: { name: 'Healthcare' } });

  const tickers = [
    // Tech Giants
    { symbol: 'AAPL', name: 'Apple Inc.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'MSFT', name: 'Microsoft Corp.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'META', name: 'Meta Platforms', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'TSLA', name: 'Tesla Inc.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'AMZN', name: 'Amazon.com', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    { symbol: 'NFLX', name: 'Netflix Inc.', assetType: AssetType.EQUITY, sectorId: techSector?.id },
    
    // Finance
    { symbol: 'JPM', name: 'JPMorgan Chase', assetType: AssetType.EQUITY, sectorId: financeSector?.id },
    { symbol: 'BAC', name: 'Bank of America', assetType: AssetType.EQUITY, sectorId: financeSector?.id },
    { symbol: 'GS', name: 'Goldman Sachs', assetType: AssetType.EQUITY, sectorId: financeSector?.id },
    { symbol: 'V', name: 'Visa Inc.', assetType: AssetType.EQUITY, sectorId: financeSector?.id },
    { symbol: 'MA', name: 'Mastercard', assetType: AssetType.EQUITY, sectorId: financeSector?.id },
    
    // Energy
    { symbol: 'XOM', name: 'Exxon Mobil', assetType: AssetType.EQUITY, sectorId: energySector?.id },
    { symbol: 'CVX', name: 'Chevron Corp.', assetType: AssetType.EQUITY, sectorId: energySector?.id },
    
    // Healthcare
    { symbol: 'JNJ', name: 'Johnson & Johnson', assetType: AssetType.EQUITY, sectorId: healthcareSector?.id },
    { symbol: 'PFE', name: 'Pfizer Inc.', assetType: AssetType.EQUITY, sectorId: healthcareSector?.id },
    { symbol: 'UNH', name: 'UnitedHealth', assetType: AssetType.EQUITY, sectorId: healthcareSector?.id },
    
    // Crypto
    { symbol: 'BTC', name: 'Bitcoin', assetType: AssetType.CRYPTO, sectorId: cryptoSector?.id },
    { symbol: 'ETH', name: 'Ethereum', assetType: AssetType.CRYPTO, sectorId: cryptoSector?.id },
    { symbol: 'SOL', name: 'Solana', assetType: AssetType.CRYPTO, sectorId: cryptoSector?.id },
    { symbol: 'COIN', name: 'Coinbase', assetType: AssetType.EQUITY, sectorId: cryptoSector?.id },
    
    // Nordic
    { symbol: 'OBX', name: 'OBX Index', assetType: AssetType.EQUITY },
    { symbol: 'EQNR', name: 'Equinor', assetType: AssetType.EQUITY, sectorId: energySector?.id },
    { symbol: 'NHY', name: 'Norsk Hydro', assetType: AssetType.EQUITY },
    { symbol: 'TEL', name: 'Telenor', assetType: AssetType.EQUITY },
    { symbol: 'ABB', name: 'ABB Ltd', assetType: AssetType.EQUITY },
    { symbol: 'INVEB', name: 'Investor B', assetType: AssetType.EQUITY },
    
    // ETFs
    { symbol: 'SPY', name: 'SPDR S&P 500', assetType: AssetType.ETF },
    { symbol: 'QQQ', name: 'Invesco QQQ', assetType: AssetType.ETF },
    { symbol: 'IWM', name: 'iShares Russell 2000', assetType: AssetType.ETF },
    { symbol: 'VTI', name: 'Vanguard Total Stock', assetType: AssetType.ETF },
    { symbol: 'ARKK', name: 'ARK Innovation', assetType: AssetType.ETF },
    
    // Indices
    { symbol: 'SPX', name: 'S&P 500', assetType: AssetType.EQUITY },
    { symbol: 'DJI', name: 'Dow Jones', assetType: AssetType.EQUITY },
    { symbol: 'IXIC', name: 'NASDAQ', assetType: AssetType.EQUITY },
  ];

  for (const ticker of tickers) {
    await prisma.ticker.upsert({
      where: { symbol: ticker.symbol },
      update: {},
      create: ticker,
    });
  }

  // 4. Seed RSS sources - 20+ premium sources
  const rssSources = [
    // Major Financial News
    { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories', assetType: AssetType.MACRO },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/rss/topstories', assetType: AssetType.MACRO },
    { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', assetType: AssetType.MACRO },
    { name: 'Reuters', url: 'https://www.reutersagency.com/feed/?taxonomy=markets&post_type=reuters-best', assetType: AssetType.MACRO },
    { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', assetType: AssetType.MACRO },
    { name: 'WSJ', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', assetType: AssetType.MACRO },
    { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', assetType: AssetType.MACRO },
    
    // Crypto
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', assetType: AssetType.CRYPTO },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', assetType: AssetType.CRYPTO },
    { name: 'CryptoNews', url: 'https://crypto.news/feed/', assetType: AssetType.CRYPTO },
    { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/feed', assetType: AssetType.CRYPTO },
    
    // Tech
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', assetType: AssetType.EQUITY },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', assetType: AssetType.EQUITY },
    { name: 'Ars Technica', url: 'https://arstechnica.com/feed/', assetType: AssetType.EQUITY },
    
    // Nordic/Norwegian
    { name: 'E24', url: 'https://e24.no/rss', assetType: AssetType.MACRO },
    { name: 'Finansavisen', url: 'https://www.finansavisen.no/rss', assetType: AssetType.MACRO },
    { name: 'Dagens Næringsliv', url: 'https://www.dn.no/rss', assetType: AssetType.MACRO },
    { name: 'Børsen', url: 'https://borsen.dk/rss', assetType: AssetType.MACRO },
    
    // Specialized
    { name: 'Seeking Alpha', url: 'https://seekingalpha.com/feed.xml', assetType: AssetType.EQUITY },
    { name: 'Investopedia', url: 'https://www.investopedia.com/feedprovider/news.rss', assetType: AssetType.MACRO },
    { name: 'ZeroHedge', url: 'https://feeds.feedburner.com/zerohedge/feed', assetType: AssetType.MACRO },
    { name: 'Kitco', url: 'https://www.kitco.com/rss/news.rss', assetType: AssetType.MACRO },
    
    // Geopolitics
    { name: 'Foreign Policy', url: 'https://foreignpolicy.com/feed/', assetType: AssetType.GEOPOLITICS },
    { name: 'Stratfor', url: 'https://worldview.stratfor.com/feed', assetType: AssetType.GEOPOLITICS },
  ];

  for (const source of rssSources) {
    await prisma.rssSource.upsert({
      where: { url: source.url },
      update: {},
      create: source,
    });
  }

  // 5. Seed sample news items with AI sentiment
  const sampleNews = [
    {
      hash: 'sample-1',
      title: 'Fed Signals Potential Rate Cuts in 2024',
      summary: 'Federal Reserve officials indicated they may begin cutting interest rates next year as inflation shows signs of cooling.',
      url: 'https://example.com/fed-rates-1',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      assetType: AssetType.MACRO,
      language: 'en',
      sentiment: 0.3,
      relevance: 0.95,
    },
    {
      hash: 'sample-2',
      title: 'Bitcoin Surges Past $45,000 on ETF Optimism',
      summary: 'Bitcoin price jumped to its highest level since April 2022 as investors bet on SEC approval of spot Bitcoin ETFs.',
      url: 'https://example.com/btc-etf-1',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 1000 * 60 * 45),
      assetType: AssetType.CRYPTO,
      language: 'en',
      sentiment: 0.85,
      relevance: 0.98,
    },
    {
      hash: 'sample-3',
      title: 'Apple Reports Strong iPhone 15 Sales',
      summary: 'Apple announced better-than-expected iPhone 15 sales in its latest quarterly earnings report.',
      url: 'https://example.com/aapl-earnings-1',
      source: 'Yahoo Finance',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      assetType: AssetType.EQUITY,
      language: 'en',
      sentiment: 0.65,
      relevance: 0.88,
    },
    {
      hash: 'sample-4',
      title: 'European Energy Crisis Deepens as Winter Approaches',
      summary: 'Natural gas prices in Europe hit new highs as cold weather forecasts intensify supply concerns.',
      url: 'https://example.com/eu-energy-1',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      assetType: AssetType.GEOPOLITICS,
      language: 'en',
      sentiment: -0.55,
      relevance: 0.82,
    },
    {
      hash: 'sample-5',
      title: 'Norwegian Oil Fund Returns 8% in Q3',
      summary: "Norway's sovereign wealth fund reported strong returns driven by technology stocks and energy investments.",
      url: 'https://example.com/norway-fund-1',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      assetType: AssetType.FUND,
      language: 'en',
      sentiment: 0.72,
      relevance: 0.85,
    },
    {
      hash: 'sample-6',
      title: 'Tesla Stock Plunges After Missing Delivery Targets',
      summary: 'Tesla shares dropped 7% after the EV maker reported quarterly deliveries below Wall Street expectations.',
      url: 'https://example.com/tsla-drop-1',
      source: 'CNBC',
      publishedAt: new Date(Date.now() - 1000 * 60 * 30),
      assetType: AssetType.EQUITY,
      language: 'en',
      sentiment: -0.68,
      relevance: 0.92,
    },
    {
      hash: 'sample-7',
      title: 'NVIDIA Reaches All-Time High on AI Demand',
      summary: 'NVIDIA stock hit a new record as data center revenue surged on strong AI chip demand.',
      url: 'https://example.com/nvda-record-1',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 1000 * 60 * 120),
      assetType: AssetType.EQUITY,
      language: 'en',
      sentiment: 0.92,
      relevance: 0.96,
    },
    {
      hash: 'sample-8',
      title: 'Equinor Discovers Major Oil Field in Barents Sea',
      summary: 'Norwegian energy giant Equinor announced a significant oil discovery that could contain up to 100 million barrels.',
      url: 'https://example.com/eqnr-discovery-1',
      source: 'E24',
      publishedAt: new Date(Date.now() - 1000 * 60 * 180),
      assetType: AssetType.EQUITY,
      language: 'en',
      sentiment: 0.45,
      relevance: 0.78,
    },
  ];

  for (const news of sampleNews) {
    const tickerSymbols = [];
    if (news.title.includes('Bitcoin') || news.title.includes('BTC')) tickerSymbols.push('BTC');
    if (news.title.includes('Apple') || news.title.includes('AAPL')) tickerSymbols.push('AAPL');
    if (news.title.includes('Tesla') || news.title.includes('TSLA')) tickerSymbols.push('TSLA');
    if (news.title.includes('NVIDIA') || news.title.includes('NVDA')) tickerSymbols.push('NVDA');
    if (news.title.includes('Norwegian') || news.title.includes('Equinor')) tickerSymbols.push('OBX', 'EQNR');

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

  // 6. Seed sample quizzes
  const quizSet1 = await prisma.quizSet.create({
    data: {
      title: 'Market Movers - December 2024',
      description: 'Test your knowledge on the biggest market moves this week!',
      type: 'MULTIPLE_CHOICE',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      dateTo: new Date(),
      assetTypes: [AssetType.MACRO, AssetType.CRYPTO, AssetType.EQUITY],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: quizSet1.id,
        question: 'What did the Federal Reserve signal about interest rates?',
        options: ['Immediate hike', 'Potential cuts in 2024', 'Freeze permanently', 'Drop by 2%'],
        correct: 1,
        order: 0,
      },
      {
        quizSetId: quizSet1.id,
        question: 'What drove Bitcoin above $45,000?',
        options: ['China crypto ban', 'ETF optimism', 'Tesla purchase', 'Fed rate hike'],
        correct: 1,
        order: 1,
      },
      {
        quizSetId: quizSet1.id,
        question: 'Which sectors drove Norwegian Oil Fund returns?',
        options: ['Tech & Energy', 'Healthcare only', 'Real Estate only', 'Banks only'],
        correct: 0,
        order: 2,
      },
      {
        quizSetId: quizSet1.id,
        question: 'Why did Tesla stock drop 7%?',
        options: ['Missed delivery targets', 'CEO resignation', 'Factory fire', 'Regulatory fine'],
        correct: 0,
        order: 3,
      },
    ],
  });

  const quizSet2 = await prisma.quizSet.create({
    data: {
      title: 'Crypto & Tech Deep Dive',
      description: 'Advanced quiz for crypto and tech enthusiasts',
      type: 'MULTIPLE_CHOICE',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      dateTo: new Date(),
      assetTypes: [AssetType.CRYPTO, AssetType.EQUITY],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: quizSet2.id,
        question: 'What fueled NVIDIA\'s all-time high?',
        options: ['Gaming demand', 'AI chip demand', 'Crypto mining', 'Mobile processors'],
        correct: 1,
        order: 0,
      },
      {
        quizSetId: quizSet2.id,
        question: 'How much oil might Equinor\'s new field contain?',
        options: ['10M barrels', '50M barrels', '100M barrels', '500M barrels'],
        correct: 2,
        order: 1,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Added ${tickers.length} tickers`);
  console.log(`📰 Added ${rssSources.length} RSS sources`);
  console.log(`📈 Added ${sampleNews.length} sample news items`);
  console.log(`🎯 Added 2 quiz sets`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
