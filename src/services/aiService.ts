import { GoogleGenAI } from "@google/genai";
import { AppSettings } from "../types";
import { CLEANUP_SYSTEM_PROMPT } from "../constants";

let aiInstance: GoogleGenAI | null = null;

export function getAI(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not defined");
  if (!aiInstance || apiKey) {
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export async function transcribeAudio(audioBase64: string, mimeType: string, settings: AppSettings): Promise<string> {
  const ai = getAI(settings.geminiKey);
  
  const response = await ai.models.generateContent({
    model: settings.transcriptionModel,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType
            }
          },
          {
            text: "Transcribe this audio exactly as spoken. Return only the transcription text, nothing else."
          }
        ]
      }
    ]
  });

  return response.text?.trim() || "";
}

export async function cleanupText(text: string, settings: AppSettings): Promise<string> {
  if (!text.trim()) return "";
  
  const ai = getAI(settings.geminiKey);
  
  const response = await ai.models.generateContent({
    model: settings.cleanupModel,
    contents: [{ parts: [{ text }] }],
    config: {
      systemInstruction: CLEANUP_SYSTEM_PROMPT,
      temperature: 0.2
    }
  });

  return response.text?.trim() || text;
}

/**
 * Simulates a "Whisper Flow" real-time stream.
 * In a real Electron app, this would use a persistent connection.
 */
export async function streamRealtimeTranscription(audioChunk: string, mimeType: string, settings: AppSettings): Promise<string> {
  // For the purpose of this modernized version, we use the same high-speed Flash model
  // but processed in chunks.
  const ai = getAI(settings.geminiKey);
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: [
      {
        parts: [
          { inlineData: { data: audioChunk, mimeType: mimeType } },
          { text: "What words are being said in this audio snippet? Provide a short preview." }
        ]
      }
    ],
    config: { temperature: 0.1 }
  });
  
  return response.text || "";
}
