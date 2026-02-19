import { prisma } from '@/lib/prisma';
import { AssetType, QuizType, Prisma } from '@prisma/client';

export interface QuizGenerationOptions {
  title: string;
  description?: string;
  type: QuizType;
  dateFrom: Date;
  dateTo: Date;
  assetTypes: AssetType[];
  questionCount?: number;
}

export interface QuizQuestionInput {
  question: string;
  options: string[];
  correct: number;
  imageUrl?: string;
  pairId?: string;
}

export async function generateQuizFromNews(options: QuizGenerationOptions) {
  console.log('Generating quiz...', options);
  
  // Fetch relevant news
  const news = await prisma.newsItem.findMany({
    where: {
      publishedAt: {
        gte: options.dateFrom,
        lte: options.dateTo,
      },
      assetType: { in: options.assetTypes },
      isDuplicate: false,
    },
    include: {
      tickers: true,
      tags: true,
    },
    orderBy: { relevance: 'desc' },
    take: 50, // Get top 50 relevant news
  });
  
  console.log(`Found ${news.length} news items for quiz`);
  
  let questions: QuizQuestionInput[] = [];
  
  switch (options.type) {
    case 'MULTIPLE_CHOICE':
      questions = generateMultipleChoiceQuestions(news, options.questionCount || 10);
      break;
    case 'MATCH_PAIRS':
      questions = generateMatchPairsQuestions(news, options.questionCount || 8);
      break;
    case 'FIND_CONNECTION':
      questions = generateFindConnectionQuestions(news, options.questionCount || 6);
      break;
    default:
      questions = generateMultipleChoiceQuestions(news, 10);
  }
  
  // Save quiz to database
  const quizSet = await prisma.quizSet.create({
    data: {
      title: options.title,
      description: options.description,
      type: options.type,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      assetTypes: options.assetTypes,
      questions: {
        create: questions.map((q, idx) => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          imageUrl: q.imageUrl,
          pairId: q.pairId,
          order: idx,
        })),
      },
    },
    include: {
      questions: true,
    },
  });
  
  console.log(`Created quiz with ${questions.length} questions`);
  return quizSet;
}

function generateMultipleChoiceQuestions(
  news: any[],
  count: number
): QuizQuestionInput[] {
  const questions: QuizQuestionInput[] = [];
  
  for (let i = 0; i < Math.min(count, news.length); i++) {
    const item = news[i];
    
    // Generate question based on news content
    const q = createQuestionFromNews(item);
    if (q) {
      questions.push(q);
    }
  }
  
  return questions;
}

function createQuestionFromNews(item: any): QuizQuestionInput | null {
  const title = item.title;
  const summary = item.summary || '';
  
  // Question templates based on asset type
  if (item.assetType === 'CRYPTO' && (title.toLowerCase().includes('bitcoin') || title.toLowerCase().includes('btc'))) {
    return {
      question: 'Hva er hovedårsaken til Bitcoin-prisbevegelsen i denne nyheten?',
      options: [
        'ETF-godkjenning',
        'Regulering',
        'Institusjonelt kjøp',
        'Teknisk oppdatering',
      ],
      correct: title.toLowerCase().includes('etf') ? 0 : Math.floor(Math.random() * 4),
    };
  }
  
  if (item.assetType === 'MACRO' && (title.toLowerCase().includes('fed') || title.toLowerCase().includes('rente'))) {
    return {
      question: 'Hva signaliserte Federal Reserve?',
      options: [
        'Øke rentene',
        'Senke rentene',
        'Holde rentene uendret',
        'Avvente mer data',
      ],
      correct: title.toLowerCase().includes('kutt') || title.toLowerCase().includes('cut') ? 1 : 
               title.toLowerCase().includes('øke') || title.toLowerCase().includes('hike') ? 0 : 2,
    };
  }
  
  if (item.tickers.length > 0) {
    const ticker = item.tickers[0].symbol;
    return {
      question: `Hvilket selskap er nevnt i denne nyheten?`,
      options: [
        ticker,
        'Generisk konkurrent',
        'Urelatert selskap',
        'Ikke nevnt',
      ],
      correct: 0,
    };
  }
  
  // Generic question if no specific pattern matches
  return {
    question: `Hva handler denne nyheten om? "${title.substring(0, 80)}..."`,
    options: [
      item.assetType === 'CRYPTO' ? 'Kryptovaluta' : 'Aksjemarkedet',
      'Makroøkonomi',
      'Geopolitikk',
      'Teknologi',
    ],
    correct: item.assetType === 'CRYPTO' ? 0 : 1,
  };
}

function generateMatchPairsQuestions(
  news: any[],
  count: number
): QuizQuestionInput[] {
  const questions: QuizQuestionInput[] = [];
  const pairsNeeded = Math.ceil(count / 2);
  
  for (let i = 0; i < Math.min(pairsNeeded, Math.floor(news.length / 2)); i++) {
    const item1 = news[i * 2];
    const item2 = news[i * 2 + 1];
    
    if (!item1 || !item2) continue;
    
    // Create matching pair
    const pairId = `pair-${i}`;
    
    questions.push({
      question: item1.title.substring(0, 60),
      options: [],
      correct: 0,
      pairId,
      imageUrl: `/api/placeholder?text=${encodeURIComponent(item1.assetType)}`,
    });
    
    questions.push({
      question: item2.title.substring(0, 60),
      options: [],
      correct: 0,
      pairId,
      imageUrl: `/api/placeholder?text=${encodeURIComponent(item2.assetType)}`,
    });
  }
  
  return questions;
}

function generateFindConnectionQuestions(
  news: any[],
  count: number
): QuizQuestionInput[] {
  const questions: QuizQuestionInput[] = [];
  
  for (let i = 0; i < Math.min(count, news.length); i++) {
    const item = news[i];
    
    questions.push({
      question: `Finn sammenhengen: "${item.title.substring(0, 70)}..."`,
      options: [
        `Påvirker ${item.assetType === 'CRYPTO' ? 'kryptomarkedet' : 'finansmarkedet'}`,
        'Ingen sammenheng',
        'Politisk nyhet',
        'Teknisk analyse',
      ],
      correct: 0,
      imageUrl: `/api/placeholder?text=${encodeURIComponent(item.assetType)}&size=300x200`,
    });
  }
  
  return questions;
}

export async function getQuizById(quizId: string) {
  return prisma.quizSet.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function getRecentQuizzes(limit: number = 10) {
  return prisma.quizSet.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });
}

export async function saveQuizScore(
  quizId: string,
  sessionId: string,
  score: number,
  maxScore: number,
  timeMs: number,
  userName?: string
) {
  return prisma.quizScore.create({
    data: {
      quizSetId: quizId,
      sessionId,
      score,
      maxScore,
      timeMs,
      userName,
    },
  });
}

export async function getQuizLeaderboard(quizId: string) {
  return prisma.quizScore.findMany({
    where: { quizSetId: quizId },
    orderBy: [
      { score: 'desc' },
      { timeMs: 'asc' },
    ],
    take: 20,
  });
}
