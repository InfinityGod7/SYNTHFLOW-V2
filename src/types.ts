export type ThemeType = 'synthwave' | 'clean';

export interface AppSettings {
  provider: 'openai' | 'google';
  openaiKey: string;
  geminiKey: string;
  hotkey: string;
  language: string;
  cleanupEnabled: boolean;
  cleanupModel: string;
  transcriptionModel: string;
  theme: ThemeType;
}

export type AppStatus = 'idle' | 'recording' | 'transcribing' | 'polishing' | 'pasted' | 'error';

export interface RecordingSession {
  id: string;
  timestamp: Date;
  rawText: string;
  cleanedText: string;
  duration: number;
}
