export type Language = 'ar' | 'en';
export type AcademicLevel = 'beginner' | 'intermediate' | 'advanced';
export type ThemeMode = 'dark' | 'light';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    type: string;
    mimeType: string;
    data?: string; // base64
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  academicLevel: AcademicLevel;
  messages: ChatMessage[];
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'fill_in_blank';
  question: string;
  options?: string[]; // for mcq
  correctAnswer: string; // for mcq/true_false/fill_in_blank
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  questions: QuizQuestion[];
  userAnswers?: Record<string, string>;
  score?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category?: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  createdAt: string;
  cards: Flashcard[];
}

export interface StudyDayTask {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  type: 'study' | 'review' | 'practice' | 'quiz';
  completed?: boolean;
}

export interface StudyDayPlan {
  dayNumber: number;
  topic: string;
  summary: string;
  tasks: StudyDayTask[];
  keyTip?: string;
}

export interface StudyPlan {
  id: string;
  subject: string;
  createdAt: string;
  durationDays: number;
  dailyHours: number;
  overview: string;
  dailyPlans: StudyDayPlan[];
}

export interface FileAnalysisResult {
  filename: string;
  fileType: string;
  extractedTextSummary: string;
  keyConcepts: string[];
  stepByStepExplanation: string;
  recommendedNextSteps: string[];
}
