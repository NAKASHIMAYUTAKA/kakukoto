import {DirEntry} from '@tauri-apps/plugin-fs';
import styles from './FileTree.module.css';

type FileTreeProps = {
  entries: DirEntry[];
  folderName: string | null;
  onSelect: (entry: DirEntry) => void;
  onOpenFolder: () => void;
};

export const FileTree = ({entries, folderName, onSelect, onOpenFolder}: FileTreeProps) => {
  const displayFolderName = folderName ? folderName.split(/[\\/]/).pop() : null;

  if (!folderName) {
    return (
      <div className={styles.container}>
        <div className={styles.empty} onClick={onOpenFolder}>
          フォルダを開く...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header} title={folderName}>
        {displayFolderName}
      </div>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.name} className={`${styles.item} ${entry.isDirectory ? styles.isDirectory : ''}`} onClick={() => onSelect(entry)}>
            <span>{entry.isDirectory ? '📁' : '📄'}</span>
            {entry.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
