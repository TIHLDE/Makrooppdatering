import { NextRequest, NextResponse } from 'next/server';
import { runIngestion } from '@/scripts/run-ingest';

// This endpoint is called by Vercel Cron
export async function GET(request: NextRequest) {
  // Verify cron secret if set
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    await runIngestion();
    return NextResponse.json({ success: true, message: 'Ingestion completed' });
  } catch (error) {
    console.error('Ingestion API error:', error);
    return NextResponse.json(
      { error: 'Ingestion failed' },
      { status: 500 }
    );
  }
}
