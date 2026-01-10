import {useState, useRef} from 'react';
import styles from './App.module.css';

function App() {
  const [text, setText] = useState('吾輩は猫である。名前はまだ無い。\n\n　どこで生れたかとんと見当がつかぬ。\n何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。\n\n（エディタ側のハイライトは削除されました。\n右側のプレビューの全角スペース　は、行の中央に表示されています）');

  // 現在アクティブな（カーソルがある）段落のインデックス
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  // const backdropRef = useRef<HTMLDivElement>(null); <-- 削除
  const scrollerRef = useRef<HTMLDivElement>(null);

  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // --- 共通: 指定した段落インデックスへプレビューをスクロール ---
  const scrollToParagraph = (paragraphIndex: number) => {
    const scroller = scrollerRef.current;
    const targetParagraph = paragraphRefs.current[paragraphIndex];

    if (scroller && targetParagraph) {
      const scrollerCenter = scroller.clientWidth / 2;
      const paragraphCenter = targetParagraph.offsetLeft + targetParagraph.clientWidth / 2;
      const scrollTarget = paragraphCenter - scrollerCenter;

      scroller.scrollTo({
        left: scrollTarget,
        behavior: 'smooth',
      });
    }
  };

  // --- 機能: カーソル位置合わせ ---
  const syncCursor = () => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const cursorIndex = textarea.selectionStart;
    const textUpToCursor = textarea.value.substring(0, cursorIndex);
    const currentParagraphIndex = (textUpToCursor.match(/\n/g) || []).length;

    setActiveParagraphIndex(currentParagraphIndex);
    scrollToParagraph(currentParagraphIndex);
  };

  // handleInputScroll, renderTextWithHighlights は削除

  // プレビュー用の行単位レンダラー
  const renderPreviewLine = (line: string) => {
    if (!line) return <br />;
    const parts = line.split(/(　)/g);
    return parts.map((part, i) => {
      if (part === '　') {
        return (
          <span key={i} className={styles.zenkakuSpace}>
            　
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={styles.container}>
      {/* 左側：入力エリア */}
      <div className={styles.inputPane}>
        {/* バックドロップ構造を削除し、シンプルなtextareaのみにする */}
        <textarea
          ref={inputRef}
          className={styles.textarea}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setTimeout(syncCursor, 50);
          }}
          onSelect={syncCursor}
          onClick={syncCursor}
          onKeyUp={syncCursor}
          placeholder='ここに入力...'
          spellCheck={false}
        />

        <div className={styles.statusBar}>{text.length} 文字</div>
      </div>

      {/* 右側：プレビューエリア */}
      <div className={styles.previewPane}>
        <div ref={scrollerRef} className={styles.previewScroller}>
          <div className={styles.paper}>
            <div className={styles.verticalText}>
              {text.split('\n').map((line, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    paragraphRefs.current[index] = el;
                  }}
                  className={`${styles.paragraph} ${index === activeParagraphIndex ? styles.active : ''}`}
                >
                  {renderPreviewLine(line)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
