import { INITIAL_APP_DATA } from '../data';
import type { AppData, Theme } from '../types';

const APP_KEY = 'macrovest.app.v1';
const THEME_KEY = 'macrovest.theme';

export function loadAppData(): AppData {
  try {
    const stored = localStorage.getItem(APP_KEY);
    if (!stored) return INITIAL_APP_DATA;
    const parsed = JSON.parse(stored) as Partial<AppData>;
    return {
      ...INITIAL_APP_DATA,
      ...parsed,
      proposalId: typeof parsed.proposalId === 'string' ? parsed.proposalId : null,
      proposalMode: parsed.proposalMode === 'mock' || parsed.proposalMode === 'http' ? parsed.proposalMode : null,
      profile: { ...INITIAL_APP_DATA.profile, ...parsed.profile },
    };
  } catch {
    return INITIAL_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

export function loadTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}
