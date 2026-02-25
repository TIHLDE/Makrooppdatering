'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MediaRenderer } from '@/components/MediaPlayer';
import { Play, ChevronRight, ChevronLeft, CheckCircle, XCircle, Trophy, Clock, AlertCircle, BookOpen, Lightbulb, ArrowRight, SkipForward } from 'lucide-react';

// Import test quiz data
import quizData from '@/data/quiz-templates/test-makrooppdatering.json';

// Type definitions
interface QuizMeta {
  title: string;
  language: string;
  asOfDate: string;
  version: string;
  timezone: string;
}

interface QuizConfig {
  scoring: {
    defaultPoints: number;
    partialCreditEnabled: boolean;
    maxPointsPerSegment: number;
  };
  ui: {
    showExplanationsAfterAnswer: boolean;
    allowSkip: boolean;
    freeTextMaxChars: number;
  };
}

interface Media {
  mediaId?: string;
  type: 'image' | 'video' | 'audio' | 'article' | 'chart' | 'tweet' | 'pdf';
  title?: string;
  url: string;
  alt?: string;
  credit?: string;
  sourceId?: string;
  timeRangeSec?: { start: number; end: number } | null;
}

interface AnswerSpec {
  mode: string;
  correctIndex?: number;
  correctIndices?: number[];
  correct?: boolean;
  pairs?: { left: string; right: string }[];
  acceptedAnswers?: string[];
  normalization?: {
    caseInsensitive?: boolean;
    trimWhitespace?: boolean;
    removePunctuation?: boolean;
    collapseSpaces?: boolean;
  };
}

interface Interaction {
  format: string;
  prompt: string;
  instructions?: string;
  options?: string[];
  answerSpec: AnswerSpec;
}

interface Solution {
  shortAnswer: string;
  modelAnswer?: string;
  explanation: {
    short: string;
    whyCorrect: string;
    whyOthersWrong?: string[];
  };
}

interface Segment {
  segmentId: string;
  segmentType: string;
  title: string;
  topicTags: string[];
  difficulty: string;
  media: Media[];
  factBox: string[];
  interaction: Interaction;
  solution: Solution;
  sourceRefs: string[];
  points: number;
}

interface Round {
  roundId: string;
  title: string;
  description: string;
  rules: {
    pointsPerCorrect: number;
    pointsPerWrong: number;
    allowRetry: boolean;
  };
  segments: Segment[];
}

interface QuizData {
  meta: QuizMeta;
  config: QuizConfig;
  sources: any[];
  rounds: Round[];
}

interface UserAnswer {
  segmentId: string;
  answer: any;
  timestamp: number;
  timeSpentMs?: number;
  skipped?: boolean;
}

// Normalize text for comparison
function normalizeText(text: string, normalization?: AnswerSpec['normalization']): string {
  if (!normalization) return text.toLowerCase().trim();
  
  let result = text;
  
  if (normalization.trimWhitespace) {
    result = result.trim();
  }
  
  if (normalization.collapseSpaces) {
    result = result.replace(/\s+/g, ' ');
  }
  
  if (normalization.removePunctuation) {
    result = result.replace(/[.,!?;:]/g, '');
  }
  
  if (normalization.caseInsensitive) {
    result = result.toLowerCase();
  }
  
  return result;
}

// Check if answer is correct
function checkAnswer(segment: Segment, answer: any): boolean {
  const spec = segment.interaction.answerSpec;
  
  switch (spec.mode) {
    case 'index':
      return answer === spec.correctIndex;
    
    case 'indices':
      if (!Array.isArray(answer) || !spec.correctIndices) return false;
      const sortedAnswer = [...answer].sort();
      const sortedCorrect = [...spec.correctIndices].sort();
      return JSON.stringify(sortedAnswer) === JSON.stringify(sortedCorrect);
    
    case 'boolean':
      return answer === spec.correct;
    
    case 'pairs':
      // For match_pairs, accept any attempt (will show solution)
      return true;
    
    case 'accepted_answers':
      if (typeof answer !== 'string' || !spec.acceptedAnswers) return false;
      const normalizedAnswer = normalizeText(answer, spec.normalization);
      return spec.acceptedAnswers.some(accepted => 
        normalizeText(accepted, spec.normalization) === normalizedAnswer
      );
    
    default:
      return true;
  }
}

