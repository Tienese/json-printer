import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../services';
import type { Course } from '../types';

/**
 * Hook to fetch all Canvas courses.
 * Implements caching with 5-minute stale time to match backend cache TTL.
 */
export function useCourses(refresh = false) {
  return useQuery<Course[], Error>({
    queryKey: ['courses', refresh],
    queryFn: () => courseService.getCourses(refresh),
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
}

/**
 * Hook to manually refresh courses cache.
 * Invalidates the query and triggers a refetch.
 */
export function useRefreshCourses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await courseService.clearCache();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}
