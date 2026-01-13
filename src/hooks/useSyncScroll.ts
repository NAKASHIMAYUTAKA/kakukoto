/* src/hooks/useSyncScroll.ts */
import {useState, useRef, RefObject, useCallback} from 'react';
import {PreviewViewerHandle} from '../components/PreviewViewer/PreviewViewer';

/**
 * エディタのカーソル位置とプレビューのスクロール同期を管理するフック
 */
export const useSyncScroll = (inputRef: RefObject<HTMLTextAreaElement | null>, previewRef: RefObject<PreviewViewerHandle | null>) => {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const lastRunTime = useRef(0); // 最後に実行した時間を記録

  const syncCursor = useCallback(() => {
    const now = Date.now();
    // 前回の実行から30ms経過していないならスキップ (間引き処理)
    if (now - lastRunTime.current < 30) return;

    const textarea = inputRef.current;
    if (!textarea) return;

    // カーソル位置までのテキストを取得し、改行コードの数で現在の段落を特定
    const cursorIndex = textarea.selectionStart;
    const textUpToCursor = textarea.value.substring(0, cursorIndex);
    const currentParagraphIndex = (textUpToCursor.match(/\n/g) || []).length;

    setActiveParagraphIndex(currentParagraphIndex);

    // プレビュー側のスクロールメソッドを呼び出し
    previewRef.current?.scrollToParagraph(currentParagraphIndex);

    lastRunTime.current = now;
  }, [inputRef, previewRef]);

  return {
    activeParagraphIndex,
    syncCursor,
  };
};
