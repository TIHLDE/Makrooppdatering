import { prisma } from './prisma';
import { updateMarketData } from './market-data';

/**
 * Fast ingestion - skip sentiment analysis for speed
 * Use this for regular fetches (runs every 2 hours)
 */
export async function fastIngest(): Promise<void> {
  console.log('Starting fast ingestion (skipping sentiment)...');
  
  const { parseRssFeed, saveNewsItems } = await import('../ingest/rss-parser');
  const sources = await prisma.rssSource.findMany({ where: { isActive: true } });
  
  let totalSaved = 0;
  
  for (const source of sources) {
    try {
      const items = await parseRssFeed(source.url, source.name, source.assetType);
      // Skip sentiment analysis - save directly
      const saved = await saveNewsItemsFast(items);
      totalSaved += saved;
      console.log(`✓ ${source.name}: ${saved} articles`);
    } catch (error) {
      console.error(`✗ ${source.name}:`, error);
    }
  }
  
  console.log(`Fast ingestion complete: ${totalSaved} articles saved`);
}

/**
 * Full ingestion with sentiment analysis
 * Use this manually when you want full analysis
 */
export async function fullIngest(): Promise<void> {
  console.log('Starting full ingestion with sentiment analysis...');
  const { parseRssFeed, saveNewsItems } = await import('../ingest/rss-parser');
  const sources = await prisma.rssSource.findMany({ where: { isActive: true } });
  
  let totalSaved = 0;
  
  for (const source of sources) {
    try {
      const items = await parseRssFeed(source.url, source.name, source.assetType);
      const saved = await saveNewsItems(items); // With sentiment
      totalSaved += saved;
    } catch (error) {
      console.error(`Failed ${source.name}:`, error);
    }
  }
  
  console.log(`Full ingestion complete: ${totalSaved} articles`);
}

/**
 * Save news items without sentiment analysis (much faster)
 */
async function saveNewsItemsFast(items: any[]): Promise<number> {
  let saved = 0;
  
  for (const item of items) {
    try {
      // Check for duplicates
      const existing = await prisma.newsItem.findUnique({
        where: { hash: item.hash }
      });
      
      if (existing) continue;
      
      // Create without sentiment
      await prisma.newsItem.create({
        data: {
          hash: item.hash,
          title: item.title,
          summary: item.summary,
          url: item.url,
          source: item.source,
          sourceUrl: item.sourceUrl,
          publishedAt: item.publishedAt,
          fetchedAt: new Date(),
          language: item.language,
          assetType: item.assetType,
          sentiment: null, // Skip sentiment for speed
          relevance: 0.5,
          isDuplicate: false,
          tickers: {
            connectOrCreate: item.tickers.map((symbol: string) => ({
              where: { symbol },
              create: { symbol, assetType: item.assetType },
            })),
          },
          tags: {
            connectOrCreate: item.tags.map((name: string) => ({
              where: { name },
              create: { name },
            })),
          },
        },
      });
      
      saved++;
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  }
  
  return saved;
}

/**
 * Update all market data (stocks + crypto)
 */
export async function updateAllMarketData(): Promise<void> {
  console.log('Updating market data...');
  try {
    await updateMarketData();
    console.log('✓ Market data updated');
  } catch (error) {
    console.error('✗ Market data update failed:', error);
  }
}
