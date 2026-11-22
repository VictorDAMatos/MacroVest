import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { INITIAL_APP_DATA } from '../data';
import { loadAppData, loadTheme, saveAppData, saveTheme } from '../services/storage';
import type { AppData, AppNotification, ExecutionRecord, FinancialProfile, Theme } from '../types';

interface AppContextValue {
  data: AppData;
  theme: Theme;
  unreadCount: number;
  updateProfile: (profile: FinancialProfile) => void;
  setProposalId: (proposalId: string, mode: 'mock' | 'http') => void;
  addExecution: (record: ExecutionRecord) => void;
  addNotification: (notification: AppNotification) => void;
  markNotificationsRead: () => void;
  setOnboardingDone: () => void;
  setTheme: (theme: Theme) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());

  useEffect(() => saveAppData(data), [data]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  const value = useMemo<AppContextValue>(() => ({
    data,
    theme,
    unreadCount: data.notifications.filter((item) => !item.read).length,
    updateProfile: (profile) => setData((current) => ({ ...current, profile })),
    setProposalId: (proposalId, mode) => setData((current) => ({ ...current, proposalId, proposalMode: mode })),
    addExecution: (record) => setData((current) => ({ ...current, executions: [record, ...current.executions] })),
    addNotification: (notification) => setData((current) => ({ ...current, notifications: [notification, ...current.notifications] })),
    markNotificationsRead: () => setData((current) => ({ ...current, notifications: current.notifications.map((item) => ({ ...item, read: true })) })),
    setOnboardingDone: () => setData((current) => ({ ...current, onboardingDone: true })),
    setTheme: setThemeState,
    resetDemo: () => setData({ ...INITIAL_APP_DATA, onboardingDone: true }),
  }), [data, theme]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser utilizado dentro de AppProvider.');
  return context;
}
