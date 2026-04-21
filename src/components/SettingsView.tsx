import React, { useEffect, useState } from 'react';
import { useApp } from './AppProvider';
import { cn } from '../lib/utils';
import { Monitor, Zap, Palette, Key, Disc, Globe, Settings as SettingsIcon, Mic } from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings } = useApp();
  const isSynth = settings.theme === 'synthwave';
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function loadMics() {
      try {
        // Request permission first so labels are populated
        await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop()));
        const devices = await navigator.mediaDevices.enumerateDevices();
        setMicrophones(devices.filter(d => d.kind === 'audioinput'));
      } catch {
        // Permission denied — list stays empty
      }
    }
    loadMics();
  }, []);

  const sections = [
    {
      title: "Engine Settings",
      icon: <Zap size={16} />,
      fields: [
        { label: "Provider", key: "provider", type: "select", options: ["google", "openai"] },
        { label: "Gemini API Key", key: "geminiKey", type: "password" },
        { label: "Transcription Model", key: "transcriptionModel", type: "text" },
      ]
    },
    {
      title: "Transcription",
      icon: <Disc size={16} />,
      fields: [
        { label: "Language Code", key: "language", type: "text" },
        { label: "Cleanup Enabled", key: "cleanupEnabled", type: "toggle" },
        { label: "Cleanup Model", key: "cleanupModel", type: "text" },
      ]
    },
    {
      title: "UI & Behavior",
      icon: <Palette size={16} />,
      fields: [
        { label: "Theme", key: "theme", type: "select", options: ["synthwave", "clean"] },
        { label: "Hotkey Trigger", key: "hotkey", type: "text" },
      ]
    }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className={isSynth ? "text-synth-accent-pink" : "text-blue-500"} />
        <h1 className={cn(
          "text-3xl font-bold uppercase tracking-wider",
          isSynth ? "text-synth-accent-pink font-mono" : "text-gray-800"
        )}>
          System Configuration
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <div 
            key={idx}
            className={cn(
              "p-6 border transition-all duration-300",
              isSynth 
                ? "bg-black/40 border-synth-accent-blue/30 text-synth-accent-blue" 
                : "bg-white border-gray-100 rounded-clean shadow-sm text-gray-700"
            )}
          >
            <div className="flex items-center gap-2 mb-6 border-b pb-2 border-current opacity-70">
              {section.icon}
              <h2 className={cn(
                "text-xs font-bold uppercase tracking-widest",
                isSynth ? "font-mono" : "font-sans"
              )}>
                {section.title}
              </h2>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold opacity-60">
                    {field.label}
                  </label>
                  
                  {field.type === 'text' || field.type === 'password' ? (
                    <input
                      type={field.type}
                      value={(settings as any)[field.key]}
                      onChange={(e) => updateSettings({ [field.key]: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 text-sm transition-all focus:outline-none",
                        isSynth 
                          ? "bg-synth-bg border border-synth-accent-blue/20 text-synth-accent-cyan font-mono focus:border-synth-accent-cyan" 
                          : "bg-gray-50 border border-gray-200 text-gray-800 rounded-md focus:ring-1 focus:ring-blue-400"
                      )}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={(settings as any)[field.key]}
                      onChange={(e) => updateSettings({ [field.key]: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 text-sm transition-all focus:outline-none",
                        isSynth 
                          ? "bg-synth-bg border border-synth-accent-blue/20 text-synth-accent-cyan font-mono focus:border-synth-accent-cyan" 
                          : "bg-gray-50 border border-gray-200 text-gray-800 rounded-md focus:ring-1 focus:ring-blue-400"
                      )}
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                      ))}
                    </select>
                  ) : field.type === 'toggle' ? (
                    <button
                      onClick={() => updateSettings({ [field.key]: !(settings as any)[field.key] })}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all",
                        (settings as any)[field.key]
                          ? (isSynth ? "bg-synth-accent-pink shadow-[0_0_10px_#ff00ff]" : "bg-blue-500")
                          : "bg-gray-400"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        (settings as any)[field.key] ? "left-7" : "left-1"
                      )} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Microphone Selection */}
      <div className={cn(
        "mt-6 p-6 border transition-all duration-300",
        isSynth
          ? "bg-black/40 border-synth-accent-blue/30 text-synth-accent-blue"
          : "bg-white border-gray-100 rounded-clean shadow-sm text-gray-700"
      )}>
        <div className="flex items-center gap-2 mb-6 border-b pb-2 border-current opacity-70">
          <Mic size={16} />
          <h2 className={cn("text-xs font-bold uppercase tracking-widest", isSynth ? "font-mono" : "font-sans")}>
            Audio Input Device
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold opacity-60">Microphone</label>
          <select
            value={settings.microphoneId}
            onChange={(e) => updateSettings({ microphoneId: e.target.value })}
            className={cn(
              "w-full px-3 py-2 text-sm transition-all focus:outline-none",
              isSynth
                ? "bg-synth-bg border border-synth-accent-blue/20 text-synth-accent-cyan font-mono focus:border-synth-accent-cyan"
                : "bg-gray-50 border border-gray-200 text-gray-800 rounded-md focus:ring-1 focus:ring-blue-400"
            )}
          >
            <option value="">Default System Microphone</option>
            {microphones.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone (${mic.deviceId.slice(0, 8)}...)`}
              </option>
            ))}
          </select>
          {microphones.length === 0 && (
            <p className="text-[10px] opacity-50 mt-1">
              No devices found — microphone permission may be required.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 opacity-40 text-center text-[10px] uppercase font-mono">
        SynthFlow OS v2.0.4-STABLE // BUILD SHA: 7F23BE
      </div>
    </div>
  );
}
