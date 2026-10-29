export type QuestionOptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  stage: 1 | 2 | 3;
  stageTitle: string;
  stageSubtitle: string;
  text: string;
  options: Record<QuestionOptionKey, string>;
  answer: QuestionOptionKey;
  explanation?: string;
}

export type GameStatus =
  | 'START'
  | 'BRIEFING'
  | 'PLAYING'
  | 'PAUSED'
  | 'STAGE_PASS'
  | 'GAMEOVER'
  | 'VICTORY';

export interface PlayerData {
  name: string;
  className: string;
  score: number;
  lives: number;
  currentQuestionIndex: number;
  stage: number;
}
