import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('synthflow_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('synthflow_settings', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Apply theme class to body
    const body = document.body;
    body.classList.remove('theme-synthwave', 'theme-clean');
    body.classList.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  return (
    <AppContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
