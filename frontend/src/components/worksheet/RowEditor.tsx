import type {
  WorksheetRow,
  HeaderRow,
  TextRow,
  GridRow,
  VocabularyRow,
  GridSection,
  BoxSize,
} from '../../types';
import { Button } from '../common';
import styles from './RowEditor.module.css';

interface RowEditorProps {
  row: WorksheetRow;
  onChange: (row: WorksheetRow) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function RowEditor({
  row,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: RowEditorProps) {
  const renderHeaderEditor = (headerRow: HeaderRow) => (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={headerRow.showDate}
            onChange={(e) =>
              onChange({ ...headerRow, showDate: e.target.checked } as WorksheetRow)
            }
          />
          Show Date
        </label>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={headerRow.showName}
            onChange={(e) =>
              onChange({ ...headerRow, showName: e.target.checked } as WorksheetRow)
            }
          />
          Show Name
        </label>
      </div>
      <div className={styles.field}>
        <label htmlFor={`title-${row.id}`} className={styles.label}>
          Title (Optional)
        </label>
        <input
          id={`title-${row.id}`}
          type="text"
          value={headerRow.title || ''}
          onChange={(e) =>
            onChange({ ...headerRow, title: e.target.value || undefined } as WorksheetRow)
          }
          className={styles.input}
          placeholder="Worksheet title"
        />
      </div>
    </div>
  );

  const renderTextEditor = (textRow: TextRow) => (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label htmlFor={`text-${row.id}`} className={styles.label}>
          Text Content
        </label>
        <textarea
          id={`text-${row.id}`}
          value={textRow.text}
          onChange={(e) => onChange({ ...textRow, text: e.target.value } as WorksheetRow)}
          className={styles.textarea}
          placeholder="Enter text content"
          rows={3}
        />
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor={`fontSize-${row.id}`} className={styles.label}>
            Font Size (pt)
          </label>
          <input
            id={`fontSize-${row.id}`}
            type="number"
            value={textRow.fontSize}
            onChange={(e) =>
              onChange({ ...textRow, fontSize: parseInt(e.target.value, 10) } as WorksheetRow)
            }
            className={styles.input}
            min="8"
            max="24"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={textRow.bold}
              onChange={(e) => onChange({ ...textRow, bold: e.target.checked } as WorksheetRow)}
            />
            Bold
          </label>
        </div>
      </div>
    </div>
  );

  const renderGridEditor = (gridRow: GridRow) => {
    const addSection = () => {
      const newSection: GridSection = {
        id: `section-${Date.now()}`,
        boxSize: 'SIZE_10MM',
        boxCount: 10,
        content: '',
        showGuides: true,
      };
      onChange({ ...gridRow, sections: [...gridRow.sections, newSection] } as WorksheetRow);
    };

    const updateSection = (index: number, section: GridSection) => {
      const sections = [...gridRow.sections];
      sections[index] = section;
      onChange({ ...gridRow, sections } as WorksheetRow);
    };

    const deleteSection = (index: number) => {
      const sections = gridRow.sections.filter((_, i) => i !== index);
      onChange({ ...gridRow, sections } as WorksheetRow);
    };

    return (
      <div className={styles.fields}>
        {gridRow.sections.map((section, index) => (
          <div key={section.id} className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Section {index + 1}</span>
              <Button
                onClick={() => deleteSection(index)}
                variant="danger"
                size="small"
              >
                Remove
              </Button>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label
                  htmlFor={`boxSize-${section.id}`}
                  className={styles.label}
                >
                  Box Size
                </label>
                <select
                  id={`boxSize-${section.id}`}
                  value={section.boxSize}
                  onChange={(e) =>
                    updateSection(index, {
                      ...section,
                      boxSize: e.target.value as BoxSize,
                    })
                  }
                  className={styles.select}
                >
                  <option value="SIZE_10MM">10mm</option>
                  <option value="SIZE_8MM">8mm</option>
                  <option value="SIZE_6MM">6mm</option>
                </select>
              </div>
              <div className={styles.field}>
                <label
                  htmlFor={`boxCount-${section.id}`}
                  className={styles.label}
                >
                  Box Count
                </label>
                <input
                  id={`boxCount-${section.id}`}
                  type="number"
                  value={section.boxCount}
                  onChange={(e) =>
                    updateSection(index, {
                      ...section,
                      boxCount: parseInt(e.target.value, 10),
                    })
                  }
                  className={styles.input}
                  min="1"
                  max="50"
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor={`content-${section.id}`} className={styles.label}>
                Content (Optional)
              </label>
              <input
                id={`content-${section.id}`}
                type="text"
                value={section.content}
                onChange={(e) =>
                  updateSection(index, { ...section, content: e.target.value })
                }
                className={styles.input}
                placeholder="Pre-filled content"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={section.showGuides}
                  onChange={(e) =>
                    updateSection(index, {
                      ...section,
                      showGuides: e.target.checked,
                    })
                  }
                />
                Show Guide Lines
              </label>
            </div>
          </div>
        ))}
        <Button onClick={addSection} variant="secondary">
          Add Section
        </Button>
      </div>
    );
  };

  const renderVocabularyEditor = (vocabRow: VocabularyRow) => {
    const updateTerms = (value: string) => {
      const terms = value.split('\n').filter((t) => t.trim());
      onChange({ ...vocabRow, terms } as WorksheetRow);
    };

    return (
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`terms-${row.id}`} className={styles.label}>
            Vocabulary Terms (one per line)
          </label>
          <textarea
            id={`terms-${row.id}`}
            value={vocabRow.terms.join('\n')}
            onChange={(e) => updateTerms(e.target.value)}
            className={styles.textarea}
            placeholder="Enter vocabulary terms, one per line"
            rows={5}
          />
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    switch (row.type) {
      case 'HEADER':
        return renderHeaderEditor(row as HeaderRow);
      case 'TEXT':
        return renderTextEditor(row as TextRow);
      case 'GRID':
        return renderGridEditor(row as GridRow);
      case 'VOCABULARY':
        return renderVocabularyEditor(row as VocabularyRow);
      default:
        return null;
    }
  };

  return (
    <div className={styles.rowEditor}>
      <div className={styles.header}>
        <h3 className={styles.rowType}>{row.type} Row</h3>
        <div className={styles.actions}>
          <Button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            variant="secondary"
            size="small"
          >
            ↑
          </Button>
          <Button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            variant="secondary"
            size="small"
          >
            ↓
          </Button>
          <Button onClick={onDelete} variant="danger" size="small">
            Delete
          </Button>
        </div>
      </div>
      {renderEditor()}
    </div>
  );
}
