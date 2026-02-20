import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis as UpstashRedis } from '@upstash/redis';
import { newsFilterSchema, sanitizeSearch } from '@/lib/validation';

// Redis client for caching
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

// Upstash Redis for rate limiting
const upstashRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiter: 30 requests per minute per IP
const ratelimit = upstashRedis
  ? new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
    })
  : null;

const CACHE_TTL = 60; // 1 minute

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    if (ratelimit) {
      const ip = request.ip ?? '127.0.0.1';
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests', limit, reset, remaining },
          { status: 429, headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }}
        );
      }
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate parameters
    const rawParams = {
      timeRange: searchParams.get('timeRange') || '24h',
      assetTypes: searchParams.getAll('assetType'),
      sources: searchParams.getAll('source'),
      tickers: searchParams.getAll('ticker'),
      search: searchParams.get('search') || undefined,
      sentiment: searchParams.get('sentiment') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '25',
    };

    const validation = newsFilterSchema.safeParse(rawParams);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.format() },
        { status: 400 }
      );
    }

    const params = validation.data;
    
    // Build cache key
    const cacheKey = `news:${JSON.stringify(params)}`;
    
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
    const dateFrom = new Date();
    
    switch (params.timeRange) {
      case '1h': dateFrom.setHours(now.getHours() - 1); break;
      case '6h': dateFrom.setHours(now.getHours() - 6); break;
      case '24h': dateFrom.setHours(now.getHours() - 24); break;
      case '3d': dateFrom.setDate(now.getDate() - 3); break;
      case '7d': dateFrom.setDate(now.getDate() - 7); break;
      case '30d': dateFrom.setDate(now.getDate() - 30); break;
    }
    
    // Build typed where clause
    const where: Prisma.NewsItemWhereInput = {
      publishedAt: {
        gte: dateFrom,
        lte: now,
      },
      isDuplicate: false,
    };
    
    if (params.assetTypes.length > 0) {
      where.assetType = { in: params.assetTypes };
    }
    
    if (params.sources.length > 0) {
      where.source = { in: params.sources };
    }
    
    if (params.tickers.length > 0) {
      where.tickers = {
        some: { symbol: { in: params.tickers } },
      };
    }
    
    if (params.search) {
      const sanitizedSearch = sanitizeSearch(params.search);
      where.OR = [
        { title: { contains: sanitizedSearch, mode: 'insensitive' } },
        { summary: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    // Sentiment filter
    if (params.sentiment !== 'all') {
      switch (params.sentiment) {
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
    const skip = Math.max(0, (params.page - 1) * params.limit);
    
    const [news, total] = await Promise.all([
      prisma.newsItem.findMany({
        where,
        include: {
          tickers: { select: { id: true, symbol: true } },
          tags: { select: { id: true, name: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: params.limit,
      }),
      prisma.newsItem.count({ where }),
    ]);
    
    const result = {
      news,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
