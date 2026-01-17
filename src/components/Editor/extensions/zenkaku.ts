import {EditorView, ViewPlugin, Decoration, DecorationSet, ViewUpdate, WidgetType} from '@codemirror/view';
import {RangeSetBuilder} from '@codemirror/state';

// 全角スペースウィジェット
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

// 全角スペースハイライトプラグイン
export const zenkakuSpaceHighlighter = ViewPlugin.fromClass(
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
