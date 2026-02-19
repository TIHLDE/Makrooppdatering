import { NextRequest, NextResponse } from 'next/server';
import { getQuizById, getQuizLeaderboard, saveQuizScore } from '@/quiz/generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await getQuizById(params.id);
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    const leaderboard = await getQuizLeaderboard(params.id);
    
    return NextResponse.json({ quiz, leaderboard });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const { sessionId, score, maxScore, timeMs, userName } = body;
    
    if (!sessionId || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await saveQuizScore(
      params.id,
      sessionId,
      score,
      maxScore,
      timeMs || 0,
      userName
    );
    
    // Get updated leaderboard
    const leaderboard = await getQuizLeaderboard(params.id);
    
    return NextResponse.json({ result, leaderboard });
  } catch (error) {
    console.error('Quiz score save error:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
