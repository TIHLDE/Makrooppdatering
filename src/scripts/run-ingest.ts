#!/usr/bin/env tsx
import { prisma } from '@/lib/prisma';
import { parseRssFeed, saveNewsItems } from '@/ingest/rss-parser';

async function runIngestion() {
  console.log('🚀 Starting RSS ingestion...');
  console.log(`⏰ ${new Date().toISOString()}`);
  
  try {
    // Get all active RSS sources
    const sources = await prisma.rssSource.findMany({
      where: { isActive: true },
    });
    
    console.log(`Found ${sources.length} active RSS sources`);
    
    let totalSaved = 0;
    
    for (const source of sources) {
      try {
        const items = await parseRssFeed(source.url, source.name, source.assetType);
        const saved = await saveNewsItems(items);
        
        console.log(`✅ ${source.name}: Saved ${saved} new items`);
        
        // Update source metadata
        await prisma.rssSource.update({
          where: { id: source.id },
          data: {
            lastFetched: new Date(),
            fetchCount: { increment: 1 },
          },
        });
        
        totalSaved += saved;
        
        // Small delay to be nice to RSS servers
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error processing ${source.name}:`, error);
      }
    }
    
    console.log(`\n🎉 Ingestion complete! Total new items: ${totalSaved}`);
    
    // Clean up old duplicates
    console.log('\n🧹 Cleaning up duplicates...');
    const duplicates = await cleanupDuplicates();
    console.log(`Marked ${duplicates} items as duplicates`);
    
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupDuplicates(): Promise<number> {
  // Simple deduplication based on URL similarity
  const recentItems = await prisma.newsItem.findMany({
    where: {
      publishedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
      },
      isDuplicate: false,
    },
    orderBy: { publishedAt: 'desc' },
  });
  
  const urlMap = new Map<string, string[]>();
  
  for (const item of recentItems) {
    const normalizedUrl = normalizeUrl(item.url);
    if (!urlMap.has(normalizedUrl)) {
      urlMap.set(normalizedUrl, []);
    }
    urlMap.get(normalizedUrl)!.push(item.id);
  }
  
  let duplicatesMarked = 0;
  
  for (const [, ids] of urlMap) {
    if (ids.length > 1) {
      // Mark all but the first as duplicates
      for (let i = 1; i < ids.length; i++) {
        await prisma.newsItem.update({
          where: { id: ids[i] },
          data: { isDuplicate: true },
        });
        duplicatesMarked++;
      }
    }
  }
  
  return duplicatesMarked;
}

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove tracking parameters
    urlObj.searchParams.delete('utm_source');
    urlObj.searchParams.delete('utm_medium');
    urlObj.searchParams.delete('utm_campaign');
    urlObj.searchParams.delete('ref');
    return urlObj.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

// Run if called directly
if (require.main === module) {
  runIngestion();
}

export { runIngestion };
