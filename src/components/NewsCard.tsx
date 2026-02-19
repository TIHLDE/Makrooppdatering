'use client';

import { NewsItem, Ticker, Tag } from '@prisma/client';
import { formatRelativeTime, truncateText, ASSET_TYPE_LABELS } from '@/lib/utils';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem & {
    tickers: Ticker[];
    tags: Tag[];
  };
}

export function NewsCard({ news }: NewsCardProps) {
  const sentimentIcon = news.sentiment !== null
    ? news.sentiment > 0.2
      ? <TrendingUp className="w-4 h-4 text-green-500" />
      : news.sentiment < -0.2
      ? <TrendingDown className="w-4 h-4 text-red-500" />
      : <Minus className="w-4 h-4 text-gray-400" />
    : null;

  const relevanceColor = news.relevance >= 0.8 
    ? 'bg-red-100 text-red-800' 
    : news.relevance >= 0.6 
    ? 'bg-yellow-100 text-yellow-800' 
    : 'bg-gray-100 text-gray-800';

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="font-medium">{news.source}</span>
          <span>•</span>
          <span>{formatRelativeTime(news.publishedAt)}</span>
        </div>
        <div className="flex items-center space-x-2">
          {sentimentIcon}
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', relevanceColor)}>
            Relevans: {Math.round(news.relevance * 100)}%
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary-600 transition-colors flex items-center gap-2"
        >
          {news.title}
          <ExternalLink className="w-4 h-4" />
        </a>
      </h3>

      {news.summary && (
        <p className="text-gray-600 text-sm mb-3">
          {truncateText(news.summary, 200)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
          {ASSET_TYPE_LABELS[news.assetType] || news.assetType}
        </span>

        {news.tickers.map((ticker) => (
          <span 
            key={ticker.id}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
          >
            {ticker.symbol}
          </span>
        ))}

        {news.tags.map((tag) => (
          <span 
            key={tag.id}
            className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </article>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
