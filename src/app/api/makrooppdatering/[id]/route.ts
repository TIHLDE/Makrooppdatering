import { NextRequest, NextResponse } from 'next/server';
import { getQuizById, getQuizLeaderboard, saveQuizScore } from '@/quiz/generator';
import { checkRateLimit, rateLimits } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema for quiz ID
const paramsSchema = z.object({
  id: z.string().uuid('Invalid quiz ID format'),
});

// Validation schema for score submission with sanitization
const scoreSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required').max(100),
  score: z.number().min(0, 'Score must be non-negative').int(),
  maxScore: z.number().min(1, 'Max score must be at least 1').int(),
  timeMs: z.number().min(0, 'Time must be non-negative').int().default(0),
  userName: z.string()
    .max(50, 'Name too long')
    .optional()
    .transform(val => {
      if (!val) return undefined;
      // Sanitize: remove HTML tags and dangerous characters
      return val
        .replace(/[<>"']/g, '')
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '') // Remove control characters
        .trim()
        .slice(0, 50) || 'Anonym';
    }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(
      request,
      rateLimits.quizFetch,
      { errorMessage: 'For mange forespørsler. Vennligst vent litt før du prøver igjen.' }
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    // Validate params
    const paramsValidation = paramsSchema.safeParse({ id: params.id });
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: 'Invalid quiz ID format' },
        { status: 400 }
      );
    }

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
    // Rate limiting check - use stricter limit for score submission
    const rateLimitResult = await checkRateLimit(
      request,
      rateLimits.scoreSubmission,
      { errorMessage: 'For mange innsendinger. Vennligst vent litt før du prøver igjen.' }
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    // Validate params
    const paramsValidation = paramsSchema.safeParse({ id: params.id });
    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: 'Invalid quiz ID format' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const bodyValidation = scoreSchema.safeParse(body);
    if (!bodyValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: bodyValidation.error.format() 
        },
        { status: 400 }
      );
    }

    const { sessionId, score, maxScore, timeMs, userName } = bodyValidation.data;
    
    // Additional validation: score cannot exceed max score
    if (score > maxScore) {
      return NextResponse.json(
        { error: 'Score cannot exceed max score' },
        { status: 400 }
      );
    }

    // Validate that score is within reasonable bounds
    if (score < 0 || maxScore > 1000) {
      return NextResponse.json(
        { error: 'Invalid score values' },
        { status: 400 }
      );
    }
    
    const result = await saveQuizScore(
      params.id,
      sessionId,
      score,
      maxScore,
      timeMs,
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
