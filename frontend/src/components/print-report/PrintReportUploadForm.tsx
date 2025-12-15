import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Alert } from '../common';
import styles from './PrintReportUploadForm.module.css';

interface PrintReportUploadFormProps {
  onSubmit: (courseId: string, quizId: string, csvFile: File, reportType: string) => void;
  isLoading: boolean;
  error?: string;
}

export function PrintReportUploadForm({ onSubmit, isLoading, error }: PrintReportUploadFormProps) {
  const [searchParams] = useSearchParams();

  const [courseId, setCourseId] = useState(searchParams.get('courseId') || '');
  const [quizId, setQuizId] = useState(searchParams.get('quizId') || '');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState('slip');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (csvFile && courseId.trim() && quizId.trim()) {
      onSubmit(courseId.trim(), quizId.trim(), csvFile, reportType);
    }
  };

  const isValid = courseId.trim() && quizId.trim() && csvFile;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Generate Print Report</h2>
      <p className={styles.subtitle}>
        Upload student CSV data to generate printable quiz reports
      </p>

      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="courseId" className={styles.label}>
            Canvas Course ID *
          </label>
          <input
            type="text"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Enter course ID"
            className={styles.input}
            disabled={isLoading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="quizId" className={styles.label}>
            Canvas Quiz ID *
          </label>
          <input
            type="text"
            id="quizId"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            placeholder="Enter quiz ID"
            className={styles.input}
            disabled={isLoading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reportType" className={styles.label}>
            Report Type
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={styles.input}
            disabled={isLoading}
          >
            <option value="slip">Retake Slip (Incorrect Only)</option>
            <option value="full">Full Report (All Questions)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="csvFile" className={styles.label}>
            Student CSV File *
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={isLoading}
            required
          />
          {csvFile && (
            <p className={styles.fileName}>
              Selected: <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <p className={styles.hint}>
            Export from Canvas: Grades → Export → Download CSV
          </p>
        </div>

        <Button type="submit" disabled={!isValid || isLoading} size="large">
          {isLoading ? 'Generating...' : 'Generate Report'}
        </Button>
      </form>
    </div>
  );
}
