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
  const [text, setText] = useState('吾輩は猫である。名前はまだ無い。\n\n　どこで生れたかとんと見当がつかぬ。\n何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<PreviewViewerHandle>(null);

  const {fileName, newFile, openFile, saveFile, saveAsFile} = useFileHandler();
  const {activeParagraphIndex, syncCursor} = useSyncScroll(inputRef, previewRef);

  useEffect(() => {
    // --- メニューバーからのイベント受信設定 ---

    const unlistenNew = listen('menu-new', async () => {
      const newContent = await newFile();
      setText(newContent);
    });

    const unlistenOpen = listen('menu-open', async () => {
      const content = await openFile();
      if (content !== null) setText(content);
    });

    const unlistenSave = listen('menu-save', () => saveFile(text));
    const unlistenSaveAs = listen('menu-save-as', () => saveAsFile(text));

    // クリーンアップ関数
    return () => {
      unlistenNew.then((f) => f());
      unlistenOpen.then((f) => f());
      unlistenSave.then((f) => f());
      unlistenSaveAs.then((f) => f());
    };
  }, [text, saveFile, saveAsFile, openFile, newFile]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setTimeout(syncCursor, 50);
  };

  return (
    <div className={styles.display} tabIndex={-1}>
      <div className={styles.inputPanel}>
        <div className={styles.editorWrapper}>
          <Editor ref={inputRef} value={text} onChange={handleChange} onCursorMove={syncCursor} />
        </div>
        <StatusBar charCount={text.length} fileName={fileName} />
      </div>

      <div className={styles.previewPanel}>
        <PreviewViewer ref={previewRef} text={text} activeParagraphIndex={activeParagraphIndex} />
      </div>
    </div>
  );
}

export default App;
