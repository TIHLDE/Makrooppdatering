'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { QuizData, Round, Segment, UserAnswer } from '@/types/quiz';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Clock,
  AlertCircle,
  BookOpen,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

// Import JSON data
import quizData from '@/data/quiz-templates/nytt-pa-nytt-finans.json';

export default function NyttPaNyttQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData>(quizData as QuizData);
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

  const currentRound = quiz.rounds[currentRoundIndex];
  const currentSegment = currentRound?.segments[currentSegmentIndex];
  const totalSegments = quiz.rounds.reduce((acc, round) => acc + round.segments.length, 0);
  const completedSegments = Object.keys(userAnswers).length;

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

  const handleAnswer = useCallback((answer: string | number | number[] | boolean) => {
    if (!currentSegment) return;

    const timeSpent = Date.now() - segmentStartTime;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentSegment.segmentId]: {
        segmentId: currentSegment.segmentId,
        answer,
        timestamp: Date.now(),
        timeSpentMs: timeSpent
      }
    }));

    setShowSolution(true);
  }, [currentSegment, segmentStartTime]);

  const handleNext = () => {
    setShowSolution(false);
    setSelectedOption(null);
    setSelectedOptions([]);
    setFreeTextAnswer('');

    if (currentSegmentIndex < currentRound.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else if (currentRoundIndex < quiz.rounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
      setCurrentSegmentIndex(0);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    setShowSolution(false);
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
    } else if (currentRoundIndex > 0) {
      setCurrentRoundIndex(prev => prev - 1);
      setCurrentSegmentIndex(quiz.rounds[currentRoundIndex - 1].segments.length - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;

    quiz.rounds.forEach(round => {
      round.segments.forEach(segment => {
        maxScore += segment.points;
        const userAnswer = userAnswers[segment.segmentId];
        
        if (userAnswer) {
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
  };

  const checkAnswer = (segment: Segment, answer: any): boolean => {
    const spec = segment.interaction.answerSpec;
    
    switch (spec.mode) {
      case 'index':
        return answer === spec.correctIndex;
      case 'indices':
        return JSON.stringify(answer?.sort()) === JSON.stringify(spec.correctIndices?.sort());
      case 'boolean':
        return answer === spec.correct;
      case 'rubric':
        return true; // Rubrikk vurderes manuelt eller med AI
      default:
        return true;
    }
  };

  const renderMedia = (media: any[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {media.map((item, idx) => (
          <div key={item.mediaId || idx} className="bg-gray-800 rounded-lg overflow-hidden">
            {item.type === 'image' && (
              <div className="aspect-video bg-gray-700 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-sm text-gray-400">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.credit}</p>
                </div>
              </div>
            )}
            {item.type === 'video' && (
              <div className="aspect-video bg-gray-700 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">▶️</div>
                  <p className="text-sm text-gray-400">{item.title}</p>
                  {item.timeRangeSec && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.timeRangeSec.start}s - {item.timeRangeSec.end}s
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{item.credit}</p>
                </div>
              </div>
            )}
            {item.type === 'chart' && (
              <div className="aspect-video bg-gray-700 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm text-gray-400">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.credit}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInteraction = (segment: Segment) => {
    const { interaction } = segment;

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
                disabled={freeTextAnswer.length < 10}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send inn svar
              </button>
            )}
          </div>
        );

      case 'case':
        return (
          <div className="space-y-4">
            {interaction.answerSpec.subQuestions?.map((sq, idx) => (
              <div key={sq.subQuestionId} className="bg-gray-800 p-4 rounded-lg">
                <p className="font-medium mb-3">{idx + 1}. {sq.prompt}</p>
                {sq.format === 'mcq' && (
                  <div className="space-y-2">
                    {sq.options?.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        className="w-full p-3 text-left rounded border border-gray-700 hover:border-purple-500/50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-gray-400">Interaksjonstype ikke implementert ennå</div>;
    }
  };

  const renderSolution = (segment: Segment) => {
    const userAnswer = userAnswers[segment.segmentId];
    const isCorrect = userAnswer ? checkAnswer(segment, userAnswer.answer) : false;

    return (
      <div className="mt-6 p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          {isCorrect ? (
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
            <p className="text-gray-300">{segment.solution.shortAnswer}</p>
          </div>

          {segment.solution.modelAnswer && (
            <div>
              <h4 className="font-semibold text-white mb-2">Modellsvar:</h4>
              <p className="text-gray-300">{segment.solution.modelAnswer}</p>
            </div>
          )}

          <div className="bg-gray-900 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Forklaring:
            </h4>
            <p className="text-gray-300 text-sm">{segment.solution.explanation.short}</p>
            <p className="text-gray-400 text-sm mt-2">{segment.solution.explanation.whyCorrect}</p>
          </div>

          {segment.solution.explanation.whyOthersWrong && segment.solution.explanation.whyOthersWrong.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2">Vanlige feil:</h4>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                {segment.solution.explanation.whyOthersWrong.map((error, idx) => (
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
  };

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
                Test dine kunnskaper om finans og økonomi
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
                    <span className="font-semibold">{quiz.rounds.length} runder</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Gjett sammenhenger, nyhetsquiz, toneanalyse, markedsreaksjoner og case
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2 text-[#ff6b35]">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">{totalSegments} spørsmål</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Ca. 15-20 minutter å fullføre
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-3">Runder:</h3>
                <div className="space-y-2">
                  {quiz.rounds.map((round, idx) => (
                    <div key={round.roundId} className="flex items-center gap-3 text-gray-300">
                      <span className="w-6 h-6 rounded-full bg-[#ff6b35] text-black text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{round.title}</span>
                      <span className="text-gray-500 text-sm">({round.segments.length} spørsmål)</span>
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
                <p className="text-green-400 font-semibold">🎉 Utmerket! Du har god kontroll på finans og økonomi!</p>
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
                onClick={() => router.push('/quiz')}
                className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                Tilbake til quizer
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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Runde {currentRoundIndex + 1} av {quiz.rounds.length}</span>
              <span>Spørsmål {completedSegments + 1} av {totalSegments}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-[#ff6b35] h-2 rounded-full transition-all"
                style={{ width: `${((completedSegments) / totalSegments) * 100}%` }}
              />
            </div>
          </div>

          {/* Round header */}
          <div className="mb-6">
            <div className="text-[#ff6b35] text-sm font-semibold mb-1">
              {currentRound.title}
            </div>
            <h1 className="text-2xl font-bold">{currentSegment.title}</h1>
            <p className="text-gray-400 mt-1">{currentRound.description}</p>
          </div>

          {/* Media */}
          {currentSegment.media.length > 0 && renderMedia(currentSegment.media)}

          {/* Fact box */}
          {currentSegment.factBox.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[#ff6b35] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Fakta fra kildene:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                {currentSegment.factBox.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Question */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <p className="text-lg mb-4">{currentSegment.interaction.prompt}</p>
            {currentSegment.interaction.instructions && (
              <p className="text-gray-400 text-sm mb-4">{currentSegment.interaction.instructions}</p>
            )}
            {currentSegment.interaction.caseText && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4 text-gray-300">
                {currentSegment.interaction.caseText}
              </div>
            )}
            
            {renderInteraction(currentSegment)}
          </div>

          {/* Solution */}
          {showSolution && renderSolution(currentSegment)}

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
                  onClick={handleNext}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Hopp over →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
