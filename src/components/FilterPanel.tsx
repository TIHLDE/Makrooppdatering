'use client';

import { useState, useEffect, useRef } from 'react';
import { AssetType } from '@prisma/client';
import { ASSET_TYPE_LABELS, cn } from '@/lib/utils';
import { 
  Filter, X, ChevronDown, ChevronUp, Search, Globe, 
  TrendingUp, Clock, DollarSign, BarChart3, Layers, 
  Cpu, Zap, Briefcase, Building2, HeartPulse, 
  Factory, Truck, ShoppingBag, Radio, Battery
} from 'lucide-react';

interface FilterOptions {
  assetTypes: AssetType[];
  sectors: { id: string; name: string; icon: string }[];
  countries: { code: string; name: string; region: string }[];
  sources: string[];
  tickers: { symbol: string; name: string | null; sector: string }[];
}

interface Filters {
  assetTypes: AssetType[];
  sectors: string[];
  countries: string[];
  regions: string[];
  sources: string[];
  tickers: string[];
  search: string;
  timeRange: string;
  sentiment: 'all' | 'positive' | 'negative' | 'neutral';
  marketCap: 'all' | 'large' | 'mid' | 'small';
}

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

const sectorIcons: Record<string, any> = {
  'Technology': Cpu,
  'Healthcare': HeartPulse,
  'Financials': Building2,
  'Energy': Zap,
  'Consumer Discretionary': ShoppingBag,
  'Industrials': Factory,
  'Materials': Layers,
  'Real Estate': Building2,
  'Communication Services': Radio,
  'Utilities': Battery,
  'Crypto/Blockchain': DollarSign,
};

const regions = [
  { code: 'AMERICAS', name: 'Americas', countries: ['US', 'CA', 'BR', 'MX'] },
  { code: 'EUROPE', name: 'Europe', countries: ['GB', 'DE', 'FR', 'NO', 'SE', 'DK'] },
  { code: 'ASIA', name: 'Asia Pacific', countries: ['CN', 'JP', 'IN', 'AU'] },
];

const timeRanges = [
  { value: '1h', label: '1H', desc: 'Last hour' },
  { value: '6h', label: '6H', desc: '6 hours' },
  { value: '24h', label: '24H', desc: '24 hours' },
  { value: '3d', label: '3D', desc: '3 days' },
  { value: '7d', label: '7D', desc: '7 days' },
  { value: '30d', label: '30D', desc: '30 days' },
];

