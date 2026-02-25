export interface QuizMeta {
  title: string;
  language: string;
  asOfDate: string;
  version: string;
  timezone: string;
}

export interface QuizConfig {
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

export interface Source {
  sourceId: string;
  publisher: string;
  title: string;
  publishedDate: string;
  url: string;
  type: 'primary' | 'secondary';
  paywalled: boolean;
  notes: string;
}

export interface Media {
  mediaId: string;
  type: 'image' | 'video' | 'audio' | 'article' | 'chart' | 'tweet' | 'pdf';
  title: string;
  url: string;
  alt: string;
  credit: string;
  sourceId: string;
  timeRangeSec: { start: number; end: number } | null;
  captionsUrl?: string;
}

export interface AnswerSpec {
  mode: 'index' | 'indices' | 'boolean' | 'pairs' | 'ordered_list' | 'accepted_answers' | 'unordered_set' | 'rubric' | 'sub_questions';
  correctIndex?: number;
  correctIndices?: number[];
  correct?: boolean;
  pairs?: { left: string; right: string }[];
  shuffleRight?: boolean;
  items?: string[];
  correctOrder?: string[];
  acceptedAnswers?: string[];
  normalization?: {
    caseInsensitive?: boolean;
    trimWhitespace?: boolean;
    removePunctuation?: boolean;
    collapseSpaces?: boolean;
  };
  requiredCount?: number;
  acceptedItems?: { canonical: string; aliases: string[] }[];
  rubric?: {
    mustMentionAny?: string[];
    shouldMentionAny?: string[];
    minConcepts?: number;
    forbiddenKeywords?: string[];
    gradingNotes?: string;
  };
  scoring?: {
    full: number;
    partial: number;
    none: number;
  };
  subQuestions?: SubQuestion[];
}

export interface SubQuestion {
  subQuestionId: string;
  format: string;
  prompt: string;
  options?: string[];
  answerSpec: AnswerSpec;
  solution: Solution;
  points: number;
  sourceRefs: string[];
}

export interface Solution {
  shortAnswer: string;
  modelAnswer?: string;
  explanation: {
    short: string;
    whyCorrect: string;
    whyOthersWrong?: string[];
  };
}

export interface Interaction {
  format: string;
  prompt: string;
  instructions?: string;
  caseText?: string;
  options?: string[];
  answerSpec: AnswerSpec;
}

export interface Segment {
  segmentId: string;
  segmentType: 'news_quiz' | 'guess_connection' | 'tone_analysis' | 'market_reaction' | 'truefalse_tricks' | 'who_said_what' | 'case' | 'reverse_quiz';
  title: string;
  topicTags: string[];
  difficulty: 'intro' | 'medium' | 'hard';
  media: Media[];
  factBox: string[];
  interaction: Interaction;
  solution: Solution;
  sourceRefs: string[];
  points: number;
}

export interface Round {
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

export interface QuizData {
  meta: QuizMeta;
  config: QuizConfig;
  sources: Source[];
  rounds: Round[];
}

export interface UserAnswer {
  segmentId: string;
  answer: string | number | number[] | boolean | Record<string, any> | null;
  timestamp: number;
  timeSpentMs?: number;
}
