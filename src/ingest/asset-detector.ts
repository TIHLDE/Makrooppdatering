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
const patterns: Record<AssetType, { keywords: string[]; weight: number }[]> = {
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
  
  DEFI: [
    { keywords: ['defi', 'decentralized finance', 'yield farming', 'liquidity pool', 'dex', 'uniswap', 'aave', 'compound'], weight: 1.0 },
    { keywords: ['smart contract', 'protocol', 'tvl', 'total value locked'], weight: 0.8 },
  ],
  
  NFT: [
    { keywords: ['nft', 'non-fungible token', 'digital art', 'opensea', 'cryptopunks', 'bored ape'], weight: 1.0 },
    { keywords: ['mint', 'collection', 'floor price'], weight: 0.8 },
  ],
  
  // Fixed Income
  BOND: [
    { keywords: ['bond', 'treasury', 'yield', 'fixed income', 'duration', 'maturity', 'coupon'], weight: 1.0 },
    { keywords: ['10-year', '2-year', '30-year', 't-note', 't-bill'], weight: 0.9 },
    { keywords: ['credit rating', 'junk bond', 'investment grade'], weight: 0.8 },
  ],
  
  RATES: [
    { keywords: ['interest rate', 'fed funds', 'eonia', 'sonia', 'libor', 'sofr'], weight: 1.0 },
    { keywords: ['central bank', 'monetary policy', 'hawkish', 'dovish'], weight: 0.8 },
  ],
  
  // Macro
  MACRO: [
    { keywords: ['fed', 'federal reserve', 'ecb', 'boe', 'norges bank', 'interest rate', 'monetary policy'], weight: 1.0 },
    { keywords: ['gdp', 'economic growth', 'recession', 'recovery', 'expansion'], weight: 0.9 },
    { keywords: ['pmi', 'manufacturing', 'services', 'economic indicator'], weight: 0.8 },
  ],
  
  INFLATION: [
    { keywords: ['inflation', 'cpi', 'consumer price index', 'deflation', 'hyperinflation', 'pce'], weight: 1.0 },
    { keywords: ['price stability', 'real wages', 'purchasing power'], weight: 0.8 },
  ],
  
  EMPLOYMENT: [
    { keywords: ['jobs report', 'unemployment', 'nfp', 'non-farm payrolls', 'labor market', 'wages'], weight: 1.0 },
    { keywords: ['jobless claims', 'adp', 'participation rate'], weight: 0.8 },
  ],
  
  GDP: [
    { keywords: ['gdp', 'gross domestic product', 'economic output', 'national accounts'], weight: 1.0 },
    { keywords: ['consumption', 'investment', 'government spending', 'net exports'], weight: 0.8 },
  ],
  
  // Geopolitics
  GEOPOLITICS: [
    { keywords: ['war', 'conflict', 'invasion', 'sanctions', 'tensions', 'border dispute'], weight: 1.0 },
    { keywords: ['military', 'defense', 'nato', 'security council', 'un resolution'], weight: 0.9 },
    { keywords: ['embassy', 'diplomatic', 'evacuation', 'hostage'], weight: 0.8 },
  ],
  
  POLITICS: [
    { keywords: ['election', 'vote', 'parliament', 'congress', 'senate', 'legislation', 'bill'], weight: 1.0 },
    { keywords: ['president', 'prime minister', 'government', 'administration'], weight: 0.9 },
    { keywords: ['campaign', 'poll', 'swing state', 'coalition'], weight: 0.7 },
  ],
  
  REGULATION: [
    { keywords: ['sec', 'finma', 'fca', 'regulator', 'regulation', 'compliance', 'fine', 'investigation'], weight: 1.0 },
    { keywords: ['rules', 'oversight', 'licensing', 'approval', 'ban', 'restrictions'], weight: 0.8 },
  ],
  
  TRADE: [
    { keywords: ['trade war', 'tariff', 'import', 'export', 'trade deficit', 'wto', 'trade deal'], weight: 1.0 },
    { keywords: ['customs', 'duties', 'trade barriers', 'protectionism', 'free trade'], weight: 0.8 },
  ],
  
  // Commodities
  ENERGY: [
    { keywords: ['oil', 'crude', 'brent', 'wti', 'natural gas', 'gasoline', 'petrol', 'electricity', 'power'], weight: 1.0 },
    { keywords: ['opec', 'energy crisis', 'renewable', 'solar', 'wind', 'nuclear'], weight: 0.9 },
    { keywords: ['equinor', 'shell', 'bp', 'exxon', 'chevron', 'saudi aramco'], weight: 0.8 },
  ],
  
  METALS: [
    { keywords: ['gold', 'silver', 'copper', 'platinum', 'palladium', 'precious metals', 'bullion'], weight: 1.0 },
    { keywords: ['mining', 'ore', 'refinery', 'smelter', 'commodity supercycle'], weight: 0.8 },
  ],
  
  AGRICULTURE: [
    { keywords: ['wheat', 'corn', 'soy', 'agriculture', 'grain', 'food prices', 'famine', 'crop'], weight: 1.0 },
    { keywords: ['fertilizer', 'drought', 'harvest', 'livestock', 'dairy'], weight: 0.8 },
  ],
  
  // Sectors
  TECH: [
    { keywords: ['tech', 'technology', 'software', 'ai', 'artificial intelligence', 'cloud', 'semiconductor', 'chip'], weight: 1.0 },
    { keywords: ['apple', 'microsoft', 'google', 'amazon', 'meta', 'nvidia', 'tesla', 'netflix'], weight: 0.9 },
    { keywords: ['startup', 'unicorn', 'venture capital', 'ipo', 'big tech'], weight: 0.8 },
  ],
  
  HEALTHCARE: [
    { keywords: ['pharma', 'biotech', 'drug', 'vaccine', 'fda approval', 'clinical trial', 'medicine'], weight: 1.0 },
    { keywords: ['pfizer', 'moderna', 'johnson & johnson', 'roche', 'novartis'], weight: 0.8 },
    { keywords: ['healthcare', 'hospital', 'medical device'], weight: 0.7 },
  ],
  
  FINANCE: [
    { keywords: ['bank', 'insurance', 'jpmorgan', 'goldman sachs', 'morgan stanley', 'wells fargo'], weight: 1.0 },
    { keywords: ['credit', 'loan', 'mortgage', 'underwriting', 'fintech', 'payment'], weight: 0.8 },
  ],
  
  CONSUMER: [
    { keywords: ['retail', 'consumer', 'walmart', 'target', 'amazon', 'luxury', 'brand'], weight: 1.0 },
    { keywords: ['shopping', 'e-commerce', 'consumer spending', 'disposable income'], weight: 0.8 },
  ],
  
  INDUSTRIAL: [
    { keywords: ['manufacturing', 'industrial', 'aerospace', 'defense', 'boeing', 'airbus', 'lockheed'], weight: 1.0 },
    { keywords: ['supply chain', 'logistics', 'shipping', 'transportation'], weight: 0.8 },
  ],
  
  OTHER: [
    { keywords: [], weight: 0 },
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
