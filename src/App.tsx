import {useState, useRef, useEffect} from 'react';
import styles from './App.module.css';

function App() {
  // 初期テキスト
  const initialText = '吾輩は猫である。名前はまだ無い。\n\nどこで生れたかとんと見当がつかぬ。\n何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。';

  // テキストの状態管理（今回は使い捨てですが、将来的に必要）
  const [text, setText] = useState(initialText);
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.container}>
      {/* textareaをやめて、divにcontentEditable属性をつけます。
        これにより、Linux環境でもCSSの縦書きが適用されるようになります。
      */}
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable={true}
        suppressContentEditableWarning={true} // Reactの警告抑制
        onInput={(e) => {
          if (editorRef.current) {
            setText(editorRef.current.innerText);
          }
        }}
        // 縦書き時のフォーカス枠を消すおまじない
        style={{outline: 'none'}}
      >
        {initialText}
      </div>
    </div>
  );
}

export default App;
