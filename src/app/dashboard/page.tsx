'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { NewsItem, Ticker, Tag } from '@prisma/client';
import { Loader2, TrendingUp, TrendingDown, Newspaper, BarChart3, Gamepad2 } from 'lucide-react';
import { TICKER_DATA } from '@/lib/constants';
import { VirtualizedNewsList } from '@/components/VirtualizedNewsList';

interface NewsWithRelations extends NewsItem {
  tickers: Ticker[];
  tags: Tag[];
}

interface Filters {
  assetTypes: string[];
  sectors: string[];
  regions: string[];
  timeRange: string;
  sentiment: 'all' | 'positive' | 'negative' | 'neutral';
}

export default function DashboardPage() {
  const [news, setNews] = useState<NewsWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    assetTypes: [],
    sectors: [],
    regions: [],
    timeRange: '24H',
    sentiment: 'all',
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (newsContainerRef.current) {
        setContainerHeight(newsContainerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Only fetch when user explicitly requests it
  const loadNews = (page = 1) => {
    setHasLoaded(true);
    fetchNews(page);
  };

  const fetchNews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const timeRangeMap: Record<string, string> = {
        '1H': '1h',
        '6H': '6h',
        '24H': '24h',
        '3D': '3d',
        '7D': '7d',
        '30D': '30d',
      };
      const timeParam = timeRangeMap[filters.timeRange] || '24h';
      
      // Build query params
      const params = new URLSearchParams();
      params.append('limit', '500');
      params.append('page', page.toString());
      params.append('timeRange', timeParam);
      
      if (filters.assetTypes.length > 0) {
        filters.assetTypes.forEach(type => params.append('assetType', type));
      }
      if (filters.sentiment !== 'all') {
        params.append('sentiment', filters.sentiment);
      }
      if (commandInput && !commandInput.startsWith('/')) {
        params.append('search', commandInput);
      }
      
      const res = await fetch(`/api/news?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (page === 1) {
          setNews(data.news);
        } else {
          setNews(prev => [...prev, ...data.news]);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange, filters.assetTypes, filters.sentiment, commandInput]);

  // Refetch when filters change (after initial load)
  useEffect(() => {
    if (hasLoaded) {
      fetchNews(1);
    }
  }, [hasLoaded, fetchNews]);

  return (
    <div className="h-screen flex flex-col bg-black text-white font-mono text-sm overflow-hidden">
      {/* TICKER TAPE */}
      <div className="bg-[#111] border-b border-[#333] h-8 flex items-center overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee">
          {[...TICKER_DATA, ...TICKER_DATA].map((ticker, i) => (
            <div key={i} className="flex items-center px-4 border-r border-[#333]">
              <span className="font-bold mr-2">{ticker.symbol}</span>
              <span className="mr-2">{ticker.price.toFixed(2)}</span>
              <span className={ticker.change >= 0 ? 'text-[#0f0]' : 'text-[#f00]'}>
                {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MENU BAR */}
      <div className="bg-[#161b22] border-b border-[#333] h-10 flex items-center px-2">
        <div className="flex items-center gap-1">
          {[
            { tab: 'DASHBOARD', href: '/dashboard', icon: Newspaper },
            { tab: 'SUMMARY', href: '/summary', icon: BarChart3 },
            { tab: 'MAKRO', href: '/makrooppdatering', icon: Gamepad2 },
          ].map(({ tab, href, icon: Icon }) => (
            <Link
              key={tab}
              href={href}
              className="flex items-center gap-1 px-4 py-1 text-xs font-bold text-[#888] hover:text-white hover:bg-[#333]"
            >
              <Icon className="w-3.5 h-3.5" />
              {tab}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-[#888]">
          <span>USD/NOK: 10.52</span>
          <span>EUR/USD: 1.08</span>
          <span className="text-[#0f0]">● LIVE</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - FILTERS */}
        <div className="w-64 bg-[#0a0a0a] border-r border-[#333] flex flex-col">
          <div className="bg-[#ff6b35] text-black px-3 py-1 font-bold text-xs">
            FILTERS
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {/* Time Range */}
            <div className="mb-4">
              <div className="text-[#ff6b35] text-xs font-bold mb-1">TIME RANGE</div>
              <div className="grid grid-cols-3 gap-1">
                {['1H', '6H', '24H', '3D', '7D', '30D'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setFilters({ ...filters, timeRange: time })}
                    className={`px-2 py-1 text-xs ${
                      filters.timeRange === time
                        ? 'bg-[#ff6b35] text-black font-bold'
                        : 'bg-[#222] text-[#888] hover:text-white'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Types */}
            <div className="mb-4">
              <div className="text-[#ff6b35] text-xs font-bold mb-1">ASSET TYPE</div>
              <div className="space-y-1">
                {['EQUITY', 'ETF', 'CRYPTO', 'FOREX', 'COMMODITY'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-[#222] p-1">
                    <input
                      type="checkbox"
                      checked={filters.assetTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.assetTypes, type]
                          : filters.assetTypes.filter(t => t !== type);
                        setFilters({ ...filters, assetTypes: newTypes });
                      }}
                      className="w-3 h-3 accent-[#ff6b35]"
                    />
                    <span className="text-xs text-[#ccc]">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div className="mb-4">
              <div className="text-[#ff6b35] text-xs font-bold mb-1">SECTOR</div>
              <div className="space-y-1">
                {['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial'].map((sector) => (
                  <label key={sector} className="flex items-center gap-2 cursor-pointer hover:bg-[#222] p-1">
                    <input
                      type="checkbox"
                      checked={filters.sectors.includes(sector)}
                      onChange={(e) => {
                        const newSectors = e.target.checked
                          ? [...filters.sectors, sector]
                          : filters.sectors.filter(s => s !== sector);
                        setFilters({ ...filters, sectors: newSectors });
                      }}
                      className="w-3 h-3 accent-[#ff6b35]"
                    />
                    <span className="text-xs text-[#ccc]">{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="mb-4">
              <div className="text-[#ff6b35] text-xs font-bold mb-1">REGION</div>
              <div className="space-y-1">
                {['North America', 'Europe', 'Asia Pacific', 'Nordics', 'Latin America'].map((region) => (
                  <label key={region} className="flex items-center gap-2 cursor-pointer hover:bg-[#222] p-1">
                    <input
                      type="checkbox"
                      checked={filters.regions.includes(region)}
                      onChange={(e) => {
                        const newRegions = e.target.checked
                          ? [...filters.regions, region]
                          : filters.regions.filter(r => r !== region);
                        setFilters({ ...filters, regions: newRegions });
                      }}
                      className="w-3 h-3 accent-[#ff6b35]"
                    />
                    <span className="text-xs text-[#ccc]">{region}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sentiment */}
            <div className="mb-4">
              <div className="text-[#ff6b35] text-xs font-bold mb-1">SENTIMENT</div>
              <div className="space-y-1">
                {[
                  { val: 'all', label: 'ALL' },
                  { val: 'positive', label: 'BULLISH', color: '#0f0' },
                  { val: 'negative', label: 'BEARISH', color: '#f00' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setFilters({ ...filters, sentiment: opt.val as any })}
                    className={`w-full text-left px-2 py-1 text-xs ${
                      filters.sentiment === opt.val
                        ? 'bg-[#ff6b35] text-black font-bold'
                        : 'text-[#888] hover:text-white'
                    }`}
                  >
                    <span style={{ color: opt.color }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL - NEWS */}
        <div className="flex-1 bg-black flex flex-col min-w-0">
          <div className="bg-[#161b22] border-b border-[#333] px-3 py-2 flex items-center justify-between">
            <div className="text-[#ff6b35] font-bold">NEWS FEED</div>
            <div className="text-xs text-[#888]">{news.length} ITEMS</div>
          </div>
          
          <div ref={newsContainerRef} className="flex-1 overflow-hidden">
            <VirtualizedNewsList
              news={news}
              loading={loading}
              hasLoaded={hasLoaded}
              onLoadMore={() => loadNews(1)}
              containerHeight={containerHeight}
            />
          </div>
        </div>

        {/* RIGHT PANEL - STATS */}
        <div className="w-72 bg-[#0a0a0a] border-l border-[#333] flex flex-col">
          <div className="bg-[#ff6b35] text-black px-3 py-1 font-bold text-xs">
            MARKET OVERVIEW
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {/* Total News */}
            <div className="bg-[#111] border border-[#333] p-3 mb-3">
              <div className="text-[#666] text-xs mb-1">FILTERED / TOTAL</div>
              <div className="text-2xl font-bold text-white">
                {news.length} <span className="text-lg text-[#666]">/ {news.length}</span>
              </div>
            </div>

            {/* Sentiment */}
            <div className="bg-[#111] border border-[#333] p-3 mb-3">
              <div className="text-[#666] text-xs mb-2">SENTIMENT (FILTERED)</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#0f0] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> BULLISH
                  </span>
                  <span className="text-white font-bold">
                    {news.filter(n => (n.sentiment || 0) > 0).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#f00] flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> BEARISH
                  </span>
                  <span className="text-white font-bold">
                    {news.filter(n => (n.sentiment || 0) < 0).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">NEUTRAL</span>
                  <span className="text-white">
                    {news.filter(n => (n.sentiment || 0) === 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Sources */}
            <div className="bg-[#111] border border-[#333] p-3 mb-3">
              <div className="text-[#666] text-xs mb-2">TOP SOURCES</div>
              <div className="space-y-1">
                {Object.entries(
                  news.reduce((acc, item) => {
                    acc[item.source] = (acc[item.source] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([source, count], idx) => (
                    <div key={source} className="flex justify-between text-xs">
                      <span className="text-[#888]">{idx + 1}. {source}</span>
                      <span className="text-[#ff6b35] font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* MOCK QUIZ - Always visible */}
            <div className="bg-[#111] border-2 border-[#ff6b35] p-3">
              <div className="text-[#ff6b35] text-xs font-bold mb-3 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                MAKRO QUIZ
              </div>
              
              {/* Mock Quiz Card 1 */}
              <div className="bg-[#0a0a0a] border border-[#333] p-2 mb-2 hover:border-[#ff6b35] cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">🕵️</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-bold">Gjett Hvem</div>
                    <div className="text-[10px] text-[#666]">Finanslegender</div>
                  </div>
                </div>
                <div className="text-[10px] text-[#888] mb-2">Kjenner du igjen Warren Buffett, Elon Musk, Jerome Powell?</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-[#222] text-[#ff6b35] px-2 py-0.5 rounded">4 spørsmål</span>
                  <Link href="/makrooppdatering" className="text-[10px] text-[#ff6b35] hover:underline">Spill →</Link>
                </div>
              </div>

              {/* Mock Quiz Card 2 */}
              <div className="bg-[#0a0a0a] border border-[#333] p-2 mb-2 hover:border-[#ff6b35] cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-bold">Match Logo</div>
                    <div className="text-[10px] text-[#666]">Tech Giants</div>
                  </div>
                </div>
                <div className="text-[10px] text-[#888] mb-2">Apple, Tesla, NVIDIA, Amazon - kjenner du logoene?</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-[#222] text-[#ff6b35] px-2 py-0.5 rounded">5 spørsmål</span>
                  <Link href="/makrooppdatering" className="text-[10px] text-[#ff6b35] hover:underline">Spill →</Link>
                </div>
              </div>

              {/* Mock Quiz Card 3 */}
              <div className="bg-[#0a0a0a] border border-[#333] p-2 mb-2 hover:border-[#ff6b35] cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-bold">Finn Sammenhengen</div>
                    <div className="text-[10px] text-[#666]">Aksjehistorier</div>
                  </div>
                </div>
                <div className="text-[10px] text-[#888] mb-2">Hva skjedde med Bitcoin, NVIDIA og Tesla i 2024?</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-[#222] text-[#ff6b35] px-2 py-0.5 rounded">4 spørsmål</span>
                  <Link href="/makrooppdatering" className="text-[10px] text-[#ff6b35] hover:underline">Spill →</Link>
                </div>
              </div>

              {/* Mock Quiz Card 4 */}
              <div className="bg-[#0a0a0a] border border-[#333] p-2 mb-2 hover:border-[#ff6b35] cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-bold">Hva Koster Det?</div>
                    <div className="text-[10px] text-[#666]">Gjett Prisen</div>
                  </div>
                </div>
                <div className="text-[10px] text-[#888] mb-2">Apples verdi, Bitcoin-pris, Oljefondet - gjett!</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-[#222] text-[#ff6b35] px-2 py-0.5 rounded">4 spørsmål</span>
                  <Link href="/makrooppdatering" className="text-[10px] text-[#ff6b35] hover:underline">Spill →</Link>
                </div>
              </div>

              {/* Mock Quiz Card 5 */}
              <div className="bg-[#0a0a0a] border border-[#333] p-2 hover:border-[#ff6b35] cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">✅❌</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-bold">Fakta eller Fiksjon</div>
                    <div className="text-[10px] text-[#666]">Sant/Usant</div>
                  </div>
                </div>
                <div className="text-[10px] text-[#888] mb-2">Bitcoin 2008, Warren Buffett, GameStop drama</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-[#222] text-[#ff6b35] px-2 py-0.5 rounded">4 spørsmål</span>
                  <Link href="/makrooppdatering" className="text-[10px] text-[#ff6b35] hover:underline">Spill →</Link>
                </div>
              </div>

              <Link href="/makrooppdatering">
                <button className="w-full mt-3 py-2 bg-[#ff6b35] text-black text-xs font-bold hover:bg-[#ff8555] transition-colors">
                  SE ALLE QUIZER →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* COMMAND LINE */}
      <div className="bg-[#161b22] border-t border-[#333] flex flex-col">
        {/* AUTOCOMPLETE SUGGESTIONS */}
        {commandInput.startsWith('/') && commandInput.length > 0 && (
          <div className="bg-[#0a0a0a] border-b border-[#333] px-3 py-1">
            <div className="flex items-center gap-4 text-xs overflow-x-auto">
              <span className="text-[#666]">SUGGESTIONS:</span>
              {[
                { cmd: '/help', desc: 'Show help' },
                { cmd: '/clear', desc: 'Clear filters' },
                { cmd: '/bullish', desc: 'Bullish news' },
                { cmd: '/bearish', desc: 'Bearish news' },
                { cmd: '/crypto', desc: 'Crypto only' },
                { cmd: '/stocks', desc: 'Stocks only' },
              ]
                .filter(s => s.cmd.startsWith(commandInput.toLowerCase()))
                .map((suggestion) => (
                  <button
                    key={suggestion.cmd}
                    onClick={() => {
                      setCommandInput(suggestion.cmd);
                      // Auto-execute on click
                      const cmd = suggestion.cmd.slice(1);
                      if (cmd === 'help' || cmd === 'h') {
                        setShowHelp(true);
                      } else if (cmd === 'clear' || cmd === 'c') {
                        setCommandInput('');
                        setFilters({ assetTypes: [], sectors: [], regions: [], timeRange: '24H', sentiment: 'all' });
                      } else if (cmd === 'bullish' || cmd === 'b') {
                        setFilters({ ...filters, sentiment: 'positive' });
                      } else if (cmd === 'bearish' || cmd === 'be') {
                        setFilters({ ...filters, sentiment: 'negative' });
                      } else if (cmd === 'crypto') {
                        setFilters({ ...filters, assetTypes: ['CRYPTO'] });
                      } else if (cmd === 'stocks' || cmd === 's') {
                        setFilters({ ...filters, assetTypes: ['EQUITY'] });
                      }
                    }}
                    className="flex items-center gap-1 text-[#ccc] hover:text-[#ff6b35] whitespace-nowrap"
                  >
                    <span className="text-[#ff6b35] font-bold">{suggestion.cmd}</span>
                    <span className="text-[#666]">- {suggestion.desc}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
        
        <div className="h-8 flex items-center px-3">
          <span className="text-[#ff6b35] font-bold mr-2">{`>`}</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Execute command or search
                if (commandInput.startsWith('/')) {
                  const cmd = commandInput.slice(1).toLowerCase();
                  if (cmd === 'help' || cmd === 'h') {
                    setShowHelp(true);
                  } else if (cmd === 'clear' || cmd === 'c') {
                    setCommandInput('');
                    setFilters({ assetTypes: [], sectors: [], regions: [], timeRange: '24H', sentiment: 'all' });
                  } else if (cmd === 'bullish' || cmd === 'b') {
                    setFilters({ ...filters, sentiment: 'positive' });
                  } else if (cmd === 'bearish' || cmd === 'be') {
                    setFilters({ ...filters, sentiment: 'negative' });
                  } else if (cmd === 'crypto') {
                    setFilters({ ...filters, assetTypes: ['CRYPTO'] });
                  } else if (cmd === 'stocks' || cmd === 's') {
                    setFilters({ ...filters, assetTypes: ['EQUITY'] });
                  }
                }
              } else if (e.key === 'F1') {
                e.preventDefault();
                setShowHelp(true);
              } else if (e.key === 'Escape') {
                setShowHelp(false);
              }
            }}
            placeholder="Type / for commands or search..."
            className="bg-transparent text-white flex-1 outline-none text-sm"
            autoFocus
          />
          <span className="text-[#666] text-xs">F1=Help ESC=Close</span>
        </div>
      </div>

      {/* HELP MODAL */}
      {showHelp && (
        <div className="absolute bottom-16 left-4 right-4 bg-[#161b22] border-2 border-[#ff6b35] p-4 z-50 max-w-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#ff6b35] font-bold">COMMAND HELP</span>
            <button onClick={() => setShowHelp(false)} className="text-[#666] hover:text-white">[X]</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-[#ff6b35] font-bold mb-2">COMMANDS:</div>
              <div className="text-[#ccc] space-y-1">
                <div>/help or /h - Show this help</div>
                <div>/clear or /c - Clear all filters</div>
                <div>/bullish or /b - Show bullish news</div>
                <div>/bearish or /be - Show bearish news</div>
                <div>/crypto - Show crypto news</div>
                <div>/stocks or /s - Show stock news</div>
              </div>
            </div>
            <div>
              <div className="text-[#ff6b35] font-bold mb-2">HOTKEYS:</div>
              <div className="text-[#ccc] space-y-1">
                <div>F1 - Show help</div>
                <div>ESC - Close help</div>
                <div>Enter - Execute command</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS BAR */}
      <div className="bg-[#0a0a0a] border-t border-[#333] h-6 flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-4 text-[#666]">
          <span>MAPRO TERMINAL v1.0</span>
          <span className="text-[#0f0]">● CONNECTED</span>
        </div>
        <div className="text-[#666]">
          {(() => {
            const now = new Date();
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          })()}
        </div>
      </div>
    </div>
  );
}
