import { prisma } from '@/lib/prisma';
import type { ParsedNewsItem } from './rss-parser';
import { analyzeSentimentFast } from '@/lib/sentiment';
import type { AssetType } from '@prisma/client';

/**
 * Batch save news items with optimized database operations
 * Fixes N+1 query problem by using batch inserts
 */
export async function saveNewsItemsOptimized(items: ParsedNewsItem[]): Promise<{
  saved: number;
  duplicates: number;
  errors: number;
}> {
  const stats = { saved: 0, duplicates: 0, errors: 0 };
  
  if (items.length === 0) return stats;

  try {
    // Step 1: Check for duplicates in batch
    const hashes = items.map(item => item.hash);
    const existingItems = await prisma.newsItem.findMany({
      where: { hash: { in: hashes } },
      select: { hash: true },
    });
    const existingHashes = new Set(existingItems.map(item => item.hash));
    
    // Filter out duplicates
    const newItems = items.filter(item => !existingHashes.has(item.hash));
    stats.duplicates = items.length - newItems.length;
    
    if (newItems.length === 0) {
      console.log(`All ${items.length} items are duplicates`);
      return stats;
    }

    // Step 2: Collect all unique tickers and tags
    const allTickers = new Map<string, { symbol: string; assetType: AssetType }>();
    const allTags = new Set<string>();
    
    newItems.forEach(item => {
      item.tickers.forEach(symbol => {
        if (!allTickers.has(symbol)) {
          allTickers.set(symbol, { symbol, assetType: item.assetType });
        }
      });
      item.tags.forEach(tag => allTags.add(tag));
    });

    // Step 3: Batch upsert tickers
    const tickerMap = new Map<string, string>(); // symbol -> id
    if (allTickers.size > 0) {
      const tickerSymbols = Array.from(allTickers.keys());
      
      // Find existing tickers
      const existingTickers = await prisma.ticker.findMany({
        where: { symbol: { in: tickerSymbols } },
        select: { id: true, symbol: true },
      });
      
      existingTickers.forEach(t => tickerMap.set(t.symbol, t.id));
      
      // Create new tickers
      const newTickers = tickerSymbols
        .filter(symbol => !tickerMap.has(symbol))
        .map(symbol => ({
          symbol,
          assetType: allTickers.get(symbol)!.assetType,
        }));
      
      if (newTickers.length > 0) {
        await prisma.ticker.createMany({
          data: newTickers,
          skipDuplicates: true,
        });
        
        // Fetch newly created tickers
        const createdTickers = await prisma.ticker.findMany({
          where: { symbol: { in: newTickers.map(t => t.symbol) } },
          select: { id: true, symbol: true },
        });
        
        createdTickers.forEach(t => tickerMap.set(t.symbol, t.id));
      }
    }

    // Step 4: Batch upsert tags
    const tagMap = new Map<string, string>(); // name -> id
    if (allTags.size > 0) {
      const tagNames = Array.from(allTags);
      
      // Find existing tags
      const existingTags = await prisma.tag.findMany({
        where: { name: { in: tagNames } },
        select: { id: true, name: true },
      });
      
      existingTags.forEach(t => tagMap.set(t.name, t.id));
      
      // Create new tags
      const newTags = tagNames
        .filter(name => !tagMap.has(name))
        .map(name => ({ name }));
      
      if (newTags.length > 0) {
        await prisma.tag.createMany({
          data: newTags,
          skipDuplicates: true,
        });
        
        // Fetch newly created tags
        const createdTags = await prisma.tag.findMany({
          where: { name: { in: newTags.map(t => t.name) } },
          select: { id: true, name: true },
        });
        
        createdTags.forEach(t => tagMap.set(t.name, t.id));
      }
    }

    // Step 5: Create news items with relations
    for (const item of newItems) {
      try {
        // Calculate sentiment
        const sentimentResult = analyzeSentimentFast({
          title: item.title,
          summary: item.summary,
          assetType: item.assetType,
        });

        // Get ticker and tag IDs
        const tickerIds = item.tickers
          .map(symbol => tickerMap.get(symbol))
          .filter((id): id is string => id !== undefined);
        
        const tagIds = item.tags
          .map(name => tagMap.get(name))
          .filter((id): id is string => id !== undefined);

        // Create news item with relations
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
            sentiment: sentimentResult.score,
            relevance: calculateRelevance(sentimentResult.score, tickerIds.length),
            isDuplicate: false,
            tickers: {
              connect: tickerIds.map(id => ({ id })),
            },
            tags: {
              connect: tagIds.map(id => ({ id })),
            },
          },
        });

        stats.saved++;
        
        if (Math.abs(sentimentResult.score) > 0.1) {
          console.log(`✓ Saved: ${sentimentResult.score.toFixed(2)} - "${item.title.substring(0, 40)}..."`);
        }
      } catch (error) {
        stats.errors++;
        console.error(`✗ Failed to save: ${item.title.substring(0, 50)}...`, error);
      }
    }

    console.log(`\n✓ Batch save complete: ${stats.saved} saved, ${stats.duplicates} duplicates, ${stats.errors} errors`);
    return stats;
    
  } catch (error) {
    console.error('Batch save failed:', error);
    throw error;
  }
}

function calculateRelevance(sentiment: number | null, tickerCount: number): number {
  let score = 0.5;
  if (sentiment !== null) {
    score += Math.abs(sentiment) * 0.2;
  }
  if (tickerCount > 0) {
    score += Math.min(tickerCount * 0.1, 0.2);
  }
  return Math.min(score, 1.0);
}
