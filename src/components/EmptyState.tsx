'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-data' | 'error' | 'loading';
  message?: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  if (type === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[#0d1117] border border-[#30363d]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35] mb-4" />
        <p className="text-white font-bold">LOADING...</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-red-900/20 border border-red-500">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white font-bold mb-2">ERROR LOADING DATA</p>
        {message && (
          <p className="text-sm text-[#8b949e] max-w-md text-center px-4">
            {message}
          </p>
        )}
      </div>
    );
  }

  // No data state
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-[#0d1117] border border-[#30363d]">
      <p className="text-white font-bold mb-2">NO DATA AVAILABLE</p>
      <p className="text-sm text-[#8b949e]">
        Data will appear when RSS sources are updated
      </p>
    </div>
  );
}
