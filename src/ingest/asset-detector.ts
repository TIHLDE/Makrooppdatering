import { AssetType } from '@prisma/client';

/**
 * Advanced Asset Type Detection
 * Uses AI-like pattern matching to categorize news accurately
 */

interface DetectionResult {
  assetType: AssetType;
  confidence: number;
  keywords: string[];
}

// Detection patterns for each asset type
const patterns: Partial<Record<AssetType, { keywords: string[]; weight: number }[]>> = {
  // Equities
  EQUITY: [
    { keywords: ['stock', 'shares', 'earnings', 'revenue', 'profit', 'loss', 'q1', 'q2', 'q3', 'q4', 'quarterly', 'annual report', 'dividend', 'buyback'], weight: 1.0 },
    { keywords: ['nasdaq', 'nyse', 'ipo', 'listing', 'delist'], weight: 0.9 },
    { keywords: ['beat expectations', 'miss estimates', 'guidance', 'forecast'], weight: 0.8 },
  ],
  
  ETF: [
    { keywords: ['etf', 'exchange traded fund', 'index fund', 'tracker', 'spdr', 'ishares', 'vanguard', 'ark invest'], weight: 1.0 },
    { keywords: ['flows', 'inflows', 'outflows', 'aum', 'assets under management'], weight: 0.8 },
  ],
  
  FUND: [
    { keywords: ['mutual fund', 'hedge fund', 'pension fund', 'sovereign wealth fund', 'nbim', 'gpfg'], weight: 1.0 },
    { keywords: ['fund manager', 'portfolio', 'allocation'], weight: 0.7 },
  ],
  
  ADR: [
    { keywords: ['adr', 'american depositary receipt', 'foreign listing'], weight: 1.0 },
  ],
  
  // Crypto
  CRYPTO: [
    { keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency', 'blockchain', 'token', 'altcoin', 'defi', 'web3'], weight: 1.0 },
    { keywords: ['mining', 'staking', 'wallet', 'exchange hack', 'crypto scam'], weight: 0.9 },
    { keywords: ['satoshi', 'halving', 'hard fork', 'airdrop'], weight: 0.8 },
  ],
  
  // Fixed Income
  BOND: [
    { keywords: ['bond', 'treasury', 'yield', 'fixed income', 'duration', 'maturity', 'coupon'], weight: 1.0 },
    { keywords: ['10-year', '2-year', '30-year', 't-note', 't-bill'], weight: 0.9 },
    { keywords: ['credit rating', 'junk bond', 'investment grade'], weight: 0.8 },
  ],
  
  // Commodities
  COMMODITY: [
    { keywords: ['oil', 'crude', 'brent', 'wti', 'natural gas', 'gasoline', 'petrol'], weight: 1.0 },
    { keywords: ['gold', 'silver', 'copper', 'platinum', 'precious metals'], weight: 1.0 },
    { keywords: ['wheat', 'corn', 'soy', 'agriculture', 'grain'], weight: 0.9 },
    { keywords: ['opec', 'commodity', 'futures', 'spot price'], weight: 0.8 },
  ],
  
  // FX
  FOREX: [
    { keywords: ['currency', 'exchange rate', 'usd', 'eur', 'gbp', 'jpy', 'nok'], weight: 1.0 },
    { keywords: ['forex', 'fx', 'dollar', 'euro', 'yen', 'pound'], weight: 0.9 },
    { keywords: ['central bank', 'monetary policy', 'interest rate'], weight: 0.7 },
  ],
  
  // Indices
  INDEX: [
    { keywords: ['s&p 500', 'nasdaq', 'dow jones', 'index', 'benchmark'], weight: 1.0 },
    { keywords: ['obx', 'ftse', 'dax', 'cac', 'nikkei', 'hang seng'], weight: 0.9 },
    { keywords: ['all-time high', 'correction', 'bear market', 'bull market'], weight: 0.8 },
  ],
  
  // Derivatives
  DERIVATIVE: [
    { keywords: ['option', 'call', 'put', 'future', 'forward', 'swap', 'derivative'], weight: 1.0 },
    { keywords: ['expiry', 'strike price', 'premium', 'open interest'], weight: 0.8 },
  ],
  
  OTHER: [
    { keywords: [], weight: 0 },
  ],
  
  // Legacy types (minimal patterns)
  MACRO: [
    { keywords: ['fed', 'gdp', 'inflation', 'economy', 'central bank'], weight: 0.8 },
  ],
  POLITICS: [
    { keywords: ['election', 'policy', 'regulation', 'government'], weight: 0.8 },
  ],
  GEOPOLITICS: [
    { keywords: ['war', 'conflict', 'sanctions', 'tensions'], weight: 0.8 },
  ],
};

/**
 * Detect asset type from text content
 */
export function detectAssetType(text: string, defaultType: AssetType = AssetType.OTHER): DetectionResult {
  const lowerText = text.toLowerCase();
  const scores: Record<AssetType, number> = {} as Record<AssetType, number>;
  const matchedKeywords: Record<AssetType, string[]> = {} as Record<AssetType, string[]>;
  
  // Score each asset type
  for (const [assetType, patternList] of Object.entries(patterns)) {
    let score = 0;
    const keywords: string[] = [];
    
    for (const pattern of patternList) {
      for (const keyword of pattern.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += pattern.weight;
          keywords.push(keyword);
        }
      }
    }
    
    scores[assetType as AssetType] = score;
    matchedKeywords[assetType as AssetType] = keywords;
  }
  
  // Find highest scoring type
  let bestType = defaultType;
  let bestScore = 0;
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as AssetType;
    }
  }
  
  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? bestScore / totalScore : 0;
  
  return {
    assetType: bestScore > 0 ? bestType : defaultType,
    confidence: Math.min(confidence, 1),
    keywords: matchedKeywords[bestType] || [],
  };
}

