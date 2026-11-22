import { environment } from '../../config/environment';

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeoutMs?: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status = 0, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.mensagem === 'string') return record.mensagem;
    if (typeof record.error === 'string') return record.error;
  }
  return fallback;
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export class ApiClient {
  constructor(private readonly baseUrl = environment.apiBaseUrl) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(
        'A URL do back-end não foi configurada. Defina VITE_API_BASE_URL no arquivo .env.',
        0,
        'API_BASE_URL_MISSING',
      );
    }

    const { body, timeoutMs = environment.apiTimeoutMs, headers: customHeaders, ...requestOptions } = options;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    const headers = new Headers(customHeaders);
    headers.set('Accept', 'application/json');

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
        requestBody = body;
      } else {
        headers.set('Content-Type', 'application/json');
        requestBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(joinUrl(this.baseUrl, path), {
        ...requestOptions,
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      const responseText = await response.text();
      let payload: unknown = undefined;
      if (responseText) {
        try {
          payload = JSON.parse(responseText) as unknown;
        } catch {
          payload = responseText;
        }
      }

      if (!response.ok) {
        const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : undefined;
        throw new ApiError(
          getErrorMessage(payload, `A solicitação falhou (HTTP ${response.status}).`),
          response.status,
          typeof record?.code === 'string' ? record.code : undefined,
          payload,
        );
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('O back-end demorou para responder. Tente novamente.', 408, 'REQUEST_TIMEOUT');
      }
      if (error instanceof TypeError) {
        throw new ApiError('Não foi possível conectar ao back-end. Verifique o servidor e a conexão.', 0, 'NETWORK_ERROR');
      }
      throw new ApiError('Ocorreu um erro inesperado durante a comunicação com o back-end.', 0, 'UNKNOWN_ERROR', error);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  get<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body: unknown, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }
}

export const apiClient = new ApiClient();
