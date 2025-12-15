import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, Alert, Spinner } from '../components/common';
import { QuizSummary, ValidationPanel } from '../components/qti-converter';
import { qtiService } from '../services';
import type { UserQuizJson, QuizValidationResult } from '../types';
import styles from './QtiEditorPage.module.css';

export function QtiEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz as UserQuizJson | undefined;

  const [courseId, setCourseId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validation, setValidation] = useState<QuizValidationResult>();
  const [error, setError] = useState<string>();

  if (!quiz) {
    return (
      <Layout>
        <div className={styles.container}>
          <Alert type="error">
            No quiz data found. Please go back and upload a quiz.
          </Alert>
          <Button onClick={() => navigate('/quiz/import')}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  const handleValidate = async () => {
    setIsValidating(true);
    setError(undefined);

    try {
      const result = await qtiService.validateQuiz(JSON.stringify(quiz));
      setValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate quiz');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!courseId.trim()) {
      setError('Please enter a Canvas Course ID');
      return;
    }

    setIsProcessing(true);
    setError(undefined);

    try {
      const response = await qtiService.processAndImport(courseId, quiz);
      navigate('/quiz/success', { state: { result: response } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import quiz');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Review Quiz</h1>
        <p className={styles.subtitle}>
          Review your quiz before importing to Canvas
        </p>

        <QuizSummary quiz={quiz} />

        {validation && <ValidationPanel validation={validation} />}

        {error && <Alert type="error">{error}</Alert>}

        <div className={styles.actions}>
          <div className={styles.courseIdSection}>
            <label htmlFor="courseId" className={styles.label}>
              Canvas Course ID
            </label>
            <input
              type="text"
              id="courseId"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Enter course ID"
              className={styles.input}
              disabled={isProcessing}
            />
          </div>

          <div className={styles.buttons}>
            <Button
              onClick={handleValidate}
              disabled={isValidating || isProcessing}
              variant="secondary"
            >
              {isValidating ? <Spinner size="small" /> : 'Validate JSON'}
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                !courseId.trim() ||
                isProcessing ||
                (validation && !validation.valid)
              }
            >
              {isProcessing ? <Spinner size="small" /> : 'Generate QTI & Import'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
