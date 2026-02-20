import weeklyMacro from './weekly-macro.json';
import cryptoBasics from './crypto-basics.json';
import marketMatch from './market-match.json';
import findConnection from './find-connection.json';

export interface QuizTemplate {
  id: string;
  title: string;
  description: string;
  type: 'MULTIPLE_CHOICE' | 'MATCH_PAIRS' | 'FIND_CONNECTION';
  assetTypes: string[];
  questions: {
    id: string;
    question: string;
    options: string[];
    correct: number;
    order: number;
    imageUrl?: string;
    pairId?: string;
  }[];
}

export const quizTemplates: QuizTemplate[] = [
  weeklyMacro as QuizTemplate,
  cryptoBasics as QuizTemplate,
  marketMatch as QuizTemplate,
  findConnection as QuizTemplate,
];

export function getQuizTemplateById(id: string): QuizTemplate | undefined {
  return quizTemplates.find(template => template.id === id);
}

export function getQuizTemplatesByType(type: QuizTemplate['type']): QuizTemplate[] {
  return quizTemplates.filter(template => template.type === type);
}

export default quizTemplates;
