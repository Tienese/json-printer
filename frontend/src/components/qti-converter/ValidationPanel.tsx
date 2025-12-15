import type { QuizValidationResult } from '../../types';
import { Alert } from '../common';
import styles from './ValidationPanel.module.css';

interface ValidationPanelProps {
  validation: QuizValidationResult;
}

export function ValidationPanel({ validation }: ValidationPanelProps) {
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return (
      <Alert type="success">
        ✓ Quiz validation passed with no errors or warnings
      </Alert>
    );
  }

  return (
    <div className={styles.container}>
      {hasErrors && (
        <div className={styles.section}>
          <h3 className={styles.errorTitle}>
            ✗ Errors ({validation.errors.length})
          </h3>
          <p className={styles.errorSubtitle}>
            These must be fixed before importing
          </p>
          <ul className={styles.errorList}>
            {validation.errors.map((error, index) => (
              <li key={index} className={styles.errorItem}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasWarnings && (
        <div className={styles.section}>
          <h3 className={styles.warningTitle}>
            ⚠ Warnings ({validation.warnings.length})
          </h3>
          <p className={styles.warningSubtitle}>
            These won't prevent import but should be reviewed
          </p>
          <ul className={styles.warningList}>
            {validation.warnings.map((warning, index) => (
              <li key={index} className={styles.warningItem}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