function TestMakrooppdateringContent() {
  const router = useRouter();
  const [quiz] = useState<QuizData>(quizData as QuizData);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [segmentStartTime, setSegmentStartTime] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [freeTextAnswer, setFreeTextAnswer] = useState('');
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const currentRound = quiz.rounds[currentRoundIndex];
  const currentSegment = currentRound?.segments[currentSegmentIndex];
  const totalSegments = quiz.rounds.reduce((acc, round) => acc + round.segments.length, 0);
  const completedSegments = Object.keys(userAnswers).filter(id => !userAnswers[id]?.skipped).length;

  useEffect(() => {
    if (currentSegment && quizStarted) {
      setSegmentStartTime(Date.now());
    }
  }, [currentSegment, quizStarted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentRoundIndex(0);
    setCurrentSegmentIndex(0);
    setSegmentStartTime(Date.now());
  };

  const handleAnswer = useCallback((answer: any) => {
    if (!currentSegment) return;

    const timeSpent = Date.now() - segmentStartTime;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentSegment.segmentId]: {
        segmentId: currentSegment.segmentId,
        answer,
        timestamp: Date.now(),
        timeSpentMs: timeSpent,
        skipped: false
      }
    }));

    setShowSolution(true);
  }, [currentSegment, segmentStartTime]);

  const handleSkip = useCallback(() => {
    if (!currentSegment) return;

    setUserAnswers(prev => ({
      ...prev,
      [currentSegment.segmentId]: {
        segmentId: currentSegment.segmentId,
        answer: null,
        timestamp: Date.now(),
        timeSpentMs: 0,
        skipped: true
      }
    }));

    // Reset state and move to next without showing solution
    setShowSolution(false);
    setSelectedOption(null);
    setSelectedOptions([]);
    setFreeTextAnswer('');
    setMatchPairs({});
    setTrueFalseAnswer(null);
    setShowHint(false);

    if (currentSegmentIndex < currentRound.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else if (currentRoundIndex < quiz.rounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
      setCurrentSegmentIndex(0);
    } else {
      setQuizCompleted(true);
    }
  }, [currentSegment, currentSegmentIndex, currentRound, currentRoundIndex, quiz.rounds.length]);

  const handleNext = useCallback(() => {
    setShowSolution(false);
    setSelectedOption(null);
    setSelectedOptions([]);
    setFreeTextAnswer('');
    setMatchPairs({});
    setTrueFalseAnswer(null);
    setShowHint(false);

    if (currentSegmentIndex < currentRound.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else if (currentRoundIndex < quiz.rounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
      setCurrentSegmentIndex(0);
    } else {
      setQuizCompleted(true);
    }
  }, [currentSegmentIndex, currentRound, currentRoundIndex, quiz.rounds.length]);

  const handlePrevious = useCallback(() => {
    setShowSolution(false);
    setShowHint(false);
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
    } else if (currentRoundIndex > 0) {
      setCurrentRoundIndex(prev => prev - 1);
      setCurrentSegmentIndex(quiz.rounds[currentRoundIndex - 1].segments.length - 1);
    }
  }, [currentSegmentIndex, currentRoundIndex, quiz.rounds]);

  const calculateScore = useCallback(() => {
    let score = 0;
    let maxScore = 0;

    quiz.rounds.forEach(round => {
      round.segments.forEach(segment => {
        maxScore += segment.points;
        const userAnswer = userAnswers[segment.segmentId];
        
        if (userAnswer && !userAnswer.skipped) {
          const isCorrect = checkAnswer(segment, userAnswer.answer);
          if (isCorrect) {
            score += segment.points;
          } else if (quiz.config.scoring.partialCreditEnabled) {
            score += segment.points * 0.5;
          }
        }
      });
    });

    return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
  }, [quiz, userAnswers]);

  // Render interaction based on type
  const renderInteraction = useCallback(() => {
    if (!currentSegment) return null;
    
    const { interaction } = currentSegment;

    switch (interaction.format) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {interaction.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedOption(idx);
                  handleAnswer(idx);
                }}
                disabled={showSolution}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showSolution
                    ? idx === interaction.answerSpec.correctIndex
                      ? 'border-green-500 bg-green-500/10'
                      : selectedOption === idx
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-700'
                    : selectedOption === idx
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-purple-500/50'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        );

      case 'multi':
        return (
          <div className="space-y-3">
            {interaction.options?.map((option, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrect = interaction.answerSpec.correctIndices?.includes(idx);
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!showSolution) {
                      setSelectedOptions(prev => 
                        isSelected ? prev.filter(i => i !== idx) : [...prev, idx]
                      );
                    }
                  }}
                  disabled={showSolution}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showSolution
                      ? isCorrect
                        ? 'border-green-500 bg-green-500/10'
                        : isSelected
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-700'
                      : isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
                    }`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
            {!showSolution && (
              <button
                onClick={() => handleAnswer(selectedOptions)}
                disabled={selectedOptions.length === 0}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bekreft svar
              </button>
            )}
          </div>
        );

      case 'truefalse':
        return (
          <div className="space-y-3">
            {[
              { value: true, label: 'Sant', color: 'green' },
              { value: false, label: 'Usant', color: 'red' }
            ].map(({ value, label }) => {
              const isSelected = trueFalseAnswer === value;
              const isCorrect = interaction.answerSpec.correct === value;
              
              return (
                <button
                  key={label}
                  onClick={() => {
                    setTrueFalseAnswer(value);
                    handleAnswer(value);
                  }}
                  disabled={showSolution}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showSolution
                      ? isCorrect
                        ? 'border-green-500 bg-green-500/10'
                        : isSelected
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-700'
                      : isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-purple-500/50'
                  }`}
                >
                  <span className="font-medium text-lg">{label}</span>
                </button>
              );
            })}
          </div>
        );

      case 'match_pairs':
        const pairs = interaction.answerSpec.pairs || [];
        const rightOptions = pairs.map(p => p.right);
        
        return (
          <div className="space-y-4">
            {pairs.map((pair, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-white flex-1">{pair.left}</span>
                  <span className="text-gray-500">→</span>
                  <select
                    value={matchPairs[pair.left] || ''}
                    onChange={(e) => {
                      if (!showSolution) {
                        setMatchPairs(prev => ({ ...prev, [pair.left]: e.target.value }));
                      }
                    }}
                    disabled={showSolution}
                    className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 flex-1"
                  >
                    <option value="">Velg...</option>
                    {rightOptions.map((right) => (
                      <option key={right} value={right}>{right}</option>
                    ))}
                  </select>
                </div>
                {showSolution && (
                  <div className="mt-2 text-sm text-green-400">
                    Riktig svar: {pair.right}
                  </div>
                )}
              </div>
            ))}
            {!showSolution && (
              <button
                onClick={() => handleAnswer(matchPairs)}
                disabled={Object.keys(matchPairs).length < pairs.length}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bekreft svar
              </button>
            )}
          </div>
        );

      case 'short_text':
      case 'free_text':
      case 'guess_connection':
        return (
          <div className="space-y-4">
            <textarea
              value={freeTextAnswer}
              onChange={(e) => setFreeTextAnswer(e.target.value)}
              disabled={showSolution}
              maxLength={quiz.config.ui.freeTextMaxChars}
              placeholder="Skriv svaret ditt her..."
              className="w-full h-32 p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{freeTextAnswer.length}/{quiz.config.ui.freeTextMaxChars} tegn</span>
            </div>
            {!showSolution && (
              <button
                onClick={() => handleAnswer(freeTextAnswer)}
                disabled={freeTextAnswer.length < 2}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send inn svar
              </button>
            )}
          </div>
        );

      default:
        return <div className="text-gray-400">Interaksjonstype ikke implementert ennå: {interaction.format}</div>;
    }
  }, [currentSegment, showSolution, selectedOption, selectedOptions, freeTextAnswer, matchPairs, trueFalseAnswer, handleAnswer, quiz.config.ui.freeTextMaxChars]);

  // Render solution
  const renderSolution = useCallback(() => {
    if (!currentSegment) return null;
    
    const userAnswer = userAnswers[currentSegment.segmentId];
    const isCorrect = userAnswer && !userAnswer.skipped ? checkAnswer(currentSegment, userAnswer.answer) : false;
    const isSkipped = userAnswer?.skipped || false;

    return (
      <div className="mt-6 p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          {isSkipped ? (
            <>
              <SkipForward className="w-6 h-6 text-yellow-500" />
              <span className="text-yellow-500 font-bold">Hoppet over</span>
            </>
          ) : isCorrect ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-500 font-bold">Riktig!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <span className="text-yellow-500 font-bold">Se fasit</span>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Fasit:</h4>
            <p className="text-gray-300">{currentSegment.solution.shortAnswer}</p>
          </div>

          {currentSegment.solution.modelAnswer && (
            <div>
              <h4 className="font-semibold text-white mb-2">Modellsvar:</h4>
              <p className="text-gray-300">{currentSegment.solution.modelAnswer}</p>
            </div>
          )}

          <div className="bg-gray-900 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Forklaring:
            </h4>
            <p className="text-gray-300 text-sm">{currentSegment.solution.explanation.short}</p>
            <p className="text-gray-400 text-sm mt-2">{currentSegment.solution.explanation.whyCorrect}</p>
          </div>

          {currentSegment.solution.explanation.whyOthersWrong && currentSegment.solution.explanation.whyOthersWrong.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">Vanlige feil:</h4>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                {currentSegment.solution.explanation.whyOthersWrong.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          {currentRoundIndex === quiz.rounds.length - 1 && 
           currentSegmentIndex === currentRound.segments.length - 1 ? (
            <>Se resultat <Trophy className="w-5 h-5" /></>
          ) : (
            <>Neste spørsmål <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    );
  }, [currentSegment, currentRound, currentRoundIndex, currentSegmentIndex, quiz.rounds.length, userAnswers, handleNext]);

  // Start screen
  if (!quizStarted) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#ff6b35]">
                {quiz.meta.title}
              </h1>
              <p className="text-xl text-gray-400">
                Test dine kunnskaper om makroøkonomiske nyheter
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#ff6b35]" />
                Om quizen
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2 text-[#ff6b35]">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">{quiz.rounds.length} runde</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {totalSegments} spørsmål om makroøkonomi, sentralbanker, markeder og geopolitikk
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2 text-[#ff6b35]">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Bilder</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Inkluderer relevante bilder fra markedet
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-3">Temaer:</h3>
                <div className="space-y-2">
                  {quiz.rounds[0].segments.map((segment, idx) => (
                    <div key={segment.segmentId} className="flex items-center gap-3 text-gray-300">
                      <span className="w-6 h-6 rounded-full bg-[#ff6b35] text-black text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{segment.title}</span>
                      <span className="text-gray-500 text-sm">({segment.interaction.format})</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full py-4 bg-[#ff6b35] text-black text-xl font-bold rounded-lg hover:bg-[#ff8555] transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6" />
                Start Quiz
              </button>
            </div>

            <div className="text-center text-gray-500 text-sm">
              Data per: {quiz.meta.asOfDate} | Versjon: {quiz.meta.version}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Completion screen
  if (quizCompleted) {
    const { score, maxScore, percentage } = calculateScore();
    
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <Trophy className="w-20 h-20 text-[#ff6b35] mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Quiz fullført!</h1>
              <p className="text-gray-400">Her er resultatet ditt</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 text-center mb-8">
              <div className="text-6xl font-bold text-[#ff6b35] mb-2">
                {percentage}%
              </div>
              <div className="text-xl text-gray-300 mb-6">
                {score} av {maxScore} poeng
              </div>

              <div className="w-full bg-gray-800 rounded-full h-4 mb-8">
                <div 
                  className="bg-[#ff6b35] h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {percentage >= 80 && (
                <p className="text-green-400 font-semibold">🎉 Utmerket! Du har god kontroll på makroøkonomien!</p>
              )}
              {percentage >= 60 && percentage < 80 && (
                <p className="text-yellow-400 font-semibold">👍 Bra jobbet! Noen områder å forbedre.</p>
              )}
              {percentage < 60 && (
                <p className="text-gray-400 font-semibold">📚 Fortsett å følge med på finansnyheter!</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/makrooppdatering')}
                className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                Tilbake til oversikt
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-[#ff6b35] text-black rounded-lg font-medium hover:bg-[#ff8555]"
              >
                Prøv igjen
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main quiz screen
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Spørsmål {completedSegments + 1} av {totalSegments}</span>
              <span>{Math.round(((completedSegments) / totalSegments) * 100)}% fullført</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-[#ff6b35] h-2 rounded-full transition-all"
                style={{ width: `${((completedSegments) / totalSegments) * 100}%` }}
              />
            </div>
          </div>

          {/* Segment header */}
          <div className="mb-6">
            <div className="text-[#ff6b35] text-sm font-semibold mb-1">
              {currentRound.title}
            </div>
            <h1 className="text-2xl font-bold">{currentSegment.title}</h1>
            <div className="flex gap-2 mt-2">
              {currentSegment.topicTags.map(tag => (
                <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Media */}
          {currentSegment.media.length > 0 && <MediaRenderer media={currentSegment.media} />}

          {/* Hint button and Fact box */}
          {currentSegment.factBox && currentSegment.factBox.length > 0 && (
            <div className="mb-6">
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-[#ff6b35] transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Vis hint</span>
                </button>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#ff6b35] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Fakta fra kildene:
                    </h3>
                    <button
                      onClick={() => setShowHint(false)}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Skjul
                    </button>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {currentSegment.factBox.map((fact, idx) => (
                      <li key={idx}>{fact}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Question */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <p className="text-lg mb-4">{currentSegment.interaction.prompt}</p>
            {currentSegment.interaction.instructions && (
              <p className="text-gray-400 text-sm mb-4">{currentSegment.interaction.instructions}</p>
            )}
            
            {renderInteraction()}
          </div>

          {/* Solution */}
          {showSolution && renderSolution()}

          {/* Navigation */}
          {!showSolution && (
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentRoundIndex === 0 && currentSegmentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Forrige
              </button>
              
              {quiz.config.ui.allowSkip && (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-yellow-500"
                >
                  <SkipForward className="w-5 h-5" />
                  Hopp over
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function TestMakrooppdateringPage() {
  return (
    <ErrorBoundary>
      <TestMakrooppdateringContent />
    </ErrorBoundary>
  );
}
