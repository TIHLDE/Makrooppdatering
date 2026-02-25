import { NextRequest, NextResponse } from 'next/server';
import { generateQuizFromNews, QuizGenerationOptions } from '@/quiz/generator';
import { QuizType, AssetType } from '@prisma/client';
import { checkRateLimit, rateLimits } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema for quiz generation
const generateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'MATCH_PAIRS', 'FIND_CONNECTION']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  assetTypes: z.array(z.enum(['CRYPTO', 'MACRO', 'EQUITY', 'GEOPOLITICS'])).min(1, 'At least one asset type required'),
  questionCount: z.number().min(3).max(20).default(10),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check - use stricter limit for quiz generation (expensive operation)
    const rateLimitResult = await checkRateLimit(
      request,
      rateLimits.quizGeneration,
      { errorMessage: 'For mange quiz-genereringer. Vennligst vent litt før du prøver igjen.' }
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = generateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Set default dates if not provided
    const dateTo = data.dateTo ? new Date(data.dateTo) : new Date();
    const dateFrom = data.dateFrom ? new Date(data.dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Validate date range
    if (dateFrom > dateTo) {
      return NextResponse.json(
        { error: 'Invalid date range: dateFrom must be before dateTo' },
        { status: 400 }
      );
    }

    // Check if date range is not too large (max 90 days)
    const daysDiff = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 90) {
      return NextResponse.json(
        { error: 'Date range too large. Maximum is 90 days.' },
        { status: 400 }
      );
    }
    
    const options: QuizGenerationOptions = {
      title: data.title,
      description: data.description,
      type: data.type as QuizType,
      dateFrom,
      dateTo,
      assetTypes: data.assetTypes as AssetType[],
      questionCount: data.questionCount,
    };
    
    const quiz = await generateQuizFromNews(options);
    
    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
