import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const assetTypes = searchParams.getAll('assetType') as AssetType[];
    const sectors = searchParams.getAll('sector');
    const countries = searchParams.getAll('country');
    const sources = searchParams.getAll('source');
    const tickers = searchParams.getAll('ticker');
    const search = searchParams.get('search');
    const timeRange = searchParams.get('timeRange') || '24h';
    const sentiment = searchParams.get('sentiment') || 'all';
    const marketCap = searchParams.get('marketCap') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    
    // Calculate date range
    const now = new Date();
    let dateFrom = new Date();
    
    switch (timeRange) {
      case '1h':
        dateFrom.setHours(now.getHours() - 1);
        break;
      case '6h':
        dateFrom.setHours(now.getHours() - 6);
        break;
      case '24h':
        dateFrom.setHours(now.getHours() - 24);
        break;
      case '3d':
        dateFrom.setDate(now.getDate() - 3);
        break;
      case '7d':
        dateFrom.setDate(now.getDate() - 7);
        break;
      case '30d':
        dateFrom.setDate(now.getDate() - 30);
        break;
      default:
        dateFrom.setHours(now.getHours() - 24);
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

    // Market cap filter (requires market data - stubbed for now)
    if (marketCap && marketCap !== 'all') {
      // This would join with MarketData table if available
      // For now, we'll just log it
      console.log('Market cap filter requested:', marketCap);
    }
    
    // Handle relations
    const include: any = {
      tickers: true,
      tags: true,
    };
    
    if (sectors.length > 0) {
      include.sectors = {
        where: { name: { in: sectors } },
      };
      where.sectors = {
        some: { name: { in: sectors } },
      };
    }
    
    if (countries.length > 0) {
      include.countries = {
        where: { code: { in: countries } },
      };
      where.countries = {
        some: { code: { in: countries } },
      };
    }
    
    if (tickers.length > 0) {
      where.tickers = {
        some: { symbol: { in: tickers } },
      };
    }
    
    // Fetch news with pagination
    const [news, total] = await Promise.all([
      prisma.newsItem.findMany({
        where,
        include,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsItem.count({ where }),
    ]);
    
    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
