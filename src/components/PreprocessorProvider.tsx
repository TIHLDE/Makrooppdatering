'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface PreprocessorContextType {
  isPreprocessing: boolean;
  lastRun: Date | null;
  cacheStats: {
    totalEntries: number;
    totalSizeKB: number;
  } | null;
}

const PreprocessorContext = createContext<PreprocessorContextType>({
  isPreprocessing: false,
  lastRun: null,
  cacheStats: null,
});

export function usePreprocessor() {
  return useContext(PreprocessorContext);
}

export function PreprocessorProvider({ children }: { children: React.ReactNode }) {
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [cacheStats, setCacheStats] = useState<{ totalEntries: number; totalSizeKB: number } | null>(null);

  useEffect(() => {
    // Trigger initial preprocessing on client side
    const runPreprocessing = async () => {
      try {
        setIsPreprocessing(true);
        
        const res = await fetch('/api/preprocess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'common' }),
        });

        if (res.ok) {
          const data = await res.json();
          setLastRun(new Date());
          setCacheStats({
            totalEntries: data.stats?.totalEntries || 0,
            totalSizeKB: data.stats?.totalSizeKB || 0,
          });
          console.log('[PreprocessorProvider] Initial preprocessing completed', data);
        }
      } catch (error) {
        console.warn('[PreprocessorProvider] Preprocessing failed:', error);
      } finally {
        setIsPreprocessing(false);
      }
    };

    // Run immediately
    runPreprocessing();

    // Set up interval for periodic preprocessing (every 5 minutes)
    const interval = setInterval(runPreprocessing, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PreprocessorContext.Provider value={{ isPreprocessing, lastRun, cacheStats }}>
      {children}
    </PreprocessorContext.Provider>
  );
}
