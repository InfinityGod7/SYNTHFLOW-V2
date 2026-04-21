import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, Settings, History, Cpu } from 'lucide-react';
import { useApp } from './AppProvider';
import { RecorderView } from './RecorderView';
import { SettingsView } from './SettingsView';
import { cn } from '../lib/utils';

type Page = 'recorder' | 'settings' | 'history';

export function Layout() {
  const [currentPage, setCurrentPage] = useState<Page>('recorder');
  const { settings } = useApp();
  const isSynth = settings.theme === 'synthwave';

  const navItems = [
    { id: 'recorder', icon: <Mic size={20} />, label: 'Dictate' },
    { id: 'history', icon: <History size={20} />, label: 'History' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen w-full overflow-hidden transition-all duration-500",
      isSynth ? "font-mono" : "font-sans"
    )}>
      {/* Immersive Top Bar */}
      <header className={cn(
        "relative z-30 flex justify-between items-center px-6 py-4 border-b",
        isSynth 
          ? "bg-black border-synth-accent-pink shadow-[0_4px_15px_-5px_#ff00ff]" 
          : "bg-white border-gray-100 shadow-sm"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 flex items-center justify-center rounded-sm",
            isSynth ? "bg-[#ff00ff] shadow-[0_0_15px_#ff00ff]" : "bg-blue-500 text-white rounded-lg"
          )}>
            <Cpu size={24} className={isSynth ? "text-black" : ""} />
          </div>
          <div>
            <h1 className={cn(
              "text-xl font-black tracking-tighter italic uppercase",
              isSynth ? "text-white" : "text-gray-800"
            )}>
              SynthFlow <span className={isSynth ? "text-[#ff00ff]" : "text-blue-500"}>v2.0</span>
            </h1>
            <p className={cn(
              "text-[10px] opacity-70 tracking-widest uppercase",
              isSynth ? "text-synth-accent-cyan" : "text-gray-400"
            )}>
              CORE LOGIC: REFACTORED // ENGINE: ELECTRON
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className={cn(
              "text-[9px] uppercase font-bold tracking-widest",
              isSynth ? "text-[#ff00ff]" : "text-blue-500"
            )}>
              Whisper Flow Active
            </span>
            <span className={cn(
              "text-[10px]",
              isSynth ? "text-synth-accent-cyan" : "text-gray-500"
            )}>
              Trigger: {settings.hotkey.toUpperCase()}
            </span>
          </div>
          <div className={cn("h-8 w-px", isSynth ? "bg-synth-accent-cyan opacity-30" : "bg-gray-200")}></div>
          <div className={cn(
            "px-3 py-1.5 border text-[10px] font-bold uppercase",
            isSynth 
              ? "border-synth-accent-cyan text-synth-accent-cyan shadow-[0_0_10px_rgba(0,243,255,0.3)]" 
              : "border-gray-200 text-gray-600 rounded-md"
          )}>
            Theme: {settings.theme.toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={cn(
          "w-20 md:w-64 flex flex-col items-center md:items-stretch border-r z-20 transition-all",
          isSynth ? "bg-[#0a0a0a] border-synth-accent-blue/30 shadow-[inset_0_0_15px_rgba(0,243,255,0.05)]" : "bg-white border-gray-100"
        )}>
          <nav className="flex-1 mt-6 space-y-2 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-ui transition-all group",
                currentPage === item.id
                  ? (isSynth ? "bg-synth-accent-blue/20 text-synth-accent-cyan border border-synth-accent-blue/30" : "bg-blue-50 text-blue-600")
                  : (isSynth ? "text-synth-accent-blue/50 hover:text-synth-accent-cyan" : "text-gray-400 hover:bg-gray-50")
              )}
            >
              <span className={cn(
                "transition-transform group-hover:scale-110",
                currentPage === item.id && "scale-110"
              )}>
                {item.icon}
              </span>
              <span className="hidden md:block text-sm font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-current opacity-10">
          <div className={cn("text-[10px] hidden md:block", isSynth ? "text-synth-accent-cyan" : "")}>
            Connected 0.0.0.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 relative overflow-hidden bg-transparent">
          <motion.div
             key={currentPage}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="h-full w-full"
          >
            {currentPage === 'recorder' && <RecorderView />}
            {currentPage === 'settings' && <SettingsView />}
            {currentPage === 'history' && (
              <div className={cn(
                "flex items-center justify-center h-full text-center opacity-20 uppercase tracking-[0.2em]",
                isSynth ? "text-synth-accent-blue" : ""
              )}>
                Archive Empty // No logs recorded
              </div>
            )}
          </motion.div>
        </main>
        
        {/* Immersive Bottom Bar */}
        <footer className={cn(
          "relative z-30 px-6 py-2 border-t flex justify-between items-center text-[9px] tracking-widest uppercase transition-all",
          isSynth 
            ? "bg-black border-synth-accent-cyan/30 text-synth-accent-cyan opacity-80" 
            : "bg-gray-50 border-gray-100 text-gray-500"
        )}>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">MEM: 142MB</span>
            <span className="flex items-center gap-1 text-[#ff00ff]">CPU: 4.1%</span>
            <span className="flex items-center gap-1">ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-60 italic">(C) 2024 SYNTHFLOW_OS</span>
            <div className={cn("w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse")}></div>
            <span>NODE_ENV: PRODUCTION</span>
          </div>
        </footer>
      </div>
    </div>
    </div>
  );
}
