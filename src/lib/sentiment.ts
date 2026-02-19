import { NewsItem } from '@prisma/client';

/**
 * AI-Powered Sentiment Analysis using Idun API
 * Analyzes financial news and returns sentiment score between -1 (bearish) and 1 (bullish)
 */

interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
  explanation: string;
}

const IDUN_API_URL = 'https://api.idun.ai/v1/chat/completions';

export async function analyzeSentiment(newsItem: NewsItem): Promise<SentimentResult> {
  // If no API key is available, use rule-based fallback
  const apiKey = process.env.IDUN_API_KEY;
  
  if (!apiKey) {
    console.log('No Idun API key found, using rule-based sentiment');
    return analyzeSentimentRuleBased(newsItem);
  }

  try {
    const prompt = buildSentimentPrompt(newsItem);
    
    const response = await fetch(IDUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'idun-o1', // or whatever model is available
        messages: [
          {
            role: 'system',
            content: `You are a financial sentiment analyzer. Analyze the sentiment of financial news and return a JSON object with:
- score: number between -1 (very bearish) and 1 (very bullish)
- label: "positive", "negative", or "neutral"
- confidence: number between 0 and 1
- explanation: brief explanation of the sentiment (max 100 chars)

Consider:
- Impact on stock prices mentioned
- Market reaction indicators (surge, plunge, rally, crash)
- Earnings/results context
- Fed/monetary policy implications
- Sector-specific impacts

Return ONLY valid JSON, no markdown formatting.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Idun API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from Idun API');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);
    
    return {
      score: Math.max(-1, Math.min(1, parsed.score)),
      label: parsed.label,
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      explanation: parsed.explanation || '',
    };

  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    // Fallback to rule-based
    return analyzeSentimentRuleBased(newsItem);
  }
}

function buildSentimentPrompt(newsItem: NewsItem): string {
  return `Analyze the sentiment of this financial news:

TITLE: ${newsItem.title}
SUMMARY: ${newsItem.summary || 'N/A'}
SOURCE: ${newsItem.source}
ASSET TYPE: ${newsItem.assetType}

Return sentiment as JSON with score (-1 to 1), label, confidence, and brief explanation.`;
}

/**
 * Rule-based sentiment analysis as fallback
 */
function analyzeSentimentRuleBased(newsItem: NewsItem): SentimentResult {
  const text = `${newsItem.title} ${newsItem.summary || ''}`.toLowerCase();
  
  const positiveWords = [
    'surge', 'rally', 'jump', 'soar', 'rocket', 'bullish', 'breakout',
    'beat', 'strong', 'growth', 'profit', 'gain', 'rise', 'up', 'higher',
    'positive', 'upgrade', 'outperform', 'buy', 'bull', 'moon', 'pump',
    'record', 'high', 'peak', 'surpass', 'exceed', 'boost', 'rally',
    'bullish', 'optimistic', 'confident', 'recovery', 'rebound'
  ];
  
  const negativeWords = [
    'plunge', 'crash', 'drop', 'fall', 'sink', 'tumble', 'bearish', 'breakdown',
    'miss', 'weak', 'loss', 'decline', 'down', 'lower', 'negative', 'downgrade',
    'underperform', 'sell', 'bear', 'dump', 'dumping', 'crash', 'low',
    'plummet', 'slide', 'tank', 'collapse', 'crisis', 'fear', 'panic',
    'bearish', 'pessimistic', 'concern', 'warning', 'risk'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeCount++;
  });
  
  const total = positiveCount + negativeCount;
  
  if (total === 0) {
    return {
      score: 0,
      label: 'neutral',
      confidence: 0.5,
      explanation: 'No clear sentiment indicators',
    };
  }
  
  const score = (positiveCount - negativeCount) / Math.max(total, 3);
  const normalizedScore = Math.max(-1, Math.min(1, score));
  
  let label: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.2) label = 'positive';
  else if (normalizedScore < -0.2) label = 'negative';
  else label = 'neutral';
  
  return {
    score: normalizedScore,
    label,
    confidence: Math.min(total / 5, 0.9),
    explanation: `${positiveCount} positive, ${negativeCount} negative indicators`,
  };
}

/**
 * Batch analyze multiple news items
 */
export async function analyzeSentimentBatch(
  newsItems: NewsItem[]
): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>();
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  
  for (let i = 0; i < newsItems.length; i += batchSize) {
    const batch = newsItems.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (item) => {
      const sentiment = await analyzeSentiment(item);
      results.set(item.id, sentiment);
    });
    
    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + batchSize < newsItems.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
