import {HTMLAttributes} from 'react';
import styles from './StatusBar.module.css';

type StatusBarProps = HTMLAttributes<HTMLDivElement> & {
  charCount: number;
  label?: string;
  fileName?: string;
};

export const StatusBar = ({charCount, label = '文字', fileName = '無題', className = '', ...props}: StatusBarProps) => {
  return (
    <footer className={`${styles.statusBar} ${className}`.trim()} {...props}>
      <div className={styles.item}>
        <span className={styles.name}>{fileName}</span>
        <span className={styles.count}>{charCount}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </footer>
  );
};
