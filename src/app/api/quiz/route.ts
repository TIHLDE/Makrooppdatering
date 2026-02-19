import { NextRequest, NextResponse } from 'next/server';
import { getRecentQuizzes } from '@/quiz/generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const quizzes = await getRecentQuizzes(limit);
    
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Quizzes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}
