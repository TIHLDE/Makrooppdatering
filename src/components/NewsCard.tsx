'use client';

import { NewsItem, Ticker, Tag } from '@prisma/client';
import { formatRelativeTime, ASSET_TYPE_LABELS } from '@/lib/utils';
import { ExternalLink, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem & {
    tickers: Ticker[];
    tags: Tag[];
  };
  compact?: boolean;
}

export function NewsCard({ news, compact = false }: NewsCardProps) {
  const sentimentIcon = news.sentiment !== null
    ? news.sentiment > 0.2
      ? <ArrowUpRight className="w-3 h-3 text-market-up" />
      : news.sentiment < -0.2
      ? <ArrowDownRight className="w-3 h-3 text-market-down" />
      : <Minus className="w-3 h-3 text-terminal-muted" />
    : null;

  if (compact) {
    return (
      <article className="group border-b border-terminal-border hover:bg-terminal-border/30 transition-colors py-2 px-2">
        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xs font-mono text-bloomberg-orange uppercase tracking-wider">
                  {news.source}
                </span>
                <span className="text-2xs font-mono text-terminal-muted">
                  {formatRelativeTime(news.publishedAt)}
                </span>
                {sentimentIcon}
              </div>
              <h3 className="text-xs font-medium text-terminal-text line-clamp-2 group-hover:text-bloomberg-orange transition-colors">
                {news.title}
              </h3>
            </div>
            <ExternalLink className="w-3 h-3 text-terminal-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </a>
      </article>
    );
  }

  return (
    <article className="group bg-terminal-card border border-terminal-border hover:border-bloomberg-orange/50 transition-all">
      <a 
        href={news.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block p-3 sm:p-4"
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-2xs font-mono text-bloomberg-orange uppercase tracking-wider whitespace-nowrap">
              {news.source}
            </span>
            <span className="text-2xs font-mono text-terminal-muted whitespace-nowrap">
              {formatRelativeTime(news.publishedAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {sentimentIcon}
            <span className="text-2xs font-mono text-terminal-muted">
              {Math.round(news.relevance * 100)}%
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-terminal-text mb-2 line-clamp-2 group-hover:text-bloomberg-orange transition-colors">
          {news.title}
          <ExternalLink className="w-3 h-3 inline-block ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>

        {/* Summary */}
        {news.summary && (
          <p className="text-xs text-terminal-muted mb-3 line-clamp-2">
            {news.summary}
          </p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Asset Type */}
          <span className="px-1.5 py-0.5 bg-terminal-bg border border-terminal-border text-2xs font-mono text-terminal-text">
            {ASSET_TYPE_LABELS[news.assetType] || news.assetType}
          </span>

          {/* Tickers */}
          {news.tickers.slice(0, 3).map((ticker) => (
            <span 
              key={ticker.id}
              className="px-1.5 py-0.5 bg-bloomberg-orange/10 border border-bloomberg-orange/30 text-2xs font-mono font-semibold text-bloomberg-orange"
            >
              {ticker.symbol}
            </span>
          ))}
          {news.tickers.length > 3 && (
            <span className="text-2xs font-mono text-terminal-muted">
              +{news.tickers.length - 3}
            </span>
          )}

          {/* Tags */}
          {news.tags.slice(0, 2).map((tag) => (
            <span 
              key={tag.id}
              className="text-2xs font-mono text-terminal-muted"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </a>
    </article>
  );
}
