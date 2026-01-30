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
// ▼ 追加
import {FileTree} from './components/FileTree/FileTree';

type ViewMode = 'kakuyomu' | 'kakukoto' | 'yomukoto';

function App() {
  const [text, setText] = useState('　吾輩は猫である。名前はまだ無い。\n\n　どこで生れたかとんと見当がつかぬ。\n　何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。');
  const [viewMode, setViewMode] = useState<ViewMode>('kakuyomu');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [previewText, setPreviewText] = useState(text);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  const inputRef = useRef<ReactCodeMirrorRef>(null);
  const previewRef = useRef<PreviewViewerHandle>(null);
  const timerRef = useRef<number | undefined>(undefined);

  // ▼ useFileHandlerから追加の機能を分割代入
  const {fileName, newFile, openFile, saveFile, saveAsFile, openFolder, currentFolderPath, fileTree, selectFileFromTree} = useFileHandler();

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 700) {
        setViewMode((prev) => (prev === 'kakuyomu' ? 'kakukoto' : prev));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // モード切り替え時のカーソル同期
  useEffect(() => {
    if (viewMode === 'yomukoto') {
      setTimeout(() => {
        previewRef.current?.scrollToParagraph(activeParagraphIndex);
      }, 50);
    }
    if (viewMode === 'kakukoto' || viewMode === 'kakuyomu') {
      inputRef.current?.view?.focus();
    }
  }, [viewMode, activeParagraphIndex]);

  const handleChange = useCallback((newVal: string) => {
    setText(newVal);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPreviewText(newVal);
    }, 300);
  }, []);

  const handleCursorChange = useCallback(
    (lineIndex: number) => {
      setActiveParagraphIndex(lineIndex);
      if (viewMode === 'kakuyomu') {
        previewRef.current?.scrollToParagraph(lineIndex);
      }
    },
    [viewMode],
  );

  const handlePreviewClick = useCallback((paragraphIndex: number) => {
    const view = inputRef.current?.view;
    if (view) {
      const totalLines = view.state.doc.lines;
      const targetLine = Math.min(paragraphIndex + 1, totalLines);
      const line = view.state.doc.line(targetLine);

      view.focus();
      view.dispatch({
        selection: {anchor: line.from},
        effects: EditorView.scrollIntoView(line.from, {y: 'center'}),
      });
      setActiveParagraphIndex(paragraphIndex);
    }
  }, []);

  // ツリーからファイル選択時
  const handleSelectFile = async (entry: any) => {
    const content = await selectFileFromTree(entry);
    if (content !== null) {
      setText(content);
      setPreviewText(content);
    }
  };

  const getModeLabel = () => {
    if (viewMode === 'yomukoto') return 'yomukoto';
    const suffix = isFocusMode ? '.zone' : '';
    return `${viewMode}${suffix}`;
  };

  // ショートカットキー
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
            if (e.shiftKey) {
              await openFolder();
            } else {
              const openedContent = await openFile();
              if (openedContent !== null) {
                setText(openedContent);
                setPreviewText(openedContent);
              }
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
            if (viewMode !== 'yomukoto') {
              const view = inputRef.current?.view;
              if (view) {
                view.focus();
                openSearchPanel(view);
              }
            }
            break;
          case 'e':
            if (e.shiftKey) {
              e.preventDefault();
              setViewMode('kakukoto');
            }
            break;
          case 'b':
            if (e.shiftKey) {
              e.preventDefault();
              if (window.innerWidth >= 700) setViewMode('kakuyomu');
            }
            break;
          case 'p':
            if (e.shiftKey) {
              e.preventDefault();
              setViewMode('yomukoto');
            }
            break;
          case 'l':
            if (e.shiftKey) {
              e.preventDefault();
              if (viewMode !== 'yomukoto') setIsFocusMode((prev) => !prev);
            }
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, viewMode, saveFile, saveAsFile, openFile, newFile, openFolder]); // openFolder追加

  // メニューイベント
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

    const unlistenModeChange = listen<ViewMode>('menu-mode-change', (event) => {
      if (event.payload === 'kakuyomu' && window.innerWidth < 700) return;
      setViewMode(event.payload);
    });

    const unlistenModeFocus = listen('menu-mode-focus', () => {
      setIsFocusMode((prev) => !prev);
    });

    return () => {
      unlistenNew.then((f) => f());
      unlistenOpen.then((f) => f());
      unlistenSave.then((f) => f());
      unlistenSaveAs.then((f) => f());
      unlistenModeChange.then((f) => f());
      unlistenModeFocus.then((f) => f());
    };
  }, [text, saveFile, saveAsFile, openFile, newFile]);

  return (
    <div className={styles.display} tabIndex={-1} data-mode={viewMode}>
      <div className={styles.sidebarPanel}>
        <FileTree entries={fileTree} folderName={currentFolderPath} onSelect={handleSelectFile} onOpenFolder={openFolder} />
      </div>

      <div className={styles.inputPanel}>
        <div className={styles.codeWrapper}>
          <Editor ref={inputRef} value={text} onChange={handleChange} onCursorChange={handleCursorChange} isFocusMode={isFocusMode} />
        </div>
        <StatusBar charCount={text.length} fileName={fileName} label={getModeLabel()} />
      </div>

      <div className={styles.previewPanel}>
        <PreviewViewer ref={previewRef} text={previewText} activeParagraphIndex={activeParagraphIndex} onParagraphClick={handlePreviewClick} />
      </div>
    </div>
  );
}

export default App;
