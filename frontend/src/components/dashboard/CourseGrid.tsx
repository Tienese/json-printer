import type { Course } from '../../types';
import { CourseCard } from './CourseCard';
import styles from './CourseGrid.module.css';

interface CourseGridProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
}

export function CourseGrid({ courses, onCourseClick }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No courses found</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onClick={() => onCourseClick(course)} />
      ))}
    </div>
  );
}
