import { useNavigate } from 'react-router-dom';
import type { Quiz } from '../../types';
import { Card, Button } from '../common';
import styles from './QuizCard.module.css';

interface QuizCardProps {
  quiz: Quiz;
  courseId: number;
}

export function QuizCard({ quiz, courseId }: QuizCardProps) {
  const navigate = useNavigate();

  const handleGenerateReport = () => {
    navigate(`/print-report?courseId=${courseId}&quizId=${quiz.id}`);
  };

  return (
    <Card className={styles.quizCard}>
      <div className={styles.header}>
        <h4 className={styles.title}>{quiz.title}</h4>
        {quiz.published && <span className={styles.publishedBadge}>Published</span>}
      </div>

      {quiz.description && (
        <p className={styles.description} dangerouslySetInnerHTML={{ __html: quiz.description }} />
      )}

      <div className={styles.metadata}>
        <span className={styles.metaItem}>
          <strong>Questions:</strong> {quiz.questionCount || 0}
        </span>
        <span className={styles.metaItem}>
          <strong>Points:</strong> {quiz.pointsPossible || 0}
        </span>
        {quiz.timeLimit && (
          <span className={styles.metaItem}>
            <strong>Time:</strong> {quiz.timeLimit} min
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <Button onClick={handleGenerateReport} size="small">
          Generate Report
        </Button>
      </div>
    </Card>
  );
}
