/**
 * Simple API client using native fetch
 * No axios or other libraries - just plain fetch with error handling
 */

const API_BASE = ''; // Same origin - API calls go to Spring Boot

export interface ApiError {
  message: string;
  status: number;
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: FormData | string | object;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Determine Content-Type based on body type
  const finalHeaders: Record<string, string> = { ...headers };

  let finalBody: BodyInit | undefined;

  if (body instanceof FormData) {
    // Don't set Content-Type for FormData - browser sets boundary
    finalBody = body;
  } else if (typeof body === 'object') {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  } else if (typeof body === 'string') {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = body;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parse errors for error responses
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
    };
    throw error;
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

/**
 * Convenience methods
 */
export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: FormData | object | string) =>
    apiFetch<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: object | string) =>
    apiFetch<T>(endpoint, { method: 'PUT', body }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};
