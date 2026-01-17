/* src/components/Editor/Editor.tsx */
import React, {useCallback} from 'react';
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
      extensions={[EditorView.lineWrapping, activeLineHighlighter, typewriterScroll, zenkakuSpaceHighlighter, searchExtension, keymap.of([{key: 'Enter', run: insertNewline}])]}
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
        defaultKeymap: true, // Search用のショートカット(Ctrl+Fなど)もここに含まれます
      }}
    />
  );
});

Editor.displayName = 'Editor';
