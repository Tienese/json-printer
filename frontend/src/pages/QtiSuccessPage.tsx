import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, Alert, Card } from '../components/common';
import type { ProcessQuizResponse } from '../types';
import styles from './QtiSuccessPage.module.css';

export function QtiSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as ProcessQuizResponse | undefined;

  if (!result) {
    return (
      <Layout>
        <div className={styles.container}>
          <Alert type="error">No import result found.</Alert>
          <Button onClick={() => navigate('/quiz/import')}>Start New Import</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        {result.success ? (
          <>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Import Successful!</h1>
            <p className={styles.subtitle}>{result.message}</p>

            <Card className={styles.details}>
              <h2 className={styles.detailsTitle}>Import Details</h2>

              <div className={styles.detailGrid}>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Quiz Title:</span>
                  <span className={styles.detailValue}>{result.quiz.title}</span>
                </div>

                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Questions:</span>
                  <span className={styles.detailValue}>{result.quiz.questions.length}</span>
                </div>

                {result.importResult.questionCount && (
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Imported Questions:</span>
                    <span className={styles.detailValue}>
                      {result.importResult.questionCount}
                    </span>
                  </div>
                )}

                {result.importResult.totalDurationMs && (
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Processing Time:</span>
                    <span className={styles.detailValue}>
                      {(result.importResult.totalDurationMs / 1000).toFixed(2)}s
                    </span>
                  </div>
                )}

                {result.importResult.migrationStatus && (
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Migration Status:</span>
                    <span className={styles.detailValue}>
                      {result.importResult.migrationStatus}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <div className={styles.actions}>
              <Button onClick={() => navigate('/quiz/import')}>Import Another Quiz</Button>
              <Button onClick={() => navigate('/dashboard')} variant="secondary">
                Back to Dashboard
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.errorIcon}>✗</div>
            <h1 className={styles.title}>Import Failed</h1>
            <Alert type="error">{result.message}</Alert>

            <div className={styles.actions}>
              <Button onClick={() => navigate('/quiz/import')}>Try Again</Button>
              <Button onClick={() => navigate('/dashboard')} variant="secondary">
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
