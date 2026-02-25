'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QuestionSkeleton, Spinner } from '@/components/LoadingSkeleton';
import { useQuizData, useSubmitScore } from '@/hooks/useQuizData';
import { Timer, Trophy, ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, Home, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  imageUrl?: string | null;
}

interface QuizData {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    questions: QuizQuestion[];
  };
  leaderboard: Array<{
    id: string;
    userName: string | null;
    score: number;
    maxScore: number;
    timeMs: number;
  }>;
}

// Constants
const MAX_QUIZ_TIME_MS = 60 * 60 * 1000; // 1 hour max

// Custom hook for timer with performance.now() and visibility handling
function useTimer(isRunning: boolean) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const hiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime;
      
      const updateTimer = () => {
        if (startTimeRef.current !== null) {
          const newTime = performance.now() - startTimeRef.current;
          setElapsedTime(Math.min(newTime, MAX_QUIZ_TIME_MS));
        }
        rafRef.current = requestAnimationFrame(updateTimer);
      };
      
      rafRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTimeRef.current = performance.now();
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else {
        if (hiddenTimeRef.current !== null && startTimeRef.current !== null && isRunning) {
          const hiddenDuration = performance.now() - hiddenTimeRef.current;
          startTimeRef.current += hiddenDuration;
          hiddenTimeRef.current = null;
          
          const updateTimer = () => {
            if (startTimeRef.current !== null) {
              const newTime = performance.now() - startTimeRef.current;
              setElapsedTime(Math.min(newTime, MAX_QUIZ_TIME_MS));
            }
            rafRef.current = requestAnimationFrame(updateTimer);
          };
          rafRef.current = requestAnimationFrame(updateTimer);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  return elapsedTime;
}

// Memoized question component with bounds checking
const QuestionCard = memo(function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelect,
}: {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
}) {
  if (!question || !question.options || !Array.isArray(question.options)) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Feil: Kunne ikke laste spørsmål</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <h2 
        id="question-text"
        className="text-xl font-semibold text-gray-900 mb-6"
      >
        {question.question || 'Spørsmål ikke tilgjengelig'}
      </h2>

      <div 
        className="space-y-3"
        role="radiogroup"
        aria-label={`Spørsmål ${questionNumber} av ${totalQuestions}`}
      >
        {question.options.map((option, idx) => (
          <button
            key={`${question.id}-option-${idx}`}
            onClick={() => onSelect(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(idx);
              }
            }}
            role="radio"
            aria-checked={selectedAnswer === idx}
            tabIndex={0}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              selectedAnswer === idx
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                  selectedAnswer === idx
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                aria-hidden="true"
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-gray-900">{option || 'Alternativ ikke tilgjengelig'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

// Question navigator component
const QuestionNavigator = memo(function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  answers,
  onNavigate,
}: {
  totalQuestions: number;
  currentQuestion: number;
  answers: number[];
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6" role="tablist" aria-label="Spørsmålsnavigasjon">
      {Array.from({ length: totalQuestions }).map((_, idx) => {
        const isAnswered = answers[idx] !== undefined;
        const isCurrent = idx === currentQuestion;
        
        return (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            role="tab"
            aria-selected={isCurrent}
            aria-label={`Spørsmål ${idx + 1}${isAnswered ? ' (besvart)' : ''}`}
            className={`w-10 h-10 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isCurrent
                ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                : isAnswered
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-purple-300'
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
});

// Memoized result review component with null checking
const ResultReview = memo(function ResultReview({
  questions,
  answers,
}: {
  questions: QuizQuestion[];
  answers: number[];
}) {
  if (!questions || !Array.isArray(questions) || !answers || !Array.isArray(answers)) {
    return (
      <div className="text-left mt-8">
        <h3 className="font-semibold text-gray-900 mb-4">Gjennomgå svar:</h3>
        <p className="text-gray-600">Kunne ikke laste svargjennomgang.</p>
      </div>
    );
  }

  return (
    <div className="text-left mt-8">
      <h3 className="font-semibold text-gray-900 mb-4">Gjennomgå svar:</h3>
      <div className="space-y-3">
        {questions.map((q, idx) => {
          if (!q || !q.options || !Array.isArray(q.options)) {
            return null;
          }
          
          const userAnswerIndex = answers[idx];
          const hasAnswer = userAnswerIndex !== undefined && userAnswerIndex !== null;
          const isCorrect = hasAnswer && userAnswerIndex === q.correct;
          const userAnswerText = hasAnswer && q.options[userAnswerIndex] !== undefined 
            ? q.options[userAnswerIndex] 
            : 'Ikke besvart';
          
          return (
            <div 
              key={q.id || `question-${idx}`}
              className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
            >
              <div className="flex items-start space-x-3">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 break-words">{idx + 1}. {q.question || 'Spørsmål ikke tilgjengelig'}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Ditt svar: {userAnswerText}
                  </p>
                  {!isCorrect && hasAnswer && q.options[q.correct] !== undefined && (
                    <p className="text-sm text-green-700 mt-1">
                      Riktig: {q.options[q.correct]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Memoized leaderboard component
const Leaderboard = memo(function Leaderboard({
  entries,
  formatTime,
}: {
  entries: QuizData['leaderboard'];
  formatTime: (ms: number) => string;
}) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">🏆 Toppliste</h3>
      <div className="space-y-2">
        {entries.slice(0, 5).map((entry, idx) => {
          if (!entry) return null;
          
          const percentage = entry.maxScore > 0 
            ? Math.round((entry.score / entry.maxScore) * 100) 
            : 0;
          
          return (
            <div 
              key={entry.id || `leaderboard-${idx}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="text-lg font-bold text-gray-400 flex-shrink-0">#{idx + 1}</span>
                <span className="font-medium truncate">{entry.userName || 'Anonym'}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-purple-600">
                  {percentage}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatTime(entry.timeMs || 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Main quiz play component
function QuizPlayContent() {
  const params = useParams();
  const router = useRouter();
  
  const quizId = params?.id;
  const isValidQuizId = typeof quizId === 'string' && quizId.length > 0;
  
  const { quizData, loading, error, refetch } = useQuizData({ 
    quizId: isValidQuizId ? quizId : '' 
  });
  const { submitScore, submitting: submittingScore } = useSubmitScore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [userName, setUserName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  
  const submittingRef = useRef(false);
  const processingNextRef = useRef(false);

  const elapsedTime = useTimer(!showResult && !!quizData);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showResult && answers.length > 0 && !scoreSubmitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showResult, answers.length, scoreSubmitted]);

  useEffect(() => {
    if (elapsedTime >= MAX_QUIZ_TIME_MS && !showResult && quizData) {
      setShowResult(true);
    }
  }, [elapsedTime, showResult, quizData]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (processingNextRef.current) return;
    setSelectedAnswer(answerIndex);
  }, []);

  const handleNavigate = useCallback((questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < (quizData?.quiz.questions.length || 0)) {
      setCurrentQuestion(questionIndex);
      // Restore selected answer if already answered
      setSelectedAnswer(answers[questionIndex] !== undefined ? answers[questionIndex] : null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [quizData, answers]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      handleNavigate(currentQuestion - 1);
    }
  }, [currentQuestion, handleNavigate]);

  const handleNext = useCallback(() => {
    if (selectedAnswer === null || !quizData || processingNextRef.current) return;
    
    processingNextRef.current = true;

    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = selectedAnswer;
      
      if (newAnswers.length >= quizData.quiz.questions.length && !newAnswers.some(a => a === undefined)) {
        setShowResult(true);
      } else if (currentQuestion < quizData.quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(newAnswers[currentQuestion + 1] !== undefined ? newAnswers[currentQuestion + 1] : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      return newAnswers;
    });
    
    setTimeout(() => {
      processingNextRef.current = false;
    }, 100);
  }, [selectedAnswer, currentQuestion, quizData]);

  const calculateScore = useCallback(() => {
    if (!quizData || !quizData.quiz.questions || !Array.isArray(quizData.quiz.questions)) {
      return { score: 0, maxScore: 0, percentage: 0 };
    }
    
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      const question = quizData.quiz.questions[i];
      if (question && answers[i] === question.correct) {
        score++;
      }
    }
    
    const maxScore = quizData.quiz.questions.length;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    
    return { score, maxScore, percentage };
  }, [answers, quizData]);

  const handleSubmitScore = useCallback(async () => {
    if (scoreSubmitted || !quizData || submittingRef.current) return;

    submittingRef.current = true;
    const { score, maxScore } = calculateScore();
    setSubmitError(null);
    
    try {
      await submitScore(quizId as string, {
        sessionId,
        score,
        maxScore,
        timeMs: elapsedTime,
        userName: userName.trim() || 'Anonym',
      });
      setScoreSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Kunne ikke lagre score');
    } finally {
      submittingRef.current = false;
    }
  }, [scoreSubmitted, quizData, calculateScore, submitScore, quizId, sessionId, elapsedTime, userName]);

  const handleRestart = useCallback(() => {
    setShowRestartConfirm(true);
  }, []);

  const confirmRestart = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setScoreSubmitted(false);
    setSubmitError(null);
    setUserName('');
    setShowRestartConfirm(false);
    submittingRef.current = false;
    processingNextRef.current = false;
  }, []);

  const formatTime = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }, []);

  if (!isValidQuizId) {
    return (
      <>
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ugyldig quiz ID</h1>
          <p className="text-gray-600 mb-6">Quiz-IDen er ikke gyldig.</p>
          <Link
            href="/makrooppdatering"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Tilbake til quizer
          </Link>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <QuestionSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kunne ikke laste quiz</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Prøv igjen
            </button>
            <Link
              href="/makrooppdatering"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Tilbake
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!quizData || !quizData.quiz) {
    return (
      <>
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz ikke funnet</h1>
          <p className="text-gray-600 mt-2">Quizen du leter etter finnes ikke.</p>
          <Link
            href="/makrooppdatering"
            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Tilbake til quizer
          </Link>
        </div>
      </>
    );
  }

  if (!quizData.quiz.questions || !Array.isArray(quizData.quiz.questions) || quizData.quiz.questions.length === 0) {
    return (
      <>
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz-data ikke tilgjengelig</h1>
          <p className="text-gray-600 mb-6">Denne quizen har ingen spørsmål.</p>
          <Link
            href="/makrooppdatering"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Tilbake til quizer
          </Link>
        </div>
      </>
    );
  }

  if (showResult) {
    const { score, maxScore, percentage } = calculateScore();

    return (
      <>
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 py-8" role="main">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz fullført!</h1>
            <p className="text-gray-600 mb-6">
              {quizData.quiz.title}
            </p>

            <div 
              className="text-6xl font-bold text-purple-600 mb-2"
              aria-label={`Du fikk ${percentage} prosent`}
            >
              {percentage}%
            </div>
            <p className="text-gray-500 mb-6">
              {score} av {maxScore} riktige • Tid: {formatTime(elapsedTime)}
            </p>

            {!scoreSubmitted && (
              <div className="mb-6 space-y-3">
                <div>
                  <label htmlFor="player-name" className="sr-only">Ditt navn for toppliste</label>
                  <input
                    id="player-name"
                    type="text"
                    placeholder="Navn for toppliste (valgfritt)"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={50}
                    disabled={submittingScore}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-center mb-3 w-64 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Dette navnet vises på topplisten</p>
                </div>
                <div>
                  <button
                    onClick={handleSubmitScore}
                    disabled={submittingScore}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingScore ? (
                      <span className="flex items-center justify-center">
                        <Spinner className="w-4 h-4 mr-2" />
                        Lagrer...
                      </span>
                    ) : (
                      'Lagre score'
                    )}
                  </button>
                </div>
                {submitError && (
                  <p className="text-sm text-red-600" role="alert">{submitError}</p>
                )}
              </div>
            )}

            {scoreSubmitted && (
              <div 
                className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg"
                role="status"
                aria-live="polite"
              >
                Score lagret! 🎉
              </div>
            )}

            <ResultReview questions={quizData.quiz.questions} answers={answers} />
            <Leaderboard entries={quizData.leaderboard} formatTime={formatTime} />

            <div className="mt-8 flex gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Spill igjen
              </button>
              <Link
                href="/makrooppdatering"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Tilbake til quizer
              </Link>
            </div>
          </div>

          {/* Restart Confirmation Modal */}
          {showRestartConfirm && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Bekreft restart"
            >
              <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Starte quiz på nytt?</h2>
                <p className="text-gray-600 mb-6">
                  Er du sikker på at du vil starte quizen på nytt? Din nåværende fremgang vil gå tapt.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRestartConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={confirmRestart}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start på nytt
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </>
    );
  }

  const question = quizData.quiz.questions[currentQuestion];
  const totalQuestions = quizData.quiz.questions.length;
  
  if (!question) {
    return (
      <>
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Spørsmål ikke funnet</h1>
          <p className="text-gray-600 mb-6">Det oppstod en feil ved lasting av spørsmålet.</p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start på nytt
          </button>
        </div>
      </>
    );
  }
  
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const isFirstQuestion = currentQuestion === 0;

  return (
    <>
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-8" role="main">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">{quizData.quiz.title}</h1>
            <div 
              className="flex items-center text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full"
              aria-label={`Tid: ${formatTime(elapsedTime)}`}
            >
              <Timer className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">
              Spørsmål <span className="font-semibold text-gray-900">{currentQuestion + 1}</span> av {totalQuestions}
            </p>
            <p className="text-gray-500">
              {answers.filter(a => a !== undefined).length} besvart
            </p>
          </div>
        </header>

        {/* Question Navigator */}
        <QuestionNavigator 
          totalQuestions={totalQuestions}
          currentQuestion={currentQuestion}
          answers={answers}
          onNavigate={handleNavigate}
        />

        {/* Question */}
        <QuestionCard
          question={question}
          questionNumber={currentQuestion + 1}
          totalQuestions={totalQuestions}
          selectedAnswer={selectedAnswer}
          onSelect={handleAnswer}
        />

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Forrige
          </button>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null || processingNextRef.current}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isLastQuestion ? 'Fullfør' : 'Neste'}
            <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Du kan navigere mellom spørsmål og endre svar når som helst før du fullfører
        </p>
      </main>
    </>
  );
}

// Wrapper with Error Boundary
export default function QuizPlayPage() {
  return (
    <ErrorBoundary>
      <QuizPlayContent />
    </ErrorBoundary>
  );
}
