import type { ReactNode } from 'react';
import styles from './StatusMessage.module.css';

interface Props {
  title: string;
  children?: ReactNode;
  loading?: boolean;
}

export default function StatusMessage({ title, children, loading = false }: Props) {
  return (
    <div className={styles.status} role={loading ? 'status' : undefined} aria-live="polite">
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <p className={styles.title}>{title}</p>
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
