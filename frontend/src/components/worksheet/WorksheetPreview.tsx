import type {
  WorksheetViewModel,
  WorksheetRow,
  HeaderRow,
  TextRow,
  GridRow,
  VocabularyRow,
  GridSection,
} from '../../types';
import { Button } from '../common';
import styles from './WorksheetPreview.module.css';

interface WorksheetPreviewProps {
  worksheet: WorksheetViewModel;
  onBack?: () => void;
}

export function WorksheetPreview({ worksheet, onBack }: WorksheetPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const renderHeaderRow = (row: HeaderRow) => (
    <div className={styles.headerRow}>
      <div className={styles.headerLine}>
        {row.showDate && (
          <div className={styles.dateField}>
            日付: __________________
          </div>
        )}
        {row.showName && (
          <div className={styles.nameField}>
            名前: __________________
          </div>
        )}
      </div>
      {row.title && <h2 className={styles.worksheetTitle}>{row.title}</h2>}
    </div>
  );

  const renderTextRow = (row: TextRow) => (
    <div
      className={styles.textRow}
      style={{
        fontSize: `${row.fontSize}pt`,
        fontWeight: row.bold ? 'bold' : 'normal',
      }}
    >
      {row.text}
    </div>
  );

  const renderGridSection = (section: GridSection) => {
    const boxes = Array.from({ length: section.boxCount }, (_, i) => {
      const content = section.content.split('')[i] || '';
      return (
        <div
          key={i}
          className={`${styles.box} ${styles[section.boxSize.toLowerCase()]} ${
            section.showGuides ? styles.withGuides : ''
          }`}
        >
          {content}
        </div>
      );
    });

    return <div className={styles.gridSection}>{boxes}</div>;
  };

  const renderGridRow = (row: GridRow) => (
    <div className={styles.gridRow}>
      {row.sections.map((section) => (
        <div key={section.id} className={styles.sectionWrapper}>
          {renderGridSection(section)}
        </div>
      ))}
    </div>
  );

  const renderVocabularyRow = (row: VocabularyRow) => (
    <div className={styles.vocabularyRow}>
      {row.terms.map((term, index) => (
        <div key={index} className={styles.vocabItem}>
          <span className={styles.vocabTerm}>{term}</span>
          <span className={styles.vocabLine}>________________________</span>
        </div>
      ))}
    </div>
  );

  const renderRow = (row: WorksheetRow) => {
    switch (row.type) {
      case 'HEADER':
        return renderHeaderRow(row as HeaderRow);
      case 'TEXT':
        return renderTextRow(row as TextRow);
      case 'GRID':
        return renderGridRow(row as GridRow);
      case 'VOCABULARY':
        return renderVocabularyRow(row as VocabularyRow);
      default:
        return null;
    }
  };

  return (
    <div>
      <div className={`${styles.toolbar} no-print`}>
        <h2 className={styles.toolbarTitle}>{worksheet.config.title}</h2>
        <div className={styles.toolbarActions}>
          {onBack && (
            <Button onClick={onBack} variant="secondary">
              Edit Worksheet
            </Button>
          )}
          <Button onClick={handlePrint}>Print Worksheet</Button>
        </div>
      </div>

      <div
        className={`${styles.worksheetContainer} ${
          worksheet.config.showGuideLines ? styles.withGuideLines : ''
        }`}
      >
        {worksheet.pages.map((page) => (
          <div key={page.pageNumber} className={styles.page}>
            {page.rows.map((row) => (
              <div key={row.id} className={styles.rowContainer}>
                {renderRow(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
