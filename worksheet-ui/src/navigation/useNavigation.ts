import { useState, useEffect, useCallback } from 'react';

export interface NavigationState {
  route: string;
  params: Record<string, string>;
}

/**
 * Parse the current URL hash into route and query params
 * Examples:
 *   #dashboard -> { route: 'dashboard', params: {} }
 *   #print-report?courseId=123&quizId=456 -> { route: 'print-report', params: { courseId: '123', quizId: '456' } }
 */
function parseHash(): NavigationState {
  const hash = window.location.hash.slice(1); // Remove '#'
  const [route, queryString] = hash.split('?');
  const params = queryString
    ? Object.fromEntries(new URLSearchParams(queryString))
    : {};
  return { route: route || '', params };
}

/**
 * Hook for hash-based navigation without a routing library
 *
 * Usage:
 *   const { route, params, navigate } = useNavigation();
 *
 *   // Navigate to a route
 *   navigate('dashboard');
 *
 *   // Navigate with params
 *   navigate('print-report', { courseId: '123', quizId: '456' });
 *
 *   // Read current route
 *   if (route === 'dashboard') { ... }
 *
 *   // Read params
 *   const { courseId } = params;
 */
export function useNavigation() {
  const [state, setState] = useState<NavigationState>(() => parseHash());

  // Listen for hash changes (back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setState(parseHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate to a new route
  const navigate = useCallback((route: string, params?: Record<string, string>) => {
    const queryString = params && Object.keys(params).length > 0
      ? '?' + new URLSearchParams(params).toString()
      : '';
    window.location.hash = route + queryString;
  }, []);

  // Go back in history
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return {
    route: state.route,
    params: state.params,
    navigate,
    goBack,
  };
}
