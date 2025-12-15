import { useState } from 'react';
import { Layout, Spinner, Alert, Button } from '../components/common';
import { CourseGrid, QuizModal } from '../components/dashboard';
import { useCourses, useRefreshCourses } from '../hooks';
import type { Course } from '../types';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { data: courses, isLoading, error } = useCourses();
  const refreshMutation = useRefreshCourses();

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Browse your Canvas courses and quizzes</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            variant="secondary"
          >
            {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Cache'}
          </Button>
        </div>

        {isLoading && (
          <div className={styles.loading}>
            <Spinner size="large" />
            <p>Loading courses...</p>
          </div>
        )}

        {error && (
          <Alert type="error">
            Failed to load courses: {error.message}
          </Alert>
        )}

        {refreshMutation.isSuccess && (
          <Alert type="success" onClose={() => refreshMutation.reset()}>
            Cache refreshed successfully!
          </Alert>
        )}

        {courses && <CourseGrid courses={courses} onCourseClick={handleCourseClick} />}

        <QuizModal
          isOpen={!!selectedCourse}
          onClose={handleCloseModal}
          course={selectedCourse}
        />
      </div>
    </Layout>
  );
}
