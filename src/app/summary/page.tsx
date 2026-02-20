'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { NewsItem, AssetType, Ticker, Tag } from '@prisma/client';
import { formatRelativeTime } from '@/lib/utils';
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
    const themes: Array<{
      id: string;
      title: string;
      icon: React.ReactNode;
      types: AssetType[];
      keywords: string[];
    }> = [
      {
        id: 'macro',
        title: 'Makroøkonomi',
        icon: <DollarSign className="w-6 h-6" />,
        types: [AssetType.OTHER],
        keywords: ['fed', 'rente', 'inflation', 'gdp', 'unemployment'],
      },
      {
        id: 'crypto',
        title: 'Kryptovaluta',
        icon: <Zap className="w-6 h-6" />,
        types: [AssetType.CRYPTO],
        keywords: ['bitcoin', 'ethereum', 'crypto', 'blockchain'],
      },
      {
        id: 'equity',
        title: 'Aksjer',
        icon: <TrendingUp className="w-6 h-6" />,
        types: [AssetType.EQUITY],
        keywords: ['earnings', 'stock', 'shares'],
      },
      {
        id: 'geopolitics',
        title: 'Geopolitikk',
        icon: <Globe className="w-6 h-6" />,
        types: [AssetType.OTHER],
        keywords: ['war', 'conflict', 'sanctions', 'election'],
      },
    ];

    return themes.map(theme => {
      const themeNews = news.filter(item => 
        theme.types.includes(item.assetType) ||
        theme.keywords.some(kw => 
          item.title.toLowerCase().includes(kw.toLowerCase())
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
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">MAKRO OPPSUMMERING</h1>
          <p className="text-[#aaa] mt-2">
            Siste 7 dager strukturert etter tema
          </p>
        </div>

        {/* Slide Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.theme}
              onClick={() => setActiveSlide(idx)}
              className={`flex items-center space-x-2 px-4 py-2 whitespace-nowrap transition-colors ${
                activeSlide === idx
                  ? 'bg-[#ff6b35] text-black font-bold'
                  : 'bg-[#111] text-white border-2 border-[#333] hover:border-[#ff6b35]'
              }`}
            >
              {slide.icon}
              <span>{slide.title}</span>
              <span className={`text-xs px-2 py-0.5 ${
                activeSlide === idx ? 'bg-black/20' : 'bg-[#333]'
              }`}>
                {slide.stats.count}
              </span>
            </button>
          ))}
        </div>

        {/* Active Slide */}
        {slides[activeSlide] && (
          <div className="bg-[#111] border-2 border-[#333]">
            {/* Slide Header */}
            <div className="bg-[#161b22] border-b-2 border-[#333] p-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-[#ff6b35]/20 border border-[#ff6b35]">
                  {slides[activeSlide].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{slides[activeSlide].title}</h2>
                  <p className="text-[#aaa]">
                    {slides[activeSlide].stats.count} nyheter denne uken
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex space-x-6 mt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-[#00d084]" />
                  <span className="text-white">{slides[activeSlide].stats.positive} positive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-[#ff4444]" />
                  <span className="text-white">{slides[activeSlide].stats.negative} negative</span>
                </div>
              </div>
            </div>

            {/* News List */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                VIKTIGE NYHETER
              </h3>
              <div className="space-y-4">
                {slides[activeSlide].news.map((item, idx) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-black border-2 border-[#333] hover:border-[#ff6b35] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-[#ff6b35] font-bold">
                        {item.source} • {formatRelativeTime(item.publishedAt)}
                      </span>
                      {item.sentiment !== null && (
                        <span className={`text-xs px-2 py-0.5 font-bold ${
                          item.sentiment > 0 
                            ? 'bg-[#00d084]/20 text-[#00d084]' 
                            : item.sentiment < 0 
                            ? 'bg-[#ff4444]/20 text-[#ff4444]'
                            : 'bg-[#333] text-[#aaa]'
                        }`}>
                          {item.sentiment > 0 ? 'Positiv' : item.sentiment < 0 ? 'Negativ' : 'Nøytral'}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white mb-1">
                      {idx + 1}. {item.title}
                    </h4>
                    {item.summary && (
                      <p className="text-sm text-[#aaa] line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
