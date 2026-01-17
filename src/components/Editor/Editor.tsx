/* src/components/Editor/Editor.tsx */
import React, {useCallback} from 'react';
import CodeMirror, {ReactCodeMirrorRef} from '@uiw/react-codemirror';
import {EditorView, ViewPlugin, Decoration, DecorationSet, ViewUpdate, keymap, WidgetType} from '@codemirror/view';
import {EditorState, RangeSetBuilder} from '@codemirror/state';
import {insertNewline} from '@codemirror/commands';

// ▼ アクティブ行ハイライト
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

// ▼ タイプライタースクロール
const typewriterScroll = EditorState.transactionExtender.of((tr) => {
  if (tr.selection || tr.docChanged) {
    return {
      effects: EditorView.scrollIntoView(tr.newSelection.main.head, {y: 'center'}),
    };
  }
  return null;
});

// ▼ 全角スペースウィジェット
class ZenkakuSpaceWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-zenkaku-space';
    span.innerText = '　';
    return span;
  }

  eq(_other: ZenkakuSpaceWidget) {
    return true;
  }
  ignoreEvent() {
    return false;
  }
}

// ▼ 全角スペースハイライトプラグイン
const zenkakuSpaceHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();

      for (const {from, to} of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        const regex = /　/g;
        let match;

        while ((match = regex.exec(text))) {
          const start = from + match.index;
          const end = start + 1;
          builder.add(
            start,
            end,
            Decoration.replace({
              widget: new ZenkakuSpaceWidget(),
            })
          );
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
    color: 'var(--color-preview) ',
    display: 'flex',
    flexDirection: 'column',
    WebkitFontSmoothing: 'subpixel-antialiased',
  },

  '.cm-zenkaku-space': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: '2px',
    display: 'inline-block',
    width: '1em',
    height: '1em',
    verticalAlign: 'middle',
    color: 'transparent',
    lineHeight: '1',
    userSelect: 'none',
  },

  '.cm-activeLineText': {
    color: '#000 !important',
    backgroundColor: 'var(--color-status)',
    padding: '0 !important',
    paddingBlock: '1em !important',
    borderRadius: '4px',
  },

  '.cm-line': {
    padding: '0 !important',
    paddingBlock: '0.5em !important',
    paddingInline: '0.5em !important',
  },

  '.cm-scroller': {
    flex: '1',
    overflow: 'auto',
    fontFamily: 'var(--font-family-editor)',
    scrollBehavior: 'auto !important',
  },

  '.cm-content': {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    padding: '0',
    paddingInline: '2.5em',
    paddingBlock: 'calc(325px - 1.25em)',
  },

  '.cm-gutters': {display: 'none'},
  '.cm-activeLine': {backgroundColor: 'transparent'},
  '.cm-selectionBackground': {backgroundColor: '#b3d4fc !important'},
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
      extensions={[EditorView.lineWrapping, activeLineHighlighter, typewriterScroll, zenkakuSpaceHighlighter, keymap.of([{key: 'Enter', run: insertNewline}])]}
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
