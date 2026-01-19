/* src/components/Editor/Editor.tsx */
import React, {useCallback, useMemo} from 'react';
import CodeMirror, {ReactCodeMirrorRef} from '@uiw/react-codemirror';
import {EditorView, keymap} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {insertNewline} from '@codemirror/commands';

// 拡張機能をインポート
import {activeLineHighlighter, typewriterScroll, zenkakuSpaceHighlighter, notepadTheme, searchExtension} from './extensions';

type EditorProps = {
  value: string;
  onChange: (val: string) => void;
  onCursorChange?: (lineIndex: number) => void;
  isFocusMode: boolean;
};

export const Editor = React.forwardRef<ReactCodeMirrorRef, EditorProps>(({value, onChange, onCursorChange, isFocusMode}, ref) => {
  const handleUpdate = useCallback(
    (viewUpdate: any) => {
      if (viewUpdate.selectionSet && onCursorChange) {
        const state = viewUpdate.state as EditorState;
        const mainRange = state.selection.main;
        const line = state.doc.lineAt(mainRange.head).number - 1;
        onCursorChange(line);
      }
    },
    [onCursorChange],
  );

  const extensions = useMemo(() => {
    const baseExtensions = [EditorView.lineWrapping, activeLineHighlighter, zenkakuSpaceHighlighter, searchExtension, keymap.of([{key: 'Enter', run: insertNewline}])];

    if (isFocusMode) {
      baseExtensions.push(typewriterScroll);
    }

    return baseExtensions;
  }, [isFocusMode]);

  return (
    <CodeMirror
      ref={ref}
      value={value}
      style={{height: '100%'}}
      theme={notepadTheme}
      extensions={extensions}
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
