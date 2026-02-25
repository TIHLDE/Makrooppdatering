'use client';

import { useCallback, memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MediaRenderer } from '@/components/MediaPlayer';
import { Segment } from '@/types/quiz';
import { useQuizState } from './useQuizState';
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

function NyttPaNyttQuizContent() {
  const router = useRouter();
  const {
    state,
    currentRound,
    currentSegment,
    totalSegments,
    completedSegments,
    startQuiz,
    nextSegment,
    previousSegment,
    submitAnswer,
    setSelectedOption,
    toggleSelectedOption,
    setFreeTextAnswer,
    resetQuiz,
    checkAnswer,
    calculateScore,
  } = useQuizState(quizData as any);

  // Hint state for showing factBox
  const [showHint, setShowHint] = useState(false);

  // Reset hint when segment changes
  const handleNextSegment = useCallback(() => {
    setShowHint(false);
    nextSegment();
  }, [nextSegment]);

  const handlePreviousSegment = useCallback(() => {
    setShowHint(false);
    previousSegment();
  }, [previousSegment]);

  // Interaction renderer
  const renderInteraction = useCallback(() => {
    if (!currentSegment) return null;
    
    const { interaction } = currentSegment;

    switch (interaction.format) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {interaction.options?.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  state.selectedOption === idx
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)})</span>
                {option}
              </button>
            ))}
            <button
              onClick={() => state.selectedOption !== null && submitAnswer(state.selectedOption)}
              disabled={state.selectedOption === null}
              className="w-full py-3 bg-[#ff6b35] text-black font-semibold rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Svar
            </button>
          </div>
        );

      case 'multi':
        return (
          <div className="space-y-3">
            {interaction.options?.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => toggleSelectedOption(idx)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  state.selectedOptions.includes(idx)
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)})</span>
                {option}
              </button>
            ))}
            <button
              onClick={() => state.selectedOptions.length > 0 && submitAnswer(state.selectedOptions)}
              disabled={state.selectedOptions.length === 0}
              className="w-full py-3 bg-[#ff6b35] text-black font-semibold rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Svar
            </button>
          </div>
        );

      case 'truefalse':
        return (
          <div className="space-y-3">
            <button
              onClick={() => submitAnswer(true)}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all"
            >
              Sant
            </button>
            <button
              onClick={() => submitAnswer(false)}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all"
            >
              Usant
            </button>
          </div>
        );

      case 'free_text':
      case 'guess_connection':
        return (
          <div className="space-y-3">
            <textarea
              value={state.freeTextAnswer}
              onChange={(e) => setFreeTextAnswer(e.target.value)}
              maxLength={interaction.answerSpec?.normalization ? 280 : undefined}
              placeholder="Skriv svaret ditt her..."
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none resize-none"
              rows={4}
            />
            <button
              onClick={() => state.freeTextAnswer.trim() && submitAnswer(state.freeTextAnswer.trim())}
              disabled={!state.freeTextAnswer.trim()}
              className="w-full py-3 bg-[#ff6b35] text-black font-semibold rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Svar
            </button>
          </div>
        );

      case 'case':
        return (
          <div className="space-y-4">
            {interaction.answerSpec?.subQuestions?.map((subQ: any) => (
              <div key={subQ.subQuestionId} className="bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold mb-3">{subQ.prompt}</p>
                {subQ.format === 'mcq' ? (
                  <div className="space-y-2">
                    {subQ.options?.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedOption(idx);
                          submitAnswer({ [subQ.subQuestionId]: idx });
                        }}
                        className="w-full p-3 text-left rounded border border-gray-700 hover:border-gray-600 transition-all text-sm"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={state.freeTextAnswer}
                      onChange={(e) => setFreeTextAnswer(e.target.value)}
                      placeholder="Skriv svaret ditt..."
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:border-[#ff6b35] focus:outline-none resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => submitAnswer({ [subQ.subQuestionId]: state.freeTextAnswer.trim() })}
                      disabled={!state.freeTextAnswer.trim()}
                      className="w-full py-2 bg-[#ff6b35] text-black font-semibold rounded text-sm hover:bg-[#ff8555] transition-colors disabled:opacity-50"
                    >
                      Svar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Dette spørsmålstypen er ikke implementert ennå.</p>
          </div>
        );
    }
  }, [currentSegment, state, setSelectedOption, submitAnswer, toggleSelectedOption, setFreeTextAnswer]);

  // Solution renderer
  const renderSolution = useCallback(() => {
    if (!currentSegment) return null;

    const userAnswer = state.userAnswers[currentSegment.segmentId];
    const isCorrect = userAnswer ? checkAnswer(currentSegment, userAnswer.answer) : false;

    return (
      <div className={`rounded-lg p-6 mb-6 ${isCorrect ? 'bg-green-900/20 border border-green-700' : 'bg-yellow-900/20 border border-yellow-700'}`}>
        <div className="flex items-center gap-2 mb-4">
          {isCorrect ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-400 font-semibold">Riktig!</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <span className="text-yellow-400 font-semibold">Læringsmulighet</span>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Riktig svar:</h4>
            <p className="text-gray-300">{currentSegment.solution.shortAnswer}</p>
          </div>

          {currentSegment.solution.modelAnswer && (
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Utdypende forklaring:</h4>
              <p className="text-gray-300">{currentSegment.solution.modelAnswer}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Hvorfor er dette riktig?</h4>
            <p className="text-gray-300 text-sm">{currentSegment.solution.explanation.short}</p>
            <p className="text-gray-400 text-sm mt-2">{currentSegment.solution.explanation.whyCorrect}</p>
          </div>

          {currentSegment.solution.explanation.whyOthersWrong && currentSegment.solution.explanation.whyOthersWrong.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Vanlige feil:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
                {currentSegment.solution.explanation.whyOthersWrong.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={handleNextSegment}
              className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-black font-semibold rounded-lg hover:bg-[#ff8555] transition-colors"
            >
              {state.currentSegmentIndex === currentRound.segments.length - 1 ? (
                state.currentRoundIndex === state.quiz.rounds.length - 1 ? (
                  <>Se resultat <Trophy className="w-5 h-5" /></>
                ) : (
                  <>Neste runde <ArrowRight className="w-5 h-5" /></>
                )
              ) : (
                <>Neste spørsmål <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }, [currentSegment, currentRound, state, checkAnswer, handleNextSegment]);

  // Render start screen
  if (!state.quizStarted) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">{quizData.meta.title}</h1>
              <p className="text-gray-400">{quizData.rounds.length} runder • {totalSegments} spørsmål</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Hvordan fungerer quizen?</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff6b35] text-black flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold">Gjett sammenhengen</h3>
                    <p className="text-gray-400 text-sm">Se på videoer, bilder og overskrifter – finn fellesnevneren og markedsimplikasjonene.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff6b35] text-black flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold">Nyhetsquiz</h3>
                    <p className="text-gray-400 text-sm">Test deg selv på fakta fra de siste ukene i finansmarkedene.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff6b35] text-black flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold">Toneanalyse</h3>
                    <p className="text-gray-400 text-sm">Les mellom linjene og analyser sentralbankers kommunikasjon.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff6b35] text-black flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold">Markedsreaksjon</h3>
                    <p className="text-gray-400 text-sm">Hvordan reagerer ulike aktiva på sentrale hendelser?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff6b35] text-black flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <h3 className="font-semibold">Case: Sektorrotasjon</h3>
                    <p className="text-gray-400 text-sm">En dypdykk-case basert på reelle markedsforhold.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={startQuiz}
                className="flex items-center gap-3 px-8 py-4 bg-[#ff6b35] text-black font-bold text-lg rounded-xl hover:bg-[#ff8555] transition-colors"
              >
                <Play className="w-6 h-6" />
                Start quiz
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render completion screen
  if (state.quizCompleted) {
    const score = calculateScore();
    
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-[#ff6b35] mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Quiz fullført!</h1>
              <p className="text-gray-400">{quizData.meta.title}</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 mb-8 text-center">
              <div className="text-6xl font-bold text-[#ff6b35] mb-2">
                {score.percentage}%
              </div>
              <p className="text-gray-400 mb-6">
                {score.score} av {score.maxScore} poeng
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={resetQuiz}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Prøv igjen
                </button>
                <button
                  onClick={() => router.push('/makrooppdatering')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-black font-semibold rounded-lg hover:bg-[#ff8555] transition-colors"
                >
                  Tilbake til quizer
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4">Oppsummering</h2>
              <div className="space-y-4">
                {state.quiz.rounds.map((round, roundIdx) => (
                  <div key={round.roundId} className="border-b border-gray-800 pb-4 last:border-0">
                    <h3 className="font-semibold text-[#ff6b35] mb-2">{round.title}</h3>
                    <div className="space-y-2">
                      {round.segments.map((segment: Segment) => {
                        const answer = state.userAnswers[segment.segmentId];
                        const isCorrect = answer ? checkAnswer(segment, answer.answer) : false;
                        
                        return (
                          <div key={segment.segmentId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{segment.title}</span>
                            {answer ? (
                              isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-yellow-500" />
                              )
                            ) : (
                              <span className="text-gray-600">Ikke besvart</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render quiz question
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Runde {state.currentRoundIndex + 1} av {state.quiz.rounds.length}</span>
              <span>Spørsmål {state.currentSegmentIndex + 1} av {currentRound.segments.length}</span>
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
            {currentSegment.interaction.caseText && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4 text-gray-300">
                {currentSegment.interaction.caseText}
              </div>
            )}
            
            {renderInteraction()}
          </div>

          {/* Solution */}
          {state.showSolution && renderSolution()}

          {/* Navigation */}
          {!state.showSolution && (
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousSegment}
                disabled={state.currentRoundIndex === 0 && state.currentSegmentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Forrige
              </button>
              
              {quizData.config.ui.allowSkip && (
                <button
                  onClick={handleNextSegment}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#ff6b35]"
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

// Wrapper with Error Boundary
export default function NyttPaNyttQuizPage() {
  return (
    <ErrorBoundary>
      <NyttPaNyttQuizContent />
    </ErrorBoundary>
  );
}
