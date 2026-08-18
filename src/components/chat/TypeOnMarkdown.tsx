import { useEffect, useRef, useState } from 'react';

import { MarkdownRenderer } from './MarkdownRenderer';

const CHARACTER_INTERVAL_MS = 4;

interface TypeOnMarkdownProps {
  content: string;
  onComplete?: () => void;
}

export function TypeOnMarkdown({ content, onComplete }: TypeOnMarkdownProps) {
  const [visibleContent, setVisibleContent] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let characterIndex = 0;
    const timer = window.setInterval(() => {
      characterIndex += 1;
      setVisibleContent(content.slice(0, characterIndex));

      if (characterIndex >= content.length) {
        window.clearInterval(timer);
        onCompleteRef.current?.();
      }
    }, CHARACTER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [content]);

  return <MarkdownRenderer content={visibleContent} />;
}
