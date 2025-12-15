import { useState } from 'react';
import { Button, Alert } from '../common';
import styles from './JsonUploadForm.module.css';

interface JsonUploadFormProps {
  onSubmit: (file?: File, text?: string) => void;
  isLoading: boolean;
  error?: string;
}

export function JsonUploadForm({ onSubmit, isLoading, error }: JsonUploadFormProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'file' && selectedFile) {
      onSubmit(selectedFile, undefined);
    } else if (activeTab === 'text' && jsonText.trim()) {
      onSubmit(undefined, jsonText);
    }
  };

  const isValid = activeTab === 'file' ? !!selectedFile : jsonText.trim().length > 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Import Quiz JSON</h2>
      <p className={styles.subtitle}>
        Upload a JSON file or paste JSON text to convert to QTI format
      </p>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'file' ? styles.active : ''}`}
          onClick={() => setActiveTab('file')}
          type="button"
        >
          Upload File
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'text' ? styles.active : ''}`}
          onClick={() => setActiveTab('text')}
          type="button"
        >
          Paste JSON
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {activeTab === 'file' ? (
          <div className={styles.fileUpload}>
            <label htmlFor="jsonFile" className={styles.label}>
              Choose JSON File
            </label>
            <input
              type="file"
              id="jsonFile"
              accept=".json,application/json"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={isLoading}
            />
            {selectedFile && (
              <p className={styles.fileName}>
                Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        ) : (
          <div className={styles.textArea}>
            <label htmlFor="jsonText" className={styles.label}>
              Paste JSON Text
            </label>
            <textarea
              id="jsonText"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{"title": "Quiz Title", "questions": [...]}'
              className={styles.textarea}
              rows={15}
              disabled={isLoading}
            />
            <p className={styles.charCount}>{jsonText.length} characters</p>
          </div>
        )}

        <Button type="submit" disabled={!isValid || isLoading} size="large">
          {isLoading ? 'Parsing...' : 'Parse Quiz'}
        </Button>
      </form>
    </div>
  );
}
