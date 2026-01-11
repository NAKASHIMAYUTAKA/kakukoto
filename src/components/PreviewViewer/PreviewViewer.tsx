import {forwardRef, useRef, useImperativeHandle} from 'react';
import styles from './PreviewViewer.module.css';

type PreviewViewerProps = {
  text: string;
  activeParagraphIndex: number;
};

export type PreviewViewerHandle = {
  scrollToParagraph: (index: number) => void;
};

// ヘルパー関数: 再描画のたびに生成されないよう外に出す
const renderLine = (line: string) => {
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

export const PreviewViewer = forwardRef<PreviewViewerHandle, PreviewViewerProps>(({text, activeParagraphIndex}, ref) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    scrollToParagraph: (paragraphIndex: number) => {
      const scroller = scrollerRef.current;
      const targetParagraph = paragraphRefs.current[paragraphIndex];

      if (scroller && targetParagraph) {
        const scrollerCenter = scroller.clientWidth / 1.1;
        const paragraphCenter = targetParagraph.offsetLeft + targetParagraph.clientWidth / 1.1;
        const scrollTarget = paragraphCenter - scrollerCenter;

        scroller.scrollTo({
          left: scrollTarget,
          behavior: 'smooth',
        });
      }
    },
  }));

  return (
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
              {renderLine(line)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

PreviewViewer.displayName = 'PreviewViewer';
