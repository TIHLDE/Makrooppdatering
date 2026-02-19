import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetType } from '@prisma/client';
import Redis from 'ioredis';

// Redis client for caching
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

const CACHE_TTL = 60; // 1 minute in production, adjust as needed

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const assetTypes = searchParams.getAll('assetType') as AssetType[];
    const sources = searchParams.getAll('source');
    const tickers = searchParams.getAll('ticker');
    const search = searchParams.get('search');
    const timeRange = (searchParams.get('timeRange') || '24h').toLowerCase();
    const sentiment = searchParams.get('sentiment') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '25')), 500);
    
    // Build cache key
    const cacheKey = `news:${JSON.stringify({
      assetTypes, sources, tickers, search, timeRange, sentiment, page, limit
    })}`;
    
    // Check Redis cache
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return NextResponse.json({ 
            ...JSON.parse(cached), 
            fromCache: true 
          });
        }
      } catch (err) {
        console.error('Redis cache error:', err);
      }
    }
    
    // Calculate date range
    const now = new Date();
    let dateFrom = new Date();
    
    switch (timeRange) {
      case '1h': dateFrom.setHours(now.getHours() - 1); break;
      case '6h': dateFrom.setHours(now.getHours() - 6); break;
      case '24h': dateFrom.setHours(now.getHours() - 24); break;
      case '3d': dateFrom.setDate(now.getDate() - 3); break;
      case '7d': dateFrom.setDate(now.getDate() - 7); break;
      case '30d': dateFrom.setDate(now.getDate() - 30); break;
      default: dateFrom.setHours(now.getHours() - 24);
    }
    
    // Build where clause
    const where: any = {
      publishedAt: {
        gte: dateFrom,
        lte: now,
      },
      isDuplicate: false,
    };
    
    if (assetTypes.length > 0) {
      where.assetType = { in: assetTypes };
    }
    
    if (sources.length > 0) {
      where.source = { in: sources };
    }
    
    if (tickers.length > 0) {
      where.tickers = {
        some: { symbol: { in: tickers } },
      };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sentiment filter
    if (sentiment && sentiment !== 'all') {
      switch (sentiment) {
        case 'positive':
          where.sentiment = { gt: 0.2 };
          break;
        case 'negative':
          where.sentiment = { lt: -0.2 };
          break;
        case 'neutral':
          where.sentiment = { gte: -0.2, lte: 0.2 };
          break;
      }
    }
    
    // Fetch news with pagination
    const skip = Math.max(0, (page - 1) * limit);
    
    const [news, total] = await Promise.all([
      prisma.newsItem.findMany({
        where,
        include: {
          tickers: true,
          tags: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsItem.count({ where }),
    ]);
    
    const result = {
      news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // Store in Redis cache
    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
      } catch (err) {
        console.error('Redis set error:', err);
      }
    }
    
    return NextResponse.json({ ...result, fromCache: false });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
