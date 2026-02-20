import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';
import { generateHash, extractTickers, calculateRelevanceScore } from '@/lib/utils';
import { analyzeSentimentFast } from '@/lib/sentiment';
import { AssetType } from '@prisma/client';
import { detectAssetType } from './asset-detector';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'MakroOppdatering/1.0 (News Aggregator)',
  },
});

export interface ParsedNewsItem {
  hash: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceUrl?: string;
  publishedAt: Date;
  language: string;
  assetType: AssetType;
  tickers: string[];
  tags: string[];
}

export async function parseRssFeed(feedUrl: string, sourceName: string, defaultAssetType: AssetType): Promise<ParsedNewsItem[]> {
  try {
    console.log(`Fetching RSS feed: ${sourceName}`);
    const feed = await parser.parseURL(feedUrl);
    
    const items: ParsedNewsItem[] = [];
    
    for (const item of feed.items || []) {
      if (!item.title || !item.link) continue;
      
      const title = item.title.trim();
      const url = item.link;
      const summary = item.contentSnippet || item.content || '';
      const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
      
      // Skip items older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (publishedAt < sevenDaysAgo) continue;
      
      // Extract tickers from title and summary
      const textToAnalyze = `${title} ${summary}`;
      const tickers = extractTickers(textToAnalyze);
      
      // Determine asset type from content using advanced detector
      const assetType = detectAssetType(textToAnalyze, defaultAssetType).assetType;
      
      // Extract tags
      const tags = extractTags(textToAnalyze);
      
      // Generate hash for deduplication
      const hash = generateHash(`${title}${sourceName}${publishedAt.toISOString()}`);
      
      items.push({
        hash,
        title,
        summary: summary.substring(0, 500),
        url,
        source: sourceName,
        sourceUrl: feed.link,
        publishedAt,
        language: 'en',
        assetType,
        tickers,
        tags,
      });
    }
    
    console.log(`Parsed ${items.length} items from ${sourceName}`);
    return items;
  } catch (error) {
    console.error(`Error parsing RSS feed ${sourceName}:`, error);
    return [];
  }
}



function extractTags(text: string): string[] {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Common financial tags
  const tagKeywords: Record<string, string[]> = {
    'earnings': ['earnings', 'profit', 'revenue', 'eps'],
    'merger': ['merger', 'acquisition', 'buyout', 'takeover'],
    'ipo': ['ipo', 'initial public offering', 'going public'],
    'dividend': ['dividend', 'payout', 'yield'],
    'guidance': ['guidance', 'forecast', 'outlook'],
    'upgrade': ['upgrade', 'downgrade', 'analyst', 'rating'],
    'breaking': ['breaking', 'alert', 'just in'],
  };
  
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      tags.push(tag);
    }
  }
  
  return tags;
}

export async function saveNewsItems(items: ParsedNewsItem[]): Promise<number> {
  let savedCount = 0;
  
  for (const item of items) {
    try {
      // Check for duplicates
      const existing = await prisma.newsItem.findUnique({
        where: { hash: item.hash },
      });
      
      if (existing) {
        console.log(`Duplicate found: ${item.title.substring(0, 50)}...`);
        continue;
      }
      
      // Find or create tickers
      const tickerRecords = await Promise.all(
        item.tickers.map(async (symbol) => {
          return await prisma.ticker.upsert({
            where: { symbol },
            update: {},
            create: {
              symbol,
              assetType: item.assetType,
            },
          });
        })
      );
      
      // Find or create tags
      const tagRecords = await Promise.all(
        item.tags.map(async (name) => {
          return await prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
          });
        })
      );
      
      // Sentiment Analysis (fast rule-based)
      let sentiment: number | null = null;
      try {
        const sentimentResult = await analyzeSentimentFast({
          title: item.title,
          summary: item.summary,
          assetType: item.assetType,
        });
        sentiment = sentimentResult.score;
        if (Math.abs(sentiment) > 0.1) {
          console.log(`✓ Sentiment: ${sentiment.toFixed(2)} (${sentimentResult.label}) - "${item.title.substring(0, 40)}..."`);
        }
      } catch (error) {
        console.warn(`✗ Sentiment failed: ${item.title.substring(0, 40)}...`);
      }
      
      // Calculate relevance
      const relevance = calculateRelevanceScore(
        sentiment,
        item.tickers.length > 0,
        item.tags.includes('breaking')
      );
      
      // Save news item
      await prisma.newsItem.create({
        data: {
          hash: item.hash,
          title: item.title,
          summary: item.summary,
          url: item.url,
          source: item.source,
          sourceUrl: item.sourceUrl,
          publishedAt: item.publishedAt,
          language: item.language,
          assetType: item.assetType,
          sentiment,
          relevance,
          tickers: {
            connect: tickerRecords.map(t => ({ id: t.id })),
          },
          tags: {
            connect: tagRecords.map(t => ({ id: t.id })),
          },
        },
      });
      
      savedCount++;
    } catch (error) {
      console.error(`Error saving news item: ${item.title}`, error);
    }
  }
  
  return savedCount;
}
