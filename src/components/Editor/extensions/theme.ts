import {EditorView} from '@codemirror/view';

export const notepadTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--color-editor)',
    color: 'var(--color-gray) ',
    display: 'flex',
    flexDirection: 'column',
    WebkitFontSmoothing: 'subpixel-antialiased',
  },

  '.cm-panel.cm-search': {
    backgroundColor: 'var(--color-bg-body)',
    color: 'var(--color-status)',
    borderTop: '1px solid var(--color-shadow)',
    padding: '0',
    paddingBlock: '4px',
    paddingInline: '8px',
    fontSize: '0.9em',
    fontFamily: 'var(--font-family-body)',
  },

  '.cm-search .cm-textfield': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'inherit',
    border: '1px solid var(--color-shadow)',
    borderRadius: '4px',
    outline: 'none',
    padding: '2px 4px',
    marginRight: '4px',
  },

  '.cm-search .cm-button': {
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: '0.8',
    textTransform: 'none',
    marginInline: '2px',
  },

  '.cm-search .cm-button:hover': {
    opacity: '1',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  '.cm-search label': {
    marginRight: '8px',
    fontSize: '0.9em',
  },

  '.cm-searchMatch': {
    backgroundColor: 'rgba(250, 189, 47, 0.4)',
  },

  '.cm-searchMatch-selected': {
    backgroundColor: 'rgba(250, 189, 47, 0.8)',
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
    color: 'var(--color-status) !important',
    padding: '0 !important',
  },

  '.cm-line': {
    padding: '0 !important',
    lineHeight: '2',
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
    paddingInline: 'var(--gap-md)',
    paddingBlock: 'calc(var(--editor-half-height) - 1.25em)',
  },

  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-preview)',
  },

  '.cm-gutters': {display: 'none'},
  '.cm-activeLine': {backgroundColor: 'transparent'},
  '.cm-selectionBackground': {backgroundColor: '#b3d4fc !important'},
});
