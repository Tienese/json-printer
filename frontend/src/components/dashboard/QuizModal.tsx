import { Modal, Spinner, Alert } from '../common';
import { QuizCard } from './QuizCard';
import { useQuizzes } from '../../hooks';
import type { Course } from '../../types';
import styles from './QuizModal.module.css';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export function QuizModal({ isOpen, onClose, course }: QuizModalProps) {
  const { data: quizzes, isLoading, error } = useQuizzes(course?.id);

  if (!course) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={course.name} size="large">
      <div className={styles.content}>
        {isLoading && (
          <div className={styles.loading}>
            <Spinner size="large" />
            <p>Loading quizzes...</p>
          </div>
        )}

        {error && (
          <Alert type="error">
            Failed to load quizzes: {error.message}
          </Alert>
        )}

        {quizzes && quizzes.length === 0 && (
          <Alert type="info">No quizzes found for this course.</Alert>
        )}

        {quizzes && quizzes.length > 0 && (
          <div className={styles.quizGrid}>
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} courseId={course.id} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
