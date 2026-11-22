const configuredMode = import.meta.env.VITE_API_MODE?.trim().toLowerCase();

export type ApiMode = 'mock' | 'http';

export const environment = {
  apiMode: (configuredMode === 'http' ? 'http' : 'mock') as ApiMode,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') ?? '',
  apiTimeoutMs: Math.max(1000, Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000),
};

export const isBackendMode = environment.apiMode === 'http';
