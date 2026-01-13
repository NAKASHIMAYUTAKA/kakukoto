/* src/App.tsx */
import {useState, useRef, useEffect} from 'react';
import {listen} from '@tauri-apps/api/event';
import styles from './App.module.css';
import {Editor} from './components/Editor/Editor';
import {StatusBar} from './components/StatusBar/StatusBar';
import {PreviewViewer, PreviewViewerHandle} from './components/PreviewViewer/PreviewViewer';
import {useFileHandler} from './hooks/useFileHandler';
import {useSyncScroll} from './hooks/useSyncScroll';

function App() {
  const [text, setText] = useState('吾輩は猫である。名前はまだ無い。\n\n　どこで生れたかとんと見当がつかぬ。\n何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。\n\n（修正版：12万文字でも表示欠けしません）');

  // プレビュー表示用のテキスト
  const [previewText, setPreviewText] = useState(text);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<PreviewViewerHandle>(null);

  // タイマーIDを保持するためのRef
  const timerRef = useRef<number | undefined>(undefined);

  const {fileName, newFile, openFile, saveFile, saveAsFile} = useFileHandler();
  const {activeParagraphIndex, syncCursor} = useSyncScroll(inputRef, previewRef);

  // --- 1. Debounce処理 ---
  useEffect(() => {
    // 以前のタイマーがあれば消す
    clearTimeout(timerRef.current);

    // 新しいタイマーをセット
    timerRef.current = setTimeout(() => {
      setPreviewText(text);
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [text]);

  // --- 2. ショートカットキーのハンドリング (★追加部分) ---
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrlキー または Commandキー(Mac) が押されているかチェック
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        switch (key) {
          case 's': // 保存 (Ctrl + S)
            e.preventDefault(); // ブラウザ標準の保存を無効化
            if (e.shiftKey) {
              await saveAsFile(text); // Ctrl + Shift + S
            } else {
              await saveFile(text); // Ctrl + S
            }
            break;

          case 'o': // 開く (Ctrl + O)
            e.preventDefault();
            const openedContent = await openFile();
            if (openedContent !== null) {
              // ファイルが開けたら、Debounce待ちの更新をキャンセルして即反映
              clearTimeout(timerRef.current);
              setText(openedContent);
              setPreviewText(openedContent);
            }
            break;

          case 'n': // 新規作成 (Ctrl + N)
            e.preventDefault();
            const newContent = await newFile();
            clearTimeout(timerRef.current);
            setText(newContent);
            setPreviewText(newContent);
            break;

          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, saveFile, saveAsFile, openFile, newFile]);

  // --- 3. メニューバー操作 (Tauriメニュー) ---
  useEffect(() => {
    const unlistenNew = listen('menu-new', async () => {
      const newContent = await newFile();
      clearTimeout(timerRef.current);
      setText(newContent);
      setPreviewText(newContent);
    });

    const unlistenOpen = listen('menu-open', async () => {
      const content = await openFile();
      if (content !== null) {
        clearTimeout(timerRef.current);
        setText(content);
        setPreviewText(content);
      }
    });

    const unlistenSave = listen('menu-save', () => saveFile(text));
    const unlistenSaveAs = listen('menu-save-as', () => saveAsFile(text));

    return () => {
      unlistenNew.then((f) => f());
      unlistenOpen.then((f) => f());
      unlistenSave.then((f) => f());
      unlistenSaveAs.then((f) => f());
    };
  }, [text, saveFile, saveAsFile, openFile, newFile]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    syncCursor();
  };

  return (
    <div className={styles.display} tabIndex={-1}>
      <div className={styles.inputPanel}>
        <Editor ref={inputRef} value={text} onChange={handleChange} onCursorMove={syncCursor} />
        <StatusBar charCount={text.length} fileName={fileName} />
      </div>

      <div className={styles.previewPanel}>
        <PreviewViewer ref={previewRef} text={previewText} activeParagraphIndex={activeParagraphIndex} />
      </div>
    </div>
  );
}

export default App;
