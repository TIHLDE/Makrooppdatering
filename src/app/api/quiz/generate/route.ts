import { NextRequest, NextResponse } from 'next/server';
import { generateQuizFromNews, QuizGenerationOptions } from '@/quiz/generator';
import { QuizType, AssetType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.type || !body.assetTypes) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, assetTypes' },
        { status: 400 }
      );
    }
    
    const options: QuizGenerationOptions = {
      title: body.title,
      description: body.description,
      type: body.type as QuizType,
      dateFrom: body.dateFrom ? new Date(body.dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dateTo: body.dateTo ? new Date(body.dateTo) : new Date(),
      assetTypes: body.assetTypes as AssetType[],
      questionCount: body.questionCount || 10,
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
