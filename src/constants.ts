import { AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  provider: 'google',
  openaiKey: '',
  geminiKey: '',
  hotkey: 'ctrl+shift',
  language: 'en',
  cleanupEnabled: true,
  cleanupModel: 'gemini-3-flash-preview',
  transcriptionModel: 'gemini-3.1-flash-live-preview',
  theme: 'synthwave',
  microphoneId: '',
};

export const CLEANUP_SYSTEM_PROMPT = `You are a voice transcription cleanup assistant.
Your job is to clean up raw speech-to-text output:
- Remove filler words (um, uh, like, you know, etc.)
- Fix run-on sentences with proper punctuation
- Capitalize correctly
- Keep the meaning and tone exactly the same
- Do NOT add new content, summarize, or change the intent
- Return ONLY the cleaned text, nothing else.`;
