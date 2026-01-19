/* src/App.tsx */
import {useState, useRef, useEffect, useCallback} from 'react';
import {listen} from '@tauri-apps/api/event';
import {ReactCodeMirrorRef} from '@uiw/react-codemirror';
import {openSearchPanel} from '@codemirror/search';
import {EditorView} from '@codemirror/view';
import styles from './App.module.css';
import {Editor} from './components/Editor/Editor';
import {StatusBar} from './components/StatusBar/StatusBar';
import {PreviewViewer, PreviewViewerHandle} from './components/PreviewViewer/PreviewViewer';
import {useFileHandler} from './hooks/useFileHandler';

function App() {
  const [text, setText] = useState('　吾輩は猫である。名前はまだ無い。\n\n　どこで生れたかとんと見当がつかぬ。\n　何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。');

  // ▼ 集中モードの状態管理をここ（親）に追加
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [previewText, setPreviewText] = useState(text);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  const inputRef = useRef<ReactCodeMirrorRef>(null);
  const previewRef = useRef<PreviewViewerHandle>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const {fileName, newFile, openFile, saveFile, saveAsFile} = useFileHandler();

  const handleChange = useCallback((newVal: string) => {
    setText(newVal);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPreviewText(newVal);
    }, 300);
  }, []);

  const handleCursorChange = useCallback((lineIndex: number) => {
    setActiveParagraphIndex(lineIndex);
    previewRef.current?.scrollToParagraph(lineIndex);
  }, []);

  const handlePreviewClick = useCallback((paragraphIndex: number) => {
    const view = inputRef.current?.view;
    if (view) {
      const totalLines = view.state.doc.lines;
      const targetLine = Math.min(paragraphIndex + 1, totalLines);
      const line = view.state.doc.line(targetLine);

      view.focus();
      // 通常モードでも強制的に「中央」にスクロールさせる
      view.dispatch({
        selection: {anchor: line.from},
        effects: EditorView.scrollIntoView(line.from, {y: 'center'}),
      });

      setActiveParagraphIndex(paragraphIndex);
    }
  }, []);

  // --- ショートカットキー制御 ---
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
          case 'f':
            e.preventDefault();
            const view = inputRef.current?.view;
            if (view) {
              view.focus();
              openSearchPanel(view);
            }
            break;

          case 'l':
            if (e.shiftKey) {
              e.preventDefault();
              setIsFocusMode((prev) => !prev);
            }
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, saveFile, saveAsFile, openFile, newFile]);

  // メニューバー操作
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
          {/* ▼ Editorに isFocusMode を渡す */}
          <Editor ref={inputRef} value={text} onChange={handleChange} onCursorChange={handleCursorChange} isFocusMode={isFocusMode} />
        </div>
        {/* ステータスバーに現在のモードを表示すると分かりやすいかも（任意） */}
        <StatusBar charCount={text.length} fileName={fileName} label={isFocusMode ? '文字/集中' : '文字'} />
      </div>

      <div className={styles.previewPanel}>
        <PreviewViewer ref={previewRef} text={previewText} activeParagraphIndex={activeParagraphIndex} onParagraphClick={handlePreviewClick} />
      </div>
    </div>
  );
}

export default App;
