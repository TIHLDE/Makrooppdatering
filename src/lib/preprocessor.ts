import { prisma } from './prisma';
import { AssetType, NewsItem, Prisma } from '@prisma/client';

/**
 * Preprocessed Data Cache
 * Aggregates and caches news data for fast frontend loading
 */

interface CachedFeed {
  id: string;
  data: any;
  generatedAt: Date;
  expiresAt: Date;
  filterHash: string;
}

interface PreprocessedNews {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: Date;
  assetType: AssetType;
  sentiment: number | null;
  relevance: number;
  tickers: { symbol: string }[];
  tags: { name: string }[];
}

interface AggregatedStats {
  totalCount: number;
  byAssetType: Record<string, number>;
  bySource: Record<string, number>;
  sentimentDistribution: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  topTickers: { symbol: string; count: number }[];
  hourlyTrend: { hour: string; count: number }[];
}

const CACHE_TTL_MINUTES = 5; // Refresh cache every 5 minutes

/**
 * Generate cache key from filters
 */
function generateFilterHash(filters: any): string {
  const normalized = {
    assetTypes: (filters.assetTypes || []).sort().join(','),
    sectors: (filters.sectors || []).sort().join(','),
    countries: (filters.countries || []).sort().join(','),
    sources: (filters.sources || []).sort().join(','),
    tickers: (filters.tickers || []).sort().join(','),
    timeRange: filters.timeRange || '24h',
    sentiment: filters.sentiment || 'all',
    search: filters.search || '',
  };
  const hash = Buffer.from(JSON.stringify(normalized)).toString('base64').substring(0, 32);
  console.log(`[Cache] Generating hash for timeRange=${normalized.timeRange}, hash=${hash.substring(0, 8)}`);
  return hash;
}

/**
 * Preprocess and cache news feed data
 */
