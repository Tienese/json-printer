import type { ReactNode } from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type = 'info', children, onClose, className = '' }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[type]} ${className}`} role="alert">
      <div className={styles.content}>{children}</div>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}
