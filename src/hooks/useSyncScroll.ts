import {useState, RefObject} from 'react';
import {PreviewViewerHandle} from '../components/PreviewViewer/PreviewViewer';

/**
 * エディタのカーソル位置とプレビューのスクロール同期を管理するフック
 */
export const useSyncScroll = (
  // 型定義に | null を追加して、より柔軟に受け取れるようにします
  inputRef: RefObject<HTMLTextAreaElement | null>,
  previewRef: RefObject<PreviewViewerHandle | null>
) => {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  const syncCursor = () => {
    const textarea = inputRef.current;
    if (!textarea) return;

    // カーソル位置までのテキストを取得し、改行コードの数で現在の段落を特定
    const cursorIndex = textarea.selectionStart;
    const textUpToCursor = textarea.value.substring(0, cursorIndex);
    const currentParagraphIndex = (textUpToCursor.match(/\n/g) || []).length;

    setActiveParagraphIndex(currentParagraphIndex);

    // プレビュー側のスクロールメソッドを呼び出し
    previewRef.current?.scrollToParagraph(currentParagraphIndex);
  };

  return {
    activeParagraphIndex,
    syncCursor,
  };
};
