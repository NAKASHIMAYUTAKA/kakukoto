/* src/App.tsx */
import {useState, useRef, useEffect, useCallback} from 'react';
import {listen} from '@tauri-apps/api/event';
import {ReactCodeMirrorRef} from '@uiw/react-codemirror'; // 型定義のためにインポート
import styles from './App.module.css';
import {Editor} from './components/Editor/Editor';
import {StatusBar} from './components/StatusBar/StatusBar';
import {PreviewViewer, PreviewViewerHandle} from './components/PreviewViewer/PreviewViewer';
import {useFileHandler} from './hooks/useFileHandler';

function App() {
  const [text, setText] = useState('吾輩は猫である。名前はまだ無い。\n\n　どこで生れたかとんと見当がつかぬ。\n何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。\n\n（CodeMirror版：プレビューをクリックすると該当箇所へジャンプします）');

  // プレビュー表示用
  const [previewText, setPreviewText] = useState(text);

  // カーソル同期用の段落インデックス
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  // CodeMirror用のRef
  const inputRef = useRef<ReactCodeMirrorRef>(null);
  const previewRef = useRef<PreviewViewerHandle>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const {fileName, newFile, openFile, saveFile, saveAsFile} = useFileHandler();

  // --- 1. テキスト変更ハンドラ ---
  const handleChange = useCallback((newVal: string) => {
    setText(newVal);

    // プレビュー更新だけDebounce
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPreviewText(newVal);
    }, 300);
  }, []);

  // --- 2. エディタ→プレビューの同期 ---
  const handleCursorChange = useCallback((lineIndex: number) => {
    setActiveParagraphIndex(lineIndex);
    previewRef.current?.scrollToParagraph(lineIndex);
  }, []);

  // --- 3. プレビュー→エディタのジャンプ ---
  const handlePreviewClick = useCallback((paragraphIndex: number) => {
    const view = inputRef.current?.view;
    if (view) {
      // 指定された行の情報を取得 (1始まりの行番号を指定)
      // 行数が足りない場合のエラー回避のため Math.min を使用
      const totalLines = view.state.doc.lines;
      const targetLine = Math.min(paragraphIndex + 1, totalLines);

      const line = view.state.doc.line(targetLine);

      // エディタにフォーカスし、カーソル移動＆スクロール
      view.focus();
      view.dispatch({
        selection: {anchor: line.from}, // 行頭にカーソル
        scrollIntoView: true, // 画面内へスクロール
      });

      // 即座にStateも更新してハイライトを合わせる
      setActiveParagraphIndex(paragraphIndex);
    }
  }, []);

  // --- 4. ショートカットキー ---
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) await saveAsFile(text);
            else await saveFile(text);
            break;
          case 'o':
            e.preventDefault();
            const openedContent = await openFile();
            if (openedContent !== null) {
              setText(openedContent);
              setPreviewText(openedContent);
            }
            break;
          case 'n':
            e.preventDefault();
            const newContent = await newFile();
            setText(newContent);
            setPreviewText(newContent);
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, saveFile, saveAsFile, openFile, newFile]);

  // --- 5. メニューバー操作 ---
  useEffect(() => {
    const unlistenNew = listen('menu-new', async () => {
      const newContent = await newFile();
      setText(newContent);
      setPreviewText(newContent);
    });
    const unlistenOpen = listen('menu-open', async () => {
      const content = await openFile();
      if (content !== null) {
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

  return (
    <div className={styles.display} tabIndex={-1}>
      <div className={styles.inputPanel}>
        <div className={styles.codeWrapper}>
          <Editor ref={inputRef} value={text} onChange={handleChange} onCursorChange={handleCursorChange} />
        </div>
        <StatusBar charCount={text.length} fileName={fileName} />
      </div>

      <div className={styles.previewPanel}>
        <PreviewViewer ref={previewRef} text={previewText} activeParagraphIndex={activeParagraphIndex} onParagraphClick={handlePreviewClick} />
      </div>
    </div>
  );
}

export default App;
