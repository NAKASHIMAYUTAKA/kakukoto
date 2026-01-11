import {useState, useRef} from 'react';
import {writeTextFile} from '@tauri-apps/plugin-fs';
import {save} from '@tauri-apps/plugin-dialog';

export const useFileHandler = () => {
  // ファイルのパスを保持（Web版の「ハンドル」ではなく「パス文字列」で管理します）
  const filePathRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState<string>('無題');

  const saveFile = async (content: string) => {
    try {
      // 1. パスがない（新規保存）場合はダイアログを出す
      if (!filePathRef.current) {
        const selectedPath = await save({
          filters: [
            {
              name: 'Text Files',
              extensions: ['txt'],
            },
          ],
          defaultPath: 'novel.txt',
        });

        // キャンセルされた場合は null が返る
        if (!selectedPath) return;

        filePathRef.current = selectedPath;

        // パスからファイル名だけを抽出して表示用にセット
        // (Windowsの '\' と Mac/Linuxの '/' 両対応)
        const name = selectedPath.split(/[\\/]/).pop() || '無題';
        setFileName(name);
      }

      // 2. ファイルに書き込む（パスが決まっていれば確認なしで上書き）
      if (filePathRef.current) {
        await writeTextFile(filePathRef.current, content);
        // 必要ならここで「保存しました」などのトーストを出してもOK
        console.log('Saved to:', filePathRef.current);
      }
    } catch (err) {
      console.error('保存に失敗しました:', err);
      alert('保存できませんでした');
    }
  };

  return {
    saveFile,
    fileName,
  };
};
