import { useState, useRef, useCallback } from 'react';

export type RecorderState = 'idle' | 'recording' | 'processing';

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(fullBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setState('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied or not available.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('processing');
    }
  }, [state]);

  const reset = useCallback(() => {
    setState('idle');
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    state,
    audioBlob,
    startRecording,
    stopRecording,
    reset,
    setState // To manually transition if needed
  };
}
