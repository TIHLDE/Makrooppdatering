import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all filter options in parallel
    const [sources, sectors, countries, tickers, assetTypes] = await Promise.all([
      prisma.newsItem.findMany({
        select: { source: true },
        distinct: ['source'],
        orderBy: { source: 'asc' },
      }),
      prisma.sector.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.country.findMany({
        select: { code: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.ticker.findMany({
        select: { symbol: true, name: true },
        orderBy: { symbol: 'asc' },
        take: 100, // Limit to most common tickers
      }),
      // Get unique asset types from enum
      Promise.resolve([
        'EQUITY',
        'ETF',
        'FUND',
        'CRYPTO',
        'MACRO',
        'GEOPOLITICS',
        'POLITICS',
        'OTHER',
      ]),
    ]);
    
    return NextResponse.json({
      sources: sources.map(s => s.source),
      sectors,
      countries,
      tickers,
      assetTypes,
    });
  } catch (error) {
    console.error('Filters API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}
