import { useQuery } from '@tanstack/react-query';
import { courseService } from '../services';
import type { Quiz } from '../types';

/**
 * Hook to fetch quizzes for a specific course.
 * Implements caching with 5-minute stale time to match backend cache TTL.
 *
 * @param courseId - The Canvas course ID (null/undefined to disable query)
 * @param refresh - If true, bypass cache and fetch fresh data
 */
export function useQuizzes(courseId: number | null | undefined, refresh = false) {
  return useQuery<Quiz[], Error>({
    queryKey: ['quizzes', courseId, refresh],
    queryFn: () => {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      return courseService.getQuizzes(courseId, refresh);
    },
    enabled: !!courseId, // Only run query if courseId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
}
