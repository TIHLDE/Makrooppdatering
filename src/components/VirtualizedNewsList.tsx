'use client';

import { memo, useEffect, useRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { NewsItem, Ticker, Tag } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/constants';

interface NewsWithRelations extends NewsItem {
  tickers: Ticker[];
  tags: Tag[];
}

interface VirtualizedNewsListProps {
  news: NewsWithRelations[];
  loading: boolean;
  hasLoaded: boolean;
  onLoadMore: () => void;
  containerHeight: number;
}

interface RowData {
  news: NewsWithRelations[];
  loading: boolean;
  onLoadMore: () => void;
}

const getSentimentColor = (sentiment: number | null) => {
  if (sentiment === null) return 'text-[#888]';
  if (sentiment > 0.2) return 'text-[#0f0]';
  if (sentiment < -0.2) return 'text-[#f00]';
  return 'text-[#888]';
};

// Memoized individual news item row
const NewsItemRow = memo(({ 
  item, 
  style 
}: { 
  item: NewsWithRelations; 
  style: React.CSSProperties;
}) => {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      className="block p-3 hover:bg-[#111] transition-colors border-l-2 border-transparent hover:border-[#ff6b35] border-b border-[#222]"
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[#ff6b35] font-bold text-xs">{item.source}</span>
          <span className="text-[#666] text-xs">{formatTime(item.publishedAt)}</span>
        </div>
        <span className={getSentimentColor(item.sentiment)}>
          {item.sentiment && item.sentiment > 0 ? '+' : ''}
          {item.sentiment?.toFixed(2) || '0.00'}
        </span>
      </div>
      <div className="font-bold text-sm text-white mb-1 leading-tight line-clamp-2">
        {item.title}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-[#222] text-[#888] px-1">{item.assetType}</span>
        {item.tickers.slice(0, 2).map(t => (
          <span key={t.id} className="text-xs text-[#ff6b35]">{t.symbol}</span>
        ))}
      </div>
    </a>
  );
});

NewsItemRow.displayName = 'NewsItemRow';

// Row component for react-window
const Row = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: RowData;
}) => {
  const { news, loading, onLoadMore } = data;
  const item = news[index];
  
  // Load more when reaching near the end
  useEffect(() => {
    if (index === news.length - 5 && !loading) {
      onLoadMore();
    }
  }, [index, news.length, loading, onLoadMore]);
  
  return <NewsItemRow item={item} style={style} />;
});

Row.displayName = 'Row';

// Main virtualized list component
export const VirtualizedNewsList = memo(function VirtualizedNewsList({
  news,
  loading,
  hasLoaded,
  onLoadMore,
  containerHeight,
}: VirtualizedNewsListProps) {
  const listRef = useRef<List>(null);
  const itemHeight = 100;

  const itemData = useMemo<RowData>(() => ({
    news,
    loading,
    onLoadMore,
  }), [news, loading, onLoadMore]);

  const RowComponent = useCallback((props: { index: number; style: React.CSSProperties }) => (
    <Row {...props} data={itemData} />
  ), [itemData]);

  if (!hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#666]">
        <div className="text-lg mb-4">Select filters and load news</div>
        <button
          onClick={onLoadMore}
          className="px-6 py-3 bg-[#ff6b35] text-black font-bold text-sm hover:bg-[#ff8555] transition-colors"
        >
          LOAD NEWS
        </button>
      </div>
    );
  }

  if (loading && news.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#666]">
        No matching items found
      </div>
    );
  }

  return (
    <>
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={news.length}
        itemSize={itemHeight}
        width="100%"
        overscanCount={5}
        itemData={itemData}
      >
        {RowComponent}
      </List>
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
        </div>
      )}
    </>
  );
});
