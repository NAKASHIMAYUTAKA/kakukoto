import {useState, useRef} from 'react';
import styles from './App.module.css';
import {Editor} from './components/Editor/Editor';
import {StatusBar} from './components/StatusBar/StatusBar';
import {Header} from './components/Header/Header';
import {PreviewViewer, PreviewViewerHandle} from './components/PreviewViewer/PreviewViewer';
import {useFileHandler} from './hooks/useFileHandler';
import {useSyncScroll} from './hooks/useSyncScroll';

function App() {
  const [text, setText] = useState('吾輩は猫である。名前はまだ無い。\n\n　どこで生れたかとんと見当がつかぬ。\n何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。\n\n（エディタ側のハイライトは削除されました。\n右側のプレビューの全角スペース　は、行の中央に表示されています）');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<PreviewViewerHandle>(null);

  // カスタムフックの呼び出し
  const {saveFile, fileName} = useFileHandler();
  const {activeParagraphIndex, syncCursor} = useSyncScroll(inputRef, previewRef);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setTimeout(syncCursor, 50);
  };

  // ショートカットキー (Ctrl+S / Cmd+S) のハンドリング
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); // ブラウザ標準の保存ダイアログを抑制
      saveFile(text);
    }
  };

  return (
    <div className={styles.display} onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* 左側：エディターエリア */}
      <div className={styles.inputPanel}>
        {/* ヘッダー（ファイル名と保存ボタン） */}
        <Header fileName={fileName} onSave={() => saveFile(text)} />

        {/* エディタ本体 (flex: 1 で残りの高さを埋める) */}
        <div className={styles.editorWrapper}>
          <Editor ref={inputRef} value={text} onChange={handleChange} onCursorMove={syncCursor} />
        </div>

        <StatusBar charCount={text.length} />
      </div>

      {/* 右側：プレビューエリア */}
      <div className={styles.previewPanel}>
        <PreviewViewer ref={previewRef} text={text} activeParagraphIndex={activeParagraphIndex} />
      </div>
    </div>
  );
}

export default App;
