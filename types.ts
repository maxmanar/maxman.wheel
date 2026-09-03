export interface WheelItem {
  id: string;
  text: string;
  enabled: boolean;
}

export interface WheelConfig {
  spinDuration: number;
  soundEnabled: boolean;
  removeWinner: boolean;
  confettiEnabled: boolean;
  questionTimer: number; // in seconds
  theme: 'national' | 'classic';
}

export interface WinnerRecord {
  id: string;
  itemText: string;
  timestamp: string;
  index: number;
  wheelType: 'numbers' | 'questions';
}

export interface QuestionItem {
  id: string;
  question: string;
  category?: string;
}
