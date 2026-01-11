import {forwardRef, TextareaHTMLAttributes} from 'react';
import styles from './Editor.module.css';

type EditorProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  onCursorMove?: () => void;
};

export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({className, onCursorMove, onChange, ...props}, ref) => {
  return <textarea ref={ref} className={`${styles.textarea} ${className || ''}`} onSelect={onCursorMove} onClick={onCursorMove} onKeyUp={onCursorMove} onChange={onChange} placeholder='書くこと' spellCheck={false} {...props} />;
});

Editor.displayName = 'Editor';
