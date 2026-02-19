'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { FilterPanel } from '@/components/FilterPanel';
import { NewsCard } from '@/components/NewsCard';
import { NewsItem, Ticker, Tag } from '@prisma/client';
import { Loader2, RefreshCw, Newspaper } from 'lucide-react';

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

export default function DashboardPage() {
  const [news, setNews] = useState<NewsWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
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
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setNews(prev => [...prev, ...data.news]);
        } else {
          setNews(data.news);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
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

  const runIngest = async () => {
    try {
      await fetch('/api/ingest');
      fetchNews(1, false);
    } catch (error) {
      console.error('Ingest failed:', error);
    }
  };

  return (
    <>
      <Navigation />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 overflow-y-auto border-r border-terminal-border">
          <div className="p-4">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>
        </aside>

        {/* News Feed */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-terminal-bg/95 backdrop-blur border-b border-terminal-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Newspaper className="w-4 h-4 text-bloomberg-orange" />
                <div>
                  <h1 className="text-sm font-mono font-semibold text-terminal-text">NEWS FEED</h1>
                  <p className="text-2xs font-mono text-terminal-muted">
                    {totalCount.toLocaleString()} ITEMS
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={runIngest}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-2xs font-mono border border-terminal-border hover:border-bloomberg-orange hover:text-bloomberg-orange transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  REFRESH
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Bar */}
          <div className="lg:hidden px-4 py-2 border-b border-terminal-border">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* News Grid */}
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

            {!loading && hasMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 bg-bloomberg-orange text-white text-xs font-mono hover:bg-bloomberg-orange-light transition-colors"
                >
                  LOAD MORE
                </button>
              </div>
            )}

            {!loading && news.length === 0 && (
              <div className="text-center py-12 border border-terminal-border">
                <p className="text-sm font-mono text-terminal-muted">NO NEWS FOUND</p>
                <p className="text-2xs font-mono text-terminal-muted mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Quick Stats */}
        <aside className="hidden xl:block w-72 flex-shrink-0 border-l border-terminal-border overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-mono font-semibold text-terminal-text mb-3 pb-2 border-b border-terminal-border">
              MARKET OVERVIEW
            </h3>
            <QuickStats />
          </div>
        </aside>
      </div>
    </>
  );
}

function QuickStats() {
  const stats = [
    { label: 'TOTAL NEWS', value: '1,247', change: '+12%' },
    { label: 'BREAKING', value: '23', change: '+5' },
    { label: 'TRENDING', value: '8', change: null },
  ];

  return (
    <div className="space-y-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-terminal-card border border-terminal-border p-3">
          <div className="text-2xs font-mono text-terminal-muted mb-1">{stat.label}</div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-mono font-bold text-terminal-text">{stat.value}</span>
            {stat.change && (
              <span className={`text-2xs font-mono ${stat.change.startsWith('+') ? 'text-market-up' : 'text-market-down'}`}>
                {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-terminal-border">
        <h4 className="text-2xs font-mono font-semibold text-terminal-text mb-2">TOP SOURCES</h4>
        <div className="space-y-1.5">
          {['Bloomberg', 'Reuters', 'CNBC', 'MarketWatch'].map((source, idx) => (
            <div key={source} className="flex items-center justify-between text-2xs font-mono">
              <span className="text-terminal-muted">{idx + 1}. {source}</span>
              <span className="text-bloomberg-orange">{Math.round(Math.random() * 200 + 50)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
