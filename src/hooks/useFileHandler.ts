import {useState, useRef} from 'react';
import {writeTextFile, readTextFile} from '@tauri-apps/plugin-fs';
import {save, open, message} from '@tauri-apps/plugin-dialog';

export const useFileHandler = () => {
  const filePathRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState<string>('無題');

  const extractFileName = (path: string) => path.split(/[\\/]/).pop() || '無題';

  const newFile = async () => {
    filePathRef.current = null;
    setFileName('無題');
    return '';
  };

  const openFile = async () => {
    try {
      const selectedPath = await open({
        filters: [{name: 'Text Files', extensions: ['txt']}],
      });

      if (!selectedPath) return null;

      const content = await readTextFile(selectedPath);
      filePathRef.current = selectedPath;
      setFileName(extractFileName(selectedPath));

      return content;
    } catch (err) {
      console.error(err);
      await message('ファイルを開けませんでした', {kind: 'error'});
      return null;
    }
  };

  const saveFile = async (content: string) => {
    if (!filePathRef.current) {
      return await saveAsFile(content);
    }
    try {
      await writeTextFile(filePathRef.current, content);
      console.log('Saved to:', filePathRef.current);
    } catch (err) {
      console.error(err);
      await message('保存に失敗しました', {kind: 'error'});
    }
  };

  const saveAsFile = async (content: string) => {
    try {
      const selectedPath = await save({
        filters: [{name: 'Text Files', extensions: ['txt']}],
        defaultPath: fileName,
      });

      if (!selectedPath) return;

      await writeTextFile(selectedPath, content);
      filePathRef.current = selectedPath;
      setFileName(extractFileName(selectedPath));
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
  };
};