export async function preprocessNewsFeed(
  filters: any = {},
  limit: number = 100
): Promise<{ news: PreprocessedNews[]; stats: AggregatedStats; fromCache: boolean }> {
  const filterHash = generateFilterHash(filters);
  const now = new Date();

  // Check cache first
  console.log(`[Cache] Looking up hash: ${filterHash.substring(0, 8)} for timeRange=${filters.timeRange}`);
  const cached = await prisma.preprocessedCache.findFirst({
    where: {
      filterHash,
      expiresAt: { gt: now },
    },
  });

  if (cached) {
    console.log(`[Cache] HIT! Using cached data for hash: ${filterHash.substring(0, 8)}...`);
    return {
      ...JSON.parse(cached.data),
      fromCache: true,
    };
  }
  
  console.log(`[Cache] MISS! No cached data for hash: ${filterHash.substring(0, 8)}...`);

  console.log(`[Cache] Generating fresh data for hash: ${filterHash.substring(0, 8)}...`);

  // Calculate date range
  const dateTo = new Date();
  const dateFrom = new Date();
  switch ((filters.timeRange || '24h').toLowerCase()) {
    case '1h': dateFrom.setHours(dateFrom.getHours() - 1); break;
    case '6h': dateFrom.setHours(dateFrom.getHours() - 6); break;
    case '24h': dateFrom.setHours(dateFrom.getHours() - 24); break;
    case '3d': dateFrom.setDate(dateFrom.getDate() - 3); break;
    case '7d': dateFrom.setDate(dateFrom.getDate() - 7); break;
    case '30d': dateFrom.setDate(dateFrom.getDate() - 30); break;
    default: dateFrom.setHours(dateFrom.getHours() - 24);
  }

  console.log(`[Cache] TimeRange: ${filters.timeRange}, dateFrom: ${dateFrom.toISOString()}, dateTo: ${dateTo.toISOString()}`);

  // Build where clause
  const where: Prisma.NewsItemWhereInput = {
    publishedAt: { gte: dateFrom, lte: dateTo },
    isDuplicate: false,
  };

  if (filters.assetTypes?.length > 0) {
    where.assetType = { in: filters.assetTypes as AssetType[] };
  }

  if (filters.sources?.length > 0) {
    where.source = { in: filters.sources };
  }

  if (filters.tickers?.length > 0) {
    where.tickers = { some: { symbol: { in: filters.tickers } } };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { summary: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Fetch news
  const news = await prisma.newsItem.findMany({
    where,
    select: {
      id: true,
      title: true,
      summary: true,
      url: true,
      source: true,
      publishedAt: true,
      assetType: true,
      sentiment: true,
      relevance: true,
      tickers: { select: { symbol: true } },
      tags: { select: { name: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  
  console.log(`[Cache] Fetched ${news.length} items from DB`);
  if (news.length > 0) {
    console.log(`[Cache] Date range: ${news[news.length-1].publishedAt} to ${news[0].publishedAt}`);
  }

  // Calculate aggregated stats
  const stats = calculateAggregatedStats(news);

  const result = {
    news: news as PreprocessedNews[],
    stats,
    fromCache: false,
  };

  // Cache the result
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000);
  
  await prisma.preprocessedCache.upsert({
    where: { filterHash },
    update: {
      data: JSON.stringify(result),
      generatedAt: now,
      expiresAt,
    },
    create: {
      filterHash,
      data: JSON.stringify(result),
      generatedAt: now,
      expiresAt,
    },
  });

  return result;
}

/**
 * Calculate aggregated statistics
 */
function calculateAggregatedStats(news: any[]): AggregatedStats {
  const stats: AggregatedStats = {
    totalCount: news.length,
    byAssetType: {},
    bySource: {},
    sentimentDistribution: { bullish: 0, bearish: 0, neutral: 0 },
    topTickers: [],
    hourlyTrend: [],
  };

  const tickerCounts: Record<string, number> = {};
  const hourlyCounts: Record<string, number> = {};

  news.forEach((item) => {
    // By asset type
    stats.byAssetType[item.assetType] = (stats.byAssetType[item.assetType] || 0) + 1;

    // By source
    stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1;

    // Sentiment
    if (item.sentiment !== null) {
      if (item.sentiment > 0.2) stats.sentimentDistribution.bullish++;
      else if (item.sentiment < -0.2) stats.sentimentDistribution.bearish++;
      else stats.sentimentDistribution.neutral++;
    } else {
      stats.sentimentDistribution.neutral++;
    }

    // Tickers
    item.tickers.forEach((t: any) => {
      tickerCounts[t.symbol] = (tickerCounts[t.symbol] || 0) + 1;
    });

    // Hourly trend
    const hour = item.publishedAt.toISOString().substring(0, 13); // YYYY-MM-DDTHH
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
  });

  // Top tickers
  stats.topTickers = Object.entries(tickerCounts)
    .map(([symbol, count]) => ({ symbol, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Hourly trend (last 24 hours)
  const sortedHours = Object.entries(hourlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-24);
  
  stats.hourlyTrend = sortedHours.map(([hour, count]) => ({
    hour: hour.substring(11, 13) + ':00',
    count,
  }));

  return stats;
}

/**
 * Preprocess data for all common filter combinations
 */
export async function preprocessAllCommonFilters(): Promise<void> {
  console.log('[Preprocessor] Starting batch preprocessing...');
  
  const commonTimeRanges = ['1h', '6h', '24h', '7d'];
  const commonAssetTypes = [[], ['MACRO'], ['CRYPTO'], ['EQUITY']];
  
  const startTime = Date.now();
  let processedCount = 0;

  for (const timeRange of commonTimeRanges) {
    for (const assetTypes of commonAssetTypes) {
      await preprocessNewsFeed({ timeRange, assetTypes }, 100);
      processedCount++;
    }
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`[Preprocessor] Completed ${processedCount} filter combinations in ${duration}s`);
}

/**
 * Clean expired cache entries
 */
export async function cleanExpiredCache(): Promise<number> {
  const result = await prisma.preprocessedCache.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  
  console.log(`[Cache] Cleaned ${result.count} expired entries`);
  return result.count;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalSize: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  const [totalEntries, oldestEntry, newestEntry] = await Promise.all([
    prisma.preprocessedCache.count(),
    prisma.preprocessedCache.findFirst({ orderBy: { generatedAt: 'asc' }, select: { generatedAt: true } }),
    prisma.preprocessedCache.findFirst({ orderBy: { generatedAt: 'desc' }, select: { generatedAt: true } }),
  ]);

  // Calculate total size (approximate)
  const entries = await prisma.preprocessedCache.findMany({ select: { data: true } });
  const totalSize = entries.reduce((acc, e) => acc + e.data.length, 0);

  return {
    totalEntries,
    totalSize,
    oldestEntry: oldestEntry?.generatedAt || null,
    newestEntry: newestEntry?.generatedAt || null,
  };
}
