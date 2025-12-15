import { useState } from 'react';
import type {
  WorksheetConfig,
  WorksheetRow,
  HeaderRow,
  TextRow,
  GridRow,
  VocabularyRow,
  RowType,
} from '../../types';
import { Button, Alert } from '../common';
import { RowEditor } from './RowEditor';
import styles from './WorksheetBuilder.module.css';

interface WorksheetBuilderProps {
  initialConfig?: WorksheetConfig;
  onGenerate: (config: WorksheetConfig) => void;
  isLoading?: boolean;
  error?: string;
}

export function WorksheetBuilder({
  initialConfig,
  onGenerate,
  isLoading = false,
  error,
}: WorksheetBuilderProps) {
  const [config, setConfig] = useState<WorksheetConfig>(
    initialConfig || {
      title: '',
      showGuideLines: true,
      rows: [],
    }
  );

  const createRow = (type: RowType): WorksheetRow => {
    const baseRow = {
      id: `row-${Date.now()}`,
      order: config.rows.length,
    };

    switch (type) {
      case 'HEADER':
        return {
          ...baseRow,
          type: 'HEADER',
          showDate: true,
          showName: true,
        } as HeaderRow;
      case 'TEXT':
        return {
          ...baseRow,
          type: 'TEXT',
          text: '',
          fontSize: 12,
          bold: false,
        } as TextRow;
      case 'GRID':
        return {
          ...baseRow,
          type: 'GRID',
          sections: [],
        } as GridRow;
      case 'VOCABULARY':
        return {
          ...baseRow,
          type: 'VOCABULARY',
          terms: [],
        } as VocabularyRow;
    }
  };

  const addRow = (type: RowType) => {
    const newRow = createRow(type);
    setConfig((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  const updateRow = (index: number, row: WorksheetRow) => {
    setConfig((prev) => {
      const rows = [...prev.rows];
      rows[index] = row;
      return { ...prev, rows };
    });
  };

  const deleteRow = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.rows.length) return;

    setConfig((prev) => {
      const rows = [...prev.rows];
      [rows[index], rows[newIndex]] = [rows[newIndex], rows[index]];
      // Update order
      rows[index].order = index;
      rows[newIndex].order = newIndex;
      return { ...prev, rows };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  return (
    <div className={styles.builder}>
      <form onSubmit={handleSubmit}>
        <div className={styles.configSection}>
          <h2 className={styles.sectionTitle}>Worksheet Configuration</h2>

          {error && <Alert type="error">{error}</Alert>}

          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              Worksheet Title
            </label>
            <input
              id="title"
              type="text"
              value={config.title}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, title: e.target.value }))
              }
              className={styles.input}
              placeholder="Enter worksheet title"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={config.showGuideLines}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    showGuideLines: e.target.checked,
                  }))
                }
              />
              Show Guide Lines
            </label>
          </div>
        </div>

        <div className={styles.rowsSection}>
          <div className={styles.rowsHeader}>
            <h2 className={styles.sectionTitle}>Rows</h2>
            <div className={styles.addButtons}>
              <Button
                type="button"
                onClick={() => addRow('HEADER')}
                variant="secondary"
                size="small"
              >
                + Header
              </Button>
              <Button
                type="button"
                onClick={() => addRow('TEXT')}
                variant="secondary"
                size="small"
              >
                + Text
              </Button>
              <Button
                type="button"
                onClick={() => addRow('GRID')}
                variant="secondary"
                size="small"
              >
                + Grid
              </Button>
              <Button
                type="button"
                onClick={() => addRow('VOCABULARY')}
                variant="secondary"
                size="small"
              >
                + Vocabulary
              </Button>
            </div>
          </div>

          {config.rows.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No rows added yet. Click the buttons above to add rows.</p>
            </div>
          ) : (
            <div className={styles.rowsList}>
              {config.rows.map((row, index) => (
                <RowEditor
                  key={row.id}
                  row={row}
                  onChange={(updatedRow) => updateRow(index, updatedRow)}
                  onDelete={() => deleteRow(index)}
                  onMoveUp={() => moveRow(index, 'up')}
                  onMoveDown={() => moveRow(index, 'down')}
                  canMoveUp={index > 0}
                  canMoveDown={index < config.rows.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.submitSection}>
          <Button type="submit" disabled={isLoading || config.rows.length === 0}>
            {isLoading ? 'Generating...' : 'Generate Worksheet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
