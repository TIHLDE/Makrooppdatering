'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QuizCardSkeleton, FeaturedQuizSkeleton, Spinner } from '@/components/LoadingSkeleton';
import { useQuizList } from '@/hooks/useQuizData';
import { QuizType, AssetType } from '@prisma/client';
import { 
  Gamepad2, 
  Plus, 
  Clock, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  RefreshCcw,
  Trophy,
  Target,
  Brain
} from 'lucide-react';

interface QuizWithCount {
  id: string;
  title: string;
  description: string | null;
  type: QuizType;
  assetTypes: AssetType[];
  createdAt: Date | string;
  _count: { questions: number };
}

// Separate component for quiz list to enable Suspense
function QuizList({ 
  onRefresh 
}: { 
  onRefresh: () => Promise<void>;
}) {
  const { quizzes, loading, error, refetch } = useQuizList({ limit: 10 });

  const handleRefresh = useCallback(async () => {
    await refetch();
    await onRefresh();
  }, [refetch, onRefresh]);

  if (loading) {
    return <QuizCardSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Kunne ikke laste quizer
        </h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          {error.message || 'Det oppstod en feil ved lasting av quizer. Vennligst prøv igjen.'}
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Prøv igjen
        </button>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <Gamepad2 className="w-16 h-16 text-purple-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ingen MakroOppdatering ennå
        </h3>
        <p className="text-gray-600 mb-4">
          Klar for å teste dine finanskunnskaper? 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}

export default function QuizListPage() {
  const router = useRouter();
  const [showGenerator, setShowGenerator] = useState(false);

  const handleQuizCreated = useCallback(async () => {
    // Close the generator modal
    setShowGenerator(false);
  }, []);

  return (
    <>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-purple-600" aria-hidden="true" />
              MakroOppdatering
            </h1>
            <p className="text-gray-600 mt-2">
              Test dine makro-kunnskaper! Hvor godt følger du med på finans? 📈🧠
            </p>
          </div>
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-expanded={showGenerator}
            aria-controls="quiz-generator"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Lag ny quiz</span>
          </button>
        </header>

        {/* Quiz Generator Panel */}
        {showGenerator && (
          <div id="quiz-generator" role="dialog" aria-label="Generer ny quiz">
            <QuizGenerator 
              onClose={() => setShowGenerator(false)} 
              onSuccess={handleQuizCreated}
            />
          </div>
        )}

        {/* Featured Quiz - Nytt på nytt */}
        <section aria-labelledby="featured-nytt-pa-nytt">
          <h2 id="featured-nytt-pa-nytt" className="sr-only">Nytt på nytt: Finans & Økonomi</h2>
          <Link href="/makrooppdatering/nytt-pa-nytt" className="block mb-8">
            <article className="relative bg-gradient-to-r from-[#ff6b35] to-[#ff8555] rounded-2xl p-8 text-white cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group">
              <div className="absolute top-4 right-4">
                <Sparkles className="w-8 h-8 text-white/80" aria-hidden="true" />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      Ny! 🔥
                    </span>
                    <span className="text-white/80 text-sm">5 runder • 13 spørsmål</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-3">
Makro uke 9
                  </h3>
                  <p className="text-white/90 text-lg mb-4 max-w-2xl">
                 Test data
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Gjett sammenhenger</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Nyhetsquiz</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Toneanalyse</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Markedsreaksjoner</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Case</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                    <span>Start quiz nå</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </section>

        {/* Test Quiz - MakroUke 8 */}
        <section aria-labelledby="featured-test-quiz">
          <h2 id="featured-test-quiz" className="sr-only">MakroUke 8: Markedsoppdatering</h2>
          <Link href="/makrooppdatering/test" className="block mb-8">
            <article className="relative bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  TEST 🧪
                </span>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/80 text-sm">1 runde • 6 spørsmål • Video & bilder</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-3">
                    Uke 9: Markedsoppdatering
                  </h3>
                  <p className="text-white/90 text-lg mb-4 max-w-2xl">
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Key Takeaways</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Video</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Sentralbanker</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Match Pairs</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Geopolitikk</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                    <span>Test quiz-systemet</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </section>

        {/* Quiz List */}
        <section aria-labelledby="quiz-list-heading">
          <h2 id="quiz-list-heading" className="text-xl font-bold text-gray-900 mb-4">
            Tilgjengelige quizer
          </h2>
          <ErrorBoundary>
            <QuizList onRefresh={handleQuizCreated} />
          </ErrorBoundary>
        </section>
      </main>
    </>
  );
}

function QuizTypeCard({ 
  type, 
  title, 
  description, 
  icon 
}: { 
  type: QuizType; 
  title: string; 
  description: string;
  icon: React.ReactNode;
}) {
  const colors = {
    MULTIPLE_CHOICE: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    MATCH_PAIRS: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    FIND_CONNECTION: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colors[type]} transition-colors`}>
      <div className="flex items-center space-x-3 mb-3">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}

// Helper component to handle date formatting safely
function QuizDate({ createdAt }: { createdAt: Date | string }) {
  // Handle both Date objects and ISO strings
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const dateStr = date.toISOString();
  const formattedDate = date.toLocaleDateString('nb-NO');
  
  return (
    <time dateTime={dateStr}>
      Opprettet {formattedDate}
    </time>
  );
}

function QuizCard({ quiz }: { quiz: QuizWithCount }) {
  const router = useRouter();

  const typeColors: Record<string, string> = {
    MULTIPLE_CHOICE: 'bg-blue-100 text-blue-800',
    MATCH_PAIRS: 'bg-green-100 text-green-800',
    FIND_CONNECTION: 'bg-orange-100 text-orange-800',
    DEFAULT: 'bg-gray-100 text-gray-800',
  };

  const typeLabels: Record<string, string> = {
    MULTIPLE_CHOICE: 'Multiple Choice',
    MATCH_PAIRS: 'Match Par',
    FIND_CONNECTION: 'Finn Sammenhengen',
    DEFAULT: 'Quiz',
  };
  
  const colorClass = typeColors[quiz.type] || typeColors.DEFAULT;
  const labelText = typeLabels[quiz.type] || typeLabels.DEFAULT;

  const handleClick = useCallback(() => {
    router.push(`/makrooppdatering/${quiz.id}`);
  }, [router, quiz.id]);

  return (
    <article
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Start quiz: ${quiz.title}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {labelText}
        </span>
        <span className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
          {quiz._count.questions} spørsmål
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {quiz.title}
      </h3>

      {quiz.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {quiz.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {quiz.assetTypes && quiz.assetTypes.length > 0 ? (
          quiz.assetTypes.map((type) => (
            <span 
              key={type}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
            >
              {type}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">Ingen verdipapirtyper</span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <QuizDate createdAt={quiz.createdAt} />
        <span className="text-purple-600 font-medium">Start →</span>
      </div>
    </article>
  );
}

interface QuizGeneratorProps {
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

function QuizGenerator({ onClose, onSuccess }: QuizGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MULTIPLE_CHOICE' as QuizType,
    questionCount: 10,
    assetTypes: [] as AssetType[],
    timeRange: '7d',
  });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  
  // Check if form has unsaved changes
  const hasUnsavedChanges = formData.title !== '' || formData.description !== '' || formData.assetTypes.length > 0;

  // Focus trap implementation
  useEffect(() => {
    // Store the element that had focus before modal opened
    lastFocusedElement.current = document.activeElement as HTMLElement;
    
    // Focus first input when modal opens
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          setShowCloseConfirm(true);
        } else {
          onClose();
        }
      }
      
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, input, select, textarea, [href]:not([disabled])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when modal closes
      lastFocusedElement.current?.focus();
    };
  }, [onClose, hasUnsavedChanges]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      
      if (formData.timeRange === '24h') {
        dateFrom.setDate(dateFrom.getDate() - 1);
      } else if (formData.timeRange === '7d') {
        dateFrom.setDate(dateFrom.getDate() - 7);
      } else {
        dateFrom.setDate(dateFrom.getDate() - 30);
      }

      const res = await fetch('/api/makrooppdatering/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Kunne ikke generere quiz');
      }

      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setGenerating(false);
    }
  }, [formData, onSuccess, onClose]);

  const toggleAssetType = useCallback((type: AssetType) => {
    setFormData(prev => ({
      ...prev,
      assetTypes: prev.assetTypes.includes(type)
        ? prev.assetTypes.filter(t => t !== type)
        : [...prev.assetTypes, type]
    }));
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Generer ny quiz"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Generer ny quiz</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Lukk"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 mb-1">
              Tittel <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="quiz-title"
              type="text"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="f.eks. Ukas Finans Quiz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formData.title.length}/100 tegn</span>
            </div>
          </div>

          <div>
            <label htmlFor="quiz-description" className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivelse (valgfritt)
            </label>
            <textarea
              id="quiz-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="En kort beskrivelse av quizen..."
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={2}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formData.description.length}/500 tegn</span>
            </div>
          </div>

          <div>
            <label htmlFor="quiz-type" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz-type
            </label>
            <select
              id="quiz-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as QuizType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="MATCH_PAIRS">Match Par</option>
              <option value="FIND_CONNECTION">Finn Sammenhengen</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-1">
                Tidsperiode
              </label>
              <select
                id="time-range"
                value={formData.timeRange}
                onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="24h">Siste 24 timer</option>
                <option value="7d">Siste 7 dager</option>
                <option value="30d">Siste 30 dager</option>
              </select>
            </div>

            <div>
              <label htmlFor="question-count" className="block text-sm font-medium text-gray-700 mb-1">
                Antall spørsmål
              </label>
              <input
                id="question-count"
                type="number"
                min={3}
                max={20}
                value={formData.questionCount}
                onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Verdipapirtyper <span className="text-red-500">*</span>
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Velg verdipapirtyper">
              {(['CRYPTO', 'MACRO', 'EQUITY', 'GEOPOLITICS'] as AssetType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleAssetType(type)}
                  aria-pressed={formData.assetTypes.includes(type)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    formData.assetTypes.includes(type)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {formData.assetTypes.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Velg minst én verdipapirtype</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={generating || formData.assetTypes.length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Genererer...
                </>
              ) : (
                'Generer Quiz'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Bekreft lukking"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Lukke uten å lagre?</h3>
            <p className="text-gray-600 mb-6">
              Du har fylt ut informasjon i skjemaet. Hvis du lukker nå, vil endringene gå tapt.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fortsett å redigere
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Lukk uten å lagre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
