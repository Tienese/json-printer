import type { QuizPrintViewModel } from '../../types';
import { Button } from '../common';
import styles from './ReportDisplay.module.css';

interface ReportDisplayProps {
  report: QuizPrintViewModel;
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className={`${styles.toolbar} no-print`}>
        <h2 className={styles.reportTitle}>{report.quizTitle}</h2>
        <Button onClick={handlePrint}>Print Report</Button>
      </div>

      <div className={styles.reportContainer}>
        {report.students.map((student, studentIndex) => (
          <div key={studentIndex} className={styles.studentSection}>
            <div className={styles.studentHeader}>
              <h3 className={styles.studentName}>{student.studentName}</h3>
              <p className={styles.studentId}>ID: {student.studentId}</p>
            </div>

            {student.questions.map((question, questionIndex) => (
              <div key={questionIndex} className={styles.question}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>Question {question.questionNumber}</span>
                  <span className={styles.visualMarker}>{question.visualMarker}</span>
                  <span className={styles.points}>{question.points} pts</span>
                </div>

                <div
                  className={styles.questionText}
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />

                {question.options.length > 0 && (
                  <div className={styles.options}>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`${styles.option} ${
                          option.isSelected ? styles.selected : ''
                        } ${option.isCorrect ? styles.correct : ''}`}
                      >
                        <span className={styles.optionLetter}>{option.letter}.</span>
                        <span className={styles.optionText}>{option.text}</span>
                        {option.isSelected && option.isCorrect && (
                          <span className={styles.badge}>✓</span>
                        )}
                        {option.isSelected && !option.isCorrect && (
                          <span className={styles.badge}>✗</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.feedbackText && (
                  <div
                    className={styles.feedback}
                    dangerouslySetInnerHTML={{ __html: question.feedbackText }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
