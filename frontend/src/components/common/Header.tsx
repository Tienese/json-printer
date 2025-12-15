import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <h1>QTI Helper</h1>
        </Link>
        <nav className={styles.nav}>
          <Link to="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link to="/print-report" className={styles.navLink}>
            Print Report
          </Link>
          <Link to="/quiz/import" className={styles.navLink}>
            QTI Converter
          </Link>
          <Link to="/worksheet" className={styles.navLink}>
            Worksheet Builder
          </Link>
        </nav>
      </div>
    </header>
  );
}
