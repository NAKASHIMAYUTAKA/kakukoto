/* src/components/Editor/Editor.tsx */
import React, {useCallback} from 'react';
import CodeMirror, {ReactCodeMirrorRef} from '@uiw/react-codemirror';
import {EditorView, ViewPlugin, Decoration, DecorationSet, ViewUpdate} from '@codemirror/view';
import {EditorState, RangeSetBuilder} from '@codemirror/state';

// ▼ アクティブ行ハイライト（変更なし）
const activeLineHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.getDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) this.decorations = this.getDecorations(update.view);
    }
    getDecorations(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();
      const lines = new Set<number>();
      for (const {head} of view.state.selection.ranges) {
        lines.add(view.state.doc.lineAt(head).from);
      }
      for (const from of Array.from(lines).sort((a, b) => a - b)) {
        builder.add(from, from, Decoration.line({class: 'cm-activeLineText'}));
      }
      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// ▼ タイプライタースクロール（変更なし）
const typewriterScroll = EditorState.transactionExtender.of((tr) => {
  if (tr.selection || tr.docChanged) {
    return {
      effects: EditorView.scrollIntoView(tr.newSelection.main.head, {y: 'center'}),
    };
  }
  return null;
});

// ▼ 全角スペースハイライトプラグイン
const zenkakuSpaceHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      // ドキュメント変更またはビューポート（表示範囲）移動時に再計算
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();

      // 表示されている範囲に対してのみ処理を行うループ
      for (const {from, to} of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        const regex = /　/g; // 全角スペースを検索
        let match;

        while ((match = regex.exec(text))) {
          const start = from + match.index;
          const end = start + 1;
          builder.add(start, end, Decoration.mark({class: 'cm-zenkaku-space'}));
        }
      }
      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// ▼ スタイル定義
const notepadTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--color-editor)',
    color: 'var(--color-shadow) ',
    display: 'flex',
    flexDirection: 'column',
  },

  '.cm-activeLineText': {
    color: 'var(--color-text) !important',
    backgroundColor: '#ebdbb2',
    padding: '2em 0.5em !important',
    borderRadius: '4px',
  },

  '.cm-zenkaku-space': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '2px',
    display: 'inline-block',
    width: '1em',
    height: '1em',
    verticalAlign: 'middle',
  },

  '.cm-line': {
    padding: '0.5em 0',
  },

  '.cm-scroller': {
    flex: '1',
    overflow: 'auto',
    fontFamily: 'var(--font-family-editor)',
    padding: 'var(--gap-md)',
    scrollBehavior: 'auto !important',
  },

  '.cm-content': {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    padding: '0',
    paddingBlock: '325px',
  },

  '.cm-gutters': {display: 'none'},
  '.cm-activeLine': {backgroundColor: 'transparent'},
  '.cm-selectionBackground': {backgroundColor: '#b3d4fc !important'},

  // スクロールバー
  '.cm-scroller::-webkit-scrollbar': {width: '12px', height: '12px'},
  '.cm-scroller::-webkit-scrollbar-track': {background: 'transparent'},
  '.cm-scroller::-webkit-scrollbar-thumb': {
    backgroundColor: '#999',
    borderRadius: '6px',
    border: '2px solid transparent',
    backgroundClip: 'content-box',
  },
  '.cm-scroller::-webkit-scrollbar-thumb:hover': {backgroundColor: '#666'},
  '.cm-scroller::-webkit-scrollbar-corner': {backgroundColor: 'transparent'},
});

type EditorProps = {
  value: string;
  onChange: (val: string) => void;
  onCursorChange?: (lineIndex: number) => void;
};

export const Editor = React.forwardRef<ReactCodeMirrorRef, EditorProps>(({value, onChange, onCursorChange}, ref) => {
  const handleUpdate = useCallback(
    (viewUpdate: any) => {
      if (viewUpdate.selectionSet && onCursorChange) {
        const state = viewUpdate.state as EditorState;
        const mainRange = state.selection.main;
        const line = state.doc.lineAt(mainRange.head).number - 1;
        onCursorChange(line);
      }
    },
    [onCursorChange]
  );

  return (
    <CodeMirror
      ref={ref}
      value={value}
      style={{height: '100%'}}
      theme={notepadTheme}
      extensions={[EditorView.lineWrapping, activeLineHighlighter, typewriterScroll, zenkakuSpaceHighlighter]}
      onChange={onChange}
      onUpdate={handleUpdate}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        history: true,
        drawSelection: true,
        bracketMatching: false,
        closeBrackets: false,
        autocompletion: false,
        defaultKeymap: true,
      }}
    />
  );
});

Editor.displayName = 'Editor';
