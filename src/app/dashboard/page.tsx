'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { FilterPanel } from '@/components/FilterPanel';
import { NewsCard } from '@/components/NewsCard';
import { NewsItem, Ticker, Tag } from '@prisma/client';
import { Loader2 } from 'lucide-react';

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
      params.set('limit', '20');
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

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* News Feed */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Nyhetsfeed</h1>
              <span className="text-sm text-gray-500">
                {news.length} nyheter funnet
              </span>
            </div>

            <div className="space-y-4">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            )}

            {!loading && hasMore && (
              <div className="flex justify-center py-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Last flere nyheter
                </button>
              </div>
            )}

            {!loading && news.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Ingen nyheter funnet med valgte filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
