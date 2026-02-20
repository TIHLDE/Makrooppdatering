import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // Bloomberg terminal style - short and concise
  if (diffInSeconds < 60) return 'NOW';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export function formatTimeOnly(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function extractTickers(text: string): string[] {
  // Simple regex to find ticker symbols (2-5 uppercase letters, often preceded by $ or standalone)
  const tickerRegex = /\$([A-Z]{1,5})\b|\b([A-Z]{2,5})\b/g;
  const matches: string[] = [];
  let match;
  
  while ((match = tickerRegex.exec(text)) !== null) {
    const ticker = match[1] || match[2];
    if (ticker && ticker.length >= 2) {
      matches.push(ticker);
    }
  }
  
  return Array.from(new Set(matches));
}

export function calculateRelevanceScore(
  sentiment: number | null,
  hasTickers: boolean,
  isBreaking: boolean
): number {
  let score = 0.5;
  
  if (sentiment !== null) {
    score += Math.abs(sentiment) * 0.2;
  }
  
  if (hasTickers) score += 0.15;
  if (isBreaking) score += 0.2;
  
  return Math.min(score, 1);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

export const ASSET_TYPE_LABELS: Record<string, string> = {
  EQUITY: 'Stocks',
  ETF: 'ETF',
  FUND: 'Funds',
  ADR: 'ADR',
  BOND: 'Bonds',
  CRYPTO: 'Crypto',
  COMMODITY: 'Commodities',
  FOREX: 'Forex',
  INDEX: 'Indices',
  DERIVATIVE: 'Derivatives',
  OTHER: 'Other',
};

export const SECTOR_LABELS: Record<string, string> = {
  'Technology': 'Teknologi',
  'Healthcare': 'Helse',
  'Financials': 'Finans',
  'Energy': 'Energi',
  'Consumer Discretionary': 'Konsum',
  'Industrials': 'Industri',
  'Materials': 'Materialer',
  'Real Estate': 'Eiendom',
  'Communication Services': 'Kommunikasjon',
  'Utilities': 'Forsyning',
  'Crypto/Blockchain': 'Krypto/Blockchain',
};
