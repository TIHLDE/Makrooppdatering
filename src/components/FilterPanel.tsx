'use client';

import { useState, useEffect, useCallback } from 'react';
import { AssetType } from '@prisma/client';
import { Filter, X, Search, Globe, ChevronDown } from 'lucide-react';

interface Filters {
  assetTypes: AssetType[];
  regions: string[];
  sources: string[];
  tickers: string[];
  search: string;
  timeRange: string;
  sentiment: 'all' | 'positive' | 'negative' | 'neutral';
}

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

const assetTypeLabels: Record<AssetType, string> = {
  EQUITY: 'Stocks / Shares',
  ETF: 'ETF',
  FUND: 'Funds',
  ADR: 'ADR',
  BOND: 'Bonds',
  CRYPTO: 'Crypto',
  COMMODITY: 'Commodities',
  FOREX: 'Forex',
  INDEX: 'Indices',
  DERIVATIVE: 'Derivatives',
  OTHER: 'Other',
};

const timeRanges = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '24h', label: '24H' },
  { value: '3d', label: '3D' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

const regions = [
  { code: 'NORTH_AMERICA', name: 'North America' },
  { code: 'EUROPE', name: 'Europe' },
  { code: 'NORDICS', name: 'Nordics' },
  { code: 'ASIA_PACIFIC', name: 'Asia Pacific' },
  { code: 'MIDDLE_EAST', name: 'Middle East' },
  { code: 'LATIN_AMERICA', name: 'Latin America' },
  { code: 'AFRICA', name: 'Africa' },
];

export function FilterPanel({ onFilterChange, initialFilters }: FilterPanelProps) {
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableTickers, setAvailableTickers] = useState<Array<{symbol: string, name: string}>>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tickerSearch, setTickerSearch] = useState('');
  
  // Expanded sections state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    search: true,
    time: true,
    assetTypes: true,
    sentiment: false,
    regions: false,
    sources: false,
    tickers: false,
  });
  
  const [filters, setFilters] = useState<Filters>({
    assetTypes: initialFilters?.assetTypes || [],
    regions: initialFilters?.regions || [],
    sources: initialFilters?.sources || [],
    tickers: initialFilters?.tickers || [],
    search: initialFilters?.search || '',
    timeRange: initialFilters?.timeRange || '24h',
    sentiment: initialFilters?.sentiment || 'all',
  });

  useEffect(() => {
    fetch('/api/filters')
      .then(res => res.json())
      .then(data => {
        setAvailableSources(data.sources || []);
        setAvailableTickers(data.tickers || []);
      })
      .catch(console.error);
  }, []);

  const updateFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [onFilterChange]);

  const toggleFilter = useCallback((key: keyof Filters, value: string) => {
    const current = filters[key] as string[];
    const exists = current.includes(value);
    const newValues = exists 
      ? current.filter(v => v !== value)
      : [...current, value];
    
    updateFilters({ ...filters, [key]: newValues });
  }, [filters, updateFilters]);

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = useCallback(() => {
    updateFilters({
      assetTypes: [],
      regions: [],
      sources: [],
      tickers: [],
      search: '',
      timeRange: '24h',
      sentiment: 'all',
    });
  }, [updateFilters]);

  const activeCount = filters.assetTypes.length + 
    filters.regions.length + 
    filters.sources.length + 
    filters.tickers.length +
    (filters.search ? 1 : 0) +
    (filters.sentiment !== 'all' ? 1 : 0);

  const filteredTickers = availableTickers
    .filter(t => 
      t.symbol.toLowerCase().includes(tickerSearch.toLowerCase()) ||
      t.name?.toLowerCase().includes(tickerSearch.toLowerCase())
    )
    .slice(0, 10);

  // Section header component
  const SectionHeader = ({ title, section, count = 0 }: { title: string; section: string; count?: number }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-2 text-xs font-bold text-white hover:text-[#ff6b35] transition-colors"
    >
      <span className="flex items-center gap-2">
        {title}
        {count > 0 && (
          <span className="px-1.5 py-0.5 bg-[#ff6b35] text-white text-[10px] rounded">
            {count}
          </span>
        )}
      </span>
      <ChevronDown 
        className={`w-4 h-4 text-[#8b949e] transition-transform duration-200 ${expanded[section] ? 'rotate-180' : ''}`} 
      />
    </button>
  );

  const filterContent = (
    <div className="p-3 space-y-2">
      {/* Search - Always visible */}
      <div>
        <SectionHeader title="SEARCH" section="search" />
        {expanded.search && (
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8b949e]" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
                placeholder="Search..."
                className="w-full bg-black border border-[#30363d] text-white text-xs pl-7 pr-2 py-1.5 focus:border-[#ff6b35] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Time Range */}
      <div className="border-t border-[#30363d] pt-2">
        <SectionHeader title="TIME RANGE" section="time" />
        {expanded.time && (
          <div className="mt-2 grid grid-cols-3 gap-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => updateFilters({ ...filters, timeRange: range.value })}
                className={`px-2 py-1 text-xs font-bold transition-colors ${
                  filters.timeRange === range.value
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-black border border-[#30363d] text-[#8b949e] hover:border-[#ff6b35] hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Asset Types */}
      <div className="border-t border-[#30363d] pt-2">
        <SectionHeader title="ASSET TYPE" section="assetTypes" count={filters.assetTypes.length} />
        {expanded.assetTypes && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {Object.entries(assetTypeLabels).map(([type, label]) => (
              <label key={type} className="flex items-center cursor-pointer group py-1">
                <input
                  type="checkbox"
                  checked={filters.assetTypes.includes(type as AssetType)}
                  onChange={() => toggleFilter('assetTypes', type)}
                  className="w-3 h-3 rounded border-[#30363d] bg-black text-[#ff6b35] accent-[#ff6b35]"
                />
                <span className="ml-2 text-xs text-[#8b949e] group-hover:text-white transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sentiment */}
      <div className="border-t border-[#30363d] pt-2">
        <SectionHeader title="SENTIMENT" section="sentiment" count={filters.sentiment !== 'all' ? 1 : 0} />
        {expanded.sentiment && (
          <div className="mt-2 grid grid-cols-2 gap-1">
            {[
              { value: 'all', label: 'ALL' },
              { value: 'positive', label: 'BULLISH' },
              { value: 'negative', label: 'BEARISH' },
              { value: 'neutral', label: 'NEUTRAL' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateFilters({ ...filters, sentiment: opt.value as any })}
                className={`px-2 py-1 text-xs font-bold transition-colors ${
                  filters.sentiment === opt.value
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-black border border-[#30363d] text-[#8b949e] hover:border-[#ff6b35] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Regions */}
      <div className="border-t border-[#30363d] pt-2">
        <SectionHeader title="REGIONS" section="regions" count={filters.regions.length} />
        {expanded.regions && (
          <div className="mt-2 space-y-1">
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => toggleFilter('regions', region.code)}
                className={`w-full flex items-center justify-between px-2 py-1 text-xs font-bold transition-colors ${
                  filters.regions.includes(region.code)
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-black border border-[#30363d] text-[#8b949e] hover:border-[#ff6b35] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {region.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sources */}
      {availableSources.length > 0 && (
        <div className="border-t border-[#30363d] pt-2">
          <SectionHeader title="SOURCES" section="sources" count={filters.sources.length} />
          {expanded.sources && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {availableSources.map((source) => (
                <label key={source} className="flex items-center cursor-pointer group py-1">
                  <input
                    type="checkbox"
                    checked={filters.sources.includes(source)}
                    onChange={() => toggleFilter('sources', source)}
                    className="w-3 h-3 rounded border-[#30363d] bg-black text-[#ff6b35] accent-[#ff6b35]"
                  />
                  <span className="ml-2 text-xs text-[#8b949e] group-hover:text-white truncate">
                    {source}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tickers */}
      <div className="border-t border-[#30363d] pt-2">
        <SectionHeader title="TICKERS" section="tickers" count={filters.tickers.length} />
        {expanded.tickers && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={tickerSearch}
              onChange={(e) => setTickerSearch(e.target.value)}
              placeholder="Search ticker..."
              className="w-full bg-black border border-[#30363d] text-white text-xs px-2 py-1 focus:border-[#ff6b35] focus:outline-none"
            />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredTickers.map((ticker) => (
                <button
                  key={ticker.symbol}
                  onClick={() => toggleFilter('tickers', ticker.symbol)}
                  className={`w-full text-left px-2 py-1 text-xs transition-colors ${
                    filters.tickers.includes(ticker.symbol)
                      ? 'bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  <span className="font-bold">{ticker.symbol}</span>
                  <span className="text-[#8b949e] ml-1">- {ticker.name}</span>
                </button>
              ))}
            </div>
            {filters.tickers.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {filters.tickers.map(ticker => (
                  <span 
                    key={ticker}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ff6b35] text-white text-xs font-bold"
                  >
                    {ticker}
                    <button 
                      onClick={() => toggleFilter('tickers', ticker)}
                      className="hover:text-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-[#ff6b35] text-white flex items-center justify-center shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3fb950] text-white text-xs flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile Panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}
      
      <div className={`md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#0d1117] border-t-2 border-[#ff6b35] transition-transform duration-300 max-h-[80vh] ${mobileOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-4 overflow-y-auto max-h-[80vh]">
          {filterContent}
        </div>
      </div>

      {/* Desktop Panel */}
      <div className="hidden md:block h-full">
        <div className="h-full flex flex-col bg-[#0d1117] border-r border-[#30363d]">
          {/* Header with CLEAR button beside it */}
          <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#30363d] bg-[#161b22]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-sm font-bold text-white">FILTERS</span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#ff6b35] text-white text-xs font-bold rounded">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#ff6b35] hover:text-white transition-colors px-2 py-1 rounded hover:bg-[#ff6b35]/20"
              >
                CLEAR
              </button>
            )}
          </div>
          
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {filterContent}
          </div>
        </div>
      </div>
    </>
  );
}