export function FilterPanel({ onFilterChange, initialFilters }: FilterPanelProps) {
  const [options, setOptions] = useState<FilterOptions>({
    assetTypes: [],
    sectors: [],
    countries: [],
    sources: [],
    tickers: [],
  });
  
  const [filters, setFilters] = useState<Filters>({
    assetTypes: initialFilters?.assetTypes || [],
    sectors: initialFilters?.sectors || [],
    countries: initialFilters?.countries || [],
    regions: initialFilters?.regions || [],
    sources: initialFilters?.sources || [],
    tickers: initialFilters?.tickers || [],
    search: initialFilters?.search || '',
    timeRange: initialFilters?.timeRange || '24h',
    sentiment: initialFilters?.sentiment || 'all',
    marketCap: initialFilters?.marketCap || 'all',
  });

  const [expanded, setExpanded] = useState<string[]>(['search', 'time', 'assetTypes']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tickerSearch, setTickerSearch] = useState('');
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);
  const tickerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tickerInputRef.current && !tickerInputRef.current.contains(event.target as Node)) {
        setShowTickerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch('/api/filters');
      if (res.ok) {
        const data = await res.json();
        // Add icons to sectors
        data.sectors = data.sectors.map((s: any) => ({
          ...s,
          icon: sectorIcons[s.name] || BarChart3,
        }));
        // Add regions to countries
        data.countries = data.countries.map((c: any) => ({
          ...c,
          region: regions.find(r => r.countries.includes(c.code))?.code || 'OTHER'
        }));
        setOptions(data);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: keyof Filters, value: string) => {
    const current = filters[key] as string[];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key as keyof Filters, newValues);
  };

  const addTicker = (symbol: string) => {
    if (!filters.tickers.includes(symbol)) {
      updateFilter('tickers', [...filters.tickers, symbol]);
    }
    setTickerSearch('');
    setShowTickerDropdown(false);
  };

  const removeTicker = (symbol: string) => {
    updateFilter('tickers', filters.tickers.filter(t => t !== symbol));
  };

  const clearFilters = () => {
    const cleared: Filters = {
      assetTypes: [],
      sectors: [],
      countries: [],
      regions: [],
      sources: [],
      tickers: [],
      search: '',
      timeRange: '24h',
      sentiment: 'all',
      marketCap: 'all',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const toggleRegion = (regionCode: string) => {
    const region = regions.find(r => r.code === regionCode);
    if (!region) return;

    const hasAllCountries = region.countries.every(c => filters.countries.includes(c));
    
    if (hasAllCountries) {
      // Remove all countries from this region
      updateFilter('countries', filters.countries.filter(c => !region.countries.includes(c)));
      updateFilter('regions', filters.regions.filter(r => r !== regionCode));
    } else {
      // Add all countries from this region
      const newCountries = [...new Set([...filters.countries, ...region.countries])];
      updateFilter('countries', newCountries);
      if (!filters.regions.includes(regionCode)) {
        updateFilter('regions', [...filters.regions, regionCode]);
      }
    }
  };

  const activeFilterCount = 
    filters.assetTypes.length +
    filters.sectors.length +
    filters.countries.length +
    filters.sources.length +
    filters.tickers.length +
    (filters.search ? 1 : 0) +
    (filters.sentiment !== 'all' ? 1 : 0) +
    (filters.marketCap !== 'all' ? 1 : 0);

  const toggleSection = (section: string) => {
    setExpanded(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const filteredTickers = options.tickers.filter(t => 
    t.symbol.toLowerCase().includes(tickerSearch.toLowerCase()) ||
    (t.name && t.name.toLowerCase().includes(tickerSearch.toLowerCase()))
  ).slice(0, 10);

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children, 
    count = 0 
  }: { 
    title: string; 
    sectionKey: string; 
    children: React.ReactNode;
    count?: number;
  }) => (
    <div className="mb-4">
      <button 
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-xs font-mono font-semibold text-terminal-text mb-2 hover:text-bloomberg-orange transition-colors group"
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="px-1.5 py-0.5 bg-bloomberg-orange text-white text-2xs rounded">
              {count}
            </span>
          )}
        </span>
        {expanded.includes(sectionKey) ? 
          <ChevronUp className="w-3 h-3" /> : 
          <ChevronDown className="w-3 h-3" />
        }
      </button>
      {expanded.includes(sectionKey) && children}
    </div>
  );

  const filterContent = (
    <>
      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mb-4 p-3 bg-terminal-bg border border-terminal-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-mono text-terminal-muted">
              {activeFilterCount} ACTIVE FILTERS
            </span>
            <button
              onClick={clearFilters}
              className="text-2xs font-mono text-bloomberg-orange hover:text-bloomberg-orange-light flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              CLEAR
            </button>
          </div>
          
          {/* Selected Tickers */}
          {filters.tickers.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {filters.tickers.map(ticker => (
                <span 
                  key={ticker}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-bloomberg-orange/20 border border-bloomberg-orange text-2xs font-mono"
                >
                  {ticker}
                  <button onClick={() => removeTicker(ticker)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <FilterSection title="SEARCH" sectionKey="search">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search news..."
            className="w-full bg-terminal-bg border border-terminal-border text-terminal-text font-mono text-xs pl-8 pr-3 py-2 focus:border-bloomberg-orange focus:outline-none transition-colors"
          />
        </div>
      </FilterSection>

      {/* Time Range */}
      <FilterSection title="TIME RANGE" sectionKey="time">
        <div className="grid grid-cols-3 gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => updateFilter('timeRange', range.value)}
              className={`px-2 py-1.5 text-2xs font-mono transition-all ${
                filters.timeRange === range.value
                  ? 'bg-bloomberg-orange text-white'
                  : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-bloomberg-orange/50'
              }`}
              title={range.desc}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Asset Types */}
      <FilterSection title="ASSET TYPES" sectionKey="assetTypes" count={filters.assetTypes.length}>
        <div className="space-y-1">
          {options.assetTypes.map((type) => (
            <label key={type} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.assetTypes.includes(type as AssetType)}
                onChange={() => toggleArrayFilter('assetTypes', type)}
                className="w-3 h-3 rounded border-terminal-border bg-terminal-bg text-bloomberg-orange focus:ring-bloomberg-orange focus:ring-1"
              />
              <span className="ml-2 text-2xs font-mono text-terminal-muted group-hover:text-terminal-text transition-colors uppercase">
                {ASSET_TYPE_LABELS[type] || type}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Sectors */}
      {options.sectors.length > 0 && (
        <FilterSection title="SECTORS" sectionKey="sectors" count={filters.sectors.length}>
          <div className="grid grid-cols-2 gap-1">
            {options.sectors.map((sector) => {
              const Icon = sector.icon || BarChart3;
              const isSelected = filters.sectors.includes(sector.id);
              return (
                <button
                  key={sector.id}
                  onClick={() => toggleArrayFilter('sectors', sector.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 text-2xs font-mono transition-all text-left ${
                    isSelected
                      ? 'bg-bloomberg-orange text-white'
                      : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-bloomberg-orange/50'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{sector.name}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Regions */}
      <FilterSection title="REGIONS" sectionKey="regions" count={filters.regions.length}>
        <div className="space-y-1">
          {regions.map((region) => {
            const isSelected = filters.regions.includes(region.code);
            return (
              <button
                key={region.code}
                onClick={() => toggleRegion(region.code)}
                className={`flex items-center justify-between w-full px-2 py-1.5 text-2xs font-mono transition-all ${
                  isSelected
                    ? 'bg-bloomberg-orange text-white'
                    : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-bloomberg-orange/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  {region.name}
                </span>
                <span className="text-2xs opacity-60">
                  {region.countries.length} countries
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Individual Countries */}
        {filters.countries.length > 0 && (
          <div className="mt-2 pt-2 border-t border-terminal-border">
            <div className="flex flex-wrap gap-1">
              {filters.countries.map(code => {
                const country = options.countries.find(c => c.code === code);
                return (
                  <span 
                    key={code}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-terminal-bg border border-terminal-border text-3xs font-mono"
                  >
                    {country?.name || code}
                    <button 
                      onClick={() => toggleArrayFilter('countries', code)}
                      className="hover:text-bloomberg-orange"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </FilterSection>

      {/* Ticker Search */}
      <FilterSection title="TICKERS" sectionKey="tickers" count={filters.tickers.length}>
        <div className="relative" ref={tickerInputRef}>
          <input
            type="text"
            value={tickerSearch}
            onChange={(e) => {
              setTickerSearch(e.target.value);
              setShowTickerDropdown(true);
            }}
            onFocus={() => setShowTickerDropdown(true)}
            placeholder="Add ticker..."
            className="w-full bg-terminal-bg border border-terminal-border text-terminal-text font-mono text-xs px-3 py-2 focus:border-bloomberg-orange focus:outline-none transition-colors"
          />
          
          {showTickerDropdown && tickerSearch && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-terminal-card border border-terminal-border max-h-40 overflow-y-auto z-50">
              {filteredTickers.length > 0 ? (
                filteredTickers.map((ticker) => (
                  <button
                    key={ticker.symbol}
                    onClick={() => addTicker(ticker.symbol)}
                    className="w-full px-3 py-2 text-left hover:bg-terminal-border transition-colors flex items-center justify-between"
                  >
                    <span className="text-xs font-mono font-semibold text-bloomberg-orange">
                      {ticker.symbol}
                    </span>
                    <span className="text-2xs font-mono text-terminal-muted truncate max-w-[120px]">
                      {ticker.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-2xs font-mono text-terminal-muted">
                  No tickers found
                </div>
              )}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Sentiment */}
      <FilterSection title="SENTIMENT" sectionKey="sentiment">
        <div className="grid grid-cols-2 gap-1">
          {[
            { value: 'all', label: 'ALL' },
            { value: 'positive', label: 'BULLISH', color: 'text-market-up' },
            { value: 'negative', label: 'BEARISH', color: 'text-market-down' },
            { value: 'neutral', label: 'NEUTRAL', color: 'text-terminal-muted' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter('sentiment', option.value as any)}
              className={`px-2 py-1.5 text-2xs font-mono transition-all ${
                filters.sentiment === option.value
                  ? 'bg-bloomberg-orange text-white'
                  : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-bloomberg-orange/50'
              }`}
            >
              <span className={filters.sentiment === option.value ? '' : option.color}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Sources */}
      {options.sources.length > 0 && (
        <FilterSection title="SOURCES" sectionKey="sources" count={filters.sources.length}>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {options.sources.map((source) => (
              <label key={source} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.sources.includes(source)}
                  onChange={() => toggleArrayFilter('sources', source)}
                  className="w-3 h-3 rounded border-terminal-border bg-terminal-bg text-bloomberg-orange focus:ring-bloomberg-orange focus:ring-1"
                />
                <span className="ml-2 text-2xs font-mono text-terminal-muted group-hover:text-terminal-text transition-colors truncate">
                  {source}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Market Cap - Beta */}
      <FilterSection title="MARKET CAP" sectionKey="marketCap">
        <div className="space-y-1">
          {[
            { value: 'all', label: 'ALL CAPS' },
            { value: 'large', label: 'LARGE CAP (>$10B)' },
            { value: 'mid', label: 'MID CAP ($2B-$10B)' },
            { value: 'small', label: 'SMALL CAP (<$2B)' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter('marketCap', option.value as any)}
              className={`w-full text-left px-2 py-1.5 text-2xs font-mono transition-all ${
                filters.marketCap === option.value
                  ? 'bg-bloomberg-orange text-white'
                  : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-bloomberg-orange/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-3xs font-mono text-terminal-muted mt-2">
          * Requires market data API
        </p>
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-bloomberg-orange text-white flex items-center justify-center shadow-lg border border-bloomberg-orange-light"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-market-up text-white text-xs flex items-center justify-center font-bold font-mono">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Filter Panel */}
      <div className={`
        md:hidden fixed inset-x-0 bottom-0 z-50 bg-terminal-card border-t-2 border-bloomberg-orange
        transform transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-y-0' : 'translate-y-full'}
        max-h-[75vh] overflow-y-auto
      `}>
        <div className="sticky top-0 bg-terminal-card border-b border-terminal-border p-3 flex items-center justify-between">
          <span className="text-sm font-mono font-semibold text-terminal-text flex items-center gap-2">
            <Filter className="w-4 h-4 text-bloomberg-orange" />
            FILTERS
          </span>
          <button onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5 text-terminal-muted" />
          </button>
        </div>
        <div className="p-4">
          {filterContent}
        </div>
      </div>

      {/* Desktop Filter Panel */}
      <div className="hidden md:block h-full">
        <div className="bg-terminal-card border border-terminal-border h-full overflow-y-auto">
          <div className="flex items-center gap-2 p-3 border-b border-terminal-border bg-terminal-bg sticky top-0 z-10">
            <Filter className="w-4 h-4 text-bloomberg-orange" />
            <span className="text-sm font-mono font-semibold text-terminal-text">FILTERS</span>
            {activeFilterCount > 0 && (
              <span className="ml-auto px-1.5 py-0.5 bg-bloomberg-orange text-white text-2xs font-mono">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="p-3">
            {filterContent}
          </div>
        </div>
      </div>
    </>
  );
}
