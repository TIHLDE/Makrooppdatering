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

  // 2. Seed countries - all regions
  const countries = [
    // North America
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    
    // Europe
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'IE', name: 'Ireland' },
    { code: 'PT', name: 'Portugal' },
    
    // Nordics
    { code: 'NO', name: 'Norway' },
    { code: 'SE', name: 'Sweden' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'IS', name: 'Iceland' },
    
    // Asia Pacific
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' },
    { code: 'AU', name: 'Australia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'KR', name: 'South Korea' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'NZ', name: 'New Zealand' },
    
    // Middle East
    { code: 'AE', name: 'UAE' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'IL', name: 'Israel' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'TR', name: 'Turkey' },
    
    // Latin America
    { code: 'BR', name: 'Brazil' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'MX', name: 'Mexico' },
    
    // Africa
    { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'EG', name: 'Egypt' },
    { code: 'KE', name: 'Kenya' },
    { code: 'MA', name: 'Morocco' },
    
    // Global/Other
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
    { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories', assetType: AssetType.OTHER },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/rss/topstories', assetType: AssetType.OTHER },
    { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', assetType: AssetType.OTHER },
    { name: 'Reuters', url: 'https://www.reutersagency.com/feed/?taxonomy=markets&post_type=reuters-best', assetType: AssetType.OTHER },
    { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', assetType: AssetType.OTHER },
    { name: 'WSJ', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', assetType: AssetType.OTHER },
    { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', assetType: AssetType.OTHER },
    
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
    { name: 'E24', url: 'https://e24.no/rss', assetType: AssetType.OTHER },
    { name: 'Finansavisen', url: 'https://www.finansavisen.no/rss', assetType: AssetType.OTHER },
    { name: 'Dagens Næringsliv', url: 'https://www.dn.no/rss', assetType: AssetType.OTHER },
    { name: 'Børsen', url: 'https://borsen.dk/rss', assetType: AssetType.OTHER },
    
    // Specialized
    { name: 'Seeking Alpha', url: 'https://seekingalpha.com/feed.xml', assetType: AssetType.EQUITY },
    { name: 'Investopedia', url: 'https://www.investopedia.com/feedprovider/news.rss', assetType: AssetType.OTHER },
    { name: 'ZeroHedge', url: 'https://feeds.feedburner.com/zerohedge/feed', assetType: AssetType.OTHER },
    { name: 'Kitco', url: 'https://www.kitco.com/rss/news.rss', assetType: AssetType.OTHER },
    
    // Geopolitics
    { name: 'Foreign Policy', url: 'https://foreignpolicy.com/feed/', assetType: AssetType.OTHER },
    { name: 'Stratfor', url: 'https://worldview.stratfor.com/feed', assetType: AssetType.OTHER },
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
      assetType: AssetType.OTHER,
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
      assetType: AssetType.OTHER,
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

  // 6. Seed MakroOppdatering Quizzer - Ultimate Finance Challenge!
  
  // Quiz 1: GJETT HVEM - Kjente Finanspersoner
  const gjettHvemQuiz = await prisma.quizSet.create({
    data: {
      title: '🕵️ Gjett Hvem - Finanslegender',
      description: 'Kan du kjenne igjen verdens mest kjente investorer og finanspersoner fra bildene?',
      type: 'MULTIPLE_CHOICE',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dateTo: new Date(),
      assetTypes: [AssetType.OTHER],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: gjettHvemQuiz.id,
        question: 'Hvem er denne legenden? Kjent for "value investing" og Berkshire Hathaway',
        options: ['Jeff Bezos', 'Warren Buffett', 'Elon Musk', 'Bill Gates'],
        correct: 1,
        order: 0,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/440px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg',
      },
      {
        quizSetId: gjettHvemQuiz.id,
        question: 'Hvem er sjefen for Federal Reserve?',
        options: ['Janet Yellen', 'Jerome Powell', 'Ben Bernanke', 'Alan Greenspan'],
        correct: 1,
        order: 1,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Jerome_Powell_%2853449480388%29_%28cropped%29.jpg/440px-Jerome_Powell_%2853449480388%29_%28cropped%29.jpg',
      },
      {
        quizSetId: gjettHvemQuiz.id,
        question: 'Hvem er grunnleggeren av Tesla, SpaceX og X?',
        options: ['Mark Zuckerberg', 'Jeff Bezos', 'Elon Musk', 'Larry Page'],
        correct: 2,
        order: 2,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
      },
      {
        quizSetId: gjettHvemQuiz.id,
        question: 'Hvem er "The Oracle of Omaha"?',
        options: ['Charlie Munger', 'Warren Buffett', 'Ray Dalio', 'Carl Icahn'],
        correct: 1,
        order: 3,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Warren_Buffett_with_Female_Fan_2017.jpg/440px-Warren_Buffett_with_Female_Fan_2017.jpg',
      },
    ],
  });

  // Quiz 2: MATCH LOGO - Kjente Selskap
  const matchLogoQuiz = await prisma.quizSet.create({
    data: {
      title: '🎯 Match Logoen - Tech Giants',
      description: 'Koble sammen logoen med riktig selskap! Kjenner du igjen alle tech-gigantene?',
      type: 'MATCH_PAIRS',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dateTo: new Date(),
      assetTypes: [AssetType.EQUITY],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: matchLogoQuiz.id,
        question: 'Hvilket selskap har denne logoen? 🍎',
        options: ['Microsoft', 'Apple', 'Google', 'Samsung'],
        correct: 1,
        order: 0,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png',
      },
      {
        quizSetId: matchLogoQuiz.id,
        question: 'Hvilket selskap har denne logoen? 🔷',
        options: ['Meta', 'Twitter', 'Facebook', 'Instagram'],
        correct: 2,
        order: 1,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/200px-2021_Facebook_icon.svg.png',
      },
      {
        quizSetId: matchLogoQuiz.id,
        question: 'Hvilket selskap har denne logoen? 🎮',
        options: ['AMD', 'NVIDIA', 'Intel', 'Qualcomm'],
        correct: 1,
        order: 2,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png',
      },
      {
        quizSetId: matchLogoQuiz.id,
        question: 'Hvilket selskap har denne logoen? 🚗',
        options: ['Ford', 'Tesla', 'GM', 'Toyota'],
        correct: 1,
        order: 3,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/200px-Tesla_Motors.svg.png',
      },
      {
        quizSetId: matchLogoQuiz.id,
        question: 'Hvilket selskap har denne logoen? 📦',
        options: ['eBay', 'Amazon', 'Alibaba', 'Shopify'],
        correct: 1,
        order: 4,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png',
      },
    ],
  });

  // Quiz 3: FINN SAKEN - Hva hendte med denne aksjen?
  const finnSakenQuiz = await prisma.quizSet.create({
    data: {
      title: '📈 Finn Sammenhengen - Aksjehistorier',
      description: 'Se på grafen og finn ut hva som skjedde! Kan du forutse markedet?',
      type: 'FIND_CONNECTION',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dateTo: new Date(),
      assetTypes: [AssetType.EQUITY, AssetType.CRYPTO],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: finnSakenQuiz.id,
        question: 'Hva skjedde med Bitcoin i 2024 som fikk prisen til å eksplodere til over $100,000?',
        options: ['Kina forbød Bitcoin', 'SEC godkjente Spot Bitcoin ETFer', 'Elon Musk solgte alt', 'Fed hevet renten'],
        correct: 1,
        order: 0,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/200px-Bitcoin.svg.png',
      },
      {
        quizSetId: finnSakenQuiz.id,
        question: 'Hvorfor steg NVIDIA-aksjen til å bli verdens mest verdifulle selskap?',
        options: ['Nye spillkort', 'AI-revolusjonen trenger deres chip', 'Kryptograving', 'Mobiltelefoner'],
        correct: 1,
        order: 1,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png',
      },
      {
        quizSetId: finnSakenQuiz.id,
        question: 'Hva skjedde med Tesla-aksjen da de leverte færre biler enn forventet?',
        options: ['Steg 20%', 'Falt over 7%', 'Ingen endring', 'Doblet seg'],
        correct: 1,
        order: 2,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/200px-Tesla_Motors.svg.png',
      },
      {
        quizSetId: finnSakenQuiz.id,
        question: 'Hva signaliserte Federal Reserve om rentene i 2024?',
        options: ['Heve renten til 10%', 'Holde renten uendret lengre', 'Kutte renten til 0%', 'Abolere renten'],
        correct: 1,
        order: 3,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Seal_of_the_United_States_Federal_Reserve_System.svg/200px-Seal_of_the_United_States_Federal_Reserve_System.svg.png',
      },
    ],
  });

  // Quiz 4: Hvem sa det? - Kjente sitater
  const hvemSaDetQuiz = await prisma.quizSet.create({
    data: {
      title: '💬 Hvem Sa Det? - Legendariske Sitater',
      description: 'Gjenkjenn disse berømte finanssitatene! Hvem sa hva?',
      type: 'MULTIPLE_CHOICE',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dateTo: new Date(),
      assetTypes: [AssetType.OTHER],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: hvemSaDetQuiz.id,
        question: '"Be fearful when others are greedy, and greedy when others are fearful"',
        options: ['Elon Musk', 'Warren Buffett', 'Ray Dalio', 'Charlie Munger'],
        correct: 1,
        order: 0,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/440px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg',
      },
      {
        quizSetId: hvemSaDetQuiz.id,
        question: '"The stock market is a device for transferring money from the impatient to the patient"',
        options: ['Warren Buffett', 'Peter Lynch', 'Benjamin Graham', 'John Bogle'],
        correct: 0,
        order: 1,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/440px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg',
      },
      {
        quizSetId: hvemSaDetQuiz.id,
        question: '"Price is what you pay, value is what you get"',
        options: ['Warren Buffett', 'Charlie Munger', 'Seth Klarman', 'Howard Marks'],
        correct: 0,
        order: 2,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/440px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg',
      },
    ],
  });

  // Quiz 5: Hva koster det? - Gjett prisen
  const hvaKosterDetQuiz = await prisma.quizSet.create({
    data: {
      title: '💰 Hva Koster Det? - Gjett Prisen',
      description: 'Kan du gjette markedsverdien eller prisen på disse kjente selskapene?',
      type: 'MULTIPLE_CHOICE',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dateTo: new Date(),
      assetTypes: [AssetType.EQUITY, AssetType.CRYPTO],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: hvaKosterDetQuiz.id,
        question: '🍎 Hva var Apples markedsverdi på sitt høyeste i 2024?',
        options: ['$1 trillion', '$3 trillion', '$5 trillion', '$10 trillion'],
        correct: 1,
        order: 0,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png',
      },
      {
        quizSetId: hvaKosterDetQuiz.id,
        question: '₿ Hva var Bitcoins høyeste pris i 2024?',
        options: ['$50,000', '$75,000', '$100,000+', '$200,000'],
        correct: 2,
        order: 1,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/200px-Bitcoin.svg.png',
      },
      {
        quizSetId: hvaKosterDetQuiz.id,
        question: '🎮 Hva kostet én NVIDIA H100 AI-chip i 2024?',
        options: ['$1,000', '$10,000', '$30,000+', '$100,000'],
        correct: 2,
        order: 2,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png',
      },
      {
        quizSetId: hvaKosterDetQuiz.id,
        question: '🇳🇴 Hva var Oljefondets verdi ved utgangen av 2024?',
        options: ['1 billion kr', '100 billioner kr', '1 trillion kr', '10 trillioner kr'],
        correct: 2,
        order: 3,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Norway.svg/200px-Flag_of_Norway.svg.png',
      },
    ],
  });

  // Quiz 6: True or False - Fakta eller Fiksjon
  const trueFalseQuiz = await prisma.quizSet.create({
    data: {
      title: '✅❌ Fakta eller Fiksjon?',
      description: 'Sant eller usant? Test kunnskapen om finanshistorie og merkedager!',
      type: 'MULTIPLE_CHOICE',
      dateFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      dateTo: new Date(),
      assetTypes: [AssetType.OTHER],
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizSetId: trueFalseQuiz.id,
        question: 'Bitcoin ble skapt i 2008 av en person (eller gruppe) kalt Satoshi Nakamoto.',
        options: ['SANT', 'USANT'],
        correct: 0,
        order: 0,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/200px-Bitcoin.svg.png',
      },
      {
        quizSetId: trueFalseQuiz.id,
        question: 'Warren Buffett kjøpte sin første aksje da han var 11 år gammel.',
        options: ['SANT', 'USANT'],
        correct: 0,
        order: 1,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/440px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg',
      },
      {
        quizSetId: trueFalseQuiz.id,
        question: 'Den store børskrakket i 1929 skjedde på en tirsdag.',
        options: ['SANT', 'USANT'],
        correct: 0,
        order: 2,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/New_York_Stock_Exchange_1929_Crash.jpg/400px-New_York_Stock_Exchange_1929_Crash.jpg',
      },
      {
        quizSetId: trueFalseQuiz.id,
        question: 'GameStop-aksjen steg over 1000% på én uke i januar 2021 pga Reddit.',
        options: ['SANT', 'USANT'],
        correct: 0,
        order: 3,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/GameStop.svg/200px-GameStop.svg.png',
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Added ${tickers.length} tickers`);
  console.log(`📰 Added ${rssSources.length} RSS sources`);
  console.log(`📈 Added ${sampleNews.length} sample news items`);
  console.log(`🎯 Added 6 MakroOppdatering quizer med bilder!`);
  console.log('   🕵️ Gjett Hvem - Finanspersoner');
  console.log('   🎯 Match Logo - Selskapslogoer');
  console.log('   📈 Finn Sammenhengen - Aksjehistorier');
  console.log('   💬 Hvem Sa Det - Legendariske sitater');
  console.log('   💰 Hva Koster Det - Gjett prisen');
  console.log('   ✅❌ Fakta eller Fiksjon');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
