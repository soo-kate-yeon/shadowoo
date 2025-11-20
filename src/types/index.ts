export interface Sentence {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number;
  
  // Note information
  notes?: {
    difficultyTags: string[]; // ["연음", "문법", "발음", "속도"]
    aiTip?: string;
  };
  
  // Highlight information
  highlights: Highlight[];
}

export interface Highlight {
  id: string;
  text: string; // selected word/phrase
  startOffset: number; // position in sentence
  endOffset: number;
  caption: string;
  color: string; // highlighter color
}

export interface StudySession {
  id: string;
  videoId: string;
  videoTitle: string;
  createdAt: Date;
  updatedAt: Date;
  sentences: Sentence[];
  currentPhase: 'blind' | 'script' | 'shadowing';
  isCompleted: boolean;
}

export interface ShadowingRecord {
  sentenceId: string;
  recordingBlob: Blob;
  timestamp: Date;
}

export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}