/**
 * Detect multiple asset types (for news that spans categories)
 */
export function detectMultipleAssetTypes(text: string): DetectionResult[] {
  const lowerText = text.toLowerCase();
  const results: DetectionResult[] = [];
  
  for (const [assetType, patternList] of Object.entries(patterns)) {
    if (assetType === 'OTHER') continue;
    
    let score = 0;
    const keywords: string[] = [];
    
    for (const pattern of patternList) {
      for (const keyword of pattern.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += pattern.weight;
          keywords.push(keyword);
        }
      }
    }
    
    if (score > 0.5) {
      results.push({
        assetType: assetType as AssetType,
        confidence: Math.min(score / 3, 1),
        keywords,
      });
    }
  }
  
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Detect country/region from text
 */
export function detectCountries(text: string): string[] {
  const countryPatterns: Record<string, string[]> = {
    'US': ['united states', 'usa', 'america', 'fed', 'federal reserve', 'wall street', 'nasdaq', 'nyse', 's&p', 'dow jones'],
    'CN': ['china', 'chinese', 'beijing', 'shanghai', 'evergrande', 'alibaba', 'tencent'],
    'NO': ['norway', 'norwegian', 'norsk', 'oslo', 'norges bank', 'equinor', 'obx', 'nbim'],
    'SE': ['sweden', 'swedish', 'stockholm', 'riksbank', 'volvo', 'ericsson', 'investor'],
    'DE': ['germany', 'german', 'deutschland', 'bundesbank', 'dax', 'volkswagen', 'siemens'],
    'GB': ['uk', 'britain', 'british', 'england', 'boe', 'bank of england', 'ftse', 'london'],
    'JP': ['japan', 'japanese', 'tokyo', 'boj', 'nikkei', 'toyota', 'sony'],
    'EU': ['europe', 'european', 'ecb', 'eurozone', 'euro', 'eu '],
  };
  
  const lowerText = text.toLowerCase();
  const detected: string[] = [];
  
  for (const [code, patterns] of Object.entries(countryPatterns)) {
    if (patterns.some(p => lowerText.includes(p))) {
      detected.push(code);
    }
  }
  
  return detected;
}
