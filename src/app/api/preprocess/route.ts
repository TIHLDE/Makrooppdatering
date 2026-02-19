import { NextRequest, NextResponse } from 'next/server';
import { preprocessNewsFeed, preprocessAllCommonFilters, cleanExpiredCache, getCacheStats } from '@/lib/preprocessor';

/**
 * API endpoint for manual preprocessing trigger
 * Can be called by Vercel Cron or manually
 */

export async function POST(request: NextRequest) {
  // Verify authorization if in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { mode = 'common' } = body;

    const startTime = Date.now();

    if (mode === 'all') {
      // Preprocess all common filters
      await preprocessAllCommonFilters();
    } else if (mode === 'cleanup') {
      // Just cleanup expired cache
      const cleaned = await cleanExpiredCache();
      return NextResponse.json({
        success: true,
        cleaned,
        duration: Date.now() - startTime,
      });
    } else {
      // Preprocess specific filter (default: last 24h)
      await preprocessNewsFeed({ timeRange: '24h' }, 100);
    }

    // Get updated stats
    const stats = await getCacheStats();

    return NextResponse.json({
      success: true,
      mode,
      stats: {
        totalEntries: stats.totalEntries,
        totalSizeKB: Math.round(stats.totalSize / 1024),
        newestEntry: stats.newestEntry,
        oldestEntry: stats.oldestEntry,
      },
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Preprocessing error:', error);
    return NextResponse.json(
      { error: 'Preprocessing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await getCacheStats();
    
    return NextResponse.json({
      stats: {
        totalEntries: stats.totalEntries,
        totalSizeKB: Math.round(stats.totalSize / 1024),
        newestEntry: stats.newestEntry,
        oldestEntry: stats.oldestEntry,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}
