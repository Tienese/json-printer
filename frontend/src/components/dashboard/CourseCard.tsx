import type { Course } from '../../types';
import { Card } from '../common';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const isActive = course.workflowState === 'available';

  return (
    <Card hover onClick={onClick} className={styles.courseCard}>
      <div className={`${styles.badge} ${isActive ? styles.active : styles.inactive}`}>
        {isActive ? 'Active' : 'Inactive'}
      </div>
      <h3 className={styles.name}>{course.name}</h3>
      <p className={styles.code}>{course.courseCode}</p>
    </Card>
  );
}
