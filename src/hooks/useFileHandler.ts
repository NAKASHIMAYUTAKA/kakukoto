/* src/hooks/useFileHandler.ts */
import {useState, useRef} from 'react';
import {writeTextFile, readTextFile, readDir, DirEntry} from '@tauri-apps/plugin-fs';
import {save, open, message} from '@tauri-apps/plugin-dialog';

export const useFileHandler = () => {
  const filePathRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState<string>('無題');

  // ▼ フォルダ・ツリー管理用
  const [currentFolderPath, setCurrentFolderPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<DirEntry[]>([]);

  const extractFileName = (path: string) => path.split(/[\\/]/).pop() || '無題';

  const newFile = async () => {
    filePathRef.current = null;
    setFileName('無題');
    return '';
  };

  // ファイルパスを指定して読み込む内部関数
  const loadFileContent = async (path: string) => {
    try {
      const content = await readTextFile(path);
      filePathRef.current = path;
      setFileName(extractFileName(path));
      return content;
    } catch (err) {
      console.error(err);
      await message('ファイルを開けませんでした', {kind: 'error'});
      return null;
    }
  };

  const openFile = async () => {
    try {
      const selectedPath = await open({
        filters: [{name: 'Text Files', extensions: ['txt', 'md']}],
      });
      if (!selectedPath) return null;
      return await loadFileContent(selectedPath);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // ▼ フォルダを開く
  const openFolder = async () => {
    try {
      const selectedDir = await open({
        directory: true,
        recursive: true,
      });

      if (!selectedDir) return null;

      setCurrentFolderPath(selectedDir);
      await refreshFileTree(selectedDir);
      return selectedDir;
    } catch (err) {
      console.error(err);
      await message('フォルダを開けませんでした', {kind: 'error'});
      return null;
    }
  };

  // ▼ ディレクトリの中身を更新
  const refreshFileTree = async (path: string) => {
    try {
      const entries = await readDir(path);

      // ▼ .txtファイルのみを表示するようにフィルタリング
      const filteredEntries = entries.filter((entry) => {
        // ファイルであり、かつ拡張子が .txt のものだけを通す
        return entry.isFile && entry.name.endsWith('.txt');
      });

      // 名前順でソート
      const sorted = filteredEntries.sort((a, b) => a.name.localeCompare(b.name));

      setFileTree(sorted);
    } catch (err) {
      console.error('Failed to read dir:', err);
    }
  };

  // ▼ ツリーからファイルを選択
  const selectFileFromTree = async (entry: DirEntry) => {
    if (!currentFolderPath || !entry.isFile) return null;

    // パスの結合 (Windows/Mac対応)
    const separator = currentFolderPath.includes('\\') ? '\\' : '/';
    const fullPath = `${currentFolderPath}${separator}${entry.name}`;

    return await loadFileContent(fullPath);
  };

  const saveFile = async (content: string) => {
    if (!filePathRef.current) {
      return await saveAsFile(content);
    }
    try {
      await writeTextFile(filePathRef.current, content);
      // console.log('Saved to:', filePathRef.current);
    } catch (err) {
      console.error(err);
      await message('保存に失敗しました', {kind: 'error'});
    }
  };

  const saveAsFile = async (content: string) => {
    try {
      const selectedPath = await save({
        filters: [{name: 'Text Files', extensions: ['txt', 'md']}],
        defaultPath: fileName,
      });

      if (!selectedPath) return;

      await writeTextFile(selectedPath, content);
      filePathRef.current = selectedPath;
      setFileName(extractFileName(selectedPath));

      // 保存した場所が現在開いているフォルダ内ならツリーを更新
      if (currentFolderPath && selectedPath.startsWith(currentFolderPath)) {
        await refreshFileTree(currentFolderPath);
      }
    } catch (err) {
      console.error(err);
      await message('保存に失敗しました', {kind: 'error'});
    }
  };

  return {
    fileName,
    newFile,
    openFile,
    saveFile,
    saveAsFile,
    openFolder,
    currentFolderPath,
    fileTree,
    selectFileFromTree,
  };
};
