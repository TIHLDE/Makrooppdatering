import { NewsItem } from '@prisma/client';

/**
 * Hybrid Sentiment Analysis
 * Fast rule-based for 90% of cases, AI only when needed
 */

interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  explanation: string;
  source: 'rule-based' | 'ai';
}

const IDUN_API_URL = 'https://api.idun.ai/v1/chat/completions';

/**
 * Fast sentiment analysis - uses rule-based by default
 * Only calls AI for ambiguous cases
 */
export async function analyzeSentiment(newsItem: NewsItem, useAI: boolean = false): Promise<SentimentResult> {
  // Always try rule-based first (fast, ~10ms)
  const ruleBased = analyzeSentimentRuleBased(newsItem);
  
  // If rule-based is confident (>0.7), use it
  if (ruleBased.confidence > 0.7) {
    return { ...ruleBased, source: 'rule-based' };
  }
  
  // If AI is requested and we have API key, try AI
  if (useAI && process.env.IDUN_API_KEY) {
    try {
      const aiResult = await analyzeSentimentWithTimeout(newsItem, 3000); // 3 second timeout
      return { ...aiResult, source: 'ai' };
    } catch (error) {
      console.warn('AI sentiment failed, using rule-based:', error);
      return { ...ruleBased, source: 'rule-based' };
    }
  }
  
  // Default to rule-based
  return { ...ruleBased, source: 'rule-based' };
}

/**
 * AI sentiment with timeout
 */
