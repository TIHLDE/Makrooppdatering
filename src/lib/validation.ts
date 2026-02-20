import { z } from 'zod';
import { AssetType } from '@prisma/client';

// Valid asset types from enum
const validAssetTypes = Object.values(AssetType) as [AssetType, ...AssetType[]];

// News filter validation schema
export const newsFilterSchema = z.object({
  timeRange: z.enum(['1h', '6h', '24h', '3d', '7d', '30d']).default('24h'),
  assetTypes: z.array(z.enum(validAssetTypes)).optional().default([]),
  sources: z.array(z.string().min(1).max(100)).optional().default([]),
  tickers: z.array(z.string().min(1).max(10)).optional().default([]),
  search: z.string().min(1).max(200).optional(),
  sentiment: z.enum(['all', 'positive', 'negative', 'neutral']).default('all'),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

// Quiz generation validation schema
export const quizGenerationSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'MATCH_PAIRS', 'FIND_CONNECTION']),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  assetTypes: z.array(z.enum(validAssetTypes)).min(1).max(5),
  questionCount: z.coerce.number().int().min(3).max(20).default(10),
}).refine((data) => data.dateTo > data.dateFrom, {
  message: 'dateTo must be after dateFrom',
  path: ['dateTo'],
}).refine((data) => {
  const diffDays = (data.dateTo.getTime() - data.dateFrom.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}, {
  message: 'Date range must not exceed 30 days',
  path: ['dateTo'],
});

// Market data query schema
export const marketDataSchema = z.object({
  symbols: z.array(z.string().min(1).max(10)).max(10).optional(),
  type: z.enum(['stocks', 'crypto', 'all']).default('all'),
});

// RSS source schema
export const rssSourceSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  assetType: z.enum(validAssetTypes),
  isActive: z.boolean().default(true),
});

// Type exports
export type NewsFilterInput = z.infer<typeof newsFilterSchema>;
export type QuizGenerationInput = z.infer<typeof quizGenerationSchema>;
export type MarketDataInput = z.infer<typeof marketDataSchema>;
export type RssSourceInput = z.infer<typeof rssSourceSchema>;

// Sanitize search input
export function sanitizeSearch(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['";`]/g, '') // Remove SQL special chars
    .trim()
    .slice(0, 200);
}
