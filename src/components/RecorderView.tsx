import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, CheckCircle2, History, Settings, Sparkles, Volume2 } from 'lucide-react';
import { useRecorder } from '../hooks/useRecorder';
import { useApp } from './AppProvider';
import { transcribeAudio, cleanupText } from '../services/aiService';
import { cn } from '../lib/utils';

export function RecorderView() {
  const { settings } = useApp();
  const { state, audioBlob, startRecording, stopRecording, reset, setState } = useRecorder();
  const [transcription, setTranscription] = useState<string>('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [status, setStatus] = useState<string>('Ready to record');
  const [logs, setLogs] = useState<string[]>([
    '> ELECTRON RENDERER PROCESS INITIALIZED... SUCCESS',
    '> REFACTORING PYTHON ASYNC_CALLS TO NODE_JS NATIVE... SUCCESS',
    '> WHISPER_FLOW_ENGINE v3.4 ATTACHED ON PORT 8841',
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg.toUpperCase()}`].slice(-6));
  };

  // Handle Hotkey (Simulated for Web, Global for Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Logic for Ctrl+Windows or similar
      // Since we are in a browser, we'll listen for a specific key
      if (e.code === 'Space' && (e.ctrlKey || e.metaKey) && state === 'idle') {
        e.preventDefault();
        startRecording();
        addLog('RECORDING STARTED // USER_PTT_ACTIVE');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === 'recording') {
        stopRecording();
        addLog('RECORDING STOPPED // BUFFERING_AUDIO');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, startRecording, stopRecording]);

  // Handle Transcription when blob is ready
  useEffect(() => {
    if (audioBlob && state === 'processing') {
      processAudio(audioBlob);
    }
  }, [audioBlob, state]);

  const processAudio = async (blob: Blob) => {
    try {
      setStatus('Transcribing...');
      addLog('UPLOADING TO NEURAL ENGINE...');
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const rawText = await transcribeAudio(base64, blob.type, settings);
        setTranscription(rawText);
        addLog(`TRANSCRIBED: "${rawText.slice(0, 30)}..."`);

        if (settings.cleanupEnabled && rawText) {
          setIsPolishing(true);
          setStatus('Polishing text...');
          addLog('APPLYING GPT-4 CLEANUP PIPELINE...');
          const polished = await cleanupText(rawText, settings);
          setTranscription(polished);
          setIsPolishing(false);
          addLog('POLISHING COMPLETE');
        }

        setStatus('Complete');
        addLog('PASTING TO CLIPBOARD // ATTACHING TO OS');
        // Simulate paste to clipboard
        navigator.clipboard.writeText(transcription);
        
        setTimeout(() => {
          setState('idle');
          setStatus('Ready to record');
        }, 3000);
      };
    } catch (err) {
      console.error(err);
      setStatus('Error occurred');
      setTimeout(reset, 3000);
    }
  };

  const isSynth = settings.theme === 'synthwave';

  return (
    <div className="flex flex-col h-full w-full relative p-6 bg-transparent">
      {/* Background Grid */}
      {isSynth && (
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none synth-grid"></div>
      )}

      {/* Main Layout Grid */}
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Sidebar Status (Immersive UI element) */}
        <aside className={cn(
          "col-span-3 flex flex-col gap-4 hidden lg:flex",
          isSynth ? "text-synth-accent-cyan" : "text-gray-600"
        )}>
          <div className={cn(
            "p-4 flex flex-col gap-4 min-h-[160px]",
            isSynth ? "synth-surface" : "bg-white border rounded-clean shadow-sm"
          )}>
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-70">
              System Status
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Latency', val: '12ms', pct: 24 },
                { label: 'Buffer', val: '98.4%', pct: 98 },
                { label: 'Temp', val: '42°C', pct: 45 }
              ].map(stat => (
                <div key={stat.label} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{stat.label.toUpperCase()}</span>
                    <span className="italic opacity-80">{stat.val}</span>
                  </div>
                  <div className={cn("w-full h-1", isSynth ? "bg-[#1a1a1a]" : "bg-gray-100")}>
                    <div className={cn(
                      "h-full transition-all duration-1000",
                      isSynth ? "bg-synth-accent-cyan shadow-[0_0_8px_#00f3ff]" : "bg-blue-500"
                    )} style={{ width: `${stat.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-4 flex-1 flex flex-col gap-4",
            isSynth ? "synth-surface synth-border-pink" : "bg-white border rounded-clean shadow-sm"
          )}>
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#ff00ff]">
              Model Config
            </h3>
            <div className="space-y-4">
              {[
                { label: 'HotKey', val: settings.hotkey },
                { label: 'Provider', val: settings.provider },
                { label: 'Cleanup', val: settings.cleanupEnabled ? 'ON' : 'OFF' }
              ].map(item => (
                <div key={item.label}>
                  <label className="text-[9px] opacity-50 block mb-1 uppercase font-bold">{item.label}</label>
                  <div className={cn(
                    "p-2 text-xs text-center border uppercase font-bold",
                    isSynth ? "bg-black border-[#ff00ff]/30 text-white" : "bg-gray-50 border-gray-100 rounded"
                  )}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto opacity-30 text-[8px] leading-tight font-mono">
              PROCESS_ID: SYNTH_88229<br/>
              STABILITY: OPTIMIZED<br/>
              KERNEL: VITE_V6_SDK
            </div>
          </div>
        </aside>

        {/* Main Interface Area */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 min-h-0">
          
          {/* Audio Feed & Transcription */}
          <div className={cn(
            "flex-[2] relative overflow-hidden flex flex-col p-6",
            isSynth ? "synth-surface !border-2" : "bg-white border rounded-clean shadow-xl"
          )}>
            {state === 'recording' && (
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 rounded-full bg-[#ff00ff] animate-pulse shadow-[0_0_10px_#ff00ff]"></div>
              </div>
            )}
            
            <h2 className="text-[10px] mb-6 opacity-50 font-bold uppercase tracking-[0.2em]">
              Live Data Stream // Whisper_Core
            </h2>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar font-mono">
               <p className="opacity-30 text-xs italic">[00:01:22] Initializing voice buffers...</p>
               <p className="opacity-30 text-xs italic">[00:01:45] Neural engine warm-up complete.</p>
               
               {transcription && (
                 <div className="space-y-3 pb-4">
                   <div className="flex gap-2 items-start">
                     <span className={cn("text-[10px] font-black uppercase shrink-0 mt-1", isSynth ? "text-[#ff00ff]" : "text-blue-500")}>
                        USER:
                     </span>
                     <p className={cn("text-lg italic leading-relaxed", isSynth ? "text-white" : "text-gray-800")}>
                        "{transcription}"
                     </p>
                   </div>
                   
                   <div className={cn("flex gap-2 items-start", isSynth ? "border-l-2 border-synth-accent-cyan pl-4" : "pl-4 border-l-2 border-blue-200")}>
                     <span className={cn("text-[10px] font-black uppercase shrink-0 mt-1", isSynth ? "text-synth-accent-cyan" : "text-blue-500")}>
                        ENGINE:
                     </span>
                     <p className={cn("text-sm", isSynth ? "text-synth-accent-cyan" : "text-gray-600")}>
                        Buffer processed. Text mapped to global clipboard. {status === 'Complete' && "READY."}
                     </p>
                   </div>
                 </div>
               )}

               {state === 'recording' && (
                 <p className="text-[#ff00ff] animate-pulse text-sm font-bold uppercase tracking-widest py-2">
                   [RECORDING_IN_PROGRESS...]
                 </p>
               )}
            </div>

            {/* Waveform Visualizer */}
            <div className="h-16 flex items-end gap-1.5 mt-auto pt-4 border-t border-current opacity-20">
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={state === 'recording' ? {
                    height: [
                      `${20 + Math.random() * 80}%`, 
                      `${40 + Math.random() * 60}%`, 
                      `${10 + Math.random() * 90}%`
                    ]
                  } : { height: '10%' }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.2 + (i % 5) * 0.1,
                    ease: "easeInOut" 
                  }}
                  className={cn(
                    "flex-1 transition-colors",
                    isSynth 
                      ? (i % 3 === 0 ? "bg-[#ff00ff] shadow-[0_0_8px_#ff00ff]" : "bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]") 
                      : "bg-blue-300"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Terminal Logs */}
          <div className={cn(
            "h-32 p-4 text-[10px] leading-tight font-mono overflow-hidden flex flex-col",
            isSynth ? "bg-black border border-synth-accent-cyan/40 text-synth-accent-cyan/80" : "bg-gray-900 text-green-400 rounded-lg"
          )}>
            <div className={cn("mb-2 font-bold uppercase tracking-widest", isSynth ? "text-[#ff00ff]" : "text-white")}>
              [System Logs]
            </div>
            <div className="flex-1 space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="opacity-80 break-all">{log}</div>
              ))}
              <div className="flex gap-2 items-center">
                <span className="terminal-cursor w-2 h-3 bg-current"></span>
                <span className="opacity-50 italic">LISTENING_FOR_SIGNAL...</span>
              </div>
            </div>
          </div>

          {/* Floating Action Bar (Responsive Mobile View) */}
          <div className="lg:hidden flex gap-4 p-4 border-t border-current opacity-20 mt-auto">
             <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                className={cn(
                  "flex-1 py-4 font-black uppercase text-sm tracking-widest",
                  isSynth ? "bg-[#ff00ff] text-black synth-glow" : "bg-blue-500 text-white rounded-clean"
                )}
             >
                {state === 'recording' ? "RELEASE" : "HOLD_PTT_ACTIVE"}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
