import { useEffect, useState } from 'react';

import { MarkdownRenderer } from './MarkdownRenderer';

const CHARACTER_INTERVAL_MS = 4;

interface TypeOnMarkdownProps {
  content: string;
}

export function TypeOnMarkdown({ content }: TypeOnMarkdownProps) {
  const [visibleContent, setVisibleContent] = useState('');

  useEffect(() => {
    let characterIndex = 0;
    const timer = window.setInterval(() => {
      characterIndex += 1;
      setVisibleContent(content.slice(0, characterIndex));

      if (characterIndex >= content.length) {
        window.clearInterval(timer);
      }
    }, CHARACTER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [content]);

  return <MarkdownRenderer content={visibleContent} />;
}
