/**
 * Background Preprocessor Worker
 * Automatically preprocesses and caches data every 5 minutes
 */

import { preprocessAllCommonFilters, cleanExpiredCache, getCacheStats } from './preprocessor';
import { prisma } from './prisma';

const PREPROCESS_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;
let cleanupId: NodeJS.Timeout | null = null;

/**
 * Start the preprocessor worker
 */
export async function startPreprocessorWorker(): Promise<void> {
  if (isRunning) {
    console.log('[Preprocessor Worker] Already running');
    return;
  }

  isRunning = true;
  console.log('[Preprocessor Worker] Starting...');

  // Run immediately on start
  await runPreprocessing();

  // Schedule periodic preprocessing
  intervalId = setInterval(async () => {
    await runPreprocessing();
  }, PREPROCESS_INTERVAL_MS);

  // Schedule cache cleanup
  cleanupId = setInterval(async () => {
    await cleanExpiredCache();
  }, CLEANUP_INTERVAL_MS);

  console.log(`[Preprocessor Worker] Running every ${PREPROCESS_INTERVAL_MS / 1000 / 60} minutes`);
}

/**
 * Stop the preprocessor worker
 */
export function stopPreprocessorWorker(): void {
  if (!isRunning) return;

  console.log('[Preprocessor Worker] Stopping...');
  
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  
  if (cleanupId) {
    clearInterval(cleanupId);
    cleanupId = null;
  }

  isRunning = false;
  console.log('[Preprocessor Worker] Stopped');
}

/**
 * Run single preprocessing cycle
 */
async function runPreprocessing(): Promise<void> {
  const startTime = Date.now();
  console.log(`[Preprocessor Worker] Starting preprocessing cycle at ${new Date().toISOString()}`);

  try {
    // Preprocess all common filter combinations
    await preprocessAllCommonFilters();

    // Log cache stats
    const stats = await getCacheStats();
    console.log(`[Preprocessor Worker] Cache stats:`, {
      entries: stats.totalEntries,
      size: `${(stats.totalSize / 1024).toFixed(2)} KB`,
      newest: stats.newestEntry,
    });

    const duration = Date.now() - startTime;
    console.log(`[Preprocessor Worker] Cycle completed in ${duration}ms`);
  } catch (error) {
    console.error('[Preprocessor Worker] Error during preprocessing:', error);
  }
}

/**
 * Check if worker is running
 */
export function isPreprocessorRunning(): boolean {
  return isRunning;
}

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  startPreprocessorWorker();
}
