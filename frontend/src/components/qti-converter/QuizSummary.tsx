import type { UserQuizJson } from '../../types';
import { Card } from '../common';
import styles from './QuizSummary.module.css';

interface QuizSummaryProps {
  quiz: UserQuizJson;
}

export function QuizSummary({ quiz }: QuizSummaryProps) {
  const questionTypeCounts = quiz.questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Card className={styles.card}>
      <h3 className={styles.title}>{quiz.title}</h3>
      {quiz.description && <p className={styles.description}>{quiz.description}</p>}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Questions:</span>
          <span className={styles.statValue}>{quiz.questions.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Points:</span>
          <span className={styles.statValue}>{totalPoints}</span>
        </div>
      </div>

      <div className={styles.types}>
        <h4 className={styles.typesTitle}>Question Types:</h4>
        <div className={styles.typesList}>
          {Object.entries(questionTypeCounts).map(([type, count]) => (
            <span key={type} className={styles.typeBadge}>
              {type}: {count}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
