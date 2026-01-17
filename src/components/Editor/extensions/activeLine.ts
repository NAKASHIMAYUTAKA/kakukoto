import {EditorView, ViewPlugin, Decoration, DecorationSet, ViewUpdate} from '@codemirror/view';
import {RangeSetBuilder} from '@codemirror/state';

export const activeLineHighlighter = ViewPlugin.fromClass(
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
