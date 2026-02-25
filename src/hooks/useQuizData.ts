'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizSet } from '@prisma/client';

interface QuizWithCount extends QuizSet {
  _count: { questions: number };
}

interface UseQuizListOptions {
  limit?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface UseQuizListResult {
  quizzes: QuizWithCount[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useQuizList(options: UseQuizListOptions = {}): UseQuizListResult {
  const { limit = 10, retryCount = 3, retryDelay = 1000 } = options;
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);

  const fetchQuizzes = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Increment request ID to track stale requests
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const res = await fetch(`/api/makrooppdatering?limit=${limit}`, {
          signal: abortController.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        
        // Check if this is still the latest request and component is mounted
        if (currentRequestId === requestIdRef.current && !abortController.signal.aborted) {
          setQuizzes(data.quizzes || []);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled, don't update state
        }
        
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < retryCount - 1) {
          // Wait before retrying with exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    // Only update error state if this is still the latest request
    if (currentRequestId === requestIdRef.current && !abortController.signal.aborted) {
      setError(lastError);
      setLoading(false);
    }
  }, [limit, retryCount, retryDelay]);

  useEffect(() => {
    fetchQuizzes();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchQuizzes]);

  return {
    quizzes,
    loading,
    error,
    refetch: fetchQuizzes,
  };
}

interface QuizData {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correct: number;
      imageUrl?: string | null;
      pairId?: string | null;
    }>;
  };
  leaderboard: Array<{
    id: string;
    userName: string | null;
    score: number;
    maxScore: number;
    timeMs: number;
  }>;
}

interface UseQuizDataOptions {
  quizId: string;
  retryCount?: number;
  retryDelay?: number;
}

interface UseQuizDataResult {
  quizData: QuizData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useQuizData(options: UseQuizDataOptions): UseQuizDataResult {
  const { quizId, retryCount = 3, retryDelay = 1000 } = options;
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setLoading(false);
      setError(new Error('Quiz ID is required'));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Increment request ID to track stale requests
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const res = await fetch(`/api/makrooppdatering/${quizId}`, {
          signal: abortController.signal,
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Quiz ikke funnet');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        
        // Check if this is still the latest request and component is mounted
        if (currentRequestId === requestIdRef.current && !abortController.signal.aborted) {
          setQuizData(data);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < retryCount - 1) {
          // Wait before retrying with exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    // Only update error state if this is still the latest request
    if (currentRequestId === requestIdRef.current && !abortController.signal.aborted) {
      setError(lastError);
      setLoading(false);
    }
  }, [quizId, retryCount, retryDelay]);

  useEffect(() => {
    fetchQuiz();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchQuiz]);

  return {
    quizData,
    loading,
    error,
    refetch: fetchQuiz,
  };
}

// Hook for submitting scores with retry and deduplication
export function useSubmitScore() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const submittingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const submitScore = useCallback(async (
    quizId: string,
    scoreData: {
      sessionId: string;
      score: number;
      maxScore: number;
      timeMs: number;
      userName?: string;
    },
    retryCount = 3
  ) => {
    // Prevent concurrent submissions
    if (submittingRef.current) {
      throw new Error('Submission already in progress');
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const res = await fetch(`/api/makrooppdatering/${quizId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scoreData),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setSubmitting(false);
        submittingRef.current = false;
        return data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < retryCount - 1) {
          // Wait before retrying with exponential backoff
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    setError(lastError);
    setSubmitting(false);
    submittingRef.current = false;
    throw lastError;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { submitScore, submitting, error };
}
