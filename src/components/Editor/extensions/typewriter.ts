import {EditorView} from '@codemirror/view';
import {EditorState} from '@codemirror/state';

export const typewriterScroll = EditorState.transactionExtender.of((tr) => {
  if (tr.selection || tr.docChanged) {
    return {
      effects: EditorView.scrollIntoView(tr.newSelection.main.head, {y: 'center'}),
    };
  }
  return null;
});
