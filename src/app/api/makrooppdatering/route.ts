import { NextRequest, NextResponse } from 'next/server';
import { getRecentQuizzes } from '@/quiz/generator';
import { checkRateLimit, rateLimits } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema for query parameters
const querySchema = z.object({
  limit: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val), { message: 'Must be a valid number' })
    .pipe(z.number().min(1).max(50))
    .default(10),
});

export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validationResult = querySchema.safeParse({
      limit: searchParams.get('limit') || '10',
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { limit } = validationResult.data;
    
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