async function analyzeSentimentWithTimeout(newsItem: NewsItem, timeoutMs: number): Promise<SentimentResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const prompt = buildSentimentPrompt(newsItem);
    
    const response = await fetch(IDUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.IDUN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'idun-o1',
        messages: [
          {
            role: 'system',
            content: `You are a financial sentiment analyzer. Return ONLY a JSON object with:
- score: number between -1 (bearish) and 1 (bullish)
- label: "positive", "negative", or "neutral"
- confidence: number between 0 and 1
- explanation: max 50 chars

Example: {"score": 0.6, "label": "positive", "confidence": 0.8, "explanation": "Strong earnings beat"}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Idun API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response');
    }

    // Extract JSON from response (handle markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      score: Math.max(-1, Math.min(1, parsed.score || 0)),
      label: ['positive', 'negative', 'neutral'].includes(parsed.label) ? parsed.label : 'neutral',
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      explanation: (parsed.explanation || '').substring(0, 50),
      source: 'ai',
    };

  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function buildSentimentPrompt(newsItem: NewsItem): string {
  return `Analyze sentiment:
TITLE: ${newsItem.title}
SUMMARY: ${newsItem.summary || 'N/A'}
ASSET: ${newsItem.assetType}`;
}

/**
 * Enhanced rule-based sentiment analysis
 */
function analyzeSentimentRuleBased(newsItem: NewsItem): SentimentResult {
  const text = `${newsItem.title} ${newsItem.summary || ''}`.toLowerCase();
  
  const positiveWords = [
    // Strong positive
    { word: 'surge', weight: 1.5 },
    { word: 'rally', weight: 1.5 },
    { word: 'rocket', weight: 1.5 },
    { word: 'soar', weight: 1.3 },
    { word: 'bullish', weight: 1.3 },
    { word: 'breakout', weight: 1.3 },
    { word: 'moon', weight: 1.2 },
    { word: 'record high', weight: 1.2 },
    { word: 'all time high', weight: 1.2 },
    { word: 'ath', weight: 1.2 },
    
    // Medium positive
    { word: 'beat', weight: 1.0 },
    { word: 'strong', weight: 1.0 },
    { word: 'growth', weight: 1.0 },
    { word: 'profit', weight: 1.0 },
    { word: 'gain', weight: 0.8 },
    { word: 'rise', weight: 0.8 },
    { word: 'up', weight: 0.6 },
    { word: 'higher', weight: 0.6 },
    { word: 'upgrade', weight: 1.0 },
    { word: 'outperform', weight: 1.0 },
    { word: 'buy', weight: 1.0 },
    { word: 'bull', weight: 1.0 },
    { word: 'surpass', weight: 0.8 },
    { word: 'exceed', weight: 0.8 },
    { word: 'boost', weight: 0.8 },
    { word: 'optimistic', weight: 0.8 },
    { word: 'confident', weight: 0.8 },
    { word: 'recovery', weight: 0.8 },
    { word: 'rebound', weight: 0.8 },
  ];
  
  const negativeWords = [
    // Strong negative
    { word: 'plunge', weight: 1.5 },
    { word: 'crash', weight: 1.5 },
    { word: 'collapse', weight: 1.5 },
    { word: 'bearish', weight: 1.3 },
    { word: 'breakdown', weight: 1.3 },
    { word: 'crisis', weight: 1.3 },
    { word: 'panic', weight: 1.3 },
    { word: 'record low', weight: 1.2 },
    { word: 'all time low', weight: 1.2 },
    { word: 'atl', weight: 1.2 },
    
    // Medium negative
    { word: 'miss', weight: 1.0 },
    { word: 'weak', weight: 1.0 },
    { word: 'loss', weight: 1.0 },
    { word: 'decline', weight: 0.8 },
    { word: 'down', weight: 0.6 },
    { word: 'lower', weight: 0.6 },
    { word: 'downgrade', weight: 1.0 },
    { word: 'underperform', weight: 1.0 },
    { word: 'sell', weight: 1.0 },
    { word: 'bear', weight: 1.0 },
    { word: 'dump', weight: 1.0 },
    { word: 'plummet', weight: 1.0 },
    { word: 'slide', weight: 0.8 },
    { word: 'tank', weight: 1.0 },
    { word: 'fear', weight: 0.8 },
    { word: 'pessimistic', weight: 0.8 },
    { word: 'concern', weight: 0.6 },
    { word: 'warning', weight: 0.6 },
    { word: 'risk', weight: 0.4 },
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(({ word, weight }) => {
    if (text.includes(word)) positiveScore += weight;
  });
  
  negativeWords.forEach(({ word, weight }) => {
    if (text.includes(word)) negativeScore += weight;
  });
  
  const totalScore = positiveScore + negativeScore;
  
  if (totalScore === 0) {
    return {
      score: 0,
      label: 'neutral',
      confidence: 0.5,
      explanation: 'No sentiment indicators',
      source: 'rule-based',
    };
  }
  
  // Calculate weighted score
  const score = (positiveScore - negativeScore) / Math.max(totalScore, 3);
  const normalizedScore = Math.max(-1, Math.min(1, score));
  
  let label: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.2) label = 'positive';
  else if (normalizedScore < -0.2) label = 'negative';
  else label = 'neutral';
  
  // Confidence based on number and strength of indicators
  const confidence = Math.min(totalScore / 4, 0.95);
  
  return {
    score: normalizedScore,
    label,
    confidence,
    explanation: totalScore > 3 
      ? `${Math.round(positiveScore)} pos, ${Math.round(negativeScore)} neg indicators`
      : 'Limited indicators',
    source: 'rule-based',
  };
}

/**
 * Fast sentiment for ingestion (simplified interface)
 */
export function analyzeSentimentFast(item: { title: string; summary?: string; assetType: string }): SentimentResult {
  const text = `${item.title} ${item.summary || ''}`.toLowerCase();
  
  const positiveWords = [
    { word: 'surge', weight: 1.5 }, { word: 'rally', weight: 1.5 },
    { word: 'rocket', weight: 1.5 }, { word: 'soar', weight: 1.3 },
    { word: 'bullish', weight: 1.3 }, { word: 'breakout', weight: 1.3 },
    { word: 'beat', weight: 1.0 }, { word: 'strong', weight: 1.0 },
    { word: 'profit', weight: 1.0 }, { word: 'gain', weight: 0.8 },
    { word: 'rise', weight: 0.8 }, { word: 'upgrade', weight: 1.0 },
    { word: 'buy', weight: 1.0 }, { word: 'moon', weight: 1.2 },
  ];
  
  const negativeWords = [
    { word: 'plunge', weight: 1.5 }, { word: 'crash', weight: 1.5 },
    { word: 'collapse', weight: 1.5 }, { word: 'bearish', weight: 1.3 },
    { word: 'miss', weight: 1.0 }, { word: 'weak', weight: 1.0 },
    { word: 'loss', weight: 1.0 }, { word: 'decline', weight: 0.8 },
    { word: 'downgrade', weight: 1.0 }, { word: 'sell', weight: 1.0 },
    { word: 'dump', weight: 1.0 }, { word: 'fear', weight: 0.8 },
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(({ word, weight }) => {
    if (text.includes(word)) positiveScore += weight;
  });
  
  negativeWords.forEach(({ word, weight }) => {
    if (text.includes(word)) negativeScore += weight;
  });
  
  const totalScore = positiveScore + negativeScore;
  
  if (totalScore === 0) {
    return {
      score: 0, label: 'neutral', confidence: 0.5,
      explanation: 'No indicators', source: 'rule-based',
    };
  }
  
  const score = (positiveScore - negativeScore) / Math.max(totalScore, 3);
  const normalizedScore = Math.max(-1, Math.min(1, score));
  
  let label: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.2) label = 'positive';
  else if (normalizedScore < -0.2) label = 'negative';
  else label = 'neutral';
  
  return {
    score: normalizedScore,
    label,
    confidence: Math.min(totalScore / 4, 0.95),
    explanation: totalScore > 2 ? `${Math.round(positiveScore)}+ ${Math.round(negativeScore)}-` : 'Limited',
    source: 'rule-based',
  };
}

/**
 * Batch analyze multiple news items efficiently
 */
export async function analyzeSentimentBatch(
  newsItems: NewsItem[],
  useAI: boolean = false
): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>();
  
  // Process all items in parallel (rule-based is fast)
  const promises = newsItems.map(async (item) => {
    const sentiment = await analyzeSentiment(item, useAI);
    results.set(item.id, sentiment);
  });
  
  await Promise.all(promises);
  
  return results;
}
