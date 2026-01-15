/* src/components/PreviewViewer/PreviewViewer.tsx */
import {forwardRef, useRef, useImperativeHandle, useMemo, memo} from 'react';
import styles from './PreviewViewer.module.css';

type PreviewViewerProps = {
  text: string;
  activeParagraphIndex: number;
  onParagraphClick: (index: number) => void;
};

export type PreviewViewerHandle = {
  scrollToParagraph: (index: number) => void;
};

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

export const PreviewViewer = memo(
  forwardRef<PreviewViewerHandle, PreviewViewerProps>(({text, activeParagraphIndex, onParagraphClick}, ref) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      scrollToParagraph: (paragraphIndex: number) => {
        const scroller = scrollerRef.current;
        const targetParagraph = paragraphRefs.current[paragraphIndex];

        if (scroller && targetParagraph) {
          const scrollerCenter = scroller.clientWidth / 2;
          const paragraphHead = targetParagraph.offsetLeft + targetParagraph.clientWidth;
          const scrollTarget = paragraphHead - scrollerCenter;

          scroller.scrollTo({
            left: scrollTarget,
            behavior: 'smooth',
          });
        }
      },
    }));

    const lines = useMemo(() => text.split('\n'), [text]);

    return (
      <div ref={scrollerRef} className={styles.previewScroller}>
        <div className={styles.verticalText}>
          {lines.map((line, index) => (
            <div
              key={index}
              ref={(el) => {
                paragraphRefs.current[index] = el;
              }}
              onClick={() => onParagraphClick(index)}
              className={`${styles.paragraph} ${index === activeParagraphIndex ? styles.active : ''}`}
            >
              {renderLine(line)}
            </div>
          ))}
        </div>
      </div>
    );
  })
);

PreviewViewer.displayName = 'PreviewViewer';
