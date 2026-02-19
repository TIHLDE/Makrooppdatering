'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { QuizQuestion } from '@prisma/client';
import { Timer, Trophy, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface QuizData {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    questions: QuizQuestion[];
  };
  leaderboard: {
    id: string;
    userName: string | null;
    score: number;
    maxScore: number;
    timeMs: number;
  }[];
}

export default function QuizPlayPage() {
  const params = useParams();
  const quizId = params.id as string;
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [userName, setUserName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (startTime > 0 && !showResult) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, showResult]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quiz/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion < (quizData?.quiz.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    if (!quizData) return { score: 0, maxScore: 0 };
    
    const score = answers.reduce((acc, answer, idx) => {
      return acc + (answer === quizData.quiz.questions[idx].correct ? 1 : 0);
    }, 0);
    
    return { score, maxScore: quizData.quiz.questions.length };
  };

  const submitScore = async () => {
    if (scoreSubmitted) return;

    const { score, maxScore } = calculateScore();
    
    try {
      await fetch(`/api/quiz/${quizId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          score,
          maxScore,
          timeMs: elapsedTime,
          userName: userName || 'Anonym',
        }),
      });
      setScoreSubmitted(true);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </>
    );
  }

  if (!quizData) {
    return (
      <>
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz ikke funnet</h1>
        </div>
      </>
    );
  }

  if (showResult) {
    const { score, maxScore } = calculateScore();
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <>
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz fullført!</h1>
            <p className="text-gray-600 mb-6">
              {quizData.quiz.title}
            </p>

            <div className="text-6xl font-bold text-purple-600 mb-2">
              {percentage}%
            </div>
            <p className="text-gray-500 mb-6">
              {score} av {maxScore} riktige • Tid: {formatTime(elapsedTime)}
            </p>

            {!scoreSubmitted && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Ditt navn (valgfritt)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-center mb-3 w-64"
                />
                <div>
                  <button
                    onClick={submitScore}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Lagre score
                  </button>
                </div>
              </div>
            )}

            {scoreSubmitted && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
                Score lagret! 🎉
              </div>
            )}

            {/* Review Answers */}
            <div className="text-left mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Gjennomgå svar:</h3>
              <div className="space-y-3">
                {quizData.quiz.questions.map((q, idx) => {
                  const isCorrect = answers[idx] === q.correct;
                  return (
                    <div 
                      key={q.id}
                      className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                    >
                      <div className="flex items-start space-x-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{idx + 1}. {q.question}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Ditt svar: {q.options[answers[idx]]}
                          </p>
                          {!isCorrect && (
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

            {/* Leaderboard */}
            {quizData.leaderboard.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">🏆 Toppliste</h3>
                <div className="space-y-2">
                  {quizData.leaderboard.slice(0, 5).map((entry, idx) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                        <span className="font-medium">{entry.userName || 'Anonym'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-purple-600">
                          {Math.round((entry.score / entry.maxScore) * 100)}%
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatTime(entry.timeMs)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <a
                href="/quiz"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Tilbake til quizer
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  const question = quizData.quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.quiz.questions.length) * 100;

  return (
    <>
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">{quizData.quiz.title}</h1>
            <div className="flex items-center text-gray-600">
              <Timer className="w-5 h-5 mr-1" />
              {formatTime(elapsedTime)}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Spørsmål {currentQuestion + 1} av {quizData.quiz.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === idx
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                    selectedAnswer === idx
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Next button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {currentQuestion === quizData.quiz.questions.length - 1 ? 'Fullfør' : 'Neste'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
