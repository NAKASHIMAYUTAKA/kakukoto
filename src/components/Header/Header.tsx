import styles from './Header.module.css';

type HeaderProps = {
  fileName: string;
  onSave: () => void;
};

export const Header = ({fileName, onSave}: HeaderProps) => {
  return (
    <header className={styles.header}>
      <span className={styles.fileName}>{fileName}</span>
      <button onClick={onSave} className={styles.saveButton}>
        保存
      </button>
    </header>
  );
};
