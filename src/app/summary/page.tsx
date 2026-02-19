'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { NewsItem, AssetType, Ticker, Tag } from '@prisma/client';
import { ASSET_TYPE_LABELS, formatRelativeTime } from '@/lib/utils';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Globe, Zap } from 'lucide-react';

interface NewsWithRelations extends NewsItem {
  tickers: Ticker[];
  tags: Tag[];
}

interface SummarySlide {
  title: string;
  theme: string;
  icon: React.ReactNode;
  news: NewsWithRelations[];
  stats: {
    count: number;
    positive: number;
    negative: number;
  };
}

export default function SummaryPage() {
  const [slides, setSlides] = useState<SummarySlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Fetch last 7 days of news grouped by themes
      const res = await fetch('/api/news?timeRange=7d&limit=100');
      if (res.ok) {
        const data = await res.json();
        const summary = generateSummarySlides(data.news);
        setSlides(summary);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummarySlides = (news: NewsWithRelations[]): SummarySlide[] => {
    const themes = [
      {
        id: 'macro',
        title: 'Makroøkonomi',
        icon: <DollarSign className="w-6 h-6" />,
        types: [AssetType.MACRO],
        keywords: ['fed', 'rente', 'inflation', 'gdp', 'unemployment', 'central bank'],
      },
      {
        id: 'crypto',
        title: 'Kryptovaluta',
        icon: <Zap className="w-6 h-6" />,
        types: [AssetType.CRYPTO],
        keywords: ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'btc', 'eth'],
      },
      {
        id: 'tech',
        title: 'Teknologi',
        icon: <TrendingUp className="w-6 h-6" />,
        types: [AssetType.EQUITY],
        keywords: ['apple', 'microsoft', 'google', 'nvidia', 'tesla', 'tech', 'ai'],
      },
      {
        id: 'geopolitics',
        title: 'Geopolitikk',
        icon: <Globe className="w-6 h-6" />,
        types: [AssetType.GEOPOLITICS, AssetType.POLITICS],
        keywords: ['war', 'conflict', 'sanctions', 'election', 'policy'],
      },
    ];

    return themes.map(theme => {
      const themeNews = news.filter(item => 
        theme.types.includes(item.assetType) ||
        theme.keywords.some(kw => 
          item.title.toLowerCase().includes(kw) || 
          (item.summary?.toLowerCase().includes(kw) || false)
        )
      ).slice(0, 5);

      const positive = themeNews.filter(n => (n.sentiment || 0) > 0).length;
      const negative = themeNews.filter(n => (n.sentiment || 0) < 0).length;

      return {
        title: theme.title,
        theme: theme.id,
        icon: theme.icon,
        news: themeNews,
        stats: {
          count: themeNews.length,
          positive,
          negative,
        },
      };
    }).filter(slide => slide.news.length > 0);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Makro Oppsummering</h1>
          <p className="text-gray-600 mt-2">
            Siste 7 dager strukturert etter tema
          </p>
        </div>

        {/* Slide Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.theme}
              onClick={() => setActiveSlide(idx)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSlide === idx
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {slide.icon}
              <span>{slide.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeSlide === idx ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {slide.stats.count}
              </span>
            </button>
          ))}
        </div>

        {/* Active Slide */}
        {slides[activeSlide] && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Slide Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    {slides[activeSlide].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{slides[activeSlide].title}</h2>
                    <p className="text-primary-100">
                      {slides[activeSlide].stats.count} nyheter denne uken
                    </p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex space-x-6 mt-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-300" />
                    <span>{slides[activeSlide].stats.positive} positive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-red-300" />
                    <span>{slides[activeSlide].stats.negative} negative</span>
                  </div>
                </div>
              </div>

              {/* News List */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Viktige nyheter
                </h3>
                <div className="space-y-4">
                  {slides[activeSlide].news.map((item, idx) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {item.source} • {formatRelativeTime(item.publishedAt)}
                        </span>
                        {item.sentiment !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.sentiment > 0 
                              ? 'bg-green-100 text-green-700' 
                              : item.sentiment < 0 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.sentiment > 0 ? 'Positiv' : item.sentiment < 0 ? 'Negativ' : 'Nøytral'}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {idx + 1}. {item.title}
                      </h4>
                      {item.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                      {item.tickers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.tickers.map(ticker => (
                            <span 
                              key={ticker.id}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono"
                            >
                              {ticker.symbol}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">
                Test kunnskapen din!
              </h3>
              <p className="text-purple-100">
                Lag en quiz basert på denne ukens nyheter
              </p>
            </div>
            <a
              href="/quiz"
              className="px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Lag quiz nå
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
