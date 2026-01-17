'use client';

// Client-side API helper that automatically includes auth token
// Use this for all authenticated API calls

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Hook that provides authenticated fetch functions
 * Automatically includes the Clerk session token in Authorization header
 */
export function useApi() {
  const { getToken, isSignedIn } = useAuth();

  const fetchWithAuth = useCallback(async (url: string, options: ApiOptions = {}) => {
    const { skipAuth, ...fetchOptions } = options;

    // Get auth token if signed in and not skipping auth
    let authHeaders: HeadersInit = {};
    if (!skipAuth && isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          authHeaders = { Authorization: `Bearer ${token}` };
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }

    // Merge headers
    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(fetchOptions.headers || {}),
    };

    return fetch(url, {
      ...fetchOptions,
      headers,
    });
  }, [getToken, isSignedIn]);

  // Convenience methods
  const get = useCallback((url: string, options?: ApiOptions) =>
    fetchWithAuth(url, { ...options, method: 'GET' }), [fetchWithAuth]);

  const post = useCallback((url: string, data?: unknown, options?: ApiOptions) =>
    fetchWithAuth(url, { ...options, method: 'POST', body: JSON.stringify(data) }), [fetchWithAuth]);

  const patch = useCallback((url: string, data?: unknown, options?: ApiOptions) =>
    fetchWithAuth(url, { ...options, method: 'PATCH', body: JSON.stringify(data) }), [fetchWithAuth]);

  const del = useCallback((url: string, options?: ApiOptions) =>
    fetchWithAuth(url, { ...options, method: 'DELETE' }), [fetchWithAuth]);

  return {
    fetch: fetchWithAuth,
    get,
    post,
    patch,
    delete: del,
    isSignedIn,
  };
}

/**
 * Non-hook version for use outside of React components
 * Requires passing the token manually
 */
export async function apiRequest(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
