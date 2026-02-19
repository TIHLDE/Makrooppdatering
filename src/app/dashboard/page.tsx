'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { FilterPanel } from '@/components/FilterPanel';
import { NewsCard } from '@/components/NewsCard';
import { NewsItem, Ticker, Tag } from '@prisma/client';
import { Loader2, Newspaper, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

interface NewsWithRelations extends NewsItem {
  tickers: Ticker[];
  tags: Tag[];
}

interface Filters {
  assetTypes: string[];
  sectors: string[];
  countries: string[];
  sources: string[];
  tickers: string[];
  search: string;
  timeRange: string;
}

interface DashboardStats {
  totalCount: number;
  bySource: Record<string, number>;
  sentimentDistribution: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
}

export default function DashboardPage() {
  const [news, setNews] = useState<NewsWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<Filters>({
    assetTypes: [],
    sectors: [],
    countries: [],
    sources: [],
    tickers: [],
    search: '',
    timeRange: '24h',
  });

  const fetchNews = useCallback(async (pageNum: number, append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', pageNum.toString());
      params.set('limit', '25');
      params.set('timeRange', filters.timeRange);
      
      filters.assetTypes.forEach(t => params.append('assetType', t));
      filters.sectors.forEach(s => params.append('sector', s));
      filters.countries.forEach(c => params.append('country', c));
      filters.sources.forEach(s => params.append('source', s));
      filters.tickers.forEach(t => params.append('ticker', t));
      
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/news?${params}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      
      const data = await res.json();
      if (append) {
        setNews(prev => [...prev, ...data.news]);
      } else {
        setNews(data.news);
      }
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setTotalCount(data.pagination.total);

      // Calculate stats from current data
      const bySource: Record<string, number> = {};
      let bullish = 0, bearish = 0, neutral = 0;
      
      data.news.forEach((item: NewsWithRelations) => {
        bySource[item.source] = (bySource[item.source] || 0) + 1;
        
        if (item.sentiment !== null) {
          if (item.sentiment > 0.2) bullish++;
          else if (item.sentiment < -0.2) bearish++;
          else neutral++;
        } else {
          neutral++;
        }
      });
      
      setStats({
        totalCount: data.pagination.total,
        bySource,
        sentimentDistribution: { bullish, bearish, neutral },
      });
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNews(1, false);
    setPage(1);
  }, [filters, fetchNews]);

  const loadMore = () => {
    const nextPage = page + 1;
    fetchNews(nextPage, true);
    setPage(nextPage);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const topSources = stats?.bySource 
    ? Object.entries(stats.bySource)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  return (
    <>
      <Navigation />
      
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Filters - Fixed/Sticky */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-terminal-border h-full">
          <div className="h-full overflow-y-auto p-4">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>
        </aside>

        {/* News Feed - Scrollable */}
        <main className="flex-1 overflow-y-auto h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-terminal-bg/95 backdrop-blur border-b border-terminal-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Newspaper className="w-4 h-4 text-bloomberg-orange" />
              <div>
                <h1 className="text-sm font-mono font-semibold text-terminal-text">NEWS FEED</h1>
                <p className="text-2xs font-mono text-terminal-muted">
                  {totalCount.toLocaleString()} ITEMS
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden px-4 py-2 border-b border-terminal-border">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mt-4 p-4 bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-market-down" />
                <span className="text-sm font-mono text-terminal-text">{error}</span>
              </div>
            </div>
          )}

          {/* News */}
          <div className="p-4">
            <div className="grid gap-2">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-bloomberg-orange" />
              </div>
            )}

            {!loading && hasMore && news.length > 0 && (
              <div className="flex justify-center py-6">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 bg-bloomberg-orange text-white text-xs font-mono hover:bg-bloomberg-orange-light transition-colors"
                >
                  LOAD MORE
                </button>
              </div>
            )}

            {!loading && news.length === 0 && !error && (
              <EmptyState type="no-data" />
            )}
          </div>
        </main>

        {/* Stats Sidebar - Fixed/Sticky */}
        <aside className="hidden xl:block w-72 flex-shrink-0 border-l border-terminal-border h-full">
          <div className="h-full overflow-y-auto p-4">
            <h3 className="text-xs font-mono font-semibold text-terminal-text mb-3 pb-2 border-b border-terminal-border">
              MARKET OVERVIEW
            </h3>
            
            {stats && stats.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="bg-terminal-card border border-terminal-border p-3">
                  <div className="text-2xs font-mono text-terminal-muted mb-1">TOTAL NEWS</div>
                  <div className="text-lg font-mono font-bold text-terminal-text">
                    {stats.totalCount.toLocaleString()}
                  </div>
                </div>

                <div className="bg-terminal-card border border-terminal-border p-3">
                  <div className="text-2xs font-mono text-terminal-muted mb-2">SENTIMENT</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-2xs font-mono">
                      <span className="flex items-center gap-1 text-market-up">
                        <TrendingUp className="w-3 h-3" />
                        BULLISH
                      </span>
                      <span>{stats.sentimentDistribution.bullish}</span>
                    </div>
                    <div className="flex items-center justify-between text-2xs font-mono">
                      <span className="flex items-center gap-1 text-market-down">
                        <TrendingDown className="w-3 h-3" />
                        BEARISH
                      </span>
                      <span>{stats.sentimentDistribution.bearish}</span>
                    </div>
                    <div className="flex items-center justify-between text-2xs font-mono">
                      <span className="text-terminal-muted">NEUTRAL</span>
                      <span>{stats.sentimentDistribution.neutral}</span>
                    </div>
                  </div>
                </div>

                {topSources.length > 0 && (
                  <div className="pt-4 border-t border-terminal-border">
                    <h4 className="text-2xs font-mono font-semibold text-terminal-text mb-2">
                      TOP SOURCES
                    </h4>
                    <div className="space-y-1.5">
                      {topSources.map(([source, count], idx) => (
                        <div key={source} className="flex items-center justify-between text-2xs font-mono">
                          <span className="text-terminal-muted">{idx + 1}. {source}</span>
                          <span className="text-bloomberg-orange">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-2xs font-mono text-terminal-muted">
                No data available
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
