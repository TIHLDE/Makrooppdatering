'use client';

import { useReducer, useCallback } from 'react';
import { QuizData, Segment, UserAnswer } from '@/types/quiz';

interface QuizState {
  quiz: QuizData;
  currentRoundIndex: number;
  currentSegmentIndex: number;
  userAnswers: Record<string, UserAnswer>;
  showSolution: boolean;
  quizStarted: boolean;
  quizCompleted: boolean;
  segmentStartTime: number;
  selectedOption: number | null;
  selectedOptions: number[];
  freeTextAnswer: string;
}

type QuizAction =
  | { type: 'START_QUIZ' }
  | { type: 'NEXT_SEGMENT' }
  | { type: 'PREVIOUS_SEGMENT' }
  | { type: 'SUBMIT_ANSWER'; payload: { answer: string | number | number[] | boolean | Record<string, any>; segmentId: string } }
  | { type: 'SHOW_SOLUTION' }
  | { type: 'HIDE_SOLUTION' }
  | { type: 'RESET_SEGMENT_STATE' }
  | { type: 'SET_SELECTED_OPTION'; payload: number }
  | { type: 'TOGGLE_SELECTED_OPTION'; payload: number }
  | { type: 'SET_FREE_TEXT_ANSWER'; payload: string }
  | { type: 'RESET_QUIZ' }
  | { type: 'SET_SEGMENT_START_TIME'; payload: number };

const initialState = (quizData: QuizData): QuizState => ({
  quiz: quizData,
  currentRoundIndex: 0,
  currentSegmentIndex: 0,
  userAnswers: {},
  showSolution: false,
  quizStarted: false,
  quizCompleted: false,
  segmentStartTime: 0,
  selectedOption: null,
  selectedOptions: [],
  freeTextAnswer: '',
});

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        quizStarted: true,
        currentRoundIndex: 0,
        currentSegmentIndex: 0,
        segmentStartTime: Date.now(),
      };

    case 'NEXT_SEGMENT': {
      const currentRound = state.quiz.rounds[state.currentRoundIndex];
      
      if (state.currentSegmentIndex < currentRound.segments.length - 1) {
        return {
          ...state,
          currentSegmentIndex: state.currentSegmentIndex + 1,
          showSolution: false,
          selectedOption: null,
          selectedOptions: [],
          freeTextAnswer: '',
          segmentStartTime: Date.now(),
        };
      } else if (state.currentRoundIndex < state.quiz.rounds.length - 1) {
        return {
          ...state,
          currentRoundIndex: state.currentRoundIndex + 1,
          currentSegmentIndex: 0,
          showSolution: false,
          selectedOption: null,
          selectedOptions: [],
          freeTextAnswer: '',
          segmentStartTime: Date.now(),
        };
      } else {
        return {
          ...state,
          quizCompleted: true,
        };
      }
    }

    case 'PREVIOUS_SEGMENT': {
      if (state.currentSegmentIndex > 0) {
        return {
          ...state,
          currentSegmentIndex: state.currentSegmentIndex - 1,
          showSolution: false,
        };
      } else if (state.currentRoundIndex > 0) {
        const prevRound = state.quiz.rounds[state.currentRoundIndex - 1];
        return {
          ...state,
          currentRoundIndex: state.currentRoundIndex - 1,
          currentSegmentIndex: prevRound.segments.length - 1,
          showSolution: false,
        };
      }
      return state;
    }

    case 'SUBMIT_ANSWER': {
      const { answer, segmentId } = action.payload;
      const timeSpent = Date.now() - state.segmentStartTime;
      
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [segmentId]: {
            segmentId,
            answer,
            timestamp: Date.now(),
            timeSpentMs: timeSpent,
          },
        },
        showSolution: true,
      };
    }

    case 'SHOW_SOLUTION':
      return { ...state, showSolution: true };

    case 'HIDE_SOLUTION':
      return { ...state, showSolution: false };

    case 'RESET_SEGMENT_STATE':
      return {
        ...state,
        showSolution: false,
        selectedOption: null,
        selectedOptions: [],
        freeTextAnswer: '',
      };

    case 'SET_SELECTED_OPTION':
      return { ...state, selectedOption: action.payload };

    case 'TOGGLE_SELECTED_OPTION': {
      const index = action.payload;
      const isSelected = state.selectedOptions.includes(index);
      
      return {
        ...state,
        selectedOptions: isSelected
          ? state.selectedOptions.filter(i => i !== index)
          : [...state.selectedOptions, index],
      };
    }

    case 'SET_FREE_TEXT_ANSWER':
      return { ...state, freeTextAnswer: action.payload };

    case 'RESET_QUIZ':
      return initialState(state.quiz);

    case 'SET_SEGMENT_START_TIME':
      return { ...state, segmentStartTime: action.payload };

    default:
      return state;
  }
}

export function useQuizState(quizData: QuizData) {
  const [state, dispatch] = useReducer(quizReducer, quizData, initialState);

  const currentRound = state.quiz.rounds[state.currentRoundIndex];
  const currentSegment = currentRound?.segments[state.currentSegmentIndex];
  const totalSegments = state.quiz.rounds.reduce((acc, round) => acc + round.segments.length, 0);
  const completedSegments = Object.keys(state.userAnswers).length;

  const startQuiz = useCallback(() => {
    dispatch({ type: 'START_QUIZ' });
  }, []);

  const nextSegment = useCallback(() => {
    dispatch({ type: 'NEXT_SEGMENT' });
  }, []);

  const previousSegment = useCallback(() => {
    dispatch({ type: 'PREVIOUS_SEGMENT' });
  }, []);

  const submitAnswer = useCallback((answer: string | number | number[] | boolean | Record<string, any>) => {
    if (currentSegment) {
      dispatch({ 
        type: 'SUBMIT_ANSWER', 
        payload: { answer, segmentId: currentSegment.segmentId } 
      });
    }
  }, [currentSegment]);

  const setSelectedOption = useCallback((option: number) => {
    dispatch({ type: 'SET_SELECTED_OPTION', payload: option });
  }, []);

  const toggleSelectedOption = useCallback((option: number) => {
    dispatch({ type: 'TOGGLE_SELECTED_OPTION', payload: option });
  }, []);

  const setFreeTextAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SET_FREE_TEXT_ANSWER', payload: answer });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, []);

  const checkAnswer = useCallback((segment: Segment, answer: any): boolean => {
    const spec = segment.interaction.answerSpec;
    
    switch (spec.mode) {
      case 'index':
        return answer === spec.correctIndex;
      case 'indices':
        return JSON.stringify(answer?.sort()) === JSON.stringify(spec.correctIndices?.sort());
      case 'boolean':
        return answer === spec.correct;
      case 'rubric':
        return true;
      default:
        return true;
    }
  }, []);

  const calculateScore = useCallback(() => {
    let score = 0;
    let maxScore = 0;

    state.quiz.rounds.forEach(round => {
      round.segments.forEach(segment => {
        maxScore += segment.points;
        const userAnswer = state.userAnswers[segment.segmentId];
        
        if (userAnswer) {
          const isCorrect = checkAnswer(segment, userAnswer.answer);
          if (isCorrect) {
            score += segment.points;
          } else if (state.quiz.config.scoring.partialCreditEnabled) {
            score += segment.points * 0.5;
          }
        }
      });
    });

    return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
  }, [state.quiz, state.userAnswers, checkAnswer]);

  return {
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
  };
}
