'use client';

import { useState, useEffect } from 'react';
import { AssetType } from '@prisma/client';
import { ASSET_TYPE_LABELS } from '@/lib/utils';

interface FilterOptions {
  assetTypes: AssetType[];
  sectors: { id: string; name: string }[];
  countries: { code: string; name: string }[];
  sources: string[];
  tickers: { symbol: string; name: string | null }[];
}

interface Filters {
  assetTypes: AssetType[];
  sectors: string[];
  countries: string[];
  sources: string[];
  tickers: string[];
  search: string;
  timeRange: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

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
    sources: initialFilters?.sources || [],
    tickers: initialFilters?.tickers || [],
    search: initialFilters?.search || '',
    timeRange: initialFilters?.timeRange || '24h',
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch('/api/filters');
      if (res.ok) {
        const data = await res.json();
        setOptions(data);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const updateFilter = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (
    key: keyof Filters,
    value: string
  ) => {
    const current = filters[key] as string[];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key as keyof Filters, newValues);
  };

  const clearFilters = () => {
    const cleared: Filters = {
      assetTypes: [],
      sectors: [],
      countries: [],
      sources: [],
      tickers: [],
      search: '',
      timeRange: '24h',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.assetTypes.length > 0 ||
    filters.sectors.length > 0 ||
    filters.countries.length > 0 ||
    filters.sources.length > 0 ||
    filters.tickers.length > 0 ||
    filters.search.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filter</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Tøm alle
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Søk
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Søk i nyheter..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tidsperiode
        </label>
        <select
          value={filters.timeRange}
          onChange={(e) => updateFilter('timeRange', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="24h">Siste 24 timer</option>
          <option value="7d">Siste 7 dager</option>
          <option value="30d">Siste 30 dager</option>
        </select>
      </div>

      {/* Asset Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verdipapirtype
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {options.assetTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.assetTypes.includes(type as AssetType)}
                onChange={() => toggleArrayFilter('assetTypes', type)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {ASSET_TYPE_LABELS[type] || type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kilder
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {options.sources.map((source) => (
            <label key={source} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.sources.includes(source)}
                onChange={() => toggleArrayFilter('sources', source)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">{source}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sectors */}
      {options.sectors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sektorer
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {options.sectors.map((sector) => (
              <label key={sector.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.sectors.includes(sector.id)}
                  onChange={() => toggleArrayFilter('sectors', sector.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">{sector.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* PE Ratio Filter - Beta */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            PE-ratio filter
          </span>
          <span className="text-xs text-gray-400">Beta</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Krever markedsdata. Tilgjengelig i v2.
        </p>
      </div>
    </div>
  );
}
