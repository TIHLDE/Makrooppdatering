'use client';

import { NewsItem, Ticker, Tag } from '@prisma/client';
import { formatRelativeTime } from '@/lib/utils';
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
      ? <TrendingUp className="w-4 h-4 text-[#3fb950]" />
      : news.sentiment < -0.2
      ? <TrendingDown className="w-4 h-4 text-[#f85149]" />
      : <Minus className="w-4 h-4 text-[#8b949e]" />
    : null;

  const sentimentColor = news.sentiment !== null
    ? news.sentiment > 0.2
      ? 'bg-[#238636]/20 text-[#3fb950]'
      : news.sentiment < -0.2
      ? 'bg-[#da3633]/20 text-[#f85149]'
      : 'bg-[#30363d] text-[#8b949e]'
    : 'bg-[#30363d] text-[#8b949e]';

  return (
    <article className="bg-[#0d1117] border border-[#30363d] p-4 hover:border-[#ff6b35] transition-colors">
      <a 
        href={news.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#ff6b35] font-bold">{news.source}</span>
            <span className="text-[#8b949e]">•</span>
            <span className="text-[#8b949e]">{formatRelativeTime(news.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {sentimentIcon}
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${sentimentColor}`}>
              {Math.round(news.relevance * 100)}%
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 leading-snug hover:text-[#ff6b35] transition-colors">
          {news.title}
        </h3>

        {/* Summary */}
        {news.summary && (
          <p className="text-sm text-[#c9d1d9] mb-3 line-clamp-2">
            {news.summary}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 bg-[#21262d] text-[#58a6ff] text-xs font-bold border border-[#30363d]">
            {news.assetType}
          </span>

          {news.tickers.slice(0, 3).map((ticker) => (
            <span 
              key={ticker.id}
              className="px-2 py-1 bg-[#ff6b35]/20 text-[#ff6b35] text-xs font-bold"
            >
              {ticker.symbol}
            </span>
          ))}

          {news.tags.slice(0, 2).map((tag) => (
            <span 
              key={tag.id}
              className="text-xs text-[#8b949e]"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </a>
    </article>
  );
}
