'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-data' | 'error' | 'loading';
  message?: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  if (type === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-terminal-border">
        <Loader2 className="w-8 h-8 animate-spin text-bloomberg-orange mb-4" />
        <p className="text-sm font-mono text-terminal-muted">LOADING...</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-red-500/30 bg-red-500/5">
        <AlertTriangle className="w-12 h-12 text-market-down mb-4" />
        <p className="text-sm font-mono text-terminal-text mb-2">ERROR LOADING DATA</p>
        {message && (
          <p className="text-xs font-mono text-terminal-muted max-w-md text-center px-4">
            {message}
          </p>
        )}
      </div>
    );
  }

  // No data state - simple, neutral message
  return (
    <div className="flex flex-col items-center justify-center py-16 border border-terminal-border">
      <p className="text-sm font-mono text-terminal-muted mb-2">NO DATA AVAILABLE</p>
      <p className="text-xs font-mono text-terminal-muted">
        Data will appear when RSS sources are updated
      </p>
    </div>
  );
}
