import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { QuizPrintViewModel } from '../types';
import { Layout, Button, Alert, Spinner, ReportDisplay } from '../components';
import { printReportService } from '../services';
import styles from './BlankQuizPage.module.css';

export function BlankQuizPage() {
  const [searchParams] = useSearchParams();
  const [courseId, setCourseId] = useState(searchParams.get('courseId') || '');
  const [quizId, setQuizId] = useState(searchParams.get('quizId') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [report, setReport] = useState<QuizPrintViewModel>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);

    try {
      const blankQuiz = await printReportService.generateBlankQuiz(courseId, quizId);
      setReport(blankQuiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blank quiz');
    } finally {
      setIsLoading(false);
    }
  };

  if (report) {
    return (
      <Layout>
        <div className={styles.toolbar}>
          <Button onClick={() => setReport(undefined)}>Generate Another</Button>
        </div>
        <ReportDisplay report={report} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Generate Blank Quiz Worksheet</h1>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="courseId" className={styles.label}>
              Canvas Course ID
            </label>
            <input
              id="courseId"
              type="text"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className={styles.input}
              placeholder="e.g., 12345"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="quizId" className={styles.label}>
              Canvas Quiz ID
            </label>
            <input
              id="quizId"
              type="text"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              required
              className={styles.input}
              placeholder="e.g., 67890"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size="small" /> : 'Generate Blank Quiz'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
